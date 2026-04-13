import { randomUUID } from "node:crypto";

import { Command } from "commander";

import { WiseClient } from "../client.js";
import { printOutput } from "../output.js";
import { getBodyInput, getConfigFromCommand } from "../util.js";
import { requireProfileId } from "../config.js";

export function registerBalanceCommands(program: Command): void {
  const balance = program.command("balance").description("Manage balances for a profile.");

  balance
    .command("list")
    .description("List balances for a profile.")
    .option(
      "--types <types>",
      "Comma-separated balance types to return. Wise currently accepts STANDARD and SAVINGS.",
      "STANDARD,SAVINGS",
    )
    .action(async (_options, command) => {
      const options = command.opts();
      const config = await getConfigFromCommand(command);
      const profileId = requireProfileId(config);
      const client = new WiseClient(config);
      const data = await client.request({
        path: `/v4/profiles/${profileId}/balances`,
        query: {
          types: options.types,
        },
      });
      printOutput(data, config.output);
    });

  balance
    .command("show")
    .description("Get a single balance by ID.")
    .argument("<balanceId>", "Balance ID")
    .action(async (balanceId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const profileId = requireProfileId(config);
      const client = new WiseClient(config);
      const data = await client.request({
        path: `/v4/profiles/${profileId}/balances/${balanceId}`,
      });
      printOutput(data, config.output);
    });

  balance
    .command("create")
    .description("Create a balance from a JSON request body.")
    .requiredOption("--body <json-or-@file>", "Request body as inline JSON or @file")
    .action(async (options, command) => {
      const config = await getConfigFromCommand(command);
      const profileId = requireProfileId(config);
      const client = new WiseClient(config);
      const data = await client.request({
        body: await getBodyInput(options.body),
        headers: {
          "X-idempotence-uuid": randomUUID(),
        },
        method: "POST",
        path: `/v4/profiles/${profileId}/balances`,
      });
      printOutput(data, config.output);
    });

  balance
    .command("close")
    .description("Close a balance by ID.")
    .argument("<balanceId>", "Balance ID")
    .action(async (balanceId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const profileId = requireProfileId(config);
      const client = new WiseClient(config);
      const data = await client.request({
        method: "DELETE",
        path: `/v4/profiles/${profileId}/balances/${balanceId}`,
      });
      printOutput(data, config.output);
    });
}
