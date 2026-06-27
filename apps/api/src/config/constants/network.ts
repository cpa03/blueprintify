/**
 * Network Configuration Constants
 *
 * HTTP headers, CORS, SSE, and status code configuration.
 * Flexy says: No hardcoded header strings - everything in config!
 *
 * @module config/constants/network
 */

import {
  HTTP_STATUS as SHARED_HTTP_STATUS,
  HTTP_HEADER_NAMES,
  CORS_DEFAULTS as SHARED_CORS_DEFAULTS,
  SECURITY_VALUES,
  SSE_CONFIG as SHARED_SSE_CONFIG,
  SSE_HEADERS as SHARED_SSE_HEADERS,
} from "@blueprint/shared";
import { getEnvConfig } from "./env";

/**
 * CORS configuration with env-based origin and max-age.
 */
export const CORS_CONFIG = {
  get ORIGIN(): string {
    return getEnvConfig().CORS_ORIGIN;
  },
  ALLOW_METHODS: [...SHARED_CORS_DEFAULTS.ALLOW_METHODS] as string[],
  ALLOW_HEADERS: [...SHARED_CORS_DEFAULTS.ALLOW_HEADERS] as string[],
  get MAX_AGE(): number {
    return getEnvConfig().CORS_MAX_AGE;
  },
};

/**
 * Comprehensive API headers configuration.
 */
export const API_HEADERS = {
  /** Custom headers for API identification and tracing */
  CUSTOM: {
    /** API key authentication header (from shared config) */
    API_KEY: HTTP_HEADER_NAMES.X_API_KEY,
    /** Request tracing identifier (from shared config) */
    REQUEST_ID: HTTP_HEADER_NAMES.X_REQUEST_ID_LC,
    /** User identity header for multi-user support (from shared config) */
    USER_ID: HTTP_HEADER_NAMES.X_USER_ID,
    /** User role header for authorization checks (from shared config) */
    USER_ROLE: HTTP_HEADER_NAMES.X_USER_ROLE,
  },
  /** Standard cache-control directives */
  CACHE_CONTROL: {
    /** The header name for Cache-Control (from shared config) */
    HEADER_NAME: HTTP_HEADER_NAMES.CACHE_CONTROL,
    /** Public cache directive with only max-age */
    PUBLIC_MAX_AGE: (maxAge: number): string => `public, max-age=${maxAge}`,
    /** Public cache directive with max-age and stale-while-revalidate */
    PUBLIC_WITH_REVALIDATE: (maxAge: number, staleWhileRevalidate: number): string =>
      `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  },
  /** CDN-specific cache headers */
  CDN: {
    /** Cloudflare CDN cache control header name (from shared config) */
    CLOUDFLARE_CACHE_CONTROL: HTTP_HEADER_NAMES.CLOUDFLARE_CACHE_CONTROL,
    /** Standard CDN cache control header name (from shared config) */
    CDN_CACHE_CONTROL: HTTP_HEADER_NAMES.CDN_CACHE_CONTROL,
  },
  /** Server timing header */
  SERVER_TIMING: {
    HEADER: HTTP_HEADER_NAMES.SERVER_TIMING,
    /** Format a server-timing entry */
    ENTRY: (name: string, description: string, duration: number): string =>
      `${name};desc="${description}";dur=${duration}`,
  },
  /** SSE-specific headers for streaming responses */
  SSE: {
    /** Nginx buffering disable header (from shared config) */
    X_ACCEL_BUFFERING: HTTP_HEADER_NAMES.X_ACCEL_BUFFERING,
    /** Value to disable Nginx buffering (from shared config) */
    X_ACCEL_BUFFERING_NO: SECURITY_VALUES.X_ACCEL_BUFFERING_NO,
  },

  /** Security-related HTTP headers */
  SECURITY: {
    /** Cross-Origin-Opener-Policy header name (from shared config) */
    CROSS_ORIGIN_OPENER_POLICY: HTTP_HEADER_NAMES.CROSS_ORIGIN_OPENER_POLICY,
    /** Cross-Origin-Resource-Policy header name (from shared config) */
    CROSS_ORIGIN_RESOURCE_POLICY: HTTP_HEADER_NAMES.CROSS_ORIGIN_RESOURCE_POLICY,
    /** Same-origin policy value (from shared config) */
    SAME_ORIGIN: SECURITY_VALUES.SAME_ORIGIN,
  },

  /** CF properties from request headers */
  CF_PROPERTIES: {
    /** Cloudflare request country header (from shared config) */
    IP_COUNTRY: HTTP_HEADER_NAMES.CF_IPCOUNTRY,
    /** Cloudflare Ray ID for request tracing (from shared config) */
    RAY_ID: HTTP_HEADER_NAMES.CF_RAY_LC,
    /** Cloudflare connecting IP (from shared config) */
    CONNECTING_IP: HTTP_HEADER_NAMES.CF_CONNECTING_IP,
    /** Cloudflare client city (from shared config) */
    CITY: HTTP_HEADER_NAMES.CF_IPCITY,
    /** Cloudflare worker datacenter (from shared config) */
    DATACENTER: HTTP_HEADER_NAMES.CF_WORKER_DC,
  },
  /** Standard HTTP request headers used by middleware */
  REQUEST: {
    /** Forwarded-for IP header (from shared config) */
    FORWARDED_FOR: HTTP_HEADER_NAMES.X_FORWARDED_FOR,
    /** User agent header (from shared config) */
    USER_AGENT: HTTP_HEADER_NAMES.USER_AGENT_LC,
    /** Content type header (from shared config) */
    CONTENT_TYPE: HTTP_HEADER_NAMES.CONTENT_TYPE_LC,
    /** Content length header (from shared config) */
    CONTENT_LENGTH: HTTP_HEADER_NAMES.CONTENT_LENGTH_LC,
  },
  /** Standard HTTP connection header (from shared config) */
  CONNECTION: HTTP_HEADER_NAMES.CONNECTION,
  /** Standard HTTP content type header (from shared config) */
  CONTENT_TYPE: HTTP_HEADER_NAMES.CONTENT_TYPE,
  /** Standard HTTP response headers set by middleware */
  RESPONSE: {
    /** Request ID for distributed tracing (from shared config) */
    REQUEST_ID: HTTP_HEADER_NAMES.X_REQUEST_ID,
    /** Response time in milliseconds (from shared config) */
    RESPONSE_TIME: HTTP_HEADER_NAMES.X_RESPONSE_TIME,
    /** Cloudflare Ray ID response header (from shared config) */
    CF_RAY: HTTP_HEADER_NAMES.CF_RAY,
  },
  /** Rate limiting response headers */
  RATE_LIMIT: {
    /** Maximum requests allowed in window (from shared config) */
    LIMIT: HTTP_HEADER_NAMES.RATE_LIMIT_LIMIT,
    /** Remaining requests in current window (from shared config) */
    REMAINING: HTTP_HEADER_NAMES.RATE_LIMIT_REMAINING,
    /** Timestamp when rate limit resets (from shared config) */
    RESET: HTTP_HEADER_NAMES.RATE_LIMIT_RESET,
    /** Seconds until client can retry (from shared config) */
    RETRY_AFTER: HTTP_HEADER_NAMES.RETRY_AFTER,
  },
} as const;

/**
 * SSE CORS headers for streaming responses.
 * Flexy says: No hardcoded CORS header strings - reference shared HTTP_HEADER_NAMES!
 */
export const SSE_CORS_HEADERS = {
  ACCESS_CONTROL_ALLOW_ORIGIN: HTTP_HEADER_NAMES.ACCESS_CONTROL_ALLOW_ORIGIN,
  ACCESS_CONTROL_ALLOW_METHODS: HTTP_HEADER_NAMES.ACCESS_CONTROL_ALLOW_METHODS,
  ACCESS_CONTROL_ALLOW_HEADERS: HTTP_HEADER_NAMES.ACCESS_CONTROL_ALLOW_HEADERS,
} as const;

// HTTP Status codes
export const HTTP_STATUS = SHARED_HTTP_STATUS;

// SSE config and headers
export { SHARED_SSE_CONFIG as SSE_CONFIG, SHARED_SSE_HEADERS as SSE_HEADERS };
