import { readFile } from "node:fs/promises";

export async function parseJsonInput(input: string): Promise<unknown> {
  return JSON.parse(await readTextInput(input));
}

export async function readTextInput(input: string): Promise<string> {
  if (input === "-") {
    return readStdin();
  }

  if (input.startsWith("@")) {
    return readFile(input.slice(1), "utf8");
  }

  return input;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}
