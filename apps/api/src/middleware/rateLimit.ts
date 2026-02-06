import type { Context, Next } from "hono";
import type { Env } from "../types";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
}

interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 100,
};

export const rateLimit = (config: Partial<RateLimitConfig> = {}) => {
  const { windowMs, maxRequests, keyGenerator } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const key = keyGenerator
      ? keyGenerator(c)
      : `rate_limit:${c.req.header("CF-Connecting-IP") || "anonymous"}`;

    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      const existingData = await c.env.RATE_LIMIT_KV?.get(key);
      let requests: number[] = [];

      if (existingData) {
        requests = JSON.parse(existingData);
        requests = requests.filter((timestamp) => timestamp > windowStart);
      }

      if (requests.length >= maxRequests) {
        const resetTime = Math.min(...requests) + windowMs;

        c.header("X-RateLimit-Limit", maxRequests.toString());
        c.header("X-RateLimit-Remaining", "0");
        c.header("X-RateLimit-Reset", new Date(resetTime).toISOString());

        return c.json(
          {
            success: false,
            error: {
              type: "rate_limit_exceeded",
              message: "Too many requests, please try again later",
              code: "RATE_LIMIT_EXCEEDED",
              details: {
                limit: maxRequests,
                windowMs,
                resetTime: new Date(resetTime).toISOString(),
              },
              timestamp: new Date().toISOString(),
            },
          },
          429,
        );
      }

      requests.push(now);

      await c.env.RATE_LIMIT_KV?.put(key, JSON.stringify(requests), {
        expirationTtl: Math.ceil(windowMs / 1000) + 1,
      });

      const remaining = maxRequests - requests.length;
      const resetTime = Math.min(...requests) + windowMs;

      c.header("X-RateLimit-Limit", maxRequests.toString());
      c.header("X-RateLimit-Remaining", remaining.toString());
      c.header("X-RateLimit-Reset", new Date(resetTime).toISOString());

      (c as any).set("rateLimit", {
        remaining,
        resetTime,
        limit: maxRequests,
      } as RateLimitInfo);

      await next();
    } catch (error) {
      console.error("[Rate Limit Error]", error);
      await next();
    }
  };
};

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
});

export const lenientRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 1000,
});

export const apiKeyRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 1000,
  keyGenerator: (c: Context) => {
    const apiKey = c.req.header("Authorization")?.replace("Bearer ", "");
    return `rate_limit:api_key:${apiKey || "unknown"}`;
  },
});
