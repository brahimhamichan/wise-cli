import { Command } from "commander";

import { requireProfileId } from "../config.js";
import { WiseClient } from "../client.js";
import { printOutput, writeBinaryOutput } from "../output.js";
import { getBodyInput, getConfigFromCommand } from "../util.js";

export function registerTransferCommands(program: Command): void {
  const transfer = program.command("transfer").description("Create and inspect transfers.");

  transfer
    .command("list")
    .description("List transfers for the current or configured profile.")
    .option("--status <status>", "Filter by transfer status")
    .option("--created-after <timestamp>", "Filter transfers created after a UTC timestamp")
    .option("--created-before <timestamp>", "Filter transfers created before a UTC timestamp")
    .action(async (options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        path: "/v1/transfers",
        query: {
          createdDateEnd: options.createdBefore,
          createdDateStart: options.createdAfter,
          profile: config.profileId,
          status: options.status,
        },
      });
      printOutput(data, config.output);
    });

  transfer
    .command("show")
    .description("Show a transfer by ID.")
    .argument("<transferId>", "Transfer ID")
    .action(async (transferId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        path: `/v1/transfers/${transferId}`,
      });
      printOutput(data, config.output);
    });

  transfer
    .command("requirements")
    .description("Validate transfer requirements from a JSON body.")
    .requiredOption("--body <json-or-@file>", "Request body as inline JSON or @file")
    .action(async (options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        body: await getBodyInput(options.body),
        method: "POST",
        path: "/v1/transfer-requirements",
      });
      printOutput(data, config.output);
    });

  transfer
    .command("create")
    .description("Create a transfer from a JSON body.")
    .requiredOption("--body <json-or-@file>", "Request body as inline JSON or @file")
    .action(async (options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        body: await getBodyInput(options.body),
        idempotent: true,
        method: "POST",
        path: "/v1/transfers",
      });
      printOutput(data, config.output);
    });

  transfer
    .command("fund")
    .description("Fund a transfer from a JSON body.")
    .argument("<transferId>", "Transfer ID")
    .requiredOption("--body <json-or-@file>", "Funding body as inline JSON or @file")
    .action(async (transferId, options, command) => {
      const config = await getConfigFromCommand(command);
      const profileId = requireProfileId(config);
      const client = new WiseClient(config);
      const data = await client.request({
        body: await getBodyInput(options.body),
        method: "POST",
        path: `/v3/profiles/${profileId}/transfers/${transferId}/payments`,
      });
      printOutput(data, config.output);
    });

  transfer
    .command("payments")
    .description("List completed payments used to fund a transfer.")
    .argument("<transferId>", "Transfer ID")
    .action(async (transferId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        path: `/v1/transfers/${transferId}/payments`,
      });
      printOutput(data, config.output);
    });

  transfer
    .command("cancel")
    .description("Cancel a transfer when Wise allows it.")
    .argument("<transferId>", "Transfer ID")
    .action(async (transferId, _options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const data = await client.request({
        method: "PUT",
        path: `/v1/transfers/${transferId}/cancel`,
      });
      printOutput(data, config.output);
    });

  transfer
    .command("receipt")
    .description("Download a transfer receipt or related PDF.")
    .argument("<transferId>", "Transfer ID")
    .option("--kind <kind>", "receipt, us-combined, or noc", "receipt")
    .option("--out <file>", "Output path for the downloaded file")
    .action(async (transferId, options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const pathByKind: Record<string, string> = {
        noc: `/v1/transfers/${transferId}/documents/noc`,
        receipt: `/v1/transfers/${transferId}/receipt.pdf`,
        "us-combined": `/v1/transfers/${transferId}/us-combined-receipt.pdf`,
      };
      const endpoint = pathByKind[options.kind];
      if (!endpoint) {
        throw new Error(`Unsupported receipt kind "${options.kind}".`);
      }

      const data = await client.request<Buffer>({
        headers: {
          Accept: "application/pdf",
        },
        path: endpoint,
        responseType: "buffer",
      });
      const filePath = options.out ?? `./transfer-${transferId}-${options.kind}.pdf`;
      await writeBinaryOutput(filePath, data);
      process.stdout.write(`${filePath}\n`);
    });
}
