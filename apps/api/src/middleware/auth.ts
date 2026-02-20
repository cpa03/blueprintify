/**
 * API Key Authentication Middleware
 *
 * Provides API key validation for protected routes with constant-time comparison
 * to prevent timing attacks. Supports configurable header name and path exclusions.
 *
 * @module middleware/auth
 */

import type { MiddlewareHandler } from "hono";

/**
 * Configuration options for API key authentication middleware.
 *
 * @property apiKeyHeader - Header name for API key (default: "x-api-key")
 * @property excludePaths - Array of paths to exclude from authentication
 */
interface AuthConfig {
  apiKeyHeader?: string;
  excludePaths?: string[];
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Uses XOR to compare each character and returns false if any differ.
 * This prevents attackers from measuring response time to guess the key.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal, false otherwise
 */
function constantTimeCompare(a: string, b: string): boolean {
  // Early return for length mismatch - but use constant time for the comparison
  if (a.length !== b.length) {
    // Still perform a comparison to maintain constant time
    return constantTimeCompare(a, a) && false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Creates an API key authentication middleware for Hono applications.
 *
 * Validates API keys from request headers using constant-time comparison.
 * If no API_KEY environment variable is set, authentication is bypassed.
 * Excluded paths (like health checks) skip authentication entirely.
 *
 * @param config - Authentication configuration options
 * @returns Hono middleware handler
 *
 * @example
 * ```typescript
 * app.use('*', apiKeyAuth({
 *   apiKeyHeader: 'x-api-key',
 *   excludePaths: ['/', '/health'],
 * }));
 * ```
 */
export const apiKeyAuth = (config: AuthConfig = {}): MiddlewareHandler => {
  const { apiKeyHeader = "x-api-key", excludePaths = ["/"] } = config;

  return async (c, next) => {
    const path = c.req.path;

    if (excludePaths.includes(path)) {
      await next();
      return;
    }

    const providedKey = c.req.header(apiKeyHeader);
    const validKey = c.env.API_KEY;

    if (!validKey) {
      await next();
      return;
    }

    // Use constant-time comparison to prevent timing attacks
    if (!providedKey || !constantTimeCompare(providedKey, validKey)) {
      return c.json(
        {
          success: false,
          error: {
            type: "authentication",
            message: "Invalid or missing API key",
            code: "AUTHENTICATION_ERROR",
            timestamp: new Date().toISOString(),
          },
        },
        401,
      );
    }

    await next();
  };
};
