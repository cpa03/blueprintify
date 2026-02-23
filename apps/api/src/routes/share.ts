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
  SHARE_CONFIG,
  SHARE_ERROR_MESSAGES,
  CACHE_CONFIG,
} from "../config/constants";
import { secureLogError } from "../utils/secureLog";
import {
  ValidationError,
  NotFoundError,
  ConfigurationError,
  InternalServerError,
} from "../errors";

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

app.post(
  "/",
  zValidator("json", createShareSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError("Request validation failed", {
        issues: result.error.issues,
      });
    }
  }),
  async (c) => {
    try {
      const { title, blueprint, metadata } = c.req.valid("json");
      const shareId = generateShareId();
      const now = new Date().toISOString();
      const expiresAt = getExpirationDate();

      if (!c.env.DB) {
        throw new ConfigurationError(
          SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
        );
      }

      await c.env.DB.prepare(
        `INSERT INTO blueprint_shares (id, title, blueprint, metadata, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          shareId,
          title,
          blueprint,
          metadata ? JSON.stringify(metadata) : null,
          now,
          expiresAt.toISOString(),
        )
        .run();

      return c.json(
        {
          id: shareId,
          url: `${c.env.CORS_ORIGIN || ""}/share/${shareId}`,
          expiresAt: expiresAt.toISOString(),
        },
        HTTP_STATUS.OK,
      );
    } catch (error) {
      secureLogError("Share creation error", error);
      // Re-throw APIError instances to be handled by error handler
      if (error instanceof ConfigurationError) {
        throw error;
      }
      throw new InternalServerError("Failed to create share");
    }
  },
);

app.get("/:id", async (c) => {
  try {
    const shareId = c.req.param("id");

    if (!shareId || shareId.length !== SHARE_CONFIG.ID_LENGTH) {
      throw new ValidationError(SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT);
    }

    if (!c.env.DB) {
      throw new ConfigurationError(
        SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
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
      throw new NotFoundError(SHARE_ERROR_MESSAGES.SHARE_NOT_FOUND_OR_EXPIRED);
    }

    const expirationDate = result.expires_at
      ? new Date(result.expires_at as string)
      : null;
    if (expirationDate && expirationDate < new Date()) {
      throw new NotFoundError(SHARE_ERROR_MESSAGES.SHARE_EXPIRED);
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
        id: result.id,
        title: result.title,
        blueprint: result.blueprint,
        metadata: parsedMetadata,
        createdAt: result.created_at,
        expiresAt: result.expires_at,
      },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    secureLogError("Share retrieval error", error);
    // Re-throw APIError instances to be handled by error handler
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof ConfigurationError
    ) {
      throw error;
    }
    throw new InternalServerError("Failed to retrieve share");
  }
});

app.delete("/:id", async (c) => {
  try {
    const shareId = c.req.param("id");

    if (!shareId || shareId.length !== SHARE_CONFIG.ID_LENGTH) {
      throw new ValidationError(SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT);
    }

    if (!c.env.DB) {
      throw new ConfigurationError(
        SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
      );
    }

    await c.env.DB.prepare("DELETE FROM blueprint_shares WHERE id = ?")
      .bind(shareId)
      .run();

    return c.json(
      {
        message: SHARE_ERROR_MESSAGES.SHARE_DELETED_SUCCESSFULLY,
      },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    secureLogError("Share deletion error", error);
    // Re-throw APIError instances to be handled by error handler
    if (
      error instanceof ValidationError ||
      error instanceof ConfigurationError
    ) {
      throw error;
    }
    throw new InternalServerError("Failed to delete share");
  }
});

export default app;
