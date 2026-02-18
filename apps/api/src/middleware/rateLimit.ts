import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "../types";
import { getConfig } from "../config/env";

type RateLimiterName =
  | "STRICT_RATE_LIMITER"
  | "STANDARD_RATE_LIMITER"
  | "LENIENT_RATE_LIMITER";

interface RateLimitConfig {
  limiter: RateLimiterName;
  keyGenerator?: (c: Context) => string;
}

/**
 * Get rate limit values from environment configuration
 * Flexy: No hardcoded values - everything configurable!
 */
function getLimiterLimits(): Record<RateLimiterName, number> {
  const env = getConfig();
  return {
    STRICT_RATE_LIMITER: env.RATE_LIMIT_STRICT_MAX,
    STANDARD_RATE_LIMITER: env.RATE_LIMIT_STANDARD_MAX,
    LENIENT_RATE_LIMITER: env.RATE_LIMIT_LENIENT_MAX,
  };
}

export const rateLimit = (config: RateLimitConfig): MiddlewareHandler => {
  const { limiter, keyGenerator } = config;

  return async (c, next) => {
    const env = c.env as Env;
    const rateLimiter = env[limiter];

    const key = keyGenerator
      ? keyGenerator(c)
      : c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        "anonymous";

    if (!rateLimiter) {
      await next();
      return;
    }

    const result = await rateLimiter.limit({ key });
    const limit = getLimiterLimits()[limiter];

    c.header("X-RateLimit-Limit", String(limit));
    if ("remaining" in result && typeof result.remaining === "number") {
      c.header("X-RateLimit-Remaining", String(result.remaining));
    }

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            type: "rate_limit",
            message: "Too many requests, please try again later",
            code: "RATE_LIMIT_ERROR",
            details: {
              limit,
              retryAfter: getConfig().RATE_LIMIT_WINDOW_MS / 1000,
            },
            timestamp: new Date().toISOString(),
          },
        },
        429,
      );
    }

    await next();
  };
};

export const rateLimitConfigs = {
  get strict() {
    return { limiter: "STRICT_RATE_LIMITER" as RateLimiterName };
  },
  get standard() {
    return { limiter: "STANDARD_RATE_LIMITER" as RateLimiterName };
  },
  get lenient() {
    return { limiter: "LENIENT_RATE_LIMITER" as RateLimiterName };
  },
};
