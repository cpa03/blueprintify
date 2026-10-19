import { describe, it, expect } from "vitest";
import { SHARE_ROUTE_PARAMS, SHARE_QUERY_PARAMS } from "./share";

describe("SHARE_ROUTE_PARAMS — Iteration 190 additions", () => {
  it("defines the share ID route param", () => {
    expect(SHARE_ROUTE_PARAMS.ID).toBe("id");
  });

  it("has 1 entry", () => {
    expect(Object.keys(SHARE_ROUTE_PARAMS).length).toBe(1);
  });
});

describe("SHARE_QUERY_PARAMS regression guard", () => {
  it("still defines the share verify token query param", () => {
    expect(SHARE_QUERY_PARAMS.TOKEN).toBe("token");
  });
});
