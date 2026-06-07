/**
 * Authorization Middleware
 *
 * Provides role-based access control (RBAC) for API endpoints.
 * Checks the user context set by the authentication middleware
 * against required minimum roles for protected operations.
 *
 * @module middleware/authorize
 */

import type { MiddlewareHandler } from "hono";
import type { User, UserRole } from "../types";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "../config/constants";
import { CONTEXT_KEYS, AUTH_DEFAULTS } from "@blueprint/shared";
import { ErrorType, createErrorJson } from "../errors";

/**
 * Role hierarchy for permission checks.
 * Higher index = more privileges.
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [AUTH_DEFAULTS.DEFAULT_ROLE]: 0,
  [AUTH_DEFAULTS.ADMIN_ROLE]: 1,
};

/**
 * Creates an authorization middleware that enforces a minimum role requirement.
 *
 * @param minimumRole - The minimum role required to access the resource
 * @returns Hono middleware handler that returns 403 if the user lacks permission
 *
 * @example
 * ```typescript
 * // Protect an admin-only endpoint
 * app.delete("/admin/cleanup", authorize("admin"), async (c) => { ... });
 *
 * // Protect a user-level endpoint
 * app.delete("/share/:id", authorize("user"), async (c) => { ... });
 * ```
 */
export function authorize(minimumRole: UserRole): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get(CONTEXT_KEYS.USER) as User | undefined;

    // Require authentication - user context must be set by auth middleware
    if (!user) {
      return c.json(
        createErrorJson(ErrorType.AUTHENTICATION, ERROR_MESSAGES.AUTHENTICATION, {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
        }),
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Check role hierarchy
    const userLevel = ROLE_HIERARCHY[user.role] ?? -1;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0;

    if (userLevel < requiredLevel) {
      return c.json(
        createErrorJson(ErrorType.AUTHORIZATION, ERROR_MESSAGES.AUTHORIZATION, {
          code: ERROR_CODES.AUTHORIZATION_ERROR,
          details: {
            requiredRole: minimumRole,
            userRole: user.role,
          },
        }),
        HTTP_STATUS.FORBIDDEN
      );
    }

    await next();
  };
}
