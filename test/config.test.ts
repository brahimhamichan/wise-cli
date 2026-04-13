import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { loadStoredConfig, resolveConfig, saveStoredConfig } from "../src/config.js";

const createdDirs: string[] = [];

afterEach(async () => {
  delete process.env.HOME;
  delete process.env.WISE_TOKEN;
  delete process.env.WISE_PROFILE_ID;

  while (createdDirs.length) {
    const dir = createdDirs.pop();
    if (dir) {
      await rm(dir, { force: true, recursive: true });
    }
  }
});

describe("config", () => {
  test("stores config with the saved token", async () => {
    const home = await createHome();
    process.env.HOME = home;

    await saveStoredConfig({
      profileId: 1234,
      token: "stored-token",
    });

    const config = await loadStoredConfig();
    expect(config.token).toBe("stored-token");

    const raw = await readFile(path.join(home, ".config", "wise-cli", "config.json"), "utf8");
    expect(raw).toContain("stored-token");
  });

  test("prefers explicit flags over env and stored values", async () => {
    const home = await createHome();
    process.env.HOME = home;
    process.env.WISE_TOKEN = "env-token";
    process.env.WISE_PROFILE_ID = "200";

    await saveStoredConfig({
      profileId: 100,
      token: "stored-token",
    });

    const resolved = await resolveConfig({
      apiToken: "flag-token",
      profileId: "300",
      sandbox: true,
    });

    expect(resolved.token).toBe("flag-token");
    expect(resolved.tokenSource).toBe("flag");
    expect(resolved.profileId).toBe(300);
    expect(resolved.baseUrl).toBe("https://api.wise-sandbox.com");
  });
});

async function createHome(): Promise<string> {
  const home = await mkdtemp(path.join(tmpdir(), "wise-cli-test-"));
  createdDirs.push(home);
  return home;
}
