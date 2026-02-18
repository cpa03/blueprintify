import type { MiddlewareHandler } from "hono";

interface AuthConfig {
  apiKeyHeader?: string;
  excludePaths?: string[];
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Uses XOR to compare each character and returns false if any differ.
 * This prevents attackers from measuring response time to guess the key.
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
