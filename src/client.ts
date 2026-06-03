import { setTimeout as sleep } from "node:timers/promises";

import type { EffectiveConfig } from "./config.js";

export class WiseApiError extends Error {
  body: unknown;
  requestId?: string;
  status: number;

  constructor(message: string, status: number, body: unknown, requestId?: string) {
    super(message);
    this.name = "WiseApiError";
    this.status = status;
    this.body = body;
    this.requestId = requestId;
  }
}

export interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  idempotent?: boolean;
  method?: string;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  responseType?: "auto" | "buffer" | "json" | "text";
  tokenOptional?: boolean;
}

export class WiseClient {
  constructor(private readonly config: EffectiveConfig) {}

  async request<T>(options: RequestOptions): Promise<T> {
    const url = new URL(options.path, `${this.config.baseUrl}/`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const method = (options.method ?? "GET").toUpperCase();
    const headers = new Headers(options.headers);
    headers.set("User-Agent", "@brahimhamichan/wise-cli/0.1.2");

    if (!options.tokenOptional) {
      if (!this.config.token) {
        throw new Error("A Wise API token is required for this command.");
      }

      headers.set("Authorization", `Bearer ${this.config.token}`);
    } else if (this.config.token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${this.config.token}`);
    }

    let body: string | undefined;
    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }

    const attempts = options.idempotent || ["DELETE", "GET", "HEAD", "OPTIONS"].includes(method) ? 3 : 1;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

      try {
        const response = await fetch(url, {
          body,
          headers,
          method,
          signal: controller.signal,
        });

        if (response.status === 429 || response.status >= 500) {
          if (attempt < attempts) {
            const retryAfterHeader = response.headers.get("Retry-After");
            const retryAfter = retryAfterHeader ? Number(retryAfterHeader) * 1_000 : 250 * attempt ** 2;
            await sleep(Number.isFinite(retryAfter) ? retryAfter : 250 * attempt ** 2);
            continue;
          }
        }

        if (!response.ok) {
          const errorBody = await parseResponse(response, "auto");
          throw new WiseApiError(
            buildErrorMessage(response.status, errorBody),
            response.status,
            errorBody,
            response.headers.get("x-request-id") ?? undefined,
          );
        }

        return (await parseResponse(response, options.responseType ?? "auto")) as T;
      } catch (error) {
        if (error instanceof WiseApiError) {
          throw error;
        }

        if ((error as Error).name === "AbortError") {
          throw new Error(`Request timed out after ${this.config.timeoutMs}ms.`);
        }

        if (attempt >= attempts) {
          throw error;
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error("Request failed after retries.");
  }
}

async function parseResponse(
  response: Response,
  responseType: RequestOptions["responseType"],
): Promise<unknown> {
  if (responseType === "buffer") {
    return Buffer.from(await response.arrayBuffer());
  }

  if (responseType === "text") {
    return response.text();
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (responseType === "json" || contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function buildErrorMessage(status: number, body: unknown): string {
  if (typeof body === "string" && body.trim()) {
    return `Wise API returned ${status}: ${body.trim()}`;
  }

  if (body && typeof body === "object") {
    const candidate =
      (body as Record<string, unknown>).message ??
      (body as Record<string, unknown>).error ??
      (body as Record<string, unknown>).errorMessage ??
      (body as Record<string, unknown>).title;

    if (typeof candidate === "string" && candidate.trim()) {
      return `Wise API returned ${status}: ${candidate}`;
    }
  }

  return `Wise API returned ${status}.`;
}
