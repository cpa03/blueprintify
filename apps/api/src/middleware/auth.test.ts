import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { apiKeyAuth } from "./auth";
import { ERROR_CODES } from "../config/constants";
import type { ErrorResponse } from "../errors";

describe("auth middleware", () => {
  const validApiKey = "test-api-key-12345";

  describe("apiKeyAuth", () => {
    it("should allow requests with valid API key", async () => {
      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: validApiKey } as unknown as { API_KEY: string };
        await next();
      });
      // Explicitly set excludePaths to empty to test auth
      app.use("/", apiKeyAuth({ excludePaths: [] }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "x-api-key": validApiKey },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as { success: boolean };
      expect(data.success).toBe(true);
    });

    it("should reject requests with invalid API key", async () => {
      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: validApiKey } as unknown as { API_KEY: string };
        await next();
      });
      app.use("/", apiKeyAuth({ excludePaths: [] }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "x-api-key": "invalid-key" },
      });

      expect(res.status).toBe(401);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("authentication");
      expect(data.error.code).toBe("AUTHENTICATION_ERROR");
    });

    it("should reject requests with missing API key", async () => {
      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: validApiKey } as unknown as { API_KEY: string };
        await next();
      });
      app.use("/", apiKeyAuth({ excludePaths: [] }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/");

      expect(res.status).toBe(401);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("authentication");
    });

    it("should reject requests when API_KEY is not configured", async () => {
      const app = new Hono<{ Bindings: { API_KEY?: string } }>();
      app.use("*", async (c, next) => {
        c.env = {} as unknown as { API_KEY?: string };
        await next();
      });
      app.use("/", apiKeyAuth({ excludePaths: [] }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "x-api-key": validApiKey },
      });

      expect(res.status).toBe(503);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ERROR_CODES.CONFIGURATION_ERROR);
      expect(data.error.message).toContain("API_KEY is not configured");
    });

    it("should allow excluded paths without authentication", async () => {
      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: validApiKey } as unknown as { API_KEY: string };
        await next();
      });
      app.use("/", apiKeyAuth({ excludePaths: ["/health", "/"] }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/");

      expect(res.status).toBe(200);
    });

    it("should use custom API key header", async () => {
      const customHeader = "x-custom-auth";
      const customKey = "my-custom-key";

      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: customKey } as unknown as { API_KEY: string };
        await next();
      });
      app.use("/", apiKeyAuth({ apiKeyHeader: customHeader, excludePaths: [] }));
      app.get("/", (c) => c.json({ success: true }));

      // Should work with custom header
      const res1 = await app.request("/", {
        headers: { [customHeader]: customKey },
      });
      expect(res1.status).toBe(200);

      // Should fail with default header
      const res2 = await app.request("/", {
        headers: { "x-api-key": customKey },
      });
      expect(res2.status).toBe(401);
    });

    it("should allow multiple excluded paths", async () => {
      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: validApiKey } as unknown as { API_KEY: string };
        await next();
      });
      app.use(
        "*",
        apiKeyAuth({
          excludePaths: ["/health", "/api/ping", "/docs"],
        })
      );
      app.get("/health", (c) => c.json({ status: "ok" }));
      app.get("/api/ping", (c) => c.json({ pong: true }));
      app.get("/docs", (c) => c.json({ docs: true }));
      app.get("/protected", (c) => c.json({ success: true }));

      // Excluded paths should work without key
      expect((await app.request("/health")).status).toBe(200);
      expect((await app.request("/api/ping")).status).toBe(200);
      expect((await app.request("/docs")).status).toBe(200);

      // Protected path should require key
      const res = await app.request("/protected");
      expect(res.status).toBe(401);
    });

    it("should reject empty API key header", async () => {
      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: validApiKey } as unknown as { API_KEY: string };
        await next();
      });
      app.use("/", apiKeyAuth({ excludePaths: [] }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "x-api-key": "" },
      });

      expect(res.status).toBe(401);
    });

    it("should handle case-sensitive API key comparison", async () => {
      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: "Key123" } as unknown as { API_KEY: string };
        await next();
      });
      app.use("/", apiKeyAuth({ excludePaths: [] }));
      app.get("/", (c) => c.json({ success: true }));

      // Exact match should work
      const res1 = await app.request("/", {
        headers: { "x-api-key": "Key123" },
      });
      expect(res1.status).toBe(200);

      // Different case should fail
      const res2 = await app.request("/", {
        headers: { "x-api-key": "key123" },
      });
      expect(res2.status).toBe(401);
    });

    it("should return consistent error response structure", async () => {
      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: validApiKey } as unknown as { API_KEY: string };
        await next();
      });
      app.use("/", apiKeyAuth({ excludePaths: [] }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/");

      const data = (await res.json()) as ErrorResponse;
      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("error");
      expect(data.error).toHaveProperty("type");
      expect(data.error).toHaveProperty("message");
      expect(data.error).toHaveProperty("code");
      expect(data.error).toHaveProperty("timestamp");
    });
  });
});
