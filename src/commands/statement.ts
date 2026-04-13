import { Command } from "commander";

import { requireProfileId } from "../config.js";
import { WiseClient } from "../client.js";
import { printOutput, writeBinaryOutput } from "../output.js";
import { getConfigFromCommand } from "../util.js";

export function registerStatementCommands(program: Command): void {
  const statement = program.command("statement").description("Download balance statements.");

  statement
    .command("get")
    .description("Download a balance statement in JSON, CSV, PDF, XLSX, XML, MT940, or QIF.")
    .argument("<balanceId>", "Balance ID")
    .requiredOption("--currency <code>", "Statement currency, for example EUR")
    .requiredOption("--start <timestamp>", "UTC interval start, for example 2025-03-01T00:00:00.000Z")
    .requiredOption("--end <timestamp>", "UTC interval end, for example 2025-04-30T23:59:59.999Z")
    .option("--format <format>", "json, csv, pdf, xlsx, xml, mt940, qif", "json")
    .option("--type <type>", "COMPACT or FLAT", "COMPACT")
    .option("--locale <locale>", "Statement locale, for example en")
    .option("--out <file>", "Output path for file formats or JSON snapshots")
    .action(async (balanceId, options, command) => {
      const config = await getConfigFromCommand(command);
      const profileId = requireProfileId(config);
      const client = new WiseClient(config);
      const format = options.format.toLowerCase();
      const data = await client.request<unknown>({
        path: `/v1/profiles/${profileId}/balance-statements/${balanceId}/statement.${format}`,
        query: {
          currency: options.currency,
          intervalEnd: options.end,
          intervalStart: options.start,
          statementLocale: options.locale,
          type: options.type,
        },
        responseType: format === "json" ? "json" : "buffer",
      });

      if (format === "json") {
        if (options.out) {
          await writeBinaryOutput(options.out, `${JSON.stringify(data, null, 2)}\n`);
          process.stdout.write(`${options.out}\n`);
          return;
        }

        printOutput(data, config.output);
        return;
      }

      const outputPath = options.out ?? `./balance-${balanceId}-statement.${format}`;
      await writeBinaryOutput(outputPath, data as Buffer);
      process.stdout.write(`${outputPath}\n`);
    });
}
