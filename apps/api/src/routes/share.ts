import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../types";
import {
  HTTP_STATUS,
  ERROR_CODES,
  ERROR_MESSAGES,
  SHARE_CONFIG,
} from "../config/constants";

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

function generateShareId(): string {
  let result = "";
  for (let i = 0; i < SHARE_CONFIG.ID_LENGTH; i++) {
    result += SHARE_CONFIG.ALPHANUMERIC_CHARS.charAt(
      Math.floor(Math.random() * SHARE_CONFIG.ALPHANUMERIC_CHARS.length),
    );
  }
  return result;
}

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
            message: "Database not configured",
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
      console.error("Share creation error:", error);
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
  try {
    const shareId = c.req.param("id");

    if (!shareId || shareId.length !== SHARE_CONFIG.ID_LENGTH) {
      return c.json(
        {
          error: ERROR_CODES.VALIDATION_ERROR,
          message: "Invalid share ID format",
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!c.env.DB) {
      return c.json(
        {
          error: ERROR_CODES.CONFIGURATION_ERROR,
          message: "Database not configured",
        },
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
        {
          error: ERROR_CODES.NOT_FOUND_ERROR,
          message: "Shared blueprint not found or expired",
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
          message: "Shared blueprint has expired",
        },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return c.json(
      {
        id: result.id,
        title: result.title,
        blueprint: result.blueprint,
        metadata: result.metadata
          ? JSON.parse(result.metadata as string)
          : undefined,
        createdAt: result.created_at,
        expiresAt: result.expires_at,
      },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Share retrieval error:", error);
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

    if (!c.env.DB) {
      return c.json(
        {
          error: ERROR_CODES.CONFIGURATION_ERROR,
          message: "Database not configured",
        },
        HTTP_STATUS.INTERNAL_ERROR,
      );
    }

    await c.env.DB.prepare("DELETE FROM blueprint_shares WHERE id = ?")
      .bind(shareId)
      .run();

    return c.json(
      {
        message: "Share deleted successfully",
      },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Share deletion error:", error);
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
