import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export const PROD_BASE_URL = "https://api.wise.com";
export const SANDBOX_BASE_URL = "https://api.wise-sandbox.com";

export type OutputFormat = "json" | "table";

export interface StoredConfig {
  token?: string;
  baseUrl?: string;
  profileId?: number;
  output?: OutputFormat;
  timeoutMs?: number;
}

export interface GlobalOptions {
  apiToken?: string;
  baseUrl?: string;
  output?: OutputFormat;
  profileId?: string | number;
  sandbox?: boolean;
  timeoutMs?: string | number;
}

export interface EffectiveConfig {
  baseUrl: string;
  configPath: string;
  output: OutputFormat;
  profileId?: number;
  timeoutMs: number;
  token?: string;
  tokenSource: "env" | "flag" | "stored" | "none";
}

export function getConfigPath(): string {
  return path.join(homedir(), ".config", "wise-cli", "config.json");
}

export async function loadStoredConfig(): Promise<StoredConfig> {
  const configPath = getConfigPath();

  try {
    return JSON.parse(await readFile(configPath, "utf8")) as StoredConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

export async function saveStoredConfig(config: StoredConfig): Promise<void> {
  const configPath = getConfigPath();
  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  await chmod(configPath, 0o600);
}

export async function clearStoredConfig(): Promise<void> {
  await rm(getConfigPath(), { force: true });
}

function parseNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Expected a numeric value but received "${value}".`);
  }

  return parsed;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export async function resolveConfig(
  options: GlobalOptions,
  requireToken = true,
): Promise<EffectiveConfig> {
  const stored = await loadStoredConfig();
  const envToken = process.env.WISE_TOKEN ?? process.env.WISE_API_TOKEN;
  const flagToken = options.apiToken;
  const token = flagToken ?? envToken ?? stored.token;
  const tokenSource: EffectiveConfig["tokenSource"] = flagToken
    ? "flag"
    : envToken
      ? "env"
      : stored.token
        ? "stored"
        : "none";

  if (requireToken && !token) {
    throw new Error(
      "No Wise API token configured. Set WISE_TOKEN or run `wise auth login --token <token>`.",
    );
  }

  const envProfileId = process.env.WISE_PROFILE_ID;
  const profileId =
    parseNumber(options.profileId) ??
    parseNumber(envProfileId) ??
    stored.profileId;

  const baseUrl = normalizeBaseUrl(
    options.baseUrl ??
      (options.sandbox ? SANDBOX_BASE_URL : undefined) ??
      process.env.WISE_BASE_URL ??
      stored.baseUrl ??
      PROD_BASE_URL,
  );

  const timeoutMs =
    parseNumber(options.timeoutMs) ??
    parseNumber(process.env.WISE_TIMEOUT_MS) ??
    stored.timeoutMs ??
    15_000;

  return {
    baseUrl,
    configPath: getConfigPath(),
    output:
      options.output ??
      (process.env.WISE_OUTPUT as OutputFormat | undefined) ??
      stored.output ??
      "table",
    profileId,
    timeoutMs,
    token,
    tokenSource,
  };
}

export function requireProfileId(config: EffectiveConfig, explicit?: number): number {
  const profileId = explicit ?? config.profileId;
  if (!profileId) {
    throw new Error(
      "No profile ID configured. Pass --profile-id <id>, set WISE_PROFILE_ID, or store one after `wise profile list`.",
    );
  }

  return profileId;
}
