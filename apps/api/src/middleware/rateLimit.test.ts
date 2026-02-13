import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { rateLimit, rateLimitConfigs } from "./rateLimit";
import type { ErrorResponse } from "../errors";

describe("rateLimit middleware", () => {
  beforeEach(() => {
    // Reset the module state between tests
    vi.resetModules();
  });

  describe("basic rate limiting", () => {
    it("should allow requests within limit", async () => {
      const app = new Hono();
      app.use(
        "/",
        rateLimit({
          windowMs: 60000,
          maxRequests: 3,
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        const res = await app.request("/", {
          headers: { "cf-connecting-ip": "1.2.3.4" },
        });
        expect(res.status).toBe(200);
        expect(res.headers.get("X-RateLimit-Limit")).toBe("3");
        expect(parseInt(res.headers.get("X-RateLimit-Remaining") || "0")).toBe(
          2 - i,
        );
      }
    });

    it("should block requests exceeding limit", async () => {
      const app = new Hono();
      app.use(
        "/",
        rateLimit({
          windowMs: 60000,
          maxRequests: 2,
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      // Make 2 successful requests
      for (let i = 0; i < 2; i++) {
        const res = await app.request("/", {
          headers: { "cf-connecting-ip": "1.2.3.5" },
        });
        expect(res.status).toBe(200);
      }

      // 3rd request should be blocked
      const blockedRes = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.5" },
      });
      expect(blockedRes.status).toBe(429);

      const data = (await blockedRes.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("rate_limit");
      expect(data.error.code).toBe("RATE_LIMIT_ERROR");
      expect(data.error.details).toHaveProperty("retryAfter");
      expect(data.error.details).toHaveProperty("limit", 2);

      // Headers should indicate rate limit
      expect(blockedRes.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(blockedRes.headers.get("Retry-After")).toBeTruthy();
    });

    it("should track different IPs separately", async () => {
      const app = new Hono();
      app.use(
        "/",
        rateLimit({
          windowMs: 60000,
          maxRequests: 2,
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      // IP 1 makes 2 requests
      for (let i = 0; i < 2; i++) {
        const res = await app.request("/", {
          headers: { "cf-connecting-ip": "10.0.0.1" },
        });
        expect(res.status).toBe(200);
      }

      // IP 2 should still be able to make requests
      const res2 = await app.request("/", {
        headers: { "cf-connecting-ip": "10.0.0.2" },
      });
      expect(res2.status).toBe(200);
    });

    it("should fallback to x-forwarded-for header", async () => {
      const app = new Hono();
      app.use(
        "/",
        rateLimit({
          windowMs: 60000,
          maxRequests: 2,
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "x-forwarded-for": "192.168.1.1" },
      });
      expect(res.status).toBe(200);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("2");
    });

    it("should handle anonymous requests without IP", async () => {
      const app = new Hono();
      app.use(
        "/",
        rateLimit({
          windowMs: 60000,
          maxRequests: 2,
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      // Requests without IP should share the same "anonymous" bucket
      const res1 = await app.request("/");
      expect(res1.status).toBe(200);

      const res2 = await app.request("/");
      expect(res2.status).toBe(200);

      const res3 = await app.request("/");
      expect(res3.status).toBe(429);
    });
  });

  describe("custom key generator", () => {
    it("should use custom key generator when provided", async () => {
      const app = new Hono();
      app.use(
        "/",
        rateLimit({
          windowMs: 60000,
          maxRequests: 2,
          keyGenerator: (c) => c.req.header("x-api-key") || "default",
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      // Same API key should share rate limit
      const res1 = await app.request("/", {
        headers: { "x-api-key": "key-123" },
      });
      expect(res1.status).toBe(200);

      const res2 = await app.request("/", {
        headers: { "x-api-key": "key-123" },
      });
      expect(res2.status).toBe(200);

      // Same key - should be blocked
      const res3 = await app.request("/", {
        headers: { "x-api-key": "key-123" },
      });
      expect(res3.status).toBe(429);

      // Different key should work
      const res4 = await app.request("/", {
        headers: { "x-api-key": "key-456" },
      });
      expect(res4.status).toBe(200);
    });
  });

  describe("rate limit configurations", () => {
    it("should have strict config with 10 requests per minute", () => {
      expect(rateLimitConfigs.strict.windowMs).toBe(60000);
      expect(rateLimitConfigs.strict.maxRequests).toBe(10);
    });

    it("should have standard config with 60 requests per minute", () => {
      expect(rateLimitConfigs.standard.windowMs).toBe(60000);
      expect(rateLimitConfigs.standard.maxRequests).toBe(60);
    });

    it("should have lenient config with 120 requests per minute", () => {
      expect(rateLimitConfigs.lenient.windowMs).toBe(60000);
      expect(rateLimitConfigs.lenient.maxRequests).toBe(120);
    });
  });

  describe("rate limit reset", () => {
    it("should reset counter after window expires", async () => {
      const shortWindow = 100; // 100ms window for testing
      const app = new Hono();
      app.use(
        "/",
        rateLimit({
          windowMs: shortWindow,
          maxRequests: 1,
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      // First request succeeds
      const res1 = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.6" },
      });
      expect(res1.status).toBe(200);

      // Second request blocked
      const res2 = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.6" },
      });
      expect(res2.status).toBe(429);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, shortWindow + 50));

      // Third request should succeed after reset
      const res3 = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.6" },
      });
      expect(res3.status).toBe(200);
    });
  });

  describe("response headers", () => {
    it("should include all rate limit headers on success", async () => {
      const app = new Hono();
      app.use(
        "/",
        rateLimit({
          windowMs: 60000,
          maxRequests: 10,
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.7" },
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
      expect(res.headers.get("X-RateLimit-Remaining")).toBe("9");
      expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
    });

    it("should include retry-after header on rate limit", async () => {
      const app = new Hono();
      app.use(
        "/",
        rateLimit({
          windowMs: 60000,
          maxRequests: 1,
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      // First request
      await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.8" },
      });

      // Second request blocked
      const res = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.8" },
      });

      expect(res.status).toBe(429);
      expect(res.headers.get("Retry-After")).toBeTruthy();
      expect(parseInt(res.headers.get("Retry-After") || "0")).toBeGreaterThan(
        0,
      );
      expect(res.headers.get("X-RateLimit-Limit")).toBe("1");
      expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    });
  });
});
