/**
 * Request Logger Middleware
 *
 * Provides structured logging for HTTP requests and responses with Cloudflare-specific metadata.
 * Generates unique request IDs for traceability and logs request/response details in JSON format.
 *
 * @module middleware/logger
 */

import type { Context, MiddlewareHandler, Next } from "hono";
import { HTTP_METHODS } from "@blueprint/shared";
import { LOGGER_CONFIG, API_HEADERS } from "../config/constants";
import { timestamp } from "../errors";

/**
 * Configuration options for the request logger middleware.
 *
 * @property excludePaths - Array of paths to exclude from logging (e.g., health checks)
 * @property logRequestBody - Whether to log request body content (default: false)
 * @property logResponseBody - Whether to log response body content (default: false)
 */
interface LoggerConfig {
  excludePaths?: readonly string[];
  logRequestBody?: boolean;
  logResponseBody?: boolean;
}

/**
 * Cloudflare-specific request metadata extracted from headers.
 * Used for enhanced logging in Cloudflare Workers environment.
 *
 * @property rayId - Cloudflare Ray ID for request tracing
 * @property country - Client country code from CF-IPCountry header
 * @property connectingIp - Client IP address from CF-Connecting-IP header
 * @property city - Client city from CF-IPCity header
 * @property datacenter - Cloudflare datacenter handling the request
 */
interface CloudflareRequestMetadata {
  rayId?: string;
  country?: string;
  connectingIp?: string;
  city?: string;
  datacenter?: string;
}

/**
 * Structured log entry for incoming HTTP requests.
 *
 * @property requestId - Unique identifier for request tracing
 * @property method - HTTP method (GET, POST, etc.)
 * @property path - Request path without query string
 * @property query - Parsed query parameters
 * @property headers - Sanitized request headers (excludes auth/cookies)
 * @property body - Optional request body (when logRequestBody is enabled)
 * @property timestamp - ISO 8601 timestamp of request receipt
 * @property ip - Client IP address
 * @property userAgent - Client User-Agent string
 * @property cloudflare - Optional Cloudflare-specific metadata
 */
interface RequestLog {
  requestId: string;
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: unknown;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  cloudflare?: CloudflareRequestMetadata;
}

/**
 * Structured log entry for HTTP responses.
 *
 * @property requestId - Unique identifier matching the request
 * @property status - HTTP response status code
 * @property duration - Request processing time in milliseconds
 * @property timestamp - ISO 8601 timestamp of response sent
 * @property body - Optional response body (when logResponseBody is enabled)
 * @property cfRay - Cloudflare Ray ID for response tracing
 */
interface ResponseLog {
  requestId: string;
  status: number;
  duration: number;
  timestamp: string;
  body?: unknown;
  cfRay?: string;
}

/**
 * Generates a unique request ID using timestamp and cryptographically random values.
 *
 * @returns A unique request ID in format `{timestamp}-{random}{random4}`
 */
const generateRequestId = (): string => {
  const randomValues = new Uint32Array(2);
  crypto.getRandomValues(randomValues);
  const timestamp = Date.now();
  const random = (randomValues[0] ?? 0).toString(36);
  const random2 = (randomValues[1] ?? 0)
    .toString(36)
    .slice(0, LOGGER_CONFIG.REQUEST_ID_SUFFIX_LENGTH);
  return `${timestamp}-${random}${random2}`;
};

/**
 * Extracts Cloudflare-specific metadata from request headers.
 *
 * @param c - Hono context containing the request
 * @returns Cloudflare metadata object with available headers
 */
const extractCloudflareMetadata = (c: Context): CloudflareRequestMetadata => {
  return {
    rayId: c.req.header(API_HEADERS.CF_PROPERTIES.RAY_ID),
    country: c.req.header(API_HEADERS.CF_PROPERTIES.IP_COUNTRY),
    connectingIp: c.req.header(API_HEADERS.CF_PROPERTIES.CONNECTING_IP),
    city: c.req.header(API_HEADERS.CF_PROPERTIES.CITY),
    datacenter: c.req.header(API_HEADERS.CF_PROPERTIES.DATACENTER),
  };
};

/**
 * Checks if any Cloudflare metadata is present.
 *
 * @param metadata - Cloudflare metadata object to check
 * @returns True if any metadata field has a value
 */
const hasCloudflareMetadata = (metadata: CloudflareRequestMetadata): boolean => {
  return Object.values(metadata).some((v) => v !== undefined);
};

/**
 * Creates a request logging middleware for Hono applications.
 *
 * Logs structured JSON entries for incoming requests and outgoing responses,
 * including timing, Cloudflare metadata, and optional body content.
 * Generates unique request IDs for distributed tracing.
 *
 * @param config - Logger configuration options
 * @returns Hono middleware handler
 *
 * @example
 * ```typescript
 * app.use('*', requestLogger({
 *   excludePaths: ['/', '/health'],
 *   logRequestBody: true,
 * }));
 * ```
 */
export const requestLogger = (config: LoggerConfig = {}): MiddlewareHandler => {
  const {
    excludePaths = LOGGER_CONFIG.DEFAULT_EXCLUDE_PATHS,
    logRequestBody = false,
    logResponseBody = false,
  } = config;

  return async (c: Context, next: Next) => {
    const path = c.req.path;

    if (excludePaths.includes(path)) {
      await next();
      return;
    }

    const requestId = generateRequestId();
    const startTime = Date.now();
    const cfMetadata = extractCloudflareMetadata(c);

    c.set("requestId", requestId);

    const query = c.req.query() as Record<string, string>;

    const headers: Record<string, string> = {};
    const allHeaders = c.req.header();
    Object.entries(allHeaders).forEach(([key, value]) => {
      if (
        !LOGGER_CONFIG.SANITIZED_HEADER_EXCLUDE.some((h) => key.toLowerCase().includes(h)) &&
        value !== undefined
      ) {
        headers[key] = value;
      }
    });

    const requestLog: RequestLog = {
      requestId,
      method: c.req.method,
      path,
      query,
      headers,
      timestamp: timestamp(),
      ip: cfMetadata.connectingIp || c.req.header(API_HEADERS.REQUEST.FORWARDED_FOR),
      userAgent: c.req.header(API_HEADERS.REQUEST.USER_AGENT),
    };

    if (hasCloudflareMetadata(cfMetadata)) {
      requestLog.cloudflare = cfMetadata;
    }

    if (logRequestBody && c.req.method !== HTTP_METHODS.GET) {
      try {
        const clonedReq = c.req.raw.clone();
        requestLog.body = await clonedReq.json();
      } catch {
        requestLog.body = LOGGER_CONFIG.UNPARSABLE_BODY;
      }
    }

    console.log(
      JSON.stringify({
        type: "request",
        ...requestLog,
      })
    );

    await next();

    const duration = Date.now() - startTime;
    const status = c.res.status;

    c.header(API_HEADERS.RESPONSE.REQUEST_ID, requestId);
    c.header(API_HEADERS.RESPONSE.RESPONSE_TIME, `${duration}ms`);

    if (cfMetadata.rayId) {
      c.header(API_HEADERS.RESPONSE.CF_RAY, cfMetadata.rayId);
    }

    const responseLog: ResponseLog = {
      requestId,
      status,
      duration,
      timestamp: timestamp(),
    };

    if (cfMetadata.rayId) {
      responseLog.cfRay = cfMetadata.rayId;
    }

    if (logResponseBody) {
      try {
        const clonedRes = c.res.clone();
        responseLog.body = await clonedRes.json();
      } catch {
        responseLog.body = LOGGER_CONFIG.UNPARSABLE_BODY;
      }
    }

    console.log(
      JSON.stringify({
        type: "response",
        ...responseLog,
      })
    );
  };
};
