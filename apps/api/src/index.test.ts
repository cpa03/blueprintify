import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MOCK_ENV, MOCK_ENV_NO_KEY, TEST_API_KEY } from "./test-utils";
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

  /**
   * @param missingAssetPaths Absolute URLs (not pathnames) the mock answers
   * with a 404, modelling a stale or absent built filename.
   */
  const createAssetFetcher = (missingAssetPaths: ReadonlySet<string> = new Set()) => ({
    fetch: vi.fn(async (input: RequestInfo | URL) => {
      // Cloudflare's Fetcher re-wraps its input before serving; this
      // reconstruction is what throws on an already-consumed body. Deleting it
      // would leave the mock ignoring its argument and the regression below
      // unable to fail.
      const assetRequest = new Request(input);
      if (missingAssetPaths.has(assetRequest.url)) {
        return new Response("Not Found", { status: HTTP_STATUS.NOT_FOUND });
      }
      return new Response(INDEX_HTML, {
        status: HTTP_STATUS.OK,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_HTML },
      });
    }),
  });

  const createEnv = (missingAssetPaths: ReadonlySet<string> = new Set()) => {
    const assets = createAssetFetcher(missingAssetPaths);
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

  /**
   * Absolute filesystem roots a leaked path would realistically sit under on
   * the platforms this repo is checked out on: Linux CI runners and dev
   * containers, macOS dev machines, and the Workers sandbox.
   *
   * The anchor rejects word characters and `-` only, so a V8 stack frame's
   * `file:///app/dist/index.js` still matches while a URL path nested one
   * segment in (`/api/app/...`) does not. `/Users` accepts either case because
   * the default macOS APFS volume is case-insensitive.
   */
  const FILESYSTEM_ROOTS: ReadonlyArray<readonly [label: string, pattern: RegExp]> = [
    ["/Users/<user>", /(?:^|[^\w-])\/[Uu]sers\/[^\s"'\\]+/],
    ["/home/<user>", /(?:^|[^\w-])\/home\/[^\s"'\\]+/],
    ["/workspace", /(?:^|[^\w-])\/workspace\/[^\s"'\\]+/],
    ["/var/task", /(?:^|[^\w-])\/var\/task\/[^\s"'\\]+/],
    ["/root", /(?:^|[^\w-])\/root\/[^\s"'\\]+/],
    ["/app", /(?:^|[^\w-])\/app\/[^\s"'\\]+/],
    ["C:\\", /(?:^|[^\w-])[A-Za-z]:\\[^\s"']+/],
  ];

  /**
   * Requires a source-location marker between `at` and the `:line:col` tail, so
   * a clock time or bare ISO timestamp after the word "at" is not read as a
   * frame. The gap after `at` is horizontal whitespace only: `\s` would cross a
   * line break and conflate a trailing `at` with a path on the next line, and
   * V8 always keeps the reference on the same line as `at`.
   */
  const STACK_FRAME = /\bat[^\S\n]+[^\n]*[/\\.][^\n]*:\d+:\d+/;

  /** Yields each string with its dotted path, so a failure can name the field. */
  const collectStrings = (value: unknown, path = "body"): Array<[string, string]> => {
    if (typeof value === "string") return [[path, value]];
    if (Array.isArray(value)) {
      return value.flatMap((item, i) => collectStrings(item, `${path}[${i}]`));
    }
    if (value !== null && typeof value === "object") {
      return Object.entries(value).flatMap(([key, item]) => collectStrings(item, `${path}.${key}`));
    }
    return [];
  };

  /** Windows the value around the match so a head-slice cannot hide the leak. */
  const excerptAround = (text: string, matchIndex: number): string => {
    const start = Math.max(0, matchIndex - 40);
    const end = Math.min(text.length, matchIndex + 80);
    return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
  };

  const escapeRegExp = (literal: string): string => literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /**
   * `notFoundHandler` echoes the caller-controlled request path into the
   * message, so `GET /app/src/index.ts` arrives lexically indistinguishable from
   * a leaked build path. Stripping that echo — not a path-shape heuristic — is
   * what makes these patterns safe; any path-shaped text left is a real leak.
   * The `/api`-stripped form is removed too, because `index.ts` rewrites that
   * prefix before routing, so it is the form the handler actually echoes.
   *
   * The trailing lookahead is load-bearing: it only removes the echoed
   * occurrence when no further path character follows, so a request for `/app`
   * does not also erase the `/app` prefix of an unrelated leak such as
   * `open '/app/dist/index.js'`. `/` counts as a path character here, so a
   * longer leaked path sharing the prefix survives.
   */
  const stripEchoedPaths = (text: string, requestPath: string): string =>
    [requestPath, requestPath.replace(/^\/api/, "")]
      .filter((p) => p.length > 1)
      .reduce(
        (acc, p) => acc.replace(new RegExp(`${escapeRegExp(p)}(?![\\w.~%/-])`, "g"), " "),
        text
      );

  const parseErrorEnvelope = (raw: string): ErrorBody => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return expect.unreachable(
        `error body was not JSON, so no envelope could be asserted: ${raw}`
      );
    }
    expect(parsed, "error body is not a structured envelope").toMatchObject({
      success: false,
      error: { message: expect.any(String) },
    });
    return parsed as ErrorBody;
  };

  const expectNoLeakedInternals = (raw: string, requestPath: string): void => {
    expect(raw).not.toContain("Cannot reconstruct a Request");

    // Scanned per field, not over the joined body: a joined haystack lets a
    // pattern match halves from two different fields and name a leak that is
    // not present in any one of them. Decoding first is what makes a stack
    // frame visible at all — on the wire it carries an escaped newline.
    for (const [path, field] of collectStrings(parseErrorEnvelope(raw))) {
      const scanned = stripEchoedPaths(field, requestPath);
      const report = (what: string, pattern: RegExp): void => {
        const at = scanned.search(pattern);
        // `at` is only ever non -1 when this assertion is about to fail, so the
        // excerpt is always windowed; there is no unbounded-dump branch.
        expect(at, `${what} in ${path}: ${excerptAround(scanned, at)}`).toBe(-1);
      };
      for (const [label, pattern] of FILESYSTEM_ROOTS) {
        report(`response body leaked a filesystem path under ${label}`, pattern);
      }
      report("response body leaked a stack frame", STACK_FRAME);
    }
  };

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

    expectNoLeakedInternals(raw, VERIFY_PATH.replace(":id", MISSING_SHARE_ID));
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

  it("separates leaked filesystem paths from request paths the 404 message echoes", () => {
    const matches = (text: string, requestPath: string): string[] =>
      FILESYSTEM_ROOTS.filter(([, pattern]) =>
        pattern.test(stripEchoedPaths(text, requestPath))
      ).map(([label]) => label);

    // Request paths that are themselves shaped like build paths. `notFoundHandler`
    // echoes these verbatim, so they must not read as leaks.
    for (const requestPath of [
      "/app/src/index.ts",
      "/var/task/index.js",
      "/home/runner/x.json",
      "/root/dist/index.js",
      "/api/app/things/42",
      "/workspace/build/out.js",
      "/share/abc123def456/verify",
      "/assets/index-abc123.js",
      "/favicon.svg",
    ]) {
      expect(
        matches(`Route not found: GET ${requestPath}`, requestPath),
        `request path ${requestPath} was read as a leak`
      ).toEqual([]);
    }

    for (const sample of [
      "/Users/alice/dev/blueprintify/apps/api/src/index.ts",
      "/home/runner/work/blueprintify/apps/api/src/index.ts",
      "/root/blueprintify/apps/api/src/index.ts",
      "/workspace/blueprintify/apps/api/src/index.ts",
      "/app/src/index.ts",
      "/var/task/src/index.ts",
      "C:\\Users\\alice\\blueprintify\\apps\\api\\src\\index.ts",
      "at file:///app/dist/index.js",
      "at file:///workspace/blueprintify/apps/api/src/index.ts",
    ]) {
      expect(
        matches(sample, "/share/abc123def456/verify"),
        `no FILESYSTEM_ROOTS entry matches the leaked path ${sample}`
      ).not.toEqual([]);
    }

    // A leak that *contains* the request path must survive stripping: the
    // echoed occurrence is removed, not every path sharing that prefix.
    for (const [requestPath, leak] of [
      ["/app", "ENOENT: no such file, open '/app/dist/index.js'"],
      ["/app/src/index.ts", "ENOENT: open '/app/src/index.ts.map'"],
      ["/api/app", "ENOENT: open '/app/dist/index.js'"],
      ["/workspace", "failed reading /workspace/dist/out.js"],
    ] as ReadonlyArray<readonly [requestPath: string, leak: string]>) {
      expect(
        matches(leak, requestPath),
        `stripping ${requestPath} also erased the unrelated leak ${leak}`
      ).not.toEqual([]);
    }
  });

  it("does not read a timestamped or clock-time string as a stack frame", () => {
    const body = JSON.stringify({
      success: false,
      error: {
        type: "not_found",
        code: "NOT_FOUND_ERROR",
        message: "Generated at 12:34:56",
        timestamp: "2026-10-01T22:53:31.479Z",
        requestId: "1790895211475-1wyag471vcz",
        details: { retryAt: "2026-10-01T10:00:00Z", finishedAt: "23:59:59" },
      },
    });

    expect(() => expectNoLeakedInternals(body, "/share/abc123def456/verify")).not.toThrow();
  });

  it("does not read a build-path-shaped request as a leak when routed end to end", async () => {
    const requestPaths = ["/app/src/index.ts", "/var/task/index.js", "/home/runner/x.json"];
    let requestsMade = 0;
    // These 404 at the binding so the request reaches notFoundHandler, which is
    // what echoes the path back.
    const { env, assets } = createEnv(new Set(requestPaths.map((p) => `https://example.com${p}`)));

    for (const requestPath of requestPaths) {
      const res = await worker.fetch(
        new Request(`https://example.com${requestPath}`, {
          method: HTTP_METHODS.GET,
          headers: authedHeaders(),
        }),
        env,
        mockCtx
      );

      const raw = await res.clone().text();
      await expectStructuredNotFound(res);
      // Without this the case also passes via an auth short-circuit or an
      // earlier return, never reaching the ASSETS fall-through it documents.
      // `last` and the URL matter: the mock is only cleared in beforeEach, so
      // a plain "called with anything" would be satisfied by iteration 1.
      expect(assets.fetch).toHaveBeenLastCalledWith(
        expect.objectContaining({ url: `https://example.com${requestPath}` })
      );
      // One lookup per request; a retry or double fetch is a behaviour change.
      // Counted as requests are made, so the expectation does not depend on
      // the list being unique or in order.
      expect(assets.fetch, `after requesting ${requestPath}`).toHaveBeenCalledTimes(
        requestsMade + 1
      );
      requestsMade += 1;
      expectNoLeakedInternals(raw, requestPath);
    }
  });

  it("catches a stack frame whether or not it also carries a filesystem root", () => {
    const body = (message: string): string =>
      JSON.stringify({ success: false, error: { message } });
    const requestPath = "/share/abc123def456/verify";

    // A frame under a root trips the path assertion first; either way it fails.
    expect(() =>
      expectNoLeakedInternals(body("at file:///app/dist/index.js:1:2"), requestPath)
    ).toThrow(/leaked a filesystem path/);
    // A frame with no root is only reachable through the stack-frame check.
    expect(() => expectNoLeakedInternals(body("Error: boom at index.js:1:2"), requestPath)).toThrow(
      /leaked a stack frame/
    );
    expect(() =>
      expectNoLeakedInternals(body("Shared blueprint not found or expired"), requestPath)
    ).not.toThrow();
    // A trailing "at" plus a source location on the next line is not one frame.
    // Rootless, so a path assertion cannot throw first and mask the result.
    expect(() =>
      expectNoLeakedInternals(body("retry scheduled at\nindex.js:1:2"), requestPath)
    ).not.toThrow();
  });

  it("falls through to the structured API 404 when a bundled asset is missing from the ASSETS binding", async () => {
    const staleAssetUrl = "https://example.com/assets/index-stale123.js";
    const { env, assets } = createEnv(new Set([staleAssetUrl]));

    const res = await worker.fetch(
      new Request(staleAssetUrl, {
        method: HTTP_METHODS.GET,
        headers: authedHeaders(),
      }),
      env,
      mockCtx
    );

    const raw = await res.clone().text();
    await expectStructuredNotFound(res);
    expect(assets.fetch).toHaveBeenCalledTimes(1);
    expect(raw).not.toContain(INDEX_HTML);
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

/**
 * BUG-058 regression coverage: authentication must fail closed.
 *
 * Removing the committed API key from the repository and the browser bundle
 * (wrangler.toml, SHARED_DEFAULTS, ENV.API_KEY) means a fresh deployment now
 * boots with API_KEY unset until an operator sets a Worker secret. That is only
 * safe if the unset case locks the API down completely rather than degrading
 * to open access, so this pins both halves of the contract at the whole-app
 * level: every documented protected route answers 503 CONFIGURATION_ERROR,
 * and the three public routes stay reachable.
 *
 * The final test records the unresolved design constraint from BUG-058: with
 * API_KEY set, a request that presents no key is still rejected. There is no
 * third option in which the browser may simply omit the credential.
 */
describe("auth must fail closed when API_KEY is unset (BUG-058)", () => {
  interface ErrorBody {
    success: boolean;
    error: { type: string; code: string; message: string };
  }

  const PROTECTED_ROUTES: ReadonlyArray<readonly [method: string, path: string]> = [
    [HTTP_METHODS.POST, ROUTE_PATHS.GENERATE],
    [HTTP_METHODS.POST, ROUTE_PATHS.TASKS],
    [HTTP_METHODS.POST, ROUTE_PATHS.REFINE],
    [HTTP_METHODS.POST, ROUTE_PATHS.EXPORT],
    [HTTP_METHODS.POST, ROUTE_PATHS.IMPORT],
    [HTTP_METHODS.GET, `${ROUTE_PATHS.STORAGE}${ROUTE_SUB_PATHS.QUOTA}`],
    [HTTP_METHODS.POST, `${ROUTE_PATHS.STORAGE}${ROUTE_SUB_PATHS.REPORT}`],
    [HTTP_METHODS.DELETE, `${ROUTE_PATHS.STORAGE}${ROUTE_SUB_PATHS.CLEAR}`],
    [HTTP_METHODS.POST, ROUTE_PATHS.SHARE],
    [HTTP_METHODS.GET, `${ROUTE_PATHS.SHARE}${ROUTE_SUB_PATHS.ID_PARAM}`],
    [HTTP_METHODS.POST, `${ROUTE_PATHS.SHARE}${ROUTE_SUB_PATHS.ID_PARAM}${ROUTE_SUB_PATHS.VERIFY}`],
    [HTTP_METHODS.DELETE, `${ROUTE_PATHS.SHARE}${ROUTE_SUB_PATHS.ID_PARAM}`],
  ];

  const PUBLIC_ROUTES = [ROUTE_PATHS.ROOT, ROUTE_PATHS.HEALTH, ROUTE_PATHS.WARMUP];

  const assetFetcher = {
    fetch: vi.fn(
      async () =>
        new Response("Not Found", { status: HTTP_STATUS.NOT_FOUND }) as unknown as Response
    ),
  };

  /** API_KEY is deliberately absent — this is the deployment state under test. */
  const envWithoutApiKey = () =>
    ({
      ...MOCK_ENV_NO_KEY,
      OPENAI_API_KEY: TEST_API_KEY,
      DB: {
        prepare: vi.fn(() => ({
          bind: vi.fn(() => ({
            first: vi.fn(async () => null),
            run: vi.fn(async () => ({ success: true })),
          })),
        })),
      },
      ASSETS: assetFetcher,
    }) as unknown as Env;

  const request = (method: string, path: string, origin = "https://api.example.com"): Request =>
    new Request(`${origin}${path}`, {
      method,
      headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
      body: method === HTTP_METHODS.GET || method === HTTP_METHODS.DELETE ? undefined : "{}",
    });

  it("answers 503 CONFIGURATION_ERROR on every documented protected route", async () => {
    const env = envWithoutApiKey();

    for (const [method, path] of PROTECTED_ROUTES) {
      const res = await worker.fetch(request(method, path), env, mockCtx);

      expect(res.status, `${method} ${path}`).toBe(HTTP_STATUS.SERVICE_UNAVAILABLE);
      const data = (await res.json()) as ErrorBody;
      expect(data.success, `${method} ${path}`).toBe(false);
      expect(data.error.code, `${method} ${path}`).toBe(ERROR_CODES.CONFIGURATION_ERROR);
    }
  });

  it("keeps /, /health and /warmup reachable", async () => {
    const env = envWithoutApiKey();

    for (const path of PUBLIC_ROUTES) {
      const res = await worker.fetch(request(HTTP_METHODS.GET, path), env, mockCtx);

      expect(res.status, path).toBe(HTTP_STATUS.OK);
    }
  });

  it("still rejects a keyless request once API_KEY is configured", async () => {
    const env = { ...envWithoutApiKey(), API_KEY: TEST_API_KEY } as unknown as Env;

    const res = await worker.fetch(request(HTTP_METHODS.GET, ROUTE_PATHS.HEALTH), env, mockCtx);
    expect(res.status).toBe(HTTP_STATUS.OK);

    const protectedRes = await worker.fetch(
      request(HTTP_METHODS.POST, ROUTE_PATHS.GENERATE),
      env,
      mockCtx
    );
    expect(protectedRes.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
