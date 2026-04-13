import { Command } from "commander";

import { clearStoredConfig, loadStoredConfig, resolveConfig, saveStoredConfig } from "../config.js";
import { printOutput } from "../output.js";
import { getConfigFromCommand } from "../util.js";

export function registerAuthCommands(program: Command): void {
  const auth = program.command("auth").description("Configure token-based access.");

  auth
    .command("login")
    .description("Store a personal token in the local config file.")
    .requiredOption("--token <token>", "Personal token from Wise > Integrations and tools")
    .option("--profile-id <id>", "Optional default profile ID")
    .option("--sandbox", "Persist the Wise sandbox base URL")
    .option("--base-url <url>", "Persist a custom Wise API base URL")
    .action(async (options) => {
      const existing = await loadStoredConfig();
      const effective = await resolveConfig(
        {
          baseUrl: options.baseUrl,
          profileId: options.profileId,
          sandbox: options.sandbox,
        },
        false,
      );

      await saveStoredConfig({
        ...existing,
        baseUrl: effective.baseUrl,
        output: existing.output ?? "table",
        profileId: options.profileId ? Number(options.profileId) : existing.profileId,
        timeoutMs: existing.timeoutMs ?? 15_000,
        token: options.token,
      });

      process.stdout.write(`Saved configuration to ${effective.configPath}\n`);
    });

  auth
    .command("status")
    .description("Show the current auth and config state.")
    .action(async (options, command) => {
      const config = await getConfigFromCommand(command, false);
      printOutput(
        {
          baseUrl: config.baseUrl,
          configPath: config.configPath,
          output: config.output,
          profileId: config.profileId ?? null,
          timeoutMs: config.timeoutMs,
          tokenConfigured: Boolean(config.token),
          tokenSource: config.tokenSource,
        },
        config.output,
      );
    });

  auth
    .command("logout")
    .description("Remove the local config file.")
    .action(async () => {
      await clearStoredConfig();
      process.stdout.write("Removed local Wise CLI configuration.\n");
    });
}
