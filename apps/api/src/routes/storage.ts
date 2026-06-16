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
  STORAGE_FALLBACK_MESSAGES,
  StorageClearRequestSchema,
  StorageReportRequestSchema,
} from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import {
  API_HEADERS,
  STORAGE_CONFIG,
  CACHE_CONFIG,
  HTTP_STATUS,
  STORAGE_MESSAGES,
  STORAGE_KV_CONFIG,
} from "../config/constants";
import { ErrorType } from "../errors";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

// KV key for storing storage quota data
const STORAGE_QUOTA_KEY = STORAGE_KV_CONFIG.QUOTA_KEY;

/**
 * Parse stored quota data from KV
 */
async function getStoredQuota(c: { env: Env }): Promise<{
  used: number;
  total: number;
  projects: number;
  updatedAt: string;
} | null> {
  try {
    const stored = await c.env.CACHE?.get(STORAGE_QUOTA_KEY, "json");
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
app.get("/quota", rateLimit(rateLimitConfigs.standard), async (c) => {
  try {
    // Try to get stored quota from KV
    const storedQuota = await getStoredQuota(c);

    // Calculate values - use stored or defaults
    const used = storedQuota?.used ?? 0;
    const total = storedQuota?.total ?? STORAGE_CONFIG.QUOTA_BYTES;
    const projects = storedQuota?.projects ?? 0;
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

    // Cache quota response - this data rarely changes
    c.header(
      API_HEADERS.CACHE_CONTROL.HEADER_NAME,
      API_HEADERS.CACHE_CONTROL.PUBLIC_WITH_REVALIDATE(
        CACHE_CONFIG.ROOT_MAX_AGE,
        CACHE_CONFIG.ROOT_STALE_WHILE_REVALIDATE
      )
    );

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
          timestamp: new Date().toISOString(),
        },
      },
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
});

/**
 * Report client storage usage
 * POST /storage/report
 *
 * Clients report their localStorage usage to the server for quota tracking.
 * This allows the server to provide accurate quota information.
 */
app.post(
  "/report",
  rateLimit(rateLimitConfigs.standard),
  validateJson(StorageReportRequestSchema),
  async (c) => {
    const { used, total, projects } = c.get(CONTEXT_KEYS.VALIDATED_DATA);

    try {
      // Store the reported quota data in KV
      await c.env.CACHE?.put(
        STORAGE_QUOTA_KEY,
        JSON.stringify({
          used,
          total,
          projects,
          updatedAt: new Date().toISOString(),
        }),
        { expirationTtl: STORAGE_KV_CONFIG.REPORT_TTL_SECONDS }
      );

      return c.json({
        success: true,
        data: {
          stored: true,
          timestamp: new Date().toISOString(),
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
            timestamp: new Date().toISOString(),
          },
        },
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

/**
 * Clear all stored data
 * DELETE /storage/clear
 */
app.delete(
  "/clear",
  rateLimit(rateLimitConfigs.strict),
  validateJson(StorageClearRequestSchema),
  async (c) => {
    const { confirm } = c.get(CONTEXT_KEYS.VALIDATED_DATA);

    if (!confirm) {
      return c.json(
        {
          success: false,
          error: {
            type: ErrorType.VALIDATION,
            message: STORAGE_MESSAGES.CONFIRMATION_REQUIRED,
            timestamp: new Date().toISOString(),
          },
        },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    try {
      // Clear stored quota data
      await c.env.CACHE?.delete(STORAGE_QUOTA_KEY);

      return c.json({
        success: true,
        data: {
          cleared: true,
          message: STORAGE_MESSAGES.CLEAR_SUCCESS,
          timestamp: new Date().toISOString(),
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
            timestamp: new Date().toISOString(),
          },
        },
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

export default app;
