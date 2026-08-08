import { describe, it, expect } from "vitest";
import { LOG_CONTEXT } from "./validation";
import { VALIDATION_MESSAGES, CONFIG_MESSAGES } from "./errors";
import { SHARE_QUERY_PARAMS } from "./share";

describe("LOG_CONTEXT — Iteration 185 additions", () => {
  it("defines RATE_LIMITER for rate limiter configuration warnings", () => {
    expect(LOG_CONTEXT.RATE_LIMITER).toBe("RateLimiter");
  });

  it("defines RATE_LIMIT for rate limit enforcement blocks", () => {
    expect(LOG_CONTEXT.RATE_LIMIT).toBe("RateLimit");
  });

  it("defines API_ERROR for uncaught API error handling", () => {
    expect(LOG_CONTEXT.API_ERROR).toBe("API Error");
  });

  it("defines AUTH_CONFIG for authentication configuration warnings", () => {
    expect(LOG_CONTEXT.AUTH_CONFIG).toBe("AuthenticationConfig");
  });

  it("defines AUTH_USER_AUTHENTICATED for successful user authentication", () => {
    expect(LOG_CONTEXT.AUTH_USER_AUTHENTICATED).toBe("User authenticated");
  });

  it("defines PROMPT_INJECTION for prompt injection detection", () => {
    expect(LOG_CONTEXT.PROMPT_INJECTION).toBe("PromptInjection");
  });
});

describe("VALIDATION_MESSAGES — Iteration 185 additions", () => {
  it("formats CONTENT_TYPE_MISMATCH with the expected type", () => {
    expect(VALIDATION_MESSAGES.CONTENT_TYPE_MISMATCH("application/json")).toBe(
      "Content-Type must be application/json"
    );
  });
});

describe("SHARE_QUERY_PARAMS", () => {
  it("defines the share verify token query param", () => {
    expect(SHARE_QUERY_PARAMS.TOKEN).toBe("token");
  });
});

describe("CONFIG_MESSAGES regression guard", () => {
  it("still exposes VALIDATED_DATA_NOT_FOUND", () => {
    expect(CONFIG_MESSAGES.VALIDATED_DATA_NOT_FOUND).toBeDefined();
  });
});
