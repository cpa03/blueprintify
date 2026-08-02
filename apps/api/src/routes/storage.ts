/**
 * Storage Routes
 *
 * API endpoints for storage quota management and data clearing operations.
 * Provides server-side storage tracking and coordination for client-side localStorage.
 *
 * @module routes/storage
 */

import { Hono } from "hono";
import {
  CONTEXT_KEYS,
  PERCENT_SCALE,
  AUTH_DEFAULTS,
  STORAGE_FALLBACK_MESSAGES,
  StorageReportRequestSchema,
} from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { authorize } from "../middleware/authorize";
import {
  API_HEADERS,
  STORAGE_CONFIG,
  HTTP_STATUS,
  STORAGE_MESSAGES,
  STORAGE_KV_CONFIG,
  ROUTE_SUB_PATHS,
  STORAGE_QUERY_PARAMS,
} from "../config/constants";
import { ErrorType, timestamp } from "../errors";
import type { AppVariables, Env, User } from "../types";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

/**
 * Compute the per-user KV key for storage quota data.
 * Scoping by user prevents one authenticated user from reading or
 * overwriting another user's reported storage usage.
 */
function getQuotaKey(c: { get: (key: string) => unknown }): string {
  const user = c.get(CONTEXT_KEYS.USER) as User | undefined;
  const userId = user?.id ?? AUTH_DEFAULTS.ANONYMOUS_USER_ID;
  return `${STORAGE_KV_CONFIG.QUOTA_KEY}:${userId}`;
}

/**
 * Parse stored quota data from KV
 */
async function getStoredQuota(
  c: { env: Env },
  quotaKey: string
): Promise<{
  used: number;
  total: number;
  projects: number;
  updatedAt: string;
} | null> {
  try {
    const stored = await c.env.CACHE?.get(quotaKey, "json");
    if (stored) {
      return stored as {
        used: number;
        total: number;
        projects: number;
        updatedAt: string;
      };
    }
  } catch {
    // If KV read fails, return null to use defaults
  }
  return null;
}

/**
 * Get storage quota information
 * GET /storage/quota
 */
app.get(
  ROUTE_SUB_PATHS.QUOTA,
  rateLimit(rateLimitConfigs.standard),
  authorize(AUTH_DEFAULTS.DEFAULT_ROLE),
  async (c) => {
    try {
      const quotaKey = getQuotaKey(c);
      // Try to get stored quota from KV
      const storedQuota = await getStoredQuota(c, quotaKey);

      // Calculate values - use stored or defaults
      const used = storedQuota?.used ?? 0;
      const total = storedQuota?.total ?? STORAGE_CONFIG.QUOTA_BYTES;
      const projects = storedQuota?.projects ?? 0;
      const percentage = total > 0 ? Math.round((used / total) * PERCENT_SCALE) : 0;

      // Per-user data must not be cached in shared caches
      c.header(API_HEADERS.CACHE_CONTROL.HEADER_NAME, API_HEADERS.CACHE_CONTROL.PRIVATE_NO_STORE);

      return c.json({
        success: true,
        data: {
          used,
          total,
          percentage,
          projects,
          note: STORAGE_MESSAGES.QUOTA_NOTE,
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            type: ErrorType.INTERNAL,
            message: error instanceof Error ? error.message : STORAGE_FALLBACK_MESSAGES.QUOTA_GET,
            timestamp: timestamp(),
          },
        },
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

/**
 * Report client storage usage
 * POST /storage/report
 *
 * Clients report their localStorage usage to the server for quota tracking.
 * This allows the server to provide accurate quota information.
 */
app.post(
  ROUTE_SUB_PATHS.REPORT,
  rateLimit(rateLimitConfigs.standard),
  authorize(AUTH_DEFAULTS.DEFAULT_ROLE),
  validateJson(StorageReportRequestSchema),
  async (c) => {
    const { used, total, projects } = c.get(CONTEXT_KEYS.VALIDATED_DATA);

    try {
      const quotaKey = getQuotaKey(c);
      // Store the reported quota data in KV
      await c.env.CACHE?.put(
        quotaKey,
        JSON.stringify({
          used,
          total,
          projects,
          updatedAt: timestamp(),
        }),
        { expirationTtl: STORAGE_KV_CONFIG.REPORT_TTL_SECONDS }
      );

      return c.json({
        success: true,
        data: {
          stored: true,
          timestamp: timestamp(),
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            type: ErrorType.INTERNAL,
            message:
              error instanceof Error ? error.message : STORAGE_FALLBACK_MESSAGES.REPORT_USAGE,
            timestamp: timestamp(),
          },
        },
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

/**
 * Clear all stored data
 * DELETE /storage/clear?confirm=true
 *
 * Uses a query parameter for confirmation instead of a JSON body
 * to comply with REST conventions (DELETE requests should not have bodies).
 */
app.delete(
  ROUTE_SUB_PATHS.CLEAR,
  rateLimit(rateLimitConfigs.strict),
  authorize(AUTH_DEFAULTS.DEFAULT_ROLE),
  async (c) => {
    const confirm = c.req.query(STORAGE_QUERY_PARAMS.CONFIRM) === STORAGE_QUERY_PARAMS.CONFIRM_TRUE;

    if (!confirm) {
      return c.json(
        {
          success: false,
          error: {
            type: ErrorType.VALIDATION,
            message: STORAGE_MESSAGES.CONFIRMATION_REQUIRED,
            timestamp: timestamp(),
          },
        },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    try {
      const quotaKey = getQuotaKey(c);
      await c.env.CACHE?.delete(quotaKey);

      return c.json({
        success: true,
        data: {
          cleared: true,
          message: STORAGE_MESSAGES.CLEAR_SUCCESS,
          timestamp: timestamp(),
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            type: ErrorType.INTERNAL,
            message:
              error instanceof Error ? error.message : STORAGE_FALLBACK_MESSAGES.CLEAR_STORAGE,
            timestamp: timestamp(),
          },
        },
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

export default app;
