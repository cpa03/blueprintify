import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkHealth } from "./api";
import { HTTP_STATUS } from "@blueprint/shared";

// Flexy: Mocks derive from @blueprint/shared via vi.importActual — single source of truth!
// RETRY_CONFIG overridden for faster test execution; all other values come from actual shared config.
vi.mock("@blueprint/shared", async (importOriginal) => {
  type SharedModule = {
    RETRY_CONFIG: {
      DEFAULT_RETRIES: number;
      DEFAULT_INITIAL_DELAY: number;
      DEFAULT_BACKOFF_FACTOR: number;
      DEFAULT_MAX_DELAY: number;
    };
    [key: string]: unknown;
  };
  const mod = (await importOriginal()) as unknown as SharedModule;
  return {
    ...mod,
    RETRY_CONFIG: {
      ...(mod.RETRY_CONFIG as SharedModule["RETRY_CONFIG"]),
      DEFAULT_INITIAL_DELAY: 100,
      DEFAULT_MAX_DELAY: 5000,
    },
  };
});

vi.mock("../config/constants", async () => {
  const shared = await vi.importActual<typeof import("@blueprint/shared")>("@blueprint/shared");
  return {
    API_ENDPOINTS: {
      GENERATE: shared.ROUTE_PATHS.GENERATE,
      TASKS: shared.ROUTE_PATHS.TASKS,
      REFINE: shared.ROUTE_PATHS.REFINE,
      HEALTH: shared.ROUTE_PATHS.ROOT,
      EXPORT: shared.ROUTE_PATHS.EXPORT,
      IMPORT: shared.ROUTE_PATHS.IMPORT,
      STORAGE: shared.ROUTE_PATHS.STORAGE,
      SHARE: shared.ROUTE_PATHS.SHARE,
    },
    API_ERROR_MESSAGES: {
      NO_RESPONSE_BODY: "No response body",
      STREAM_ERROR: "Stream error",
      GENERATION_FAILED: "Generation failed",
      TASK_GENERATION_FAILED: "Task generation failed",
      REFINEMENT_FAILED: "Refinement failed",
    },
    SSE_CONFIG: shared.SSE_CONFIG,
    UI_FALLBACKS: {
      API_BASE: shared.DEV_DEFAULTS.API_PROXY_TARGET,
    },
    TIMEOUTS: {
      API_CONNECTION: 30000,
      API_HEALTH_CHECK: 5000,
    },
  };
});

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
