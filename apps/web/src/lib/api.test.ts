import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkHealth } from "./api";

// Flexy: Mock values MUST match @blueprint/shared single source of truth.
// When shared config values change, update these mocks accordingly.
const { DEV_DEFAULTS, ROUTE_PATHS, HTTP_HEADERS, HTTP_METHODS, HTTP_STATUS } = vi.hoisted(() => ({
  DEV_DEFAULTS: {
    API_PROXY_TARGET: "http://localhost:8787",
    WEB_PORT: 3000,
    API_PORT: 8787,
    PLAYWRIGHT_TEST_URL: "http://localhost:3000",
  },
  ROUTE_PATHS: {
    ROOT: "/",
    GENERATE: "/generate",
    TASKS: "/tasks",
    REFINE: "/refine",
    EXPORT: "/export",
    IMPORT: "/import",
    STORAGE: "/storage",
    SHARE: "/share",
    WARMUP: "/warmup",
  },
  HTTP_HEADERS: {
    CONTENT_TYPE_JSON: "application/json",
  },
  HTTP_METHODS: {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
    PATCH: "PATCH",
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    PAYLOAD_TOO_LARGE: 413,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },
}));

// Mock the @blueprint/shared module
vi.mock("@blueprint/shared", () => ({
  DEV_DEFAULTS,
  ROUTE_PATHS: {
    ROOT: "/",
    GENERATE: "/generate",
    TASKS: "/tasks",
    REFINE: "/refine",
    EXPORT: "/export",
    IMPORT: "/import",
    STORAGE: "/storage",
    SHARE: "/share",
    WARMUP: "/warmup",
  },
  RETRY_CONFIG: {
    DEFAULT_RETRIES: 3,
    DEFAULT_INITIAL_DELAY: 100,
    DEFAULT_BACKOFF_FACTOR: 2,
    DEFAULT_MAX_DELAY: 5000,
  },
  HTTP_HEADERS: {
    CONTENT_TYPE_JSON: HTTP_HEADERS.CONTENT_TYPE_JSON,
  },
  HTTP_STATUS,
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  HTTP_METHODS: {
    GET: HTTP_METHODS.GET,
    POST: HTTP_METHODS.POST,
    PUT: HTTP_METHODS.PUT,
    DELETE: HTTP_METHODS.DELETE,
    PATCH: HTTP_METHODS.PATCH,
  },
}));

// Mock the constants module
vi.mock("../config/constants", () => ({
  API_ENDPOINTS: {
    GENERATE: ROUTE_PATHS.GENERATE,
    TASKS: ROUTE_PATHS.TASKS,
    REFINE: ROUTE_PATHS.REFINE,
    HEALTH: ROUTE_PATHS.ROOT,
    EXPORT: ROUTE_PATHS.EXPORT,
    IMPORT: ROUTE_PATHS.IMPORT,
    STORAGE: ROUTE_PATHS.STORAGE,
    SHARE: ROUTE_PATHS.SHARE,
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
    API_BASE: DEV_DEFAULTS.API_PROXY_TARGET,
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
        status: HTTP_STATUS.INTERNAL_ERROR,
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
