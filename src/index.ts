import { Command } from "commander";

import { registerApiCommands } from "./commands/api.js";
import { registerAuthCommands } from "./commands/auth.js";
import { registerBalanceCommands } from "./commands/balance.js";
import { registerCurrencyCommands } from "./commands/currency.js";
import { registerProfileCommands } from "./commands/profile.js";
import { registerQuoteCommands } from "./commands/quote.js";
import { registerRecipientCommands } from "./commands/recipient.js";
import { registerStatementCommands } from "./commands/statement.js";
import { registerTransferCommands } from "./commands/transfer.js";
import { WiseApiError } from "./client.js";

export async function main(argv = process.argv): Promise<void> {
  const program = new Command();

  program
    .name("wise")
    .description("Wise Platform CLI for profiles, balances, recipients, quotes, transfers, statements, and raw API calls.")
    .version("0.1.0")
    .showHelpAfterError()
    .option("--api-token <token>", "Override the configured Wise token for one command")
    .option("--base-url <url>", "Override the Wise API base URL")
    .option("--sandbox", "Use the Wise sandbox base URL")
    .option("--profile-id <id>", "Override the default Wise profile ID")
    .option("--output <format>", "json or table", "table")
    .option("--timeout-ms <ms>", "Request timeout in milliseconds", "15000");

  registerAuthCommands(program);
  registerProfileCommands(program);
  registerBalanceCommands(program);
  registerCurrencyCommands(program);
  registerRecipientCommands(program);
  registerQuoteCommands(program);
  registerTransferCommands(program);
  registerStatementCommands(program);
  registerApiCommands(program);

  try {
    await program.parseAsync(argv);
  } catch (error) {
    handleError(error);
  }
}

function handleError(error: unknown): never {
  if (error instanceof WiseApiError) {
    process.stderr.write(`${error.message}\n`);
    if (error.requestId) {
      process.stderr.write(`request_id=${error.requestId}\n`);
    }
    process.exit(1);
  }

  process.stderr.write(`${(error as Error).message}\n`);
  process.exit(1);
}

void main();
