import { vi } from "vitest";
import { loadConfig } from "./config/env";
import { setEnvConfig } from "./config/constants";

/**
 * Common test utilities and mocks for API tests
 */

export const MOCK_ENV = {
  OPENAI_API_KEY: "test-key",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  OPENAI_MODEL: "gpt-4",
  OPENAI_TIMEOUT_MS: "60000",
  OPENAI_MAX_TOKENS: "4000",
  OPENAI_TEMPERATURE: "0.7",
  API_VERSION: "1.0.0",
  CORS_ORIGIN: "*",
  CORS_MAX_AGE: "86400",
  RATE_LIMIT_WINDOW_MS: "60000",
  RATE_LIMIT_STRICT_MAX: "10",
  RATE_LIMIT_STANDARD_MAX: "60",
  RATE_LIMIT_LENIENT_MAX: "120",
  STORAGE_QUOTA_MB: "5",
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: "5",
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS: "60000",
  CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: "3",
  RETRY_MAX_RETRIES: "3",
  RETRY_INITIAL_DELAY_MS: "1000",
  RETRY_BACKOFF_FACTOR: "2",
  RETRY_MAX_DELAY_MS: "10000",
  PROJECT_HOMEPAGE_URL: "https://blueprint-generator.pages.dev",
  GITHUB_URL: "https://github.com",
} as const;

export const MOCK_ENV_NO_KEY = {
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  OPENAI_MODEL: "gpt-4",
  OPENAI_TIMEOUT_MS: "60000",
  OPENAI_MAX_TOKENS: "4000",
  OPENAI_TEMPERATURE: "0.7",
  API_VERSION: "1.0.0",
  CORS_ORIGIN: "*",
  CORS_MAX_AGE: "86400",
  RATE_LIMIT_WINDOW_MS: "60000",
  RATE_LIMIT_STRICT_MAX: "10",
  RATE_LIMIT_STANDARD_MAX: "60",
  RATE_LIMIT_LENIENT_MAX: "120",
  STORAGE_QUOTA_MB: "5",
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: "5",
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS: "60000",
  CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: "3",
  RETRY_MAX_RETRIES: "3",
  RETRY_INITIAL_DELAY_MS: "1000",
  RETRY_BACKOFF_FACTOR: "2",
  RETRY_MAX_DELAY_MS: "10000",
  PROJECT_HOMEPAGE_URL: "https://blueprint-generator.pages.dev",
  GITHUB_URL: "https://github.com",
} as const;

export function setupTestConfig(env: Record<string, string> = MOCK_ENV) {
  const config = loadConfig(env);
  setEnvConfig(config);
}

export function setupCommonMocks() {
  vi.mock("../services/openai", () => ({
    streamCompletion: vi.fn(),
  }));
}

export function setupStreamMocks(mockResponse = "mock-stream") {
  vi.mock("../utils/stream", () => ({
    createStreamFromGenerator: vi.fn(),
    createSSEResponse: vi
      .fn()
      .mockImplementation(() => new Response(mockResponse)),
  }));
}
