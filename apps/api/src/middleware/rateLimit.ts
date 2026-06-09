import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "../types";
import { getConfig } from "../config/env";
import {
  HTTP_STATUS,
  ERROR_CODES,
  RATE_LIMIT_CONSTANTS,
  ERROR_MESSAGES,
  API_HEADERS,
} from "../config/constants";
import { TIME_UNITS, ENVIRONMENT_NAMES } from "@blueprint/shared";
import { ErrorType, createErrorJson } from "../errors";
import { secureLogWarn, secureLogError } from "../utils/secureLog";

type RateLimiterName = "STRICT_RATE_LIMITER" | "STANDARD_RATE_LIMITER" | "LENIENT_RATE_LIMITER";

interface RateLimitConfig {
  limiter: RateLimiterName;
  keyGenerator?: (c: Context) => string;
}

/**
 * Check if we're running in test environment.
 * Uses a safe check compatible with both Workers runtime and Vitest.
 * Vitest automatically sets NODE_ENV to ENVIRONMENT_NAMES.TEST
 */
const isTestEnvironment = (): boolean => {
  const nodeProcess = (globalThis as Record<string, unknown>).process;
  if (nodeProcess && typeof nodeProcess === "object") {
    const env = (nodeProcess as Record<string, unknown>).env as Record<string, string | undefined>;
    return env?.NODE_ENV === ENVIRONMENT_NAMES.TEST;
  }
  return false;
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
      : c.req.header(API_HEADERS.CF_PROPERTIES.CONNECTING_IP) ||
        c.req.header(API_HEADERS.REQUEST.FORWARDED_FOR) ||
        RATE_LIMIT_CONSTANTS.ANONYMOUS_CLIENT_KEY;

    if (!rateLimiter) {
      // Security: Reject requests when rate limiter is not configured
      // This prevents accidental security misconfigurations in production
      secureLogWarn("RateLimiter", `Rate limiter '${limiter}' not configured - rejecting request`, {
        endpoint: c.req.path,
        method: c.req.method,
      });
      return c.json(
        createErrorJson(ErrorType.CONFIGURATION, ERROR_MESSAGES.RATE_LIMITER_NOT_CONFIGURED, {
          code: ERROR_CODES.CONFIGURATION_ERROR,
          details: { limiter },
        }),
        HTTP_STATUS.SERVICE_UNAVAILABLE
      );
    }

    const result = await rateLimiter.limit({ key });
    const limit = getLimiterLimits()[limiter];

    c.header(API_HEADERS.RATE_LIMIT.LIMIT, String(limit));
    if ("remaining" in result && typeof result.remaining === "number") {
      c.header(API_HEADERS.RATE_LIMIT.REMAINING, String(result.remaining));
    }

    const rateLimitResetTimestamp = Math.ceil(
      Date.now() / TIME_UNITS.MS_PER_SECOND +
        getConfig().RATE_LIMIT_WINDOW_MS / TIME_UNITS.MS_PER_SECOND
    );
    c.header(API_HEADERS.RATE_LIMIT.RESET, String(rateLimitResetTimestamp));

    if (!result.success) {
      const retryAfterSeconds = Math.ceil(
        getConfig().RATE_LIMIT_WINDOW_MS / TIME_UNITS.MS_PER_SECOND
      );
      c.header(API_HEADERS.RATE_LIMIT.RETRY_AFTER, String(retryAfterSeconds));

      // Log rate limit block for security monitoring
      secureLogError("RateLimit", "Request blocked by rate limiter", {
        endpoint: c.req.path,
        method: c.req.method,
        clientKey: key,
        limit,
        retryAfter: retryAfterSeconds,
      });

      return c.json(
        createErrorJson(ErrorType.VALIDATION, ERROR_MESSAGES.RATE_LIMIT, {
          code: ERROR_CODES.RATE_LIMIT_ERROR,
          details: { limit, retryAfter: retryAfterSeconds },
        }),
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
    return {
      limiter: RATE_LIMIT_CONSTANTS.LIMITER_BINDINGS.STRICT as RateLimiterName,
    };
  },
  get standard() {
    return {
      limiter: RATE_LIMIT_CONSTANTS.LIMITER_BINDINGS.STANDARD as RateLimiterName,
    };
  },
  get lenient() {
    return {
      limiter: RATE_LIMIT_CONSTANTS.LIMITER_BINDINGS.LENIENT as RateLimiterName,
    };
  },
};
