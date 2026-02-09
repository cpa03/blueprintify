import type { MiddlewareHandler } from "hono";
import { ErrorResponse, ErrorType } from "../errors";
import { RATE_LIMIT_CONFIG } from "../config/constants";

interface RateLimitState {
  count: number;
  resetTime: number;
}

export const rateLimit = (
  windowMs: number = RATE_LIMIT_CONFIG.WINDOW_MS,
  maxRequests: number = RATE_LIMIT_CONFIG.MAX_REQUESTS,
): MiddlewareHandler => {
  return async (c, next) => {
    const clientIP =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0] ||
      "unknown";

    const now = Date.now();
    const key = `rate_limit:${clientIP}`;

    try {
      const state = await c.env.RATE_LIMIT_KV?.get(key);
      let rateLimitState: RateLimitState;

      if (state) {
        rateLimitState = JSON.parse(state);

        if (rateLimitState.resetTime <= now) {
          rateLimitState = {
            count: 1,
            resetTime: now + windowMs,
          };
        } else {
          rateLimitState.count++;
        }
      } else {
        rateLimitState = {
          count: 1,
          resetTime: now + windowMs,
        };
      }

      if (rateLimitState.count > maxRequests) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            type: ErrorType.RATE_LIMIT,
            message: "Rate limit exceeded",
            code: "RATE_LIMIT_EXCEEDED",
            details: {
              limit: maxRequests,
              windowMs,
              resetTime: rateLimitState.resetTime,
            },
            timestamp: new Date().toISOString(),
          },
        };

        c.header("X-RateLimit-Limit", maxRequests.toString());
        c.header("X-RateLimit-Remaining", "0");
        c.header(
          "X-RateLimit-Reset",
          Math.ceil(rateLimitState.resetTime / 1000).toString(),
        );

        return c.json(errorResponse, 429);
      }

      await c.env.RATE_LIMIT_KV?.put(key, JSON.stringify(rateLimitState), {
        expirationTtl: Math.ceil(windowMs / 1000) + 60,
      });

      const remaining = Math.max(0, maxRequests - rateLimitState.count);
      c.header("X-RateLimit-Limit", maxRequests.toString());
      c.header("X-RateLimit-Remaining", remaining.toString());
      c.header(
        "X-RateLimit-Reset",
        Math.ceil(rateLimitState.resetTime / 1000).toString(),
      );

      await next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      await next();
    }
  };
};

export const rateLimitAuth = (
  windowMs: number = RATE_LIMIT_CONFIG.AUTH_WINDOW_MS,
  maxRequests: number = RATE_LIMIT_CONFIG.AUTH_MAX_REQUESTS,
): MiddlewareHandler => {
  return async (c, next) => {
    const now = Date.now();
    const apiKey = c.req.header("Authorization")?.replace("Bearer ", "");
    const identifier = apiKey || "anonymous";
    const key = `rate_limit_auth:${identifier}`;

    try {
      const state = await c.env.RATE_LIMIT_KV?.get(key);
      let rateLimitState: RateLimitState;

      if (state) {
        rateLimitState = JSON.parse(state);

        if (rateLimitState.resetTime <= now) {
          rateLimitState = {
            count: 1,
            resetTime: now + windowMs,
          };
        } else {
          rateLimitState.count++;
        }
      } else {
        rateLimitState = {
          count: 1,
          resetTime: now + windowMs,
        };
      }

      if (rateLimitState.count > maxRequests) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: {
            type: ErrorType.RATE_LIMIT,
            message: "Rate limit exceeded",
            code: "RATE_LIMIT_EXCEEDED",
            details: {
              limit: maxRequests,
              windowMs,
              resetTime: rateLimitState.resetTime,
            },
            timestamp: new Date().toISOString(),
          },
        };

        c.header("X-RateLimit-Limit", maxRequests.toString());
        c.header("X-RateLimit-Remaining", "0");
        c.header(
          "X-RateLimit-Reset",
          Math.ceil(rateLimitState.resetTime / 1000).toString(),
        );

        return c.json(errorResponse, 429);
      }

      await c.env.RATE_LIMIT_KV?.put(key, JSON.stringify(rateLimitState), {
        expirationTtl: Math.ceil(windowMs / 1000) + 60,
      });

      const remaining = Math.max(0, maxRequests - rateLimitState.count);
      c.header("X-RateLimit-Limit", maxRequests.toString());
      c.header("X-RateLimit-Remaining", remaining.toString());
      c.header(
        "X-RateLimit-Reset",
        Math.ceil(rateLimitState.resetTime / 1000).toString(),
      );

      await next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      await next();
    }
  };
};
