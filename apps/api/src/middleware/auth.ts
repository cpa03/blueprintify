/**
 * API Key Authentication Middleware
 *
 * Provides API key validation for protected routes with constant-time comparison
 * to prevent timing attacks. Also extracts user identity context from request headers
 * for downstream authorization checks.
 *
 * @module middleware/auth
 */

import type { MiddlewareHandler } from "hono";
import type { User, UserRole } from "../types";
import {
  HTTP_STATUS,
  ERROR_CODES,
  ERROR_MESSAGES,
  API_HEADERS,
  ROUTE_PATHS,
} from "../config/constants";
import { AUTH_DEFAULTS, CONTEXT_KEYS } from "@blueprint/shared";
import { ErrorType, createErrorJson } from "../errors";

/**
 * Configuration options for API key authentication middleware.
 *
 * @property apiKeyHeader - Header name for API key (default: "x-api-key")
 * @property excludePaths - Array of paths to exclude from authentication
 * @property defaultRole - Default role assigned to authenticated users (default: "user")
 */
interface AuthConfig {
  apiKeyHeader?: string;
  excludePaths?: string[];
  defaultRole?: UserRole;
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
 * If no API_KEY environment variable is set, requests are rejected with 503.
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
  const {
    apiKeyHeader = API_HEADERS.CUSTOM.API_KEY,
    excludePaths = [ROUTE_PATHS.ROOT],
    defaultRole = AUTH_DEFAULTS.DEFAULT_ROLE,
  } = config;

  return async (c, next) => {
    const path = c.req.path;

    if (excludePaths.includes(path)) {
      await next();
      return;
    }

    const providedKey = c.req.header(apiKeyHeader);
    const validKey = c.env.API_KEY;

    // SECURITY FIX: Reject requests when API_KEY is not configured instead of bypassing auth
    // This prevents unauthenticated access when the server is misconfigured
    if (!validKey) {
      return c.json(
        createErrorJson(ErrorType.CONFIGURATION, ERROR_MESSAGES.AUTHENTICATION_MISSING_CONFIG, {
          code: ERROR_CODES.CONFIGURATION_ERROR,
        }),
        HTTP_STATUS.SERVICE_UNAVAILABLE
      );
    }

    // Use constant-time comparison to prevent timing attacks
    if (!providedKey || !constantTimeCompare(providedKey, validKey)) {
      return c.json(
        createErrorJson(ErrorType.AUTHENTICATION, ERROR_MESSAGES.AUTHENTICATION_INVALID_KEY, {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
        }),
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const userId = c.req.header(API_HEADERS.CUSTOM.USER_ID) || AUTH_DEFAULTS.ANONYMOUS_USER_ID;
    // SECURITY: User role is assigned server-side only — never trust client-provided x-user-role.
    // All authenticated users default to `defaultRole` (typically "user").
    // Admin access must be configured via server-side mechanisms (env var, API key mapping).
    const userRole: UserRole = defaultRole;

    const user: User = {
      id: userId,
      role: userRole,
    };
    c.set(CONTEXT_KEYS.USER, user);

    await next();
  };
};
