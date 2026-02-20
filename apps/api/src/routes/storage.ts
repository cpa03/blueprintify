import { Hono } from "hono";
import { StorageClearRequestSchema } from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { STORAGE_CONFIG } from "../config/constants";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * Get storage quota information
 * GET /storage/quota
 */
app.get("/quota", rateLimit(rateLimitConfigs.standard), async (c) => {
  const startTime = Date.now();
  try {
    // Cache quota response for 60 seconds - this data rarely changes
    c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
    c.header(
      "Server-Timing",
      `storage;desc="Quota Check";dur=${Date.now() - startTime}`,
    );
    return c.json({
      success: true,
      data: {
        used: 0,
        total: STORAGE_CONFIG.QUOTA_BYTES,
        percentage: 0,
        projects: 0,
        note: "Server-side storage tracking. Client-side storage quota available via localStorage API.",
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal" as const,
          message:
            error instanceof Error
              ? error.message
              : "Failed to get storage quota",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

/**
 * Clear all stored data
 * DELETE /storage/clear
 */
app.delete(
  "/clear",
  rateLimit(rateLimitConfigs.strict),
  validateJson(StorageClearRequestSchema),
  async (c) => {
    const { confirm } = c.get("validatedData");

    if (!confirm) {
      return c.json(
        {
          success: false,
          error: {
            type: "validation" as const,
            message: "Confirmation required to clear storage",
            timestamp: new Date().toISOString(),
          },
        },
        400,
      );
    }

    try {
      return c.json({
        success: true,
        data: {
          cleared: true,
          message:
            "Server-side storage cleared. Client-side storage must be cleared via localStorage API.",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            type: "internal" as const,
            message:
              error instanceof Error
                ? error.message
                : "Failed to clear storage",
            timestamp: new Date().toISOString(),
          },
        },
        500,
      );
    }
  },
);

export default app;
