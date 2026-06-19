import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { apiKeyAuth } from "./auth";
import { ERROR_CODES, API_HEADERS } from "../config/constants";
import { HTTP_STATUS, RESPONSE_STATUS } from "@blueprint/shared";
import type { ErrorResponse } from "../errors";
import { TEST_API_KEY } from "../test-utils";

/** Flexy says: Shared test constants - no hardcoded test-key strings! */
const TEST_VALID_API_KEY = TEST_API_KEY;
const TEST_CUSTOM_HEADER = "x-custom-auth";
const TEST_CUSTOM_KEY = "my-custom-key";

describe("auth middleware", () => {
  const validApiKey = TEST_VALID_API_KEY;

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
        headers: { [API_HEADERS.CUSTOM.API_KEY]: validApiKey },
      });

      expect(res.status).toBe(HTTP_STATUS.OK);
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
        headers: { [API_HEADERS.CUSTOM.API_KEY]: "invalid_key_value" },
      });

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      const data = (await res.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("authentication");
      expect(data.error.code).toBe(ERROR_CODES.AUTHENTICATION_ERROR);
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

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
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
        headers: { [API_HEADERS.CUSTOM.API_KEY]: validApiKey },
      });

      expect(res.status).toBe(HTTP_STATUS.SERVICE_UNAVAILABLE);
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

      expect(res.status).toBe(HTTP_STATUS.OK);
    });

    it("should use custom API key header", async () => {
      const app = new Hono<{ Bindings: { API_KEY: string } }>();
      app.use("*", async (c, next) => {
        c.env = { API_KEY: TEST_CUSTOM_KEY } as unknown as { API_KEY: string };
        await next();
      });
      app.use("/", apiKeyAuth({ apiKeyHeader: TEST_CUSTOM_HEADER, excludePaths: [] }));
      app.get("/", (c) => c.json({ success: true }));

      // Should work with custom header
      const res1 = await app.request("/", {
        headers: { [TEST_CUSTOM_HEADER]: TEST_CUSTOM_KEY },
      });
      expect(res1.status).toBe(HTTP_STATUS.OK);

      // Should fail with default header
      const res2 = await app.request("/", {
        headers: { [API_HEADERS.CUSTOM.API_KEY]: TEST_CUSTOM_KEY },
      });
      expect(res2.status).toBe(HTTP_STATUS.UNAUTHORIZED);
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
      app.get("/health", (c) => c.json({ status: RESPONSE_STATUS.OK }));
      app.get("/api/ping", (c) => c.json({ pong: true }));
      app.get("/docs", (c) => c.json({ docs: true }));
      app.get("/protected", (c) => c.json({ success: true }));

      // Excluded paths should work without key
      expect((await app.request("/health")).status).toBe(HTTP_STATUS.OK);
      expect((await app.request("/api/ping")).status).toBe(HTTP_STATUS.OK);
      expect((await app.request("/docs")).status).toBe(HTTP_STATUS.OK);

      // Protected path should require key
      const res = await app.request("/protected");
      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
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
        headers: { [API_HEADERS.CUSTOM.API_KEY]: "" },
      });

      expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
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
        headers: { [API_HEADERS.CUSTOM.API_KEY]: "Key123" },
      });
      expect(res1.status).toBe(HTTP_STATUS.OK);

      // Different case should fail
      const res2 = await app.request("/", {
        headers: { [API_HEADERS.CUSTOM.API_KEY]: "key123" },
      });
      expect(res2.status).toBe(HTTP_STATUS.UNAUTHORIZED);
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
