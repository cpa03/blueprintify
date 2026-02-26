/**
 * Share Routes
 *
 * API endpoints for sharing blueprints via unique links with expiration.
 * Supports creating, retrieving, and deleting shared blueprints with
 * cryptographic ID generation and database persistence.
 *
 * @module routes/share
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../types";
import {
  HTTP_STATUS,
  ERROR_CODES,
  ERROR_MESSAGES,
  SHARE_CONFIG,
  SHARE_ERROR_MESSAGES,
  CACHE_CONFIG,
} from "../config/constants";
import { secureLogError } from "../utils/secureLog";
import { sanitizeBlueprintContent } from "../utils/sanitize";
import { ErrorType } from "../errors";

const app = new Hono<{ Bindings: Env }>();

/**
 * Creates a standardized error response with requestId and timestamp.
 * @param c - Hono context for getting requestId
 * @param type - Error type from ErrorType enum
 * @param message - Human-readable error message
 * @param code - Error code for client handling
 * @param details - Optional additional error details
 * @returns Standardized error response object
 */
function createErrorResponse(
  c: { get: (key: string) => string | undefined },
  type: ErrorType,
  message: string,
  code: string,
  details?: Record<string, unknown>
): {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    code: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId?: string;
  };
} {
  const requestId = c.get("requestId");
  return {
    success: false,
    error: {
      type,
      message,
      code,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    },
  };
}

const createShareSchema = z.object({
  title: z.string().min(1).max(SHARE_CONFIG.TITLE_MAX_LENGTH),
  blueprint: z.string().min(1).max(SHARE_CONFIG.BLUEPRINT_MAX_LENGTH),
  metadata: z
    .object({
      projectName: z.string().optional(),
      techStack: z.array(z.string()).optional(),
      author: z.string().optional(),
    })
    .optional(),
});

/**
 * Generate a cryptographically secure random share ID.
 * Uses crypto.getRandomValues() instead of Math.random() to prevent
 * ID prediction attacks that could allow unauthorized access to shared blueprints.
 */
function generateShareId(): string {
  const randomValues = new Uint32Array(SHARE_CONFIG.ID_LENGTH);
  crypto.getRandomValues(randomValues);

  let result = "";
  for (let i = 0; i < SHARE_CONFIG.ID_LENGTH; i++) {
    result += SHARE_CONFIG.ALPHANUMERIC_CHARS.charAt(
      (randomValues[i] ?? 0) % SHARE_CONFIG.ALPHANUMERIC_CHARS.length
    );
  }
  return result;
}

/**
 * Calculates the expiration date for a shared blueprint.
 * Uses the configured expiration period (default: 30 days).
 * @returns Date object representing when the share will expire
 */
function getExpirationDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SHARE_CONFIG.EXPIRATION_DAYS);
  return expiresAt;
}

app.post(
  "/",
  zValidator("json", createShareSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        createErrorResponse(
          c,
          ErrorType.VALIDATION,
          ERROR_MESSAGES.VALIDATION,
          ERROR_CODES.VALIDATION_ERROR,
          { issues: result.error.issues }
        ),
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }),
  async (c) => {
    try {
      const { title, blueprint, metadata } = c.req.valid("json");
      const shareId = generateShareId();
      const now = new Date().toISOString();
      const expiresAt = getExpirationDate();

      // Sanitize blueprint content to prevent stored XSS attacks
      const sanitizedBlueprint = sanitizeBlueprintContent(blueprint);

      if (!c.env.DB) {
        return c.json(
          createErrorResponse(
            c,
            ErrorType.CONFIGURATION,
            SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
            ERROR_CODES.CONFIGURATION_ERROR
          ),
          HTTP_STATUS.INTERNAL_ERROR
        );
      }

      await c.env.DB.prepare(
        `INSERT INTO blueprint_shares (id, title, blueprint, metadata, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          shareId,
          title,
          sanitizedBlueprint,
          metadata ? JSON.stringify(metadata) : null,
          now,
          expiresAt.toISOString()
        )
        .run();

      return c.json(
        {
          id: shareId,
          url: `${c.env.CORS_ORIGIN || ""}/share/${shareId}`,
          expiresAt: expiresAt.toISOString(),
        },
        HTTP_STATUS.OK
      );
    } catch (error) {
      secureLogError("Share creation error", error);
      return c.json(
        createErrorResponse(
          c,
          ErrorType.INTERNAL,
          ERROR_MESSAGES.INTERNAL,
          ERROR_CODES.INTERNAL_ERROR
        ),
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

app.get("/:id", async (c) => {
  try {
    const shareId = c.req.param("id");

    if (!shareId || !SHARE_CONFIG.ID_PATTERN.test(shareId)) {
      return c.json(
        createErrorResponse(
          c,
          ErrorType.VALIDATION,
          SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT,
          ERROR_CODES.VALIDATION_ERROR
        ),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!c.env.DB) {
      return c.json(
        createErrorResponse(
          c,
          ErrorType.CONFIGURATION,
          SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
          ERROR_CODES.CONFIGURATION_ERROR
        ),
        HTTP_STATUS.INTERNAL_ERROR
      );
    }

    const result = await c.env.DB.prepare(
      `SELECT id, title, blueprint, metadata, created_at, expires_at
       FROM blueprint_shares
       WHERE id = ?`
    )
      .bind(shareId)
      .first();

    if (!result) {
      return c.json(
        createErrorResponse(
          c,
          ErrorType.NOT_FOUND,
          SHARE_ERROR_MESSAGES.SHARE_NOT_FOUND_OR_EXPIRED,
          ERROR_CODES.NOT_FOUND_ERROR
        ),
        HTTP_STATUS.NOT_FOUND
      );
    }

    const expirationDate = result.expires_at ? new Date(result.expires_at as string) : null;
    if (expirationDate && expirationDate < new Date()) {
      return c.json(
        createErrorResponse(
          c,
          ErrorType.NOT_FOUND,
          SHARE_ERROR_MESSAGES.SHARE_EXPIRED,
          ERROR_CODES.NOT_FOUND_ERROR
        ),
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Safely parse metadata JSON with error handling
    let parsedMetadata: Record<string, unknown> | undefined;
    if (result.metadata) {
      try {
        parsedMetadata = JSON.parse(result.metadata as string) as Record<string, unknown>;
      } catch (parseError) {
        secureLogError("Failed to parse share metadata", parseError);
        parsedMetadata = undefined;
      }
    }

    // Set cache headers for CDN caching - shared blueprints are immutable until expiration
    c.header(
      "Cache-Control",
      `public, max-age=${CACHE_CONFIG.SHARE_MAX_AGE}, stale-while-revalidate=${CACHE_CONFIG.SHARE_STALE_WHILE_REVALIDATE}`
    );
    c.header("CDN-Cache-Control", `public, max-age=${CACHE_CONFIG.SHARE_MAX_AGE}`);

    return c.json(
      {
        id: result.id,
        title: result.title,
        blueprint: result.blueprint,
        metadata: parsedMetadata,
        createdAt: result.created_at,
        expiresAt: result.expires_at,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    secureLogError("Share retrieval error", error);
    return c.json(
      createErrorResponse(
        c,
        ErrorType.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        ERROR_CODES.INTERNAL_ERROR
      ),
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
});

app.delete("/:id", async (c) => {
  try {
    const shareId = c.req.param("id");

    if (!shareId || !SHARE_CONFIG.ID_PATTERN.test(shareId)) {
      return c.json(
        createErrorResponse(
          c,
          ErrorType.VALIDATION,
          SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT,
          ERROR_CODES.VALIDATION_ERROR
        ),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!c.env.DB) {
      return c.json(
        createErrorResponse(
          c,
          ErrorType.CONFIGURATION,
          SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
          ERROR_CODES.CONFIGURATION_ERROR
        ),
        HTTP_STATUS.INTERNAL_ERROR
      );
    }

    await c.env.DB.prepare("DELETE FROM blueprint_shares WHERE id = ?").bind(shareId).run();

    return c.json(
      {
        message: SHARE_ERROR_MESSAGES.SHARE_DELETED_SUCCESSFULLY,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    secureLogError("Share deletion error", error);
    return c.json(
      createErrorResponse(
        c,
        ErrorType.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        ERROR_CODES.INTERNAL_ERROR
      ),
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
});

export default app;
