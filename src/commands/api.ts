import { Command } from "commander";

import { WiseClient } from "../client.js";
import { printOutput, writeBinaryOutput } from "../output.js";
import { getBodyInput, getConfigFromCommand, parseQueryEntries } from "../util.js";

export function registerApiCommands(program: Command): void {
  program
    .command("api")
    .description("Raw Wise API escape hatch for unsupported endpoints.")
    .argument("<method>", "HTTP method")
    .argument("<path>", "Request path, for example /v1/transfers")
    .option("--body <json-or-@file>", "Request body as inline JSON or @file")
    .option("--query <key=value...>", "Repeatable query parameters", collectValues, [])
    .option("--header <key=value...>", "Repeatable extra headers", collectValues, [])
    .option("--response-type <type>", "auto, json, text, or buffer", "auto")
    .option("--out <file>", "Output path for buffer or text responses")
    .action(async (method, requestPath, options, command) => {
      const config = await getConfigFromCommand(command);
      const client = new WiseClient(config);
      const responseType = options.responseType as "auto" | "buffer" | "json" | "text";
      const data = await client.request<unknown>({
        body: options.body ? await getBodyInput(options.body) : undefined,
        headers: parseQueryEntries(options.header),
        method,
        path: requestPath,
        query: parseQueryEntries(options.query),
        responseType,
      });

      if (options.out) {
        const contents =
          Buffer.isBuffer(data) || typeof data === "string"
            ? data
            : `${JSON.stringify(data, null, 2)}\n`;
        await writeBinaryOutput(options.out, contents);
        process.stdout.write(`${options.out}\n`);
        return;
      }

      printOutput(data, config.output);
    });
}

function collectValues(value: string, previous: string[]): string[] {
  previous.push(value);
  return previous;
}
