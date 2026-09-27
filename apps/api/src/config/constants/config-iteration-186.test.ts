import { describe, it, expect } from "vitest";
import { SHARE_ROUTE_PARAMS } from "./share";

describe("SHARE_ROUTE_PARAMS — Iteration 186 additions", () => {
  it("defines the share ID route param key", () => {
    expect(SHARE_ROUTE_PARAMS.ID).toBe("id");
  });
});
