import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MOCK_ENV, TEST_API_KEY } from "./test-utils";
import { API_METADATA, ERROR_CODES, ROUTE_SUB_PATHS } from "./config/constants";
import {
  RESPONSE_STATUS,
  ROUTE_PATHS,
  HTTP_STATUS,
  HTTP_METHODS,
  HTTP_HEADERS,
  HTTP_HEADER_NAMES,
  ERROR_TYPES,
} from "@blueprint/shared";
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

/**
 * BUG-053 regression coverage.
 *
 * The post-API 404 fallback to the static ASSETS binding re-used the original
 * `Request`. For any method carrying a body the body is already consumed by the
 * API app, and Cloudflare's Fetcher re-wraps its input, so the fallback threw
 * "Cannot reconstruct a Request with a used body" out of the top-level fetch
 * handler. The same fallback also shadowed the structured NOT_FOUND_ERROR body
 * that docs/openapi.yaml documents for unmatched routes. apps/web ships no
 * client-side router, so the fallback had no consumer and was removed; these
 * tests also pin the asset paths the pre-app ASSETS lookup must keep serving.
 */
describe("SPA asset fallback must not re-fetch a consumed request body (BUG-053)", () => {
  const MISSING_SHARE_ID = "abc123def456";
  const SHARE_PATH = `${ROUTE_PATHS.SHARE}${ROUTE_SUB_PATHS.ID_PARAM}`;
  const VERIFY_PATH = `${SHARE_PATH}${ROUTE_SUB_PATHS.VERIFY}`;
  const INDEX_HTML = "<!doctype html><html><body>blueprintify</body></html>";

  interface ErrorBody {
    success: boolean;
    error: { type: string; code: string; message: string };
  }

  const createMockDB = () => ({
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => null),
        run: vi.fn(async () => ({ success: true })),
      })),
    })),
  });

  const createAssetFetcher = () => ({
    fetch: vi.fn(async (input: RequestInfo | URL) => {
      new Request(input);
      return new Response(INDEX_HTML, {
        status: HTTP_STATUS.OK,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_HTML },
      });
    }),
  });

  const createEnv = () => {
    const assets = createAssetFetcher();
    const env = {
      ...MOCK_ENV,
      API_KEY: TEST_API_KEY,
      DB: createMockDB(),
      ASSETS: assets,
    } as unknown as Env;
    return { env, assets };
  };

  const authedHeaders = (extra: Record<string, string> = {}): Record<string, string> => ({
    [HTTP_HEADER_NAMES.X_API_KEY]: TEST_API_KEY,
    [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
    ...extra,
  });

  const expectStructuredNotFound = async (res: Response): Promise<void> => {
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    const body = (await res.json()) as ErrorBody;
    expect(body.success).toBe(false);
    expect(body.error.type).toBe(ERROR_TYPES.NOT_FOUND);
    expect(body.error.code).toBe(ERROR_CODES.NOT_FOUND_ERROR);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a structured NOT_FOUND_ERROR for POST /share/:id/verify on a missing id, without re-fetching the consumed body", async () => {
    const { env, assets } = createEnv();

    const res = await worker.fetch(
      new Request(`https://example.com${VERIFY_PATH.replace(":id", MISSING_SHARE_ID)}`, {
        method: HTTP_METHODS.POST,
        headers: authedHeaders(),
        body: JSON.stringify({ passphrase: "correct-horse-battery-staple" }),
      }),
      env,
      mockCtx
    );

    const raw = await res.clone().text();
    await expectStructuredNotFound(res);
    expect(assets.fetch).not.toHaveBeenCalled();

    expect(raw).not.toContain("Cannot reconstruct a Request");
    expect(raw).not.toMatch(/\/workspace\/|\/home\/[a-z]/);
  });

  it("keeps a structured NOT_FOUND_ERROR for GET requests carrying a JSON Accept header", async () => {
    const { env, assets } = createEnv();

    const res = await worker.fetch(
      new Request(`https://example.com${SHARE_PATH.replace(":id", MISSING_SHARE_ID)}`, {
        method: HTTP_METHODS.GET,
        headers: authedHeaders({ [HTTP_HEADER_NAMES.ACCEPT]: HTTP_HEADERS.CONTENT_TYPE_JSON }),
      }),
      env,
      mockCtx
    );

    await expectStructuredNotFound(res);
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("keeps a structured NOT_FOUND_ERROR for unknown /api/* routes", async () => {
    const { env, assets } = createEnv();

    const res = await worker.fetch(
      new Request(`https://example.com${ROUTE_PATHS.ROOT}api/no-such-endpoint`, {
        method: HTTP_METHODS.GET,
        headers: authedHeaders(),
      }),
      env,
      mockCtx
    );

    await expectStructuredNotFound(res);
    expect(assets.fetch).not.toHaveBeenCalled();
  });

  it("serves the SPA document for the root path from the ASSETS binding", async () => {
    const { env, assets } = createEnv();

    const res = await worker.fetch(
      new Request(`https://example.com${ROUTE_PATHS.ROOT}`, {
        method: HTTP_METHODS.GET,
        headers: authedHeaders({ [HTTP_HEADER_NAMES.ACCEPT]: HTTP_HEADERS.CONTENT_TYPE_HTML }),
      }),
      env,
      mockCtx
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.text()).toBe(INDEX_HTML);
    expect(assets.fetch).toHaveBeenCalledTimes(1);
  });

  it("still serves bundled assets under the assets prefix without reaching the API app", async () => {
    const { env, assets } = createEnv();

    const res = await worker.fetch(
      new Request(`https://example.com/assets/index-abc123.js`, {
        method: HTTP_METHODS.GET,
        headers: authedHeaders(),
      }),
      env,
      mockCtx
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(assets.fetch).toHaveBeenCalledTimes(1);
  });

  it("still serves extension-bearing asset paths without reaching the API app", async () => {
    const { env, assets } = createEnv();

    const res = await worker.fetch(
      new Request(`https://example.com/favicon.svg`, {
        method: HTTP_METHODS.GET,
        headers: authedHeaders(),
      }),
      env,
      mockCtx
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(assets.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns the structured NOT_FOUND_ERROR for an extensionless path the API does not serve", async () => {
    const { env, assets } = createEnv();

    const res = await worker.fetch(
      new Request(`https://example.com/deep/link`, {
        method: HTTP_METHODS.GET,
        headers: authedHeaders({ [HTTP_HEADER_NAMES.ACCEPT]: HTTP_HEADERS.CONTENT_TYPE_HTML }),
      }),
      env,
      mockCtx
    );

    await expectStructuredNotFound(res);
    expect(assets.fetch).not.toHaveBeenCalled();
  });
});
