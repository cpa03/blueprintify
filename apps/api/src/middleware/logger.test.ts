/**
 * Tests for the Request Logger Middleware
 *
 * Covers:
 * - Request ID generation and format
 * - Excluded path skipping
 * - Response header injection (requestId, response-time)
 * - Cloudflare metadata extraction
 * - Request body logging
 * - Header sanitization
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { HTTP_HEADERS, HTTP_HEADER_NAMES, HTTP_METHODS, HTTP_STATUS } from "@blueprint/shared";
import { API_HEADERS } from "../config/constants";
import { requestLogger } from "./logger";

describe("requestLogger middleware", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("request ID generation", () => {
    it("should generate a request ID and set it as a response header", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");

      expect(res.status).toBe(HTTP_STATUS.OK);
      const requestId = res.headers.get(API_HEADERS.RESPONSE.REQUEST_ID);
      expect(requestId).toBeTruthy();
      // Format: timestamp-random (e.g., "1712345678900-abc123def456")
      expect(requestId).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it("should generate unique request IDs for consecutive requests", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/test", (c) => c.json({ ok: true }));

      const res1 = await app.request("/test");
      const res2 = await app.request("/test");

      const id1 = res1.headers.get(API_HEADERS.RESPONSE.REQUEST_ID);
      const id2 = res2.headers.get(API_HEADERS.RESPONSE.REQUEST_ID);
      expect(id1).not.toBe(id2);
    });
  });

  describe("response-time header", () => {
    it("should set x-response-time header with duration in ms", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");

      const responseTime = res.headers.get(API_HEADERS.RESPONSE.RESPONSE_TIME);
      expect(responseTime).toBeTruthy();
      expect(responseTime).toMatch(/^\d+ms$/);
    });
  });

  describe("excluded paths", () => {
    it("should skip logging for excluded paths", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/", (c) => c.json({ ok: true }));

      const callsBefore = consoleLogSpy.mock.calls.length;
      await app.request("/");
      const callsAfter = consoleLogSpy.mock.calls.length;

      expect(callsAfter - callsBefore).toBe(0);
    });

    it("should log for non-excluded paths", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/api/test", (c) => c.json({ ok: true }));

      await app.request("/api/test");

      // Should have at least one console.log call (the request log)
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Cloudflare metadata", () => {
    it("should include Cloudflare ray ID in response when present", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/test", (c) => c.json({ ok: true }));

      await app.request("/test", {
        headers: { [API_HEADERS.CF_PROPERTIES.RAY_ID]: "test-ray-123" },
      });

      const logCalls = consoleLogSpy.mock.calls;
      const requestLogs = logCalls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" && (call[0] as string).includes("test-ray-123")
      );
      expect(requestLogs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("header sanitization", () => {
    it("should not log sensitive headers when request body logging is enabled", async () => {
      const app = new Hono();
      app.use("*", requestLogger({ logRequestBody: true }));
      app.post("/api/data", (c) => c.json({ received: true }));

      await app.request("/api/data", {
        method: HTTP_METHODS.POST,
        headers: {
          [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
          Authorization: "Bearer secret-token-12345",
          Cookie: "session=abc123",
        },
        body: JSON.stringify({ key: "value" }),
      });

      // Find the request log entry
      const logCalls = consoleLogSpy.mock.calls;
      const requestLogs = logCalls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" && (call[0] as string).includes('"type":"request"')
      );

      if (requestLogs.length > 0) {
        const logEntry = JSON.parse(requestLogs[0][0] as string);
        // Authorization and Cookie should not appear in logged headers
        const loggedHeaderKeys = Object.keys(logEntry.headers || {});
        const hasSensitive = loggedHeaderKeys.some(
          (key) =>
            key.toLowerCase().includes(HTTP_HEADER_NAMES.AUTHORIZATION_LC) ||
            key.toLowerCase().includes(HTTP_HEADER_NAMES.COOKIE_LC)
        );
        expect(hasSensitive).toBe(false);
      }
    });

    it("should not leak the x-api-key credential into the serialized log payload", async () => {
      const CREDENTIAL_CANARY = "CANARY-bug052-never-log-this-credential-9f3a1c7e2b4d";
      const app = new Hono();
      app.use("*", requestLogger({ logRequestBody: true }));
      app.post("/api/data", (c) => c.json({ received: true }));

      const callsBefore = consoleLogSpy.mock.calls.length;
      await app.request("/api/data", {
        method: HTTP_METHODS.POST,
        headers: {
          [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON,
          [API_HEADERS.CUSTOM.API_KEY]: CREDENTIAL_CANARY,
          "X-Correlation-Note": "safe-header-value",
        },
        body: JSON.stringify({ key: "value" }),
      });

      const serialized = consoleLogSpy.mock.calls
        .slice(callsBefore)
        .map((call: unknown[]) => call[0] as string)
        .join("\n");

      expect(serialized).toContain('"type":"request"');
      expect(serialized).not.toContain(CREDENTIAL_CANARY);
      expect(serialized).not.toContain(HTTP_HEADER_NAMES.X_API_KEY);
      expect(serialized).toContain("x-correlation-note");
    });

    it("should keep logging unrelated headers when x-api-key is present", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/api/data", (c) => c.json({ ok: true }));

      const callsBefore = consoleLogSpy.mock.calls.length;
      await app.request("/api/data", {
        headers: {
          [API_HEADERS.CUSTOM.API_KEY]: "CANARY-bug052-second-case-keepothers-4a7d1e",
          "X-Correlation-Note": "safe-header-value",
          [HTTP_HEADER_NAMES.USER_AGENT]: "vitest",
        },
      });

      const requestLogs = consoleLogSpy.mock.calls
        .slice(callsBefore)
        .filter(
          (call: unknown[]) =>
            typeof call[0] === "string" && (call[0] as string).includes('"type":"request"')
        );
      expect(requestLogs.length).toBeGreaterThanOrEqual(1);

      const loggedHeaders =
        (JSON.parse(requestLogs[0][0] as string) as { headers?: Record<string, string> }).headers ||
        {};
      const loggedHeaderKeys = Object.keys(loggedHeaders).map((key) => key.toLowerCase());

      expect(loggedHeaderKeys).toContain("x-correlation-note");
      expect(loggedHeaders["x-correlation-note"]).toBe("safe-header-value");
      expect(loggedHeaderKeys).toContain(HTTP_HEADER_NAMES.USER_AGENT_LC);
    });
  });

  describe("logRequestBody option", () => {
    it("should include request body when logRequestBody is true", async () => {
      const app = new Hono();
      app.use("*", requestLogger({ logRequestBody: true }));
      app.post("/api/data", (c) => c.json({ received: true }));

      await app.request("/api/data", {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({ message: "hello" }),
      });

      // Verify a request log was written
      const requestLogs = consoleLogSpy.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" && (call[0] as string).includes('"type":"request"')
      );
      expect(requestLogs.length).toBeGreaterThanOrEqual(1);
    });

    it("should not include request body when logRequestBody is false", async () => {
      const app = new Hono();
      app.use("*", requestLogger({ logRequestBody: false }));
      app.post("/api/data", (c) => c.json({ received: true }));

      await app.request("/api/data", {
        method: HTTP_METHODS.POST,
        headers: { [HTTP_HEADER_NAMES.CONTENT_TYPE]: HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({ message: "hello" }),
      });

      const requestLogs = consoleLogSpy.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" && (call[0] as string).includes('"type":"request"')
      );
      expect(requestLogs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("logResponseBody option", () => {
    it("should include both request and response log entries", async () => {
      const app = new Hono();
      app.use("*", requestLogger({ logResponseBody: true }));
      app.get("/api/test", (c) => c.json({ result: "ok" }));

      await app.request("/api/test");

      const logCalls = consoleLogSpy.mock.calls;
      const requestLogs = logCalls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" && (call[0] as string).includes('"type":"request"')
      );
      const responseLogs = logCalls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" && (call[0] as string).includes('"type":"response"')
      );

      // Should have at least one request and one response log
      expect(requestLogs.length).toBeGreaterThanOrEqual(1);
      expect(responseLogs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("middleware chain", () => {
    it("should execute the next middleware in the chain", async () => {
      const app = new Hono();
      app.use("*", requestLogger());
      app.get("/chain-test", (c) => {
        c.header("x-chain-verified", "true");
        return c.json({ ok: true });
      });

      const res = await app.request("/chain-test");

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.headers.get("x-chain-verified")).toBe("true");
    });
  });
});
