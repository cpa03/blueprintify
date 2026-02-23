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

const app = new Hono<{ Bindings: Env }>();

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
      (randomValues[i] ?? 0) % SHARE_CONFIG.ALPHANUMERIC_CHARS.length,
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

/**
 * Validates share ID format using regex pattern.
 * SECURITY FIX #905: Prevents injection attacks by only allowing alphanumeric and URL-safe characters.
 * @param id - Share ID to validate
 * @returns True if valid, false otherwise
 */
function isValidShareId(id: string | undefined): id is string {
  if (!id) return false;
  return SHARE_CONFIG.ID_PATTERN.test(id);
}

/**
 * Creates a standardized error response object.
 * SECURITY FIX #907: Includes timestamp for debugging and tracing.
 * @param type - Error type
 * @param message - Error message
 * @param code - Error code
 * @returns Standardized error response object
 */
function createErrorResponse(
  type: string,
  message: string,
  code: string,
): {
  success: false;
  error: {
    type: string;
    message: string;
    code: string;
    timestamp: string;
  };
} {
  return {
    success: false,
    error: {
      type,
      message,
      code,
      timestamp: new Date().toISOString(),
    },
  };
}

app.post(
  "/",
  zValidator("json", createShareSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        createErrorResponse(
          "validation",
          ERROR_MESSAGES.VALIDATION,
          ERROR_CODES.VALIDATION_ERROR,
        ),
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }),
  async (c) => {
    try {
      const { title, blueprint, metadata } = c.req.valid("json");
      const shareId = generateShareId();
      const now = new Date().toISOString();
      const expiresAt = getExpirationDate();

      // SECURITY FIX #892: Track ownership for deletion authorization
      const requestSource = c.req.header("x-api-key")
        ? "api_key_user"
        : "anonymous";

      if (!c.env.DB) {
        return c.json(
          createErrorResponse(
            "configuration",
            SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
            ERROR_CODES.CONFIGURATION_ERROR,
          ),
          HTTP_STATUS.INTERNAL_ERROR,
        );
      }

      await c.env.DB.prepare(
        `INSERT INTO blueprint_shares (id, title, blueprint, metadata, created_at, expires_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          shareId,
          title,
          blueprint,
          metadata ? JSON.stringify(metadata) : null,
          now,
          expiresAt.toISOString(),
          requestSource,
        )
        .run();

      return c.json(
        {
          success: true,
          data: {
            id: shareId,
            url: `${c.env.CORS_ORIGIN || ""}/share/${shareId}`,
            expiresAt: expiresAt.toISOString(),
          },
        },
        HTTP_STATUS.OK,
      );
    } catch (error) {
      secureLogError("Share creation error", error);
      return c.json(
        createErrorResponse(
          "internal",
          ERROR_MESSAGES.INTERNAL,
          ERROR_CODES.INTERNAL_ERROR,
        ),
        HTTP_STATUS.INTERNAL_ERROR,
      );
    }
  },
);

app.get("/:id", async (c) => {
  try {
    const shareId = c.req.param("id");

    // SECURITY FIX #905: Use regex pattern validation instead of just length check
    if (!isValidShareId(shareId)) {
      return c.json(
        createErrorResponse(
          "validation",
          SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT,
          ERROR_CODES.VALIDATION_ERROR,
        ),
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!c.env.DB) {
      return c.json(
        createErrorResponse(
          "configuration",
          SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
          ERROR_CODES.CONFIGURATION_ERROR,
        ),
        HTTP_STATUS.INTERNAL_ERROR,
      );
    }

    const result = await c.env.DB.prepare(
      `SELECT id, title, blueprint, metadata, created_at, expires_at
       FROM blueprint_shares
       WHERE id = ?`,
    )
      .bind(shareId)
      .first();

    if (!result) {
      return c.json(
        createErrorResponse(
          "not_found",
          SHARE_ERROR_MESSAGES.SHARE_NOT_FOUND_OR_EXPIRED,
          ERROR_CODES.NOT_FOUND_ERROR,
        ),
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const expirationDate = result.expires_at
      ? new Date(result.expires_at as string)
      : null;
    if (expirationDate && expirationDate < new Date()) {
      return c.json(
        createErrorResponse(
          "not_found",
          SHARE_ERROR_MESSAGES.SHARE_EXPIRED,
          ERROR_CODES.NOT_FOUND_ERROR,
        ),
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Safely parse metadata JSON with error handling
    let parsedMetadata: Record<string, unknown> | undefined;
    if (result.metadata) {
      try {
        parsedMetadata = JSON.parse(result.metadata as string) as Record<
          string,
          unknown
        >;
      } catch (parseError) {
        secureLogError("Failed to parse share metadata", parseError);
        parsedMetadata = undefined;
      }
    }

    // Set cache headers for CDN caching - shared blueprints are immutable until expiration
    c.header(
      "Cache-Control",
      `public, max-age=${CACHE_CONFIG.SHARE_MAX_AGE}, stale-while-revalidate=${CACHE_CONFIG.SHARE_STALE_WHILE_REVALIDATE}`,
    );
    c.header(
      "CDN-Cache-Control",
      `public, max-age=${CACHE_CONFIG.SHARE_MAX_AGE}`,
    );

    return c.json(
      {
        success: true,
        data: {
          id: result.id,
          title: result.title,
          blueprint: result.blueprint,
          metadata: parsedMetadata,
          createdAt: result.created_at,
          expiresAt: result.expires_at,
        },
      },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    secureLogError("Share retrieval error", error);
    return c.json(
      createErrorResponse(
        "internal",
        ERROR_MESSAGES.INTERNAL,
        ERROR_CODES.INTERNAL_ERROR,
      ),
      HTTP_STATUS.INTERNAL_ERROR,
    );
  }
});

app.delete("/:id", async (c) => {
  try {
    const shareId = c.req.param("id");

    // SECURITY FIX #905: Use regex pattern validation instead of just length check
    if (!isValidShareId(shareId)) {
      return c.json(
        createErrorResponse(
          "validation",
          SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT,
          ERROR_CODES.VALIDATION_ERROR,
        ),
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!c.env.DB) {
      return c.json(
        createErrorResponse(
          "configuration",
          SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
          ERROR_CODES.CONFIGURATION_ERROR,
        ),
        HTTP_STATUS.INTERNAL_ERROR,
      );
    }

    // SECURITY FIX #892: Check ownership before deletion
    const existingShare = await c.env.DB.prepare(
      `SELECT id, created_by FROM blueprint_shares WHERE id = ?`,
    )
      .bind(shareId)
      .first();

    if (!existingShare) {
      // Return 404 for non-existent shares (avoid enumeration)
      return c.json(
        createErrorResponse(
          "not_found",
          SHARE_ERROR_MESSAGES.SHARE_NOT_FOUND_OR_EXPIRED,
          ERROR_CODES.NOT_FOUND_ERROR,
        ),
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Get request source for ownership verification
    const requestSource = c.req.header("x-api-key")
      ? "api_key_user"
      : "anonymous";
    const shareOwner = existingShare.created_by as string | null;

    // Allow deletion if:
    // 1. Share was created anonymously and request is anonymous, OR
    // 2. Share was created by API key user and request has API key
    // Note: For backward compatibility, shares without created_by can be deleted by anyone
    if (
      shareOwner &&
      shareOwner !== "anonymous" &&
      requestSource !== shareOwner
    ) {
      return c.json(
        createErrorResponse(
          "authorization",
          "Not authorized to delete this share",
          ERROR_CODES.AUTHORIZATION_ERROR,
        ),
        HTTP_STATUS.FORBIDDEN,
      );
    }

    await c.env.DB.prepare("DELETE FROM blueprint_shares WHERE id = ?")
      .bind(shareId)
      .run();

    return c.json(
      {
        success: true,
        message: SHARE_ERROR_MESSAGES.SHARE_DELETED_SUCCESSFULLY,
      },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    secureLogError("Share deletion error", error);
    return c.json(
      createErrorResponse(
        "internal",
        ERROR_MESSAGES.INTERNAL,
        ERROR_CODES.INTERNAL_ERROR,
      ),
      HTTP_STATUS.INTERNAL_ERROR,
    );
  }
});

export default app;
