import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { OutputFormat } from "./config.js";

export function printOutput(value: unknown, format: OutputFormat): void {
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
    return;
  }

  if (Array.isArray(value)) {
    console.table(value.map((row) => compactRow(row)));
    return;
  }

  if (value && typeof value === "object") {
    console.table([compactRow(value)]);
    return;
  }

  process.stdout.write(`${String(value)}\n`);
}

export async function writeBinaryOutput(
  filePath: string,
  contents: Buffer | string,
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
}

function compactRow(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return { value };
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      entry && typeof entry === "object" ? JSON.stringify(entry) : entry,
    ]),
  );
}
