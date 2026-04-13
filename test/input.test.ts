import { describe, expect, test } from "vitest";

import { parseQueryEntries } from "../src/util.js";

describe("parseQueryEntries", () => {
  test("converts repeated key=value pairs into an object", () => {
    expect(parseQueryEntries(["currency=EUR", "profileId=12"])).toEqual({
      currency: "EUR",
      profileId: "12",
    });
  });
});
