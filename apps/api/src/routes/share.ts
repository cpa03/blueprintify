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

// Cache configuration for share lookups
const CACHE_CONFIG = {
  // Cache TTL in seconds (5 minutes for share lookups)
  TTL_SECONDS: 300,
  // Cache key prefix for namespacing
  KEY_PREFIX: "share:",
} as const;

/**
 * Generate cache key for a share ID
 */
function getCacheKey(shareId: string): string {
  return `${CACHE_CONFIG.KEY_PREFIX}${shareId}`;
}

/**
 * Try to get share from KV cache
 */
async function getFromCache(
  cache: KVNamespace | undefined,
  shareId: string,
): Promise<{
  id: string;
  title: string;
  blueprint: string;
  metadata: unknown;
  created_at: string;
  expires_at: string;
} | null> {
  if (!cache) return null;

  try {
    const cached = await cache.get(getCacheKey(shareId), "json");
    if (cached && typeof cached === "object") {
      return cached as {
        id: string;
        title: string;
        blueprint: string;
        metadata: unknown;
        created_at: string;
        expires_at: string;
      };
    }
  } catch {
    // Cache miss or parse error, continue to database
  }
  return null;
}

/**
 * Store share in KV cache
 */
async function setInCache(
  cache: KVNamespace | undefined,
  shareId: string,
  data: {
    id: string;
    title: string;
    blueprint: string;
    metadata: unknown;
    created_at: string;
    expires_at: string;
  },
): Promise<void> {
  if (!cache) return;

  try {
    await cache.put(getCacheKey(shareId), JSON.stringify(data), {
      expirationTtl: CACHE_CONFIG.TTL_SECONDS,
    });
  } catch {
    // Cache write failure is non-critical, continue silently
  }
}

/**
 * Invalidate share from KV cache
 */
async function invalidateCache(
  cache: KVNamespace | undefined,
  shareId: string,
): Promise<void> {
  if (!cache) return;

  try {
    await cache.delete(getCacheKey(shareId));
  } catch {
    // Cache delete failure is non-critical, continue silently
  }
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

    // Try KV cache first
    const cachedResult = await getFromCache(c.env.CACHE, shareId);
    if (cachedResult) {
      const expirationDate = cachedResult.expires_at
        ? new Date(cachedResult.expires_at)
        : null;
      if (expirationDate && expirationDate < new Date()) {
        await invalidateCache(c.env.CACHE, shareId);
        return c.json(
          {
            error: ERROR_CODES.NOT_FOUND_ERROR,
            message: "Shared blueprint has expired",
          },
          HTTP_STATUS.NOT_FOUND,
        );
      }

      c.header("X-Cache-Status", "HIT");
      return c.json(
        {
          id: cachedResult.id,
          title: cachedResult.title,
          blueprint: cachedResult.blueprint,
          metadata: cachedResult.metadata,
          createdAt: cachedResult.created_at,
          expiresAt: cachedResult.expires_at,
        },
        HTTP_STATUS.OK,
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

    // Store in cache for future requests
    const cacheData = {
      id: result.id as string,
      title: result.title as string,
      blueprint: result.blueprint as string,
      metadata: result.metadata ? JSON.parse(result.metadata as string) : null,
      created_at: result.created_at as string,
      expires_at: result.expires_at as string,
    };
    await setInCache(c.env.CACHE, shareId, cacheData);

    c.header("X-Cache-Status", "MISS");
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

    if (!shareId || shareId.length !== 12) {
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

    await c.env.DB.prepare("DELETE FROM blueprint_shares WHERE id = ?")
      .bind(shareId)
      .run();

    await invalidateCache(c.env.CACHE, shareId);

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
