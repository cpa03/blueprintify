/**
 * Request Body Size Limit Middleware
 *
 * Limits the size of request bodies to prevent DoS attacks with large payloads.
 * Cloudflare Workers has a default limit of 100MB, but we should enforce
 * application-specific limits for security.
 *
 * @module middleware/bodyLimit
 */

import type { MiddlewareHandler } from "hono";
import { NUMBER_RADIX } from "@blueprint/shared";
import {
  HTTP_STATUS,
  ERROR_CODES,
  BODY_SIZE_MAX,
  API_HEADERS,
  VALIDATION_MESSAGES,
} from "../config/constants";
import { ErrorType, createErrorJson } from "../errors";

/**
 * Configuration options for body size limit middleware.
 *
 * @property maxSize - Maximum allowed body size in bytes (default: 1MB)
 * @property excludePaths - Array of paths to exclude from body size checking
 */
interface BodyLimitConfig {
  maxSize?: number;
  excludePaths?: string[];
}

const DEFAULT_MAX_SIZE = BODY_SIZE_MAX.DEFAULT;

/** Transfer-Encoding header (lowercase form used by Hono's header lookup). */
const TRANSFER_ENCODING_HEADER = "transfer-encoding";

/** Strict digits only — rejects negative ("−1"), signed ("+5") and malformed values. */
const POSITIVE_LENGTH_PATTERN = /^\d+$/;

/**
 * Creates a body size limit middleware for Hono applications.
 *
 * Checks the Content-Length header before processing the request body.
 * If the body exceeds the limit, returns a 413 Payload Too Large error.
 *
 * @param config - Body limit configuration options
 * @returns Hono middleware handler
 *
 * @example
 * ```typescript
 * import { BYTE_CONVERSION } from "@blueprint/shared";
 * app.use('*', bodyLimit({
 *   maxSize: BYTE_CONVERSION.MB, // 1MB
 *   excludePaths: ['/upload'],
 * }));
 * ```
 *
 * @security
 * - Prevents DoS attacks via large request bodies
 * - Trusts Content-Length only when it is strictly numeric and no
 *   Transfer-Encoding is present; otherwise enforces the limit against the
 *   actual consumed bytes (chunked / missing / forged headers cannot bypass)
 * - Returns standard 413 error for oversized payloads
 */
export const bodyLimit = (config: BodyLimitConfig = {}): MiddlewareHandler => {
  const { maxSize = DEFAULT_MAX_SIZE, excludePaths = [] } = config;

  return async (c, next) => {
    const path = c.req.path;

    // Skip body size check for excluded paths
    if (excludePaths.includes(path)) {
      await next();
      return;
    }

    const payloadTooLarge = (actualSize: number) =>
      c.json(
        createErrorJson(ErrorType.VALIDATION, VALIDATION_MESSAGES.BODY_TOO_LARGE(maxSize), {
          code: ERROR_CODES.PAYLOAD_TOO_LARGE,
          details: { maxSize, actualSize },
        }),
        HTTP_STATUS.PAYLOAD_TOO_LARGE
      );

    // Fast path: the declared length is trustworthy only when it is strictly
    // numeric and the body is not chunked (a chunked framing makes any
    // Content-Length advisory, per RFC 9112 §6.1).
    const contentLength = c.req.header(API_HEADERS.REQUEST.CONTENT_LENGTH);
    const hasTransferEncoding = c.req.header(TRANSFER_ENCODING_HEADER) !== undefined;
    const trustedLength =
      contentLength !== undefined &&
      !hasTransferEncoding &&
      POSITIVE_LENGTH_PATTERN.test(contentLength);

    if (trustedLength) {
      const size = parseInt(contentLength, NUMBER_RADIX.DECIMAL);
      if (size > maxSize) {
        return payloadTooLarge(size);
      }
      await next();
      return;
    }

    // Enforcement path: header absent, chunked, or malformed/negative —
    // count the real bytes before handing the body to downstream handlers.
    // Mirrors hono's built-in body-limit stream handling.
    const body = c.req.raw.body;
    if (body) {
      const reader = body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > maxSize) {
          return payloadTooLarge(size);
        }
        chunks.push(value);
      }
      const init: RequestInit & { duplex?: "half" } = {
        body: new ReadableStream({
          start(controller) {
            for (const chunk of chunks) controller.enqueue(chunk);
            controller.close();
          },
        }),
        duplex: "half",
      };
      c.req.raw = new Request(c.req.raw, init);
    }

    await next();
  };
};

/**
 * Predefined body limit configurations for different use cases.
 */
export const bodyLimitConfigs = {
  standard: { maxSize: BODY_SIZE_MAX.DEFAULT },
  strict: { maxSize: BODY_SIZE_MAX.STRICT },
  lenient: { maxSize: BODY_SIZE_MAX.LENIENT },
};
