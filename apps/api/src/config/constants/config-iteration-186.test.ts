import { describe, it, expect } from "vitest";
import { CRYPTO_CONFIG, SHARE_TOKEN_CODEC, TIME_UNITS } from "@blueprint/shared";
import { nowMs, nowSeconds } from "../../errors";

describe("Flexy Iteration 186 constants", () => {
  it("HEX_PAD_CHAR is zero", () => {
    expect(CRYPTO_CONFIG.HEX_PAD_CHAR).toBe("0");
  });

  it("SHARE_TOKEN_CODEC delimiters and radix", () => {
    expect(SHARE_TOKEN_CODEC.PAYLOAD_SEPARATOR).toBe(".");
    expect(SHARE_TOKEN_CODEC.FIELD_SEPARATOR).toBe(":");
    expect(SHARE_TOKEN_CODEC.EXPIRY_RADIX).toBe(10);
    expect(SHARE_TOKEN_CODEC.MISSING_PART_FALLBACK).toBe("");
    expect(SHARE_TOKEN_CODEC.MISSING_EXPIRY_FALLBACK).toBe("0");
  });

  it("SHARE_TOKEN_CODEC base64url mapping", () => {
    expect(SHARE_TOKEN_CODEC.BASE64_PLUS).toBe("+");
    expect(SHARE_TOKEN_CODEC.BASE64URL_DASH).toBe("-");
    expect(SHARE_TOKEN_CODEC.BASE64_SLASH).toBe("/");
    expect(SHARE_TOKEN_CODEC.BASE64URL_UNDERSCORE).toBe("_");
  });

  it("nowMs tracks Date.now", () => {
    const before = Date.now();
    const value = nowMs();
    const after = Date.now();
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(after);
  });

  it("nowSeconds tracks floored epoch seconds", () => {
    const expected = Math.floor(Date.now() / TIME_UNITS.MS_PER_SECOND);
    expect(Math.abs(nowSeconds() - expected)).toBeLessThanOrEqual(1);
  });
});
