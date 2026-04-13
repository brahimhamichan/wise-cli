import { Command } from "commander";

import { WiseClient } from "../client.js";
import { printOutput } from "../output.js";
import { getConfigFromCommand } from "../util.js";

export function registerProfileCommands(program: Command): void {
  const profile = program.command("profile").description("Inspect Wise profiles.");

  profile
    .command("list")
    .description("List available personal and business profiles.")
    .action(async (_options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request<unknown[]>({ path: "/v2/profiles" });
      printOutput(data, config.output);
    });

  profile
    .command("show")
    .description("Show a profile by ID.")
    .argument("<profileId>", "Wise profile ID")
    .action(async (profileId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        path: `/v2/profiles/${profileId}`,
      });
      printOutput(data, config.output);
    });
}
