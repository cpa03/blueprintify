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
import { validateJson, validatePromptInjection } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { authorize } from "../middleware/authorize";
import type { Env } from "../types";
import {
  CONTEXT_KEYS,
  AUTH_DEFAULTS,
  EXPORT_ERROR_STRINGS,
  SHARE_TOKEN_CONFIG,
  RATE_LIMIT_KEY_PREFIXES,
  CreateShareSchema,
  VerifySharePassphraseSchema,
} from "@blueprint/shared";
import {
  API_HEADERS,
  HTTP_STATUS,
  ERROR_CODES,
  ERROR_MESSAGES,
  ROUTE_PATHS,
  SHARE_CONFIG,
  SHARE_ERROR_MESSAGES,
  CACHE_CONFIG,
  RATE_LIMIT_CONSTANTS,
} from "../config/constants";
import { secureLogError } from "../utils/secureLog";
import { sanitizeHtml } from "../utils/sanitize";
import { ErrorType, createErrorJson } from "../errors";

/**
 * Derives a deterministic creator identifier from the API key.
 * Uses SHA-256 hashing to avoid storing the raw API key.
 * Returns undefined if no API key is configured (allows backward compatibility).
 */
/** Flexy says: Log context strings stay local — these are log identifiers, not app config */
const LOG_CREATE_ERROR = "Share creation error";
const LOG_VERIFY_ERROR = "Share verify error";

const UNKNOWN_SHARE_ID = "unknown";

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

/**
 * Generates a short-lived verify token for passphrase-protected shares.
 * Uses HMAC-SHA256 to sign shareId + expiration, creating a stateless token
 * that can be verified without a database lookup.
 */
async function generateVerifyToken(
  shareId: string,
  apiKey: string | undefined
): Promise<string | undefined> {
  if (!apiKey) return undefined;
  const encoder = new TextEncoder();
  const expiresAt = Math.floor(Date.now() / 1000) + SHARE_TOKEN_CONFIG.TOKEN_EXPIRY_SECONDS;
  const payload = `${shareId}:${expiresAt}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiKey),
    { name: SHARE_TOKEN_CONFIG.HMAC_ALGORITHM, hash: SHARE_TOKEN_CONFIG.HMAC_HASH },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    SHARE_TOKEN_CONFIG.HMAC_ALGORITHM,
    key,
    encoder.encode(payload)
  );
  const signatureHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const payloadB64 = btoa(payload).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${payloadB64}.${signatureHex.slice(0, SHARE_TOKEN_CONFIG.SIGNATURE_HEX_LENGTH)}`;
}

/**
 * Verifies a share access token without database lookup.
 * Returns true if the token is valid and not expired.
 */
async function isValidVerifyToken(
  token: string,
  shareId: string,
  apiKey: string | undefined
): Promise<boolean> {
  if (!apiKey) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const payload = atob((parts[0] || "").replace(/-/g, "+").replace(/_/g, "/"));
    const payloadParts = payload.split(":");
    if (payloadParts.length !== 2) return false;
    if (payloadParts[0] !== shareId) return false;
    const expiresAt = parseInt(payloadParts[1] || "0", 10);
    if (isNaN(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(apiKey),
      { name: SHARE_TOKEN_CONFIG.HMAC_ALGORITHM, hash: SHARE_TOKEN_CONFIG.HMAC_HASH },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      SHARE_TOKEN_CONFIG.HMAC_ALGORITHM,
      key,
      encoder.encode(payload)
    );
    const expectedSig = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, SHARE_TOKEN_CONFIG.SIGNATURE_HEX_LENGTH);
    return parts[1] === expectedSig;
  } catch {
    return false;
  }
}

app.post(
  "/",
  rateLimit(rateLimitConfigs.standard),
  validateJson(CreateShareSchema),
  validatePromptInjection([
    { path: "title", label: "share title" },
    { path: "blueprint", label: "blueprint content" },
  ]),
  async (c) => {
    try {
      const { title, blueprint, metadata, passphraseHash } = c.get(CONTEXT_KEYS.VALIDATED_DATA) as {
        title: string;
        blueprint: string;
        metadata?: Record<string, unknown>;
        passphraseHash?: string;
      };

      // Sanitize user-submitted content before storing to prevent stored XSS
      const sanitizedTitle = sanitizeHtml(title);
      const sanitizedBlueprint = sanitizeHtml(blueprint);

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
        `INSERT INTO blueprint_shares (id, title, blueprint, metadata, passphrase_hash, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          shareId,
          sanitizedTitle,
          sanitizedBlueprint,
          metadataJson,
          passphraseHash || null,
          now,
          expiresAt.toISOString()
        )
        .run();

      return c.json(
        {
          success: true,
          data: {
            id: shareId,
            url: `${c.env.CORS_ORIGIN || ""}${ROUTE_PATHS.SHARE}/${shareId}`,
            expiresAt: expiresAt.toISOString(),
            passphraseRequired: !!passphraseHash,
          },
        },
        HTTP_STATUS.OK
      );
    } catch (error) {
      secureLogError(LOG_CREATE_ERROR, error);
      return c.json(
        withCtxError(c, ErrorType.INTERNAL, ERROR_MESSAGES.INTERNAL, ERROR_CODES.INTERNAL_ERROR),
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

/**
 * Rate limiter for share ID enumeration protection.
 * Uses a combination of client IP and share ID as the rate limit key,
 * preventing brute-force enumeration and DoS on specific share IDs.
 * Stricter than standard because it targets enumeration attacks.
 */
const shareEnumerationRateLimit = rateLimit({
  limiter: RATE_LIMIT_CONSTANTS.LIMITER_BINDINGS.STRICT,
  keyGenerator: (c) => {
    const ip =
      c.req.header(API_HEADERS.CF_PROPERTIES.CONNECTING_IP) ||
      c.req.header(API_HEADERS.REQUEST.FORWARDED_FOR) ||
      RATE_LIMIT_CONSTANTS.ANONYMOUS_CLIENT_KEY;
    const shareId = c.req.param("id") || UNKNOWN_SHARE_ID;
    return `${RATE_LIMIT_KEY_PREFIXES.SHARE}${shareId}:${ip}`;
  },
});

app.get("/:id", shareEnumerationRateLimit, async (c) => {
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
      `SELECT id, title, blueprint, metadata, passphrase_hash, created_at, expires_at
         FROM blueprint_shares
         WHERE id = ?`
    )
      .bind(shareId)
      .first<{
        id: string;
        title: string;
        blueprint: string;
        metadata: string | null;
        passphrase_hash: string | null;
        created_at: string;
        expires_at: string;
      }>();

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
        secureLogError(EXPORT_ERROR_STRINGS.SHARE_METADATA_PARSE_FAILED, null);
      }
    }

    // Check passphrase protection
    const isPassphraseProtected = !!result.passphrase_hash;
    const token = c.req.query("token");
    const hasValidToken = token ? await isValidVerifyToken(token, shareId, c.env.API_KEY) : false;

    // If passphrase-protected and no valid token, hide blueprint content
    if (isPassphraseProtected && !hasValidToken) {
      return c.json(
        {
          success: true,
          data: {
            id: result.id,
            title: result.title,
            passphraseRequired: true,
            metadata: parsedMetadata,
            createdAt: result.created_at,
            expiresAt: result.expires_at,
          },
        },
        HTTP_STATUS.OK
      );
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
          passphraseRequired: isPassphraseProtected,
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

/**
 * Rate limiter for passphrase verification endpoint.
 * Stricter than standard to prevent brute-force attacks on passphrases.
 * Uses share ID + IP as key to prevent cross-share brute-forcing.
 */
const shareVerifyRateLimit = rateLimit({
  limiter: RATE_LIMIT_CONSTANTS.LIMITER_BINDINGS.STRICT,
  keyGenerator: (c) => {
    const ip =
      c.req.header(API_HEADERS.CF_PROPERTIES.CONNECTING_IP) ||
      c.req.header(API_HEADERS.REQUEST.FORWARDED_FOR) ||
      RATE_LIMIT_CONSTANTS.ANONYMOUS_CLIENT_KEY;
    const shareId = c.req.param("id") || UNKNOWN_SHARE_ID;
    return `${RATE_LIMIT_KEY_PREFIXES.VERIFY}${shareId}:${ip}`;
  },
});

/**
 * POST /share/:id/verify
 *
 * Verifies a passphrase for a passphrase-protected shared blueprint.
 * On success, returns the full blueprint content and a short-lived verify token
 * that can be used with GET /share/:id?token=xxx for subsequent access.
 * Rate-limited per share ID + IP to prevent brute-force attacks.
 */
app.post("/:id/verify", shareVerifyRateLimit, async (c) => {
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

    // Parse and validate the request body
    const body = await c.req.json().catch(() => ({}));
    const parsed = VerifySharePassphraseSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        withCtxError(
          c,
          ErrorType.VALIDATION,
          SHARE_ERROR_MESSAGES.INVALID_PASSPHRASE,
          ERROR_CODES.VALIDATION_ERROR
        ),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const { passphrase } = parsed.data;

    // Fetch share with passphrase hash
    const result = await c.env.DB.prepare(
      `SELECT id, title, blueprint, metadata, passphrase_hash, created_at, expires_at
         FROM blueprint_shares
         WHERE id = ?`
    )
      .bind(shareId)
      .first<{
        id: string;
        title: string;
        blueprint: string;
        metadata: string | null;
        passphrase_hash: string | null;
        created_at: string;
        expires_at: string;
      }>();

    if (!result || !result.passphrase_hash) {
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

    // Hash the provided passphrase and compare with stored hash
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(passphrase));
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hashHex !== result.passphrase_hash) {
      return c.json(
        withCtxError(
          c,
          ErrorType.AUTHORIZATION,
          SHARE_ERROR_MESSAGES.INVALID_PASSPHRASE,
          ERROR_CODES.AUTHORIZATION_ERROR
        ),
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Generate verify token for subsequent GET requests
    const verifyToken = await generateVerifyToken(shareId, c.env.API_KEY);

    // Parse metadata
    let parsedMetadata: Record<string, unknown> | undefined;
    if (result.metadata) {
      parsedMetadata = parseMetadata(result.metadata);
    }

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
          verifyToken,
        },
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    secureLogError(LOG_VERIFY_ERROR, error);
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
