import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkHealth } from "./api";

// Mock the @blueprint/shared module
vi.mock("@blueprint/shared", () => ({
  RETRY_CONFIG: {
    DEFAULT_RETRIES: 3,
    DEFAULT_INITIAL_DELAY: 100,
    DEFAULT_BACKOFF_FACTOR: 2,
    DEFAULT_MAX_DELAY: 5000,
  },
  HTTP_HEADERS: {
    CONTENT_TYPE_JSON: "application/json",
  },
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
}));

// Mock the constants module
vi.mock("../config/constants", () => ({
  API_ENDPOINTS: {
    GENERATE: "/generate",
    TASKS: "/tasks",
    REFINE: "/refine",
    HEALTH: "/",
    EXPORT: "/export",
    IMPORT: "/import",
    STORAGE: "/storage",
    SHARE: "/share",
  },
  API_ERROR_MESSAGES: {
    NO_RESPONSE_BODY: "No response body",
    STREAM_ERROR: "Stream error",
    GENERATION_FAILED: "Generation failed",
    TASK_GENERATION_FAILED: "Task generation failed",
    REFINEMENT_FAILED: "Refinement failed",
  },
  SSE_CONFIG: {
    EVENT_SEPARATOR: "\n\n",
    DATA_PREFIX: "data: ",
    EVENT_TYPES: {
      CONTENT: "content",
      ERROR: "error",
      DONE: "done",
    },
  },
  UI_FALLBACKS: {
    API_BASE: "http://localhost:8787",
  },
  TIMEOUTS: {
    API_CONNECTION: 30000,
    API_HEALTH_CHECK: 5000,
  },
}));

describe("API Client", () => {
  describe("checkHealth", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("should return true when API is healthy", async () => {
      const mockResponse = {
        ok: true,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const result = await checkHealth();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalled();
    });

    it("should return false when API returns error status", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const result = await checkHealth();

      expect(result).toBe(false);
    });

    it("should return false when fetch throws an error", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

      const result = await checkHealth();

      expect(result).toBe(false);
    });

    it("should use the correct endpoint for health check", async () => {
      const mockResponse = {
        ok: true,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      await checkHealth();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/"),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it("should set a timeout for the health check", async () => {
      const mockResponse = {
        ok: true,
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const setTimeoutSpy = vi.spyOn(global, "setTimeout");

      await checkHealth();

      // Should have called setTimeout to set up the abort controller
      expect(setTimeoutSpy).toHaveBeenCalled();
    });
  });
});
