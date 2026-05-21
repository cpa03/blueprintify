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
import { HTTP_STATUS, ERROR_CODES } from "../config/constants";
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

/**
 * Body size limit constants
 * Centralized for consistency and maintainability
 */
const BODY_SIZE_LIMITS = {
  /** Default maximum body size: 1MB - reasonable for JSON API requests */
  DEFAULT_MB: 1,
  /** Strict limit: 100KB - for text-only endpoints */
  STRICT_KB: 100,
  /** Lenient limit: 10MB - for file upload endpoints */
  LENIENT_MB: 10,
} as const;

/** Bytes per kilobyte */
const KB = 1024;
/** Bytes per megabyte */
const MB = 1024 * KB;

/** Default maximum body size: 1MB */
const DEFAULT_MAX_SIZE = BODY_SIZE_LIMITS.DEFAULT_MB * MB;
/** Strict limit for text-only endpoints: 100KB */
const STRICT_MAX_SIZE = BODY_SIZE_LIMITS.STRICT_KB * KB;
/** Lenient limit for file uploads: 10MB */
const LENIENT_MAX_SIZE = BODY_SIZE_LIMITS.LENIENT_MB * MB;

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
    const contentLength = c.req.header("content-length");

    if (contentLength) {
      const size = parseInt(contentLength, 10);

      if (!isNaN(size) && size > maxSize) {
        return c.json(
          {
            success: false,
            error: {
              type: ErrorType.VALIDATION,
              message: `Request body too large. Maximum allowed size is ${maxSize} bytes.`,
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
  standard: { maxSize: DEFAULT_MAX_SIZE },
  strict: { maxSize: STRICT_MAX_SIZE },
  lenient: { maxSize: LENIENT_MAX_SIZE },
};
