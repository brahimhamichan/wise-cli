import type { Command } from "commander";

import type { EffectiveConfig, GlobalOptions } from "./config.js";
import { requireProfileId, resolveConfig } from "./config.js";
import { parseJsonInput } from "./input.js";

export async function getConfigFromCommand(
  command: Command,
  requireToken = true,
): Promise<EffectiveConfig> {
  return resolveConfig(getGlobalOptions(command), requireToken);
}

export async function getBodyInput(body?: string): Promise<unknown> {
  if (!body) {
    throw new Error("This command requires --body '<json>' or --body @file.json.");
  }

  return parseJsonInput(body);
}

export function getProfileId(command: Command, explicit?: number): number {
  const globals = command.optsWithGlobals() as GlobalOptions;
  const config = {
    profileId: globals.profileId ? Number(globals.profileId) : undefined,
  } as EffectiveConfig;

  return requireProfileId(config, explicit);
}

export function parseQueryEntries(entries: string[]): Record<string, string> {
  return Object.fromEntries(
    entries.map((entry) => {
      const index = entry.indexOf("=");
      if (index === -1) {
        throw new Error(`Expected key=value but received "${entry}".`);
      }

      return [entry.slice(0, index), entry.slice(index + 1)];
    }),
  );
}

export function getGlobalOptions(command: Command): GlobalOptions {
  const chain: Command[] = [];
  let cursor: Command | null = command;

  while (cursor) {
    chain.unshift(cursor);
    cursor = cursor.parent;
  }

  return chain.reduce<GlobalOptions>(
    (merged, current) => ({
      ...merged,
      ...(current.opts() as GlobalOptions),
    }),
    {},
  );
}
