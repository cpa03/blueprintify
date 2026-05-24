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
import {
  HTTP_STATUS,
  ERROR_CODES,
  BODY_SIZE_MAX,
  API_HEADERS,
  VALIDATION_MESSAGES,
} from "../config/constants";
import { ErrorType } from "../errors";

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
 * app.use('*', bodyLimit({
 *   maxSize: 1024 * 1024, // 1MB
 *   excludePaths: ['/upload'],
 * }));
 * ```
 *
 * @security
 * - Prevents DoS attacks via large request bodies
 * - Checks Content-Length header before body parsing
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

    // Check Content-Length header
    const contentLength = c.req.header(API_HEADERS.REQUEST.CONTENT_LENGTH);

    if (contentLength) {
      const size = parseInt(contentLength, 10);

      if (!isNaN(size) && size > maxSize) {
        return c.json(
          {
            success: false,
            error: {
              type: ErrorType.VALIDATION,
              message: VALIDATION_MESSAGES.BODY_TOO_LARGE(maxSize),
              code: ERROR_CODES.PAYLOAD_TOO_LARGE,
              details: {
                maxSize,
                actualSize: size,
              },
              timestamp: new Date().toISOString(),
            },
          },
          HTTP_STATUS.PAYLOAD_TOO_LARGE
        );
      }
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
