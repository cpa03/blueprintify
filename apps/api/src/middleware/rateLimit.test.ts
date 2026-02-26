import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Hono } from "hono";
import { rateLimit, rateLimitConfigs } from "./rateLimit";
import type { ErrorResponse } from "../errors";
import { initializeConfig, resetConfig } from "../config/env";

function createMockRateLimit(shouldSucceed: boolean[] = []) {
  let callCount = 0;
  return {
    limit: vi.fn(async () => {
      const success = shouldSucceed[callCount] ?? true;
      callCount++;
      return { success };
    }),
  };
}

describe("rateLimit middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    initializeConfig({
      OPENAI_API_KEY: "test-api-key",
    });
  });

  afterEach(() => {
    resetConfig();
  });

  describe("basic rate limiting", () => {
    it("should allow requests when rate limiter succeeds", async () => {
      const mockLimiter = createMockRateLimit([true, true, true]);
      const app = new Hono<{
        Bindings: { STANDARD_RATE_LIMITER: RateLimit };
      }>();
      app.use("*", async (c, next) => {
        c.env = { STANDARD_RATE_LIMITER: mockLimiter } as unknown as {
          STANDARD_RATE_LIMITER: RateLimit;
        };
        await next();
      });
      app.use("/", rateLimit({ limiter: "STANDARD_RATE_LIMITER" }));
      app.get("/", (c) => c.json({ success: true }));

      for (let i = 0; i < 3; i++) {
        const res = await app.request("/", {
          headers: { "cf-connecting-ip": "1.2.3.4" },
        });
        expect(res.status).toBe(200);
        expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
      }
    });

    it("should block requests when rate limiter fails", async () => {
      const mockLimiter = createMockRateLimit([true, true, false]);
      const app = new Hono<{
        Bindings: { STANDARD_RATE_LIMITER: RateLimit };
      }>();

      app.use("*", async (c, next) => {
        c.env = { STANDARD_RATE_LIMITER: mockLimiter } as unknown as {
          STANDARD_RATE_LIMITER: RateLimit;
        };
        await next();
      });
      app.use("/", rateLimit({ limiter: "STANDARD_RATE_LIMITER" }));
      app.get("/", (c) => c.json({ success: true }));

      for (let i = 0; i < 2; i++) {
        const res = await app.request("/", {
          headers: { "cf-connecting-ip": "1.2.3.5" },
        });
        expect(res.status).toBe(200);
      }

      const blockedRes = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.5" },
      });
      expect(blockedRes.status).toBe(429);

      const data = (await blockedRes.json()) as ErrorResponse;
      expect(data.success).toBe(false);
      expect(data.error.type).toBe("rate_limit");
      expect(data.error.code).toBe("RATE_LIMIT_ERROR");
    });

    it("should fallback to x-forwarded-for header", async () => {
      const mockLimiter = createMockRateLimit([true]);
      const app = new Hono<{
        Bindings: { STANDARD_RATE_LIMITER: RateLimit };
      }>();
      app.use("*", async (c, next) => {
        c.env = {
          STANDARD_RATE_LIMITER: mockLimiter,
        } as unknown as { STANDARD_RATE_LIMITER: RateLimit };
        await next();
      });
      app.use("/", rateLimit({ limiter: "STANDARD_RATE_LIMITER" }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "x-forwarded-for": "192.168.1.1" },
      });
      expect(res.status).toBe(200);
    });

    it("should handle anonymous requests without IP", async () => {
      const mockLimiter = createMockRateLimit([true, true, false]);
      const app = new Hono<{
        Bindings: { STANDARD_RATE_LIMITER: RateLimit };
      }>();
      app.use("*", async (c, next) => {
        c.env = { STANDARD_RATE_LIMITER: mockLimiter } as unknown as {
          STANDARD_RATE_LIMITER: RateLimit;
        };
        await next();
      });
      app.use("/", rateLimit({ limiter: "STANDARD_RATE_LIMITER" }));
      app.get("/", (c) => c.json({ success: true }));

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
      const mockLimiter = createMockRateLimit([true, true, false, true]);
      const app = new Hono<{
        Bindings: { STANDARD_RATE_LIMITER: RateLimit };
      }>();
      app.use("*", async (c, next) => {
        c.env = { STANDARD_RATE_LIMITER: mockLimiter } as unknown as {
          STANDARD_RATE_LIMITER: RateLimit;
        };
        await next();
      });
      app.use(
        "/",
        rateLimit({
          limiter: "STANDARD_RATE_LIMITER",
          keyGenerator: (c) => c.req.header("x-api-key") || "default",
        }),
      );
      app.get("/", (c) => c.json({ success: true }));

      const res1 = await app.request("/", {
        headers: { "x-api-key": "key-123" },
      });
      expect(res1.status).toBe(200);

      const res2 = await app.request("/", {
        headers: { "x-api-key": "key-123" },
      });
      expect(res2.status).toBe(200);

      const res3 = await app.request("/", {
        headers: { "x-api-key": "key-123" },
      });
      expect(res3.status).toBe(429);
    });
  });

  describe("rate limit configurations", () => {
    it("should have strict config with STRICT_RATE_LIMITER", () => {
      expect(rateLimitConfigs.strict.limiter).toBe("STRICT_RATE_LIMITER");
    });

    it("should have standard config with STANDARD_RATE_LIMITER", () => {
      expect(rateLimitConfigs.standard.limiter).toBe("STANDARD_RATE_LIMITER");
    });

    it("should have lenient config with LENIENT_RATE_LIMITER", () => {
      expect(rateLimitConfigs.lenient.limiter).toBe("LENIENT_RATE_LIMITER");
    });
  });

  describe("missing rate limiter binding", () => {
    it("should reject requests with 503 when rate limiter is not configured", async () => {
      // Save original NODE_ENV and set to production to test security behavior
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      try {
        const app = new Hono<{
          Bindings: { STANDARD_RATE_LIMITER?: RateLimit };
        }>();
        app.use("*", async (c, next) => {
          c.env = {} as { STANDARD_RATE_LIMITER?: RateLimit };
          await next();
        });
        app.use("/", rateLimit({ limiter: "STANDARD_RATE_LIMITER" }));
        app.get("/", (c) => c.json({ success: true }));

        const res = await app.request("/", {
          headers: { "cf-connecting-ip": "1.2.3.9" },
        });
        expect(res.status).toBe(503);

        const data = (await res.json()) as ErrorResponse;
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("RATE_LIMITER_NOT_CONFIGURED");
      } finally {
        // Restore original NODE_ENV
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });

  describe("response headers", () => {
    it("should include rate limit headers on success", async () => {
      const mockLimiter = createMockRateLimit([true]);
      const app = new Hono<{
        Bindings: { STANDARD_RATE_LIMITER: RateLimit };
      }>();
      app.use("*", async (c, next) => {
        c.env = { STANDARD_RATE_LIMITER: mockLimiter } as unknown as {
          STANDARD_RATE_LIMITER: RateLimit;
        };
        await next();
      });
      app.use("/", rateLimit({ limiter: "STANDARD_RATE_LIMITER" }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.7" },
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
    });

    it("should include rate limit headers on blocked request", async () => {
      const mockLimiter = createMockRateLimit([true, false]);
      const app = new Hono<{
        Bindings: { STANDARD_RATE_LIMITER: RateLimit };
      }>();
      app.use("*", async (c, next) => {
        c.env = { STANDARD_RATE_LIMITER: mockLimiter } as unknown as {
          STANDARD_RATE_LIMITER: RateLimit;
        };
        await next();
      });
      app.use("/", rateLimit({ limiter: "STANDARD_RATE_LIMITER" }));
      app.get("/", (c) => c.json({ success: true }));

      await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.8" },
      });

      const res = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.8" },
      });

      expect(res.status).toBe(429);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
    });
  });

  describe("different limiter configurations", () => {
    it("should use correct limit for STRICT_RATE_LIMITER", async () => {
      const mockLimiter = createMockRateLimit([true]);
      const app = new Hono<{
        Bindings: { STRICT_RATE_LIMITER: RateLimit };
      }>();
      app.use("*", async (c, next) => {
        c.env = { STRICT_RATE_LIMITER: mockLimiter } as unknown as {
          STRICT_RATE_LIMITER: RateLimit;
        };
        await next();
      });
      app.use("/", rateLimit({ limiter: "STRICT_RATE_LIMITER" }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.10" },
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
    });

    it("should use correct limit for LENIENT_RATE_LIMITER", async () => {
      const mockLimiter = createMockRateLimit([true]);
      const app = new Hono<{
        Bindings: { LENIENT_RATE_LIMITER: RateLimit };
      }>();
      app.use("*", async (c, next) => {
        c.env = { LENIENT_RATE_LIMITER: mockLimiter } as unknown as {
          LENIENT_RATE_LIMITER: RateLimit;
        };
        await next();
      });
      app.use("/", rateLimit({ limiter: "LENIENT_RATE_LIMITER" }));
      app.get("/", (c) => c.json({ success: true }));

      const res = await app.request("/", {
        headers: { "cf-connecting-ip": "1.2.3.11" },
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("120");
    });
  });
});
