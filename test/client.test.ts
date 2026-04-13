import { describe, expect, test, vi } from "vitest";

import { WiseClient, WiseApiError } from "../src/client.js";

describe("WiseClient", () => {
  test("retries a rate-limited idempotent request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "slow down" }), {
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "0",
          },
          status: 429,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 1 }]), {
          headers: {
            "Content-Type": "application/json",
          },
          status: 200,
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const client = new WiseClient({
      baseUrl: "https://api.wise-sandbox.com",
      configPath: "/tmp/config.json",
      output: "json",
      timeoutMs: 1_000,
      token: "token",
      tokenSource: "flag",
    });

    const response = await client.request<unknown[]>({
      idempotent: true,
      path: "/v2/profiles",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(response).toEqual([{ id: 1 }]);
  });

  test("surfaces Wise API errors with status and request id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "bad request" }), {
          headers: {
            "Content-Type": "application/json",
            "x-request-id": "req_123",
          },
          status: 400,
        }),
      ),
    );

    const client = new WiseClient({
      baseUrl: "https://api.wise-sandbox.com",
      configPath: "/tmp/config.json",
      output: "json",
      timeoutMs: 1_000,
      token: "token",
      tokenSource: "flag",
    });

    await expect(client.request({ path: "/v2/profiles" })).rejects.toMatchObject({
      message: "Wise API returned 400: bad request",
      requestId: "req_123",
      status: 400,
    } satisfies Partial<WiseApiError>);
  });
});
