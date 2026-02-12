import type { Context, MiddlewareHandler } from "hono";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimit = (config: RateLimitConfig): MiddlewareHandler => {
  const { windowMs, maxRequests, keyGenerator } = config;

  return async (c, next) => {
    const key = keyGenerator
      ? keyGenerator(c)
      : c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        "anonymous";

    const now = Date.now();
    const record = store[key];

    if (record && now > record.resetTime) {
      delete store[key];
    }

    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      store[key].count++;
    }

    if (store[key].count > maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);

      c.header("Retry-After", String(retryAfter));
      c.header("X-RateLimit-Limit", String(maxRequests));
      c.header("X-RateLimit-Remaining", "0");
      c.header(
        "X-RateLimit-Reset",
        String(Math.ceil(store[key].resetTime / 1000)),
      );

      return c.json(
        {
          success: false,
          error: {
            type: "rate_limit",
            message: "Too many requests, please try again later",
            code: "RATE_LIMIT_ERROR",
            details: {
              retryAfter,
              limit: maxRequests,
              window: `${windowMs / 1000}s`,
            },
            timestamp: new Date().toISOString(),
          },
        },
        429,
      );
    }

    c.header("X-RateLimit-Limit", String(maxRequests));
    c.header(
      "X-RateLimit-Remaining",
      String(Math.max(0, maxRequests - store[key].count)),
    );
    c.header(
      "X-RateLimit-Reset",
      String(Math.ceil(store[key].resetTime / 1000)),
    );

    await next();
  };
};

export const rateLimitConfigs = {
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },
  lenient: {
    windowMs: 60 * 1000,
    maxRequests: 120,
  },
} as const;
