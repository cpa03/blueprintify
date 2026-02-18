import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "../types";

type RateLimiterName =
  | "STRICT_RATE_LIMITER"
  | "STANDARD_RATE_LIMITER"
  | "LENIENT_RATE_LIMITER";

interface RateLimitConfig {
  limiter: RateLimiterName;
  keyGenerator?: (c: Context) => string;
}

/**
 * Default rate limit values (used when env vars not set)
 * Cloudflare best practice: defaults aligned with wrangler.toml
 */
const DEFAULT_LIMITS: Record<RateLimiterName, number> = {
  STRICT_RATE_LIMITER: 10,
  STANDARD_RATE_LIMITER: 60,
  LENIENT_RATE_LIMITER: 120,
};

const DEFAULT_WINDOW_MS = 60000;

/**
 * Get rate limit value from context environment
 * Cloudflare best practice: read config from bindings/env, not singleton
 */
function getLimitFromEnv(env: Env, limiter: RateLimiterName): number {
  const envKey = `${limiter.replace("_RATE_LIMITER", "_MAX")}` as keyof Env;
  const envValue = env[envKey];
  if (typeof envValue === "string") {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return DEFAULT_LIMITS[limiter];
}

/**
 * Get rate limit window from context environment
 */
function getWindowFromEnv(env: Env): number {
  const envValue = env.RATE_LIMIT_WINDOW_MS;
  if (typeof envValue === "string") {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return DEFAULT_WINDOW_MS;
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
    const limit = getLimitFromEnv(env, limiter);

    c.header("X-RateLimit-Limit", String(limit));

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
              retryAfter: getWindowFromEnv(env) / 1000,
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
