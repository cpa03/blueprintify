import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "../types";
import { getConfig } from "../config/env";
import { HTTP_STATUS, RATE_LIMIT_CONSTANTS } from "../config/constants";
import { TIME_UNITS } from "@blueprint/shared";
import { secureLogWarn, secureLogError } from "../utils/secureLog";

type RateLimiterName = "STRICT_RATE_LIMITER" | "STANDARD_RATE_LIMITER" | "LENIENT_RATE_LIMITER";

interface RateLimitConfig {
  limiter: RateLimiterName;
  keyGenerator?: (c: Context) => string;
}

/**
 * Check if we're running in test environment
 * Vitest automatically sets NODE_ENV to 'test'
 */
const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === "test";
};

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

/**
 * Rate limiting middleware for Cloudflare Workers.
 *
 * Implements IP-based rate limiting using Cloudflare's built-in rate limiter.
 * Protects against DoS attacks and API abuse by limiting requests per time window.
 *
 * @param config - Rate limit configuration
 * @param config.limiter - Name of the rate limiter (STRICT, STANDARD, or LENIENT)
 * @param config.keyGenerator - Optional custom key generator for rate limiting
 * @returns Hono middleware handler
 *
 * @example
 * ```typescript
 * // Apply standard rate limiting
 * app.use("*", rateLimit(rateLimitConfigs.standard));
 *
 * // Apply strict rate limiting for sensitive endpoints
 * app.use("/auth/*", rateLimit(rateLimitConfigs.strict));
 * ```
 *
 * @security
 * - Uses Cloudflare's rate limiter for distributed rate limiting
 * - Falls back to IP-based identification via CF headers
 * - Returns standard rate limit headers (X-RateLimit-*)
 * - Includes Retry-After header when limit exceeded
 * - Rejects requests when rate limiter is not configured (secure default)
 * - Bypasses rate limiting in test environment when no rate limiter is configured
 */
export const rateLimit = (config: RateLimitConfig): MiddlewareHandler => {
  const { limiter, keyGenerator } = config;

  return async (c, next) => {
    const env = c.env as Env;
    const rateLimiter = env[limiter];

    // Bypass rate limiting in test environment ONLY when rate limiter is not explicitly configured
    // This allows route tests to bypass (no rate limiter in env) while still allowing
    // rate limit unit tests to test rate limiting behavior (they explicitly provide mock limiters)
    if (isTestEnvironment() && rateLimiter === undefined) {
      await next();
      return;
    }

    const key = keyGenerator
      ? keyGenerator(c)
      : c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        RATE_LIMIT_CONSTANTS.CLIENT_ID_FALLBACK;

    if (!rateLimiter) {
      // Security: Reject requests when rate limiter is not configured
      // This prevents accidental security misconfigurations in production
      secureLogWarn("RateLimiter", `Rate limiter '${limiter}' not configured - rejecting request`, {
        endpoint: c.req.path,
        method: c.req.method,
      });
      return c.json(
        {
          success: false,
          error: {
            type: "rate_limit",
            message: "Rate limiter not configured",
            code: "RATE_LIMITER_NOT_CONFIGURED",
            details: {
              limiter,
            },
            timestamp: new Date().toISOString(),
          },
        },
        HTTP_STATUS.SERVICE_UNAVAILABLE
      );
    }

    const result = await rateLimiter.limit({ key });
    const limit = getLimiterLimits()[limiter];

    c.header("X-RateLimit-Limit", String(limit));
    if ("remaining" in result && typeof result.remaining === "number") {
      c.header("X-RateLimit-Remaining", String(result.remaining));
    }

    const rateLimitResetTimestamp = Math.ceil(
      Date.now() / TIME_UNITS.MS_PER_SECOND +
        getConfig().RATE_LIMIT_WINDOW_MS / TIME_UNITS.MS_PER_SECOND
    );
    c.header("X-RateLimit-Reset", String(rateLimitResetTimestamp));

    if (!result.success) {
      const retryAfterSeconds = Math.ceil(
        getConfig().RATE_LIMIT_WINDOW_MS / TIME_UNITS.MS_PER_SECOND
      );
      c.header("Retry-After", String(retryAfterSeconds));

      // Log rate limit block for security monitoring
      secureLogError("RateLimit", "Request blocked by rate limiter", {
        endpoint: c.req.path,
        method: c.req.method,
        clientKey: key,
        limit,
        retryAfter: retryAfterSeconds,
      });

      return c.json(
        {
          success: false,
          error: {
            type: "rate_limit",
            message: "Too many requests, please try again later",
            code: "RATE_LIMIT_ERROR",
            details: {
              limit,
              retryAfter: retryAfterSeconds,
            },
            timestamp: new Date().toISOString(),
          },
        },
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    await next();
  };
};

/**
 * Pre-configured rate limit configurations for common use cases.
 *
 * - `strict`: For sensitive endpoints (auth, password reset)
 * - `standard`: For general API endpoints
 * - `lenient`: For high-volume endpoints (health checks, metrics)
 */
export const rateLimitConfigs = {
  get strict() {
    return { limiter: "STRICT_RATE_LIMITER" as RateLimiterName };
  },
  get standard() {
    return { limiter: RATE_LIMIT_CONSTANTS.DEFAULT_LIMITER_NAME as RateLimiterName };
  },
  get lenient() {
    return { limiter: "LENIENT_RATE_LIMITER" as RateLimiterName };
  },
};
