/**
 * API Key Authentication Middleware
 *
 * Provides API key validation for protected routes with constant-time comparison
 * to prevent timing attacks. Derives user identity from the API key to prevent
 * identity spoofing via client-controlled headers.
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
 * Derives a stable, non-reversible user identifier from an API key.
 *
 * Uses SHA-256 hashing to produce a deterministic user ID that:
 * - Cannot be reversed to recover the original API key
 * - Is stable across requests (same key → same userId)
 * - Prevents client-side identity spoofing since the userId is
 *   server-derived from the authenticated credential, not from
 *   a client-controlled header
 *
 * @param apiKey - The API key to derive identity from
 * @returns A hex-encoded user ID prefixed with "user_"
 */
async function deriveUserId(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `user_${hashHex.substring(0, 16)}`;
}

/**
 * Creates an API key authentication middleware for Hono applications.
 *
 * Validates API keys from request headers using constant-time comparison.
 * If no API_KEY environment variable is set, requests are rejected with 503.
 * Excluded paths (like health checks) skip authentication entirely.
 *
 * User identity is derived from the API key via SHA-256 hashing rather than
 * trusting client-provided identity headers. This prevents:
 * - Identity spoofing: clients cannot impersonate other users
 * - Tampering: userId is server-determined and non-reversible
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
    const adminKey = c.env.ADMIN_API_KEY;

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

    // Determine user role based on which API key was used
    // Priority: admin key > regular key
    let userRole: UserRole;

    if (adminKey && providedKey && constantTimeCompare(providedKey, adminKey)) {
      // Admin API key provides admin role — allows access to admin-protected endpoints
      userRole = AUTH_DEFAULTS.ADMIN_ROLE;
    } else if (!providedKey || !constantTimeCompare(providedKey, validKey)) {
      // Invalid or missing key
      return c.json(
        createErrorJson(ErrorType.AUTHENTICATION, ERROR_MESSAGES.AUTHENTICATION_INVALID_KEY, {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
        }),
        HTTP_STATUS.UNAUTHORIZED
      );
    } else {
      // Regular API key provides default role
      userRole = defaultRole;
    }

    // SECURITY: Derive userId from the authenticated API key via SHA-256 hash.
    // This prevents identity spoofing — clients cannot control their userId
    // by sending a custom x-user-id header. The userId is deterministic and
    // non-reversible, providing a stable identity for audit logging and rate limiting.
    // When no API key is available (key-matched but not exposed), fall back to anonymous.
    const userId = providedKey ? await deriveUserId(providedKey) : AUTH_DEFAULTS.ANONYMOUS_USER_ID;
    // SECURITY: User role is assigned server-side only — never trust client-provided x-user-role.
    // All authenticated users default to `defaultRole` (typically "user").
    // Admin access is granted via ADMIN_API_KEY environment variable.
    // Admin key has higher priority: if both keys match, admin role takes precedence.

    const user: User = {
      id: userId,
      role: userRole,
    };
    c.set(CONTEXT_KEYS.USER, user);

    await next();
  };
};
