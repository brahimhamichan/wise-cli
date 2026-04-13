import { Command } from "commander";

import { requireProfileId } from "../config.js";
import { WiseClient } from "../client.js";
import { printOutput } from "../output.js";
import { getBodyInput, getConfigFromCommand } from "../util.js";

export function registerQuoteCommands(program: Command): void {
  const quote = program.command("quote").description("Create and inspect quotes.");

  quote
    .command("preview")
    .description("Create an unauthenticated preview quote.")
    .requiredOption("--body <json-or-@file>", "Request body as inline JSON or @file")
    .action(async (options, command) => {
      const config = await getConfigFromCommand(command, false);
      const client = new WiseClient(config);
      const data = await client.request({
        body: await getBodyInput(options.body),
        method: "POST",
        path: "/v3/quotes",
        tokenOptional: true,
      });
      printOutput(data, config.output);
    });

  quote
    .command("create")
    .description("Create an authenticated quote.")
    .requiredOption("--body <json-or-@file>", "Request body as inline JSON or @file")
    .action(async (options, command) => {
      const config = await getConfigFromCommand(command);
      const profileId = requireProfileId(config);
      const client = new WiseClient(config);
      const data = await client.request({
        body: await getBodyInput(options.body),
        method: "POST",
        path: `/v3/profiles/${profileId}/quotes`,
      });
      printOutput(data, config.output);
    });

  quote
    .command("show")
    .description("Show a quote by ID.")
    .argument("<quoteId>", "Quote ID")
    .action(async (quoteId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const profileId = requireProfileId(config);
      const client = new WiseClient(config);
      const data = await client.request({
        path: `/v3/profiles/${profileId}/quotes/${quoteId}`,
      });
      printOutput(data, config.output);
    });

  quote
    .command("update")
    .description("Update an authenticated quote.")
    .argument("<quoteId>", "Quote ID")
    .requiredOption("--body <json-or-@file>", "Request body as inline JSON or @file")
    .action(async (quoteId, options, command) => {
      const config = await getConfigFromCommand(command);
      const profileId = requireProfileId(config);
      const client = new WiseClient(config);
      const data = await client.request({
        body: await getBodyInput(options.body),
        method: "PATCH",
        path: `/v3/profiles/${profileId}/quotes/${quoteId}`,
      });
      printOutput(data, config.output);
    });
}
