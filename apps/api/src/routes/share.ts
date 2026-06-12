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
import { validateJson } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { authorize } from "../middleware/authorize";
import { z } from "zod";
import type { Env } from "../types";
import { CONTEXT_KEYS, AUTH_DEFAULTS } from "@blueprint/shared";
import {
  API_HEADERS,
  HTTP_STATUS,
  ERROR_CODES,
  ERROR_MESSAGES,
  SHARE_CONFIG,
  SHARE_ERROR_MESSAGES,
  CACHE_CONFIG,
} from "../config/constants";
import { secureLogError } from "../utils/secureLog";
import { ErrorType, createErrorJson } from "../errors";

/**
 * Derives a deterministic creator identifier from the API key.
 * Uses SHA-256 hashing to avoid storing the raw API key.
 * Returns undefined if no API key is configured (allows backward compatibility).
 */
async function getCreatorId(apiKey: string | undefined): Promise<string | undefined> {
  if (!apiKey) return undefined;
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

const app = new Hono<{ Bindings: Env }>();

/**
 * Minimal interface for Hono context operations used by internal helpers.
 * Extracted to avoid complex Hono generic type variance issues in utility functions.
 */
interface RouteHelperContext {
  env: { DB?: unknown };
  get: (key: string) => string | undefined;
  json: (data: unknown, status?: number) => Response;
}

/**
 * Creates a standardized error response with requestId extracted from the Hono context.
 * Thin wrapper around the shared createErrorJson utility.
 */
function withCtxError(
  c: RouteHelperContext,
  type: ErrorType,
  message: string,
  code: string,
  details?: Record<string, unknown>
) {
  return createErrorJson(type, message, {
    code,
    details,
    requestId: c.get(CONTEXT_KEYS.REQUEST_ID) as string | undefined,
  });
}

/**
 * Validates that a share ID has the expected length.
 * Returns true if valid, false otherwise.
 */
function isValidShareId(id: string | undefined): id is string {
  return typeof id === "string" && id.length === SHARE_CONFIG.ID_LENGTH;
}

/**
 * Safely parses a metadata JSON string into a Record.
 * Returns undefined if the input is null/undefined or unparseable.
 * Avoids unsafe `as` type assertions by validating the parsed value at runtime.
 */
function parseMetadata(metadata: unknown): Record<string, unknown> | undefined {
  if (!metadata || typeof metadata !== "string") return undefined;
  try {
    const parsed = JSON.parse(metadata);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Checks if the database binding is configured and returns a 500 error response if not.
 * Returns null when DB is available (caller can proceed), or a Response when it's missing.
 */
function checkDbConfigured(c: RouteHelperContext): Response | null {
  if (!c.env.DB) {
    return c.json(
      withCtxError(
        c,
        ErrorType.CONFIGURATION,
        SHARE_ERROR_MESSAGES.DATABASE_NOT_CONFIGURED,
        ERROR_CODES.CONFIGURATION_ERROR
      ),
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
  return null;
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

app.post("/", rateLimit(rateLimitConfigs.standard), validateJson(createShareSchema), async (c) => {
  try {
    const { title, blueprint, metadata } = c.get("validatedData");
    const shareId = generateShareId();
    const now = new Date().toISOString();
    const expiresAt = getExpirationDate();
    const creatorId = await getCreatorId(c.env.API_KEY);

    const dbError = checkDbConfigured(c);
    if (dbError) return dbError;

    // Store creator info in metadata for ownership validation on delete
    const enrichedMetadata = {
      ...(metadata || {}),
      ...(creatorId ? { createdBy: creatorId } : {}),
    };
    const metadataJson =
      Object.keys(enrichedMetadata).length > 0 ? JSON.stringify(enrichedMetadata) : null;

    await c.env.DB.prepare(
      `INSERT INTO blueprint_shares (id, title, blueprint, metadata, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(shareId, title, blueprint, metadataJson, now, expiresAt.toISOString())
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
      HTTP_STATUS.OK
    );
  } catch (error) {
    secureLogError("Share creation error", error);
    return c.json(
      withCtxError(c, ErrorType.INTERNAL, ERROR_MESSAGES.INTERNAL, ERROR_CODES.INTERNAL_ERROR),
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
});

app.get("/:id", rateLimit(rateLimitConfigs.standard), async (c) => {
  try {
    const shareId = c.req.param("id") || "";

    if (!isValidShareId(shareId)) {
      return c.json(
        withCtxError(
          c,
          ErrorType.VALIDATION,
          SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT,
          ERROR_CODES.VALIDATION_ERROR
        ),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const dbError = checkDbConfigured(c);
    if (dbError) return dbError;

    const result = await c.env.DB.prepare(
      `SELECT id, title, blueprint, metadata, created_at, expires_at
         FROM blueprint_shares
         WHERE id = ?`
    )
      .bind(shareId)
      .first();

    if (!result) {
      return c.json(
        withCtxError(
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
        withCtxError(
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
      parsedMetadata = parseMetadata(result.metadata);
      if (parsedMetadata === undefined) {
        secureLogError("Failed to parse share metadata", null);
      }
    }

    // Set cache headers for CDN caching - shared blueprints are immutable until expiration
    c.header(
      API_HEADERS.CACHE_CONTROL.HEADER_NAME,
      API_HEADERS.CACHE_CONTROL.PUBLIC_WITH_REVALIDATE(
        CACHE_CONFIG.SHARE_MAX_AGE,
        CACHE_CONFIG.SHARE_STALE_WHILE_REVALIDATE
      )
    );
    c.header(
      API_HEADERS.CDN.CDN_CACHE_CONTROL,
      API_HEADERS.CACHE_CONTROL.PUBLIC_MAX_AGE(CACHE_CONFIG.SHARE_MAX_AGE)
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
      HTTP_STATUS.OK
    );
  } catch (error) {
    secureLogError("Share retrieval error", error);
    return c.json(
      withCtxError(c, ErrorType.INTERNAL, ERROR_MESSAGES.INTERNAL, ERROR_CODES.INTERNAL_ERROR),
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
});

app.delete(
  "/:id",
  rateLimit(rateLimitConfigs.standard),
  authorize(AUTH_DEFAULTS.DEFAULT_ROLE),
  async (c) => {
    try {
      const shareId = c.req.param("id") || "";

      if (!isValidShareId(shareId)) {
        return c.json(
          withCtxError(
            c,
            ErrorType.VALIDATION,
            SHARE_ERROR_MESSAGES.INVALID_SHARE_ID_FORMAT,
            ERROR_CODES.VALIDATION_ERROR
          ),
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const dbError = checkDbConfigured(c);
      if (dbError) return dbError;

      // Fetch share to verify ownership before deletion
      const existing = await c.env.DB.prepare(
        `SELECT id, metadata FROM blueprint_shares WHERE id = ?`
      )
        .bind(shareId)
        .first<{ id: string; metadata: string | null }>();

      if (!existing) {
        // Share doesn't exist — treat as success to avoid leaking existence info
        return c.json(
          {
            success: true,
            data: {
              message: SHARE_ERROR_MESSAGES.SHARE_DELETED_SUCCESSFULLY,
            },
          },
          HTTP_STATUS.OK
        );
      }

      // Validate ownership: if the share has a creatorId, the request must match
      const creatorId = await getCreatorId(c.env.API_KEY);
      if (creatorId && existing.metadata) {
        const parsedMetadata = parseMetadata(existing.metadata) ?? {};
        const shareCreatorId = parsedMetadata.createdBy as string | undefined;
        if (shareCreatorId && shareCreatorId !== creatorId) {
          return c.json(
            withCtxError(
              c,
              ErrorType.AUTHORIZATION,
              ERROR_MESSAGES.AUTHORIZATION,
              ERROR_CODES.AUTHORIZATION_ERROR
            ),
            HTTP_STATUS.FORBIDDEN
          );
        }
      }

      await c.env.DB.prepare("DELETE FROM blueprint_shares WHERE id = ?").bind(shareId).run();

      return c.json(
        {
          success: true,
          data: {
            message: SHARE_ERROR_MESSAGES.SHARE_DELETED_SUCCESSFULLY,
          },
        },
        HTTP_STATUS.OK
      );
    } catch (error) {
      secureLogError("Share deletion error", error);
      return c.json(
        withCtxError(c, ErrorType.INTERNAL, ERROR_MESSAGES.INTERNAL, ERROR_CODES.INTERNAL_ERROR),
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

export default app;
