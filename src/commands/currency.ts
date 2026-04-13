import { Command } from "commander";

import { WiseClient } from "../client.js";
import { printOutput } from "../output.js";
import { getConfigFromCommand } from "../util.js";

export function registerCurrencyCommands(program: Command): void {
  const currency = program.command("currency").description("Inspect supported currencies.");

  currency
    .command("list")
    .description("List transfer-supported currencies.")
    .action(async (_options, command) => {
      const config = await getConfigFromCommand(command, false);
      const client = new WiseClient(config);
      const data = await client.request({
        path: "/v1/currencies",
        tokenOptional: true,
      });
      printOutput(data, config.output);
    });
}
