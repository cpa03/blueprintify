import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { apiKeyAuth, AUTH_CONFIG_ERROR } from "./auth";
import { MOCK_ENV, MOCK_ENV_NO_KEY } from "../test-utils";
import type { ErrorResponse } from "../errors";

// Create env with API_KEY
const MOCK_ENV_WITH_KEY = { ...MOCK_ENV, API_KEY: "test-api-key-12345" };
const MOCK_ENV_NO_API_KEY = { ...MOCK_ENV_NO_KEY, API_KEY: "" };

describe("auth middleware", () => {
  describe("apiKeyAuth", () => {
    it("should allow requests with valid API key", async () => {
      const app = new Hono<{ Bindings: typeof MOCK_ENV_WITH_KEY }>();
      app.use("/api", apiKeyAuth({ excludePaths: [] }));
      app.get("/api", (c) => c.json({ success: true }));

      const res = await app.request(
        "/api",
        { headers: { "x-api-key": "test-api-key-12345" } },
        MOCK_ENV_WITH_KEY
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as { success: boolean };
      expect(data.success).toBe(true);
    });

    it("should reject requests without API key", async () => {
      const app = new Hono<{ Bindings: typeof MOCK_ENV_WITH_KEY }>();
      app.use("/api", apiKeyAuth({ excludePaths: [] }));
      app.get("/api", (c) => c.json({ success: true }));

      const res = await app.request("/api", {}, MOCK_ENV_WITH_KEY);

      expect(res.status).toBe(401);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("authentication");
      expect(data.error.code).toBe("AUTHENTICATION_ERROR");
    });

    it("should reject requests with invalid API key", async () => {
      const app = new Hono<{ Bindings: typeof MOCK_ENV_WITH_KEY }>();
      app.use("/api", apiKeyAuth({ excludePaths: [] }));
      app.get("/api", (c) => c.json({ success: true }));

      const res = await app.request(
        "/api",
        { headers: { "x-api-key": "invalid-key" } },
        MOCK_ENV_WITH_KEY
      );

      expect(res.status).toBe(401);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("authentication");
    });

    it("should return 503 when API_KEY is not configured", async () => {
      const app = new Hono<{ Bindings: typeof MOCK_ENV_NO_API_KEY }>();
      app.use("/api", apiKeyAuth({ excludePaths: [] }));
      app.get("/api", (c) => c.json({ success: true }));

      const res = await app.request(
        "/api",
        { headers: { "x-api-key": "test-api-key-12345" } },
        MOCK_ENV_NO_API_KEY
      );

      expect(res.status).toBe(503);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("server_configuration");
      expect(data.error.code).toBe(AUTH_CONFIG_ERROR);
    });

    it("should allow excluded paths without API key", async () => {
      const app = new Hono<{ Bindings: typeof MOCK_ENV_WITH_KEY }>();
      app.use("/health", apiKeyAuth({ excludePaths: ["/health"] }));
      app.get("/health", (c) => c.json({ status: "ok" }));

      const res = await app.request("/health", {}, MOCK_ENV_WITH_KEY);

      expect(res.status).toBe(200);
    });

    it("should use custom header name", async () => {
      const customHeader = "x-custom-auth";
      const app = new Hono<{ Bindings: typeof MOCK_ENV_WITH_KEY }>();
      app.use("/api", apiKeyAuth({ apiKeyHeader: customHeader, excludePaths: [] }));
      app.get("/api", (c) => c.json({ success: true }));

      // Should fail with default header
      const res1 = await app.request(
        "/api",
        { headers: { "x-api-key": "test-api-key-12345" } },
        MOCK_ENV_WITH_KEY
      );
      expect(res1.status).toBe(401);

      // Should work with custom header
      const res2 = await app.request(
        "/api",
        { headers: { [customHeader]: "test-api-key-12345" } },
        MOCK_ENV_WITH_KEY
      );
      expect(res2.status).toBe(200);
    });

    it("should exclude multiple paths from authentication", async () => {
      const app = new Hono<{ Bindings: typeof MOCK_ENV_WITH_KEY }>();
      app.use("*", apiKeyAuth({ excludePaths: ["/health", "/status"] }));
      app.get("/health", (c) => c.json({ status: "ok" }));
      app.get("/status", (c) => c.json({ status: "ok" }));

      // All excluded paths should work without API key
      const healthRes = await app.request("/health", {}, MOCK_ENV_WITH_KEY);
      expect(healthRes.status).toBe(200);

      const statusRes = await app.request("/status", {}, MOCK_ENV_WITH_KEY);
      expect(statusRes.status).toBe(200);
    });

    it("should handle empty API key in header", async () => {
      const app = new Hono<{ Bindings: typeof MOCK_ENV_WITH_KEY }>();
      app.use("/api", apiKeyAuth({ excludePaths: [] }));
      app.get("/api", (c) => c.json({ success: true }));

      const res = await app.request("/api", { headers: { "x-api-key": "" } }, MOCK_ENV_WITH_KEY);

      expect(res.status).toBe(401);
    });

    it("should provide timestamp in error response", async () => {
      const app = new Hono<{ Bindings: typeof MOCK_ENV_WITH_KEY }>();
      app.use("/api", apiKeyAuth({ excludePaths: [] }));
      app.get("/api", (c) => c.json({ success: true }));

      const res = await app.request("/api", {}, MOCK_ENV_WITH_KEY);
      const data = (await res.json()) as ErrorResponse;

      expect(data.error.timestamp).toBeDefined();
      expect(() => new Date(data.error.timestamp)).not.toThrow();
    });

    it("should reject requests with wrong length API key", async () => {
      const app = new Hono<{ Bindings: typeof MOCK_ENV_WITH_KEY }>();
      app.use("/api", apiKeyAuth({ excludePaths: [] }));
      app.get("/api", (c) => c.json({ success: true }));

      // Shorter key should fail due to timing-safe comparison
      const res = await app.request(
        "/api",
        { headers: { "x-api-key": "short" } },
        MOCK_ENV_WITH_KEY
      );

      expect(res.status).toBe(401);
    });
  });
});
