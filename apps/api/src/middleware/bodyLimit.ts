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
import { HTTP_STATUS } from "../config/constants";

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
 * Default maximum body size: 1MB
 * This is a reasonable limit for JSON API requests
 */
const DEFAULT_MAX_SIZE = 1024 * 1024; // 1MB

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
              type: "validation",
              message: `Request body too large. Maximum allowed size is ${maxSize} bytes.`,
              code: "PAYLOAD_TOO_LARGE",
              details: {
                maxSize,
                actualSize: size,
              },
              timestamp: new Date().toISOString(),
            },
          },
          HTTP_STATUS.PAYLOAD_TOO_LARGE,
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
  /** Standard limit for most API endpoints (1MB) */
  standard: { maxSize: DEFAULT_MAX_SIZE },
  /** Strict limit for text-only endpoints (100KB) */
  strict: { maxSize: 100 * 1024 },
  /** Lenient limit for file upload endpoints (10MB) */
  lenient: { maxSize: 10 * 1024 * 1024 },
};
