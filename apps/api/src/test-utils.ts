import { vi } from "vitest";
import { loadConfig, DEFAULTS } from "./config/env";
import { setEnvConfig } from "./config/constants";

/**
 * Common test utilities and mocks for API tests
 */

/**
 * Helper to convert DEFAULTS to string format for env vars
 * This ensures test mocks stay in sync with production defaults
 */
const createDefaultsEnvStrings = (): Record<string, string> => ({
  OPENAI_BASE_URL: DEFAULTS.OPENAI_BASE_URL ?? "",
  OPENAI_MODEL: DEFAULTS.OPENAI_MODEL,
  OPENAI_TIMEOUT_MS: String(DEFAULTS.OPENAI_TIMEOUT_MS),
  OPENAI_MAX_TOKENS: String(DEFAULTS.OPENAI_MAX_TOKENS),
  OPENAI_TEMPERATURE: String(DEFAULTS.OPENAI_TEMPERATURE),
  API_VERSION: DEFAULTS.API_VERSION,
  CORS_ORIGIN: "http://localhost:3000", // Must be non-empty for validation
  CORS_MAX_AGE: String(DEFAULTS.CORS_MAX_AGE),
  RATE_LIMIT_WINDOW_MS: String(DEFAULTS.RATE_LIMIT_WINDOW_MS),
  RATE_LIMIT_STRICT_MAX: String(DEFAULTS.RATE_LIMIT_STRICT_MAX),
  RATE_LIMIT_STANDARD_MAX: String(DEFAULTS.RATE_LIMIT_STANDARD_MAX),
  RATE_LIMIT_LENIENT_MAX: String(DEFAULTS.RATE_LIMIT_LENIENT_MAX),
  STORAGE_QUOTA_MB: String(DEFAULTS.STORAGE_QUOTA_MB),
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: String(
    DEFAULTS.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
  ),
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS: String(
    DEFAULTS.CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
  ),
  CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: String(
    DEFAULTS.CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS,
  ),
  RETRY_MAX_RETRIES: String(DEFAULTS.RETRY_MAX_RETRIES),
  RETRY_INITIAL_DELAY_MS: String(DEFAULTS.RETRY_INITIAL_DELAY_MS),
  RETRY_BACKOFF_FACTOR: String(DEFAULTS.RETRY_BACKOFF_FACTOR),
  RETRY_MAX_DELAY_MS: String(DEFAULTS.RETRY_MAX_DELAY_MS),
  PROJECT_HOMEPAGE_URL: DEFAULTS.PROJECT_HOMEPAGE_URL,
  GITHUB_URL: DEFAULTS.GITHUB_URL,
});

const DEFAULTS_ENV_STRINGS = createDefaultsEnvStrings();

export const MOCK_ENV: Record<string, string> = {
  OPENAI_API_KEY: "test-key",
  ...DEFAULTS_ENV_STRINGS,
};

export const MOCK_ENV_NO_KEY: Record<string, string> = {
  ...DEFAULTS_ENV_STRINGS,
};

export function setupTestConfig(env: Record<string, string> = MOCK_ENV): void {
  const config = loadConfig(env);
  setEnvConfig(config);
}

export function setupCommonMocks(): void {
  vi.mock("../services/openai", () => ({
    streamCompletion: vi.fn(),
  }));
}

export function setupStreamMocks(mockResponse = "mock-stream"): void {
  vi.mock("../utils/stream", () => ({
    createStreamFromGenerator: vi.fn(),
    createSSEResponse: vi
      .fn()
      .mockImplementation(() => new Response(mockResponse)),
  }));
}
