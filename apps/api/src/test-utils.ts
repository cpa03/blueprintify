import { vi } from "vitest";

/**
 * Common test utilities and mocks for API tests
 */

export const MOCK_ENV = {
  OPENAI_API_KEY: "test-key",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  OPENAI_MODEL: "gpt-4",
} as const;

export const MOCK_ENV_NO_KEY = {
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  OPENAI_MODEL: "gpt-4",
} as const;

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
