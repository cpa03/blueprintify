import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MOCK_ENV } from "./test-utils";
import { API_METADATA } from "./config/constants";
import { RESPONSE_STATUS, ROUTE_PATHS, HTTP_STATUS, HTTP_METHODS } from "@blueprint/shared";
import { DEV_DEFAULTS } from "@blueprint/shared";

/**
 * Hoisted mock breaker so the /health endpoint's unhealthy (503) path is
 * testable without tripping the real circuit breaker singleton.
 */
const mockBreaker = vi.hoisted(() => ({
  getState: vi.fn().mockReturnValue({
    state: "CLOSED",
    failures: 0,
    successes: 0,
    lastFailureTime: null,
    nextAttempt: Date.now(),
    isColdStart: false,
    coldStartRemainingMs: 0,
  }),
}));

vi.mock("./utils/circuitBreaker", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./utils/circuitBreaker")>();
  return {
    ...actual,
    CircuitState: {
      CLOSED: "CLOSED",
      OPEN: "OPEN",
      HALF_OPEN: "HALF_OPEN",
    },
  };
});

vi.mock("./services/openai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./services/openai")>();
  return {
    ...actual,
    initializeCircuitBreaker: vi.fn(() => mockBreaker),
  };
});

// ---- target module (imported after mocks) ----
import worker from "./index";
import type { Env } from "./types";

interface HealthCheckResponse {
  status: string;
  checks: {
    api: string;
    aiService: string;
  };
  timestamp: string;
}

const mockCtx = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
} as unknown as ExecutionContext;

describe("GET /health endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBreaker.getState.mockReturnValue({
      state: "CLOSED",
      failures: 0,
      successes: 0,
      lastFailureTime: null,
      nextAttempt: Date.now(),
      isColdStart: false,
      coldStartRemainingMs: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 with healthy status and component checks when services are healthy", async () => {
    const res = await worker.fetch(
      new Request(`https://example.com${ROUTE_PATHS.HEALTH}`, { method: HTTP_METHODS.GET }),
      MOCK_ENV as unknown as Env,
      mockCtx
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    const body = (await res.json()) as HealthCheckResponse;
    expect(body.status).toBe(API_METADATA.STATUS);
    expect(body.checks.api).toBe(API_METADATA.STATUS);
    expect(body.checks.aiService).toBe(API_METADATA.STATUS);
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns 503 with error status when the AI service circuit is OPEN", async () => {
    mockBreaker.getState.mockReturnValue({
      state: "OPEN",
      failures: 5,
      successes: 0,
      lastFailureTime: Date.now() - 1000,
      nextAttempt: Date.now() + 30000,
      isColdStart: false,
      coldStartRemainingMs: 0,
    });

    const res = await worker.fetch(
      new Request(`https://example.com${ROUTE_PATHS.HEALTH}`, { method: HTTP_METHODS.GET }),
      MOCK_ENV as unknown as Env,
      mockCtx
    );

    expect(res.status).toBe(HTTP_STATUS.SERVICE_UNAVAILABLE);
    const body = (await res.json()) as HealthCheckResponse;
    expect(body.status).toBe(RESPONSE_STATUS.ERROR);
    expect(body.checks.aiService).toBe(RESPONSE_STATUS.ERROR);
  });

  it("does not require an API key (excluded from authentication)", async () => {
    const res = await worker.fetch(
      new Request(`https://example.com${ROUTE_PATHS.HEALTH}`, { method: HTTP_METHODS.GET }),
      MOCK_ENV as unknown as Env,
      mockCtx
    );

    expect(res.status).not.toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.status).not.toBe(HTTP_STATUS.FORBIDDEN);
  });
});

describe("CORS origin handling (security regression for #930)", () => {
  const configuredOrigin = DEV_DEFAULTS.PLAYWRIGHT_TEST_URL;

  const fetchWithOrigin = (origin: string, path = ROUTE_PATHS.ROOT): Promise<Response> =>
    worker.fetch(
      new Request(`https://api.example.com${path}`, {
        method: HTTP_METHODS.GET,
        headers: { Origin: origin },
      }),
      MOCK_ENV as unknown as Env,
      mockCtx
    );

  it("reflects the configured CORS_ORIGIN, never an arbitrary attacker origin", async () => {
    const res = await fetchWithOrigin("https://evil.example.com");
    const acao = res.headers.get("access-control-allow-origin");
    expect(acao).toBe(configuredOrigin);
    expect(acao).not.toBe("https://evil.example.com");
  });

  it("never echoes an untrusted Origin header back to the caller", async () => {
    const res = await fetchWithOrigin("https://untrusted.invalid");
    expect(res.headers.get("access-control-allow-origin")).not.toBe("https://untrusted.invalid");
  });
});
