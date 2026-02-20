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

app.post(
  "/",
  zValidator("json", createShareSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: ERROR_CODES.VALIDATION_ERROR,
          message: ERROR_MESSAGES.VALIDATION,
          details: result.error.issues,
        },
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

      if (!c.env.DB) {
        return c.json(
          {
            error: ERROR_CODES.CONFIGURATION_ERROR,
            message: SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
          },
          HTTP_STATUS.INTERNAL_ERROR,
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
      return c.json(
        {
          error: ERROR_CODES.INTERNAL_ERROR,
          message: ERROR_MESSAGES.INTERNAL,
        },
        HTTP_STATUS.INTERNAL_ERROR,
      );
    }
  },
);

app.get("/:id", async (c) => {
  const startTime = Date.now();
  try {
    const shareId = c.req.param("id");

    if (!shareId || shareId.length !== SHARE_CONFIG.ID_LENGTH) {
      return c.json(
        {
          error: ERROR_CODES.VALIDATION_ERROR,
          message: SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT,
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!c.env.DB) {
      return c.json(
        {
          error: ERROR_CODES.CONFIGURATION_ERROR,
          message: SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
        },
        HTTP_STATUS.INTERNAL_ERROR,
      );
    }

    const dbStartTime = Date.now();
    const result = await c.env.DB.prepare(
      `SELECT id, title, blueprint, metadata, created_at, expires_at
       FROM blueprint_shares
       WHERE id = ?`,
    )
      .bind(shareId)
      .first();
    const dbDuration = Date.now() - dbStartTime;

    if (!result) {
      return c.json(
        {
          error: ERROR_CODES.NOT_FOUND_ERROR,
          message: SHARE_ERROR_MESSAGES.SHARE_NOT_FOUND_OR_EXPIRED,
        },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const expirationDate = result.expires_at
      ? new Date(result.expires_at as string)
      : null;
    if (expirationDate && expirationDate < new Date()) {
      return c.json(
        {
          error: ERROR_CODES.NOT_FOUND_ERROR,
          message: SHARE_ERROR_MESSAGES.SHARE_EXPIRED,
        },
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
    // Cache for 5 minutes, stale-while-revalidate for 1 hour
    c.header(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=3600",
    );
    c.header("CDN-Cache-Control", "public, max-age=300");
    c.header(
      "Server-Timing",
      `db;desc="Database Query";dur=${dbDuration}, total;desc="Total Request";dur=${Date.now() - startTime}`,
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
    return c.json(
      {
        error: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES.INTERNAL,
      },
      HTTP_STATUS.INTERNAL_ERROR,
    );
  }
});

app.delete("/:id", async (c) => {
  try {
    const shareId = c.req.param("id");

    if (!shareId || shareId.length !== SHARE_CONFIG.ID_LENGTH) {
      return c.json(
        {
          error: ERROR_CODES.VALIDATION_ERROR,
          message: SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT,
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!c.env.DB) {
      return c.json(
        {
          error: ERROR_CODES.CONFIGURATION_ERROR,
          message: SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
        },
        HTTP_STATUS.INTERNAL_ERROR,
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
    return c.json(
      {
        error: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES.INTERNAL,
      },
      HTTP_STATUS.INTERNAL_ERROR,
    );
  }
});

export default app;
