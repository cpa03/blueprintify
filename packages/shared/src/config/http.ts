/**
 * Retry Configuration
 * Shared retry settings for API calls
 */
export const RETRY_CONFIG = {
  DEFAULT_RETRIES: 3,
  DEFAULT_INITIAL_DELAY: 1000,
  DEFAULT_BACKOFF_FACTOR: 2,
  DEFAULT_MAX_DELAY: 10000,
} as const;

/**
 * HTTP Status codes for retry logic
 * Shared between frontend and backend for consistent retry behavior
 */
export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504] as const;

/**
 * SSE Stream configuration
 * Shared between frontend and backend for consistent SSE handling
 */
export const SSE_CONFIG = {
  DATA_PREFIX: "data: ",
  EVENT_PREFIX: "event: " as const,
  ID_PREFIX: "id: " as const,
  LINE_BREAK: "\n" as const,
  EVENT_SEPARATOR: "\n\n",
  EVENT_TYPES: {
    CONTENT: "content",
    ERROR: "error",
    DONE: "done",
  },
} as const;

/**
 * SSE Headers configuration
 * Standard headers for Server-Sent Events responses
 * Used by both API and frontend tests for consistent SSE handling
 */
export const SSE_HEADERS = {
  CONTENT_TYPE: "text/event-stream",
  CACHE_CONTROL: "no-cache",
  CONNECTION: "keep-alive",
} as const;

/**
 * HTTP Headers configuration
 * Standard HTTP header values used across frontend and backend
 * Flexy says: Add new MIME types here instead of hardcoding them!
 */
export const HTTP_HEADERS = {
  /** Content-Type header for JSON requests/responses */
  CONTENT_TYPE_JSON: "application/json",
  /** Content-Type header for ZIP file downloads */
  CONTENT_TYPE_ZIP: "application/zip",
  /** Content-Type header for HTML responses */
  CONTENT_TYPE_HTML: "text/html",
  /** Content-Type header for plain text */
  CONTENT_TYPE_PLAIN: "text/plain",
  /** Content-Type header for markdown files */
  CONTENT_TYPE_MARKDOWN: "text/markdown",
  /** Content-Type header for executable binaries */
  CONTENT_TYPE_EXECUTABLE: "application/x-executable",
} as const;

/**
 * HTTP Status codes
 * Shared between frontend and backend for consistent status handling
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * HTTP Header Names
 * Centralized header NAME strings to eliminate hardcoded header key literals.
 * Single source of truth for HTTP header field names used across API and Web.
 * Flexy says: Use these instead of hardcoded "Content-Type" strings in header objects!
 */
export const HTTP_HEADER_NAMES = {
  /** Content-Type header - most commonly hardcoded as object key */
  CONTENT_TYPE: "Content-Type",
  /** Cache-Control header for caching directives */
  CACHE_CONTROL: "Cache-Control",
  /** Authorization header for bearer tokens */
  AUTHORIZATION: "Authorization",
  /** Connection header for HTTP connection management */
  CONNECTION: "Connection",
  /** Accept header for content negotiation */
  ACCEPT: "Accept",
  /** Content-Length header for body size indication */
  CONTENT_LENGTH: "Content-Length",
  /** User-Agent header for client identification */
  USER_AGENT: "User-Agent",
  /** Retry-After header for rate limiting */
  RETRY_AFTER: "Retry-After",
  /** Set-Cookie header for cookie management */
  SET_COOKIE: "Set-Cookie",
  /** Request-ID header for distributed tracing */
  X_REQUEST_ID: "X-Request-ID",
  /** Response-Time header for performance monitoring */
  X_RESPONSE_TIME: "X-Response-Time",
  /** Cloudflare Ray-ID header for request tracing */
  CF_RAY: "X-CF-Ray",

  /** CORS headers */
  ACCESS_CONTROL_ALLOW_ORIGIN: "Access-Control-Allow-Origin",
  ACCESS_CONTROL_ALLOW_METHODS: "Access-Control-Allow-Methods",
  ACCESS_CONTROL_ALLOW_HEADERS: "Access-Control-Allow-Headers",

  /** Streaming headers */
  X_ACCEL_BUFFERING: "X-Accel-Buffering",
  SERVER_TIMING: "Server-Timing",

  /** Rate limiting headers */
  RATE_LIMIT_LIMIT: "X-RateLimit-Limit",
  RATE_LIMIT_REMAINING: "X-RateLimit-Remaining",
  RATE_LIMIT_RESET: "X-RateLimit-Reset",

  /** Security headers */
  CONTENT_SECURITY_POLICY: "Content-Security-Policy",
  X_CONTENT_TYPE_OPTIONS: "X-Content-Type-Options",
  X_FRAME_OPTIONS: "X-Frame-Options",
  X_XSS_PROTECTION: "X-XSS-Protection",
  REFERRER_POLICY: "Referrer-Policy",
  STRICT_TRANSPORT_SECURITY: "Strict-Transport-Security",
  PERMISSIONS_POLICY: "Permissions-Policy",
  CROSS_ORIGIN_OPENER_POLICY: "Cross-Origin-Opener-Policy",
  CROSS_ORIGIN_RESOURCE_POLICY: "Cross-Origin-Resource-Policy",

  /** Custom application headers for API key auth and user identity */
  X_API_KEY: "x-api-key",
  X_USER_ID: "x-user-id",
  X_USER_ROLE: "x-user-role",

  /** Forwarded-for IP header for proxy/client IP detection */
  X_FORWARDED_FOR: "x-forwarded-for",

  /** Cloudflare-specific request property headers */
  CF_IPCOUNTRY: "cf-ipcountry",
  CF_CONNECTING_IP: "cf-connecting-ip",
  CF_IPCITY: "cf-ipcity",
  CF_WORKER_DC: "cf-worker-dc",

  /** CDN cache control header names */
  CLOUDFLARE_CACHE_CONTROL: "Cloudflare-CDN-Cache-Control",
  CDN_CACHE_CONTROL: "CDN-Cache-Control",

  /** Lowercase variants for request header lookups */
  USER_AGENT_LC: "user-agent",
  CONTENT_TYPE_LC: "content-type",
  CONTENT_LENGTH_LC: "content-length",
  AUTHORIZATION_LC: "authorization",
  COOKIE_LC: "cookie",
  X_REQUEST_ID_LC: "x-request-id",
  CF_RAY_LC: "cf-ray",
} as const;

/**
 * CORS Configuration Defaults
 * Centralized CORS settings shared between API and Web.
 * Single source of truth to eliminate hardcoded CORS values.
 */
export const CORS_DEFAULTS = {
  ALLOW_METHODS: ["GET", "POST", "OPTIONS"] as const,
  ALLOW_HEADERS: ["Content-Type", "Authorization"] as const,
} as const;

/**
 * HTTP Methods Constants
 * Centralized HTTP method strings to eliminate hardcoded method literals.
 * Single source of truth for HTTP methods across API and Web.
 */
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

/**
 * Network Error Codes for Retry Logic
 * Centralized retryable network error codes used by both API and Web.
 * Single source of truth to eliminate hardcoded error code strings.
 */
export const NETWORK_ERROR_CODES = [
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNREFUSED",
] as const;

/**
 * Network Status Notification Defaults
 * Centralized source of truth for offline/online banner display durations.
 * Flexy says: No hardcoded 3000ms offline banner durations in components!
 * Usage: import { NETWORK_DEFAULTS } from "@blueprint/shared";
 *        ONLINE_DURATION: NETWORK_DEFAULTS.ONLINE_DURATION_MS
 */
export const NETWORK_DEFAULTS = {
  /** Default offline indicator duration — stays visible (0 = no auto-dismiss) */
  OFFLINE_DURATION_MS: 0,
  /** Online restoration banner display duration before auto-dismiss (3s) */
  ONLINE_DURATION_MS: 3000,
} as const;

/**
 * Vite Dev Server Proxy Path
 * Centralized source of truth for the API proxy path used in Vite config.
 * Flexy says: No hardcoded "/api" strings in vite.config.ts or env.ts!
 * Usage: import { API_PROXY_PATH } from "@blueprint/shared";
 */
export const API_PROXY_PATH = "/api" as const;

/**
 * Common Security Header Values
 * Centralized values for standard security HTTP response headers.
 * Flexy says: No hardcoded security values - single source of truth!
 */
export const SECURITY_VALUES = {
  /** X-Content-Type-Options: prevent MIME sniffing */
  X_CONTENT_TYPE_OPTIONS_NOSNIFF: "nosniff",
  /** X-Frame-Options: deny framing */
  X_FRAME_OPTIONS_DENY: "DENY",
  /** X-XSS-Protection: enable browser XSS filter */
  X_XSS_PROTECTION_VALUE: "1; mode=block",
  /** Referrer-Policy: strict origin when cross-origin */
  REFERRER_POLICY_STRICT_ORIGIN: "strict-origin-when-cross-origin",
  /** Strict-Transport-Security: 1 year HSTS with preload */
  STRICT_TRANSPORT_SECURITY_VALUE: "max-age=31536000; includeSubDomains; preload",
  /** Same-origin value for Cross-Origin-Opener-Policy and Cross-Origin-Resource-Policy */
  SAME_ORIGIN: "same-origin",
  /** X-Accel-Buffering: disable nginx buffering for SSE */
  X_ACCEL_BUFFERING_NO: "no",

  /** Permissions-Policy directive values - individual feature permissions */
  PERMISSIONS_POLICY: {
    /** Disable accelerometer access */
    ACCELEROMETER_NONE: "accelerometer=()",
    /** Disable camera access */
    CAMERA_NONE: "camera=()",
    /** Disable geolocation access */
    GEOLOCATION_NONE: "geolocation=()",
    /** Disable gyroscope access */
    GYROSCOPE_NONE: "gyroscope=()",
    /** Disable magnetometer access */
    MAGNETOMETER_NONE: "magnetometer=()",
    /** Disable microphone access */
    MICROPHONE_NONE: "microphone=()",
    /** Disable payment request API */
    PAYMENT_NONE: "payment=()",
    /** Disable USB device access */
    USB_NONE: "usb=()",
  } as const,
} as const;

/**
 * CSP Connect-Source Domains
 * Centralized domain list for Content Security Policy connect-src directives.
 * Flexy says: No hardcoded domain URLs in security config!
 */
export const CSP_CONNECT_DOMAINS = {
  /** Production API domain */
  PRODUCTION_API: "https://api.blueprintify.dev",
  /** Staging API domain */
  STAGING_API: "https://api-staging.blueprintify.dev",
  /** Production web domain */
  PRODUCTION_WEB: "https://blueprintify.dev",
  /** Staging web domain */
  STAGING_WEB: "https://staging.blueprintify.dev",
} as const;
