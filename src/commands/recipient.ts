import { Command } from "commander";

import { WiseClient } from "../client.js";
import { printOutput } from "../output.js";
import { getBodyInput, getConfigFromCommand } from "../util.js";

export function registerRecipientCommands(program: Command): void {
  const recipient = program.command("recipient").description("Manage recipient accounts.");

  recipient
    .command("list")
    .description("List recipients, optionally filtered by profile or currency.")
    .option("--currency <code>", "Filter by target currency")
    .action(async (options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        path: "/v2/accounts",
        query: {
          currency: options.currency,
          profileId: config.profileId,
        },
      });
      printOutput(data, config.output);
    });

  recipient
    .command("show")
    .description("Show a recipient by account ID.")
    .argument("<accountId>", "Recipient account ID")
    .action(async (accountId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        path: `/v2/accounts/${accountId}`,
      });
      printOutput(data, config.output);
    });

  recipient
    .command("create")
    .description("Create a recipient from a JSON request body.")
    .requiredOption("--body <json-or-@file>", "Request body as inline JSON or @file")
    .option("--refund", "Create a refund recipient instead of a standard recipient")
    .action(async (options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        body: await getBodyInput(options.body),
        method: "POST",
        path: "/v1/accounts",
        query: {
          refund: options.refund ? true : undefined,
        },
      });
      printOutput(data, config.output);
    });

  recipient
    .command("delete")
    .description("Deactivate a recipient account.")
    .argument("<accountId>", "Recipient account ID")
    .action(async (accountId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        method: "DELETE",
        path: `/v2/accounts/${accountId}`,
      });
      printOutput(data, config.output);
    });

  recipient
    .command("requirements")
    .description("Load recipient requirements for a quote.")
    .argument("<quoteId>", "Quote ID")
    .action(async (quoteId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        headers: {
          "Accept-Minor-Version": "1",
        },
        path: `/v1/quotes/${quoteId}/account-requirements`,
      });
      printOutput(data, config.output);
    });
}
