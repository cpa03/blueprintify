/**
 * Shared constants and configuration
 * Centralized configuration used across frontend and backend
 */

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
 * Validation Limits Configuration
 * Centralized validation constraints for forms and API requests
 */
export const VALIDATION_LIMITS = {
  PROJECT_NAME: {
    MIN: 1,
    MAX: 100,
  },
  DESCRIPTION: {
    MIN: 10,
    MAX: 2000,
  },
  TARGET_AUDIENCE: {
    MAX: 200,
  },
  CONSTRAINTS: {
    MAX: 1000,
  },
  FEATURE: {
    MAX: 100,
    MAX_COUNT: 20,
  },
  TECH_STACK: {
    MIN: 1,
    MAX: 10,
  },
} as const;

/**
 * Storage Configuration
 * Centralized storage limits and settings
 */
export const STORAGE_CONFIG = {
  // 5MB quota (typical browser localStorage limit)
  QUOTA_BYTES: 5 * 1024 * 1024,
  // Warning threshold at 90% capacity
  WARNING_THRESHOLD_PERCENT: 90,
} as const;

/**
 * Debounce Configuration
 * Centralized debounce delays for store operations
 */
export const DEBOUNCE_CONFIG = {
  WIZARD_SAVE: 300, // 300ms - faster as wizard changes are less frequent
  EDITOR_SAVE: 500, // 500ms - balances performance with data safety
} as const;

/**
 * Security Configuration
 * Centralized security limits for content validation
 */
export const SECURITY_LIMITS = {
  MAX_CONTENT_LENGTH: 1000000,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_JSON_DEPTH: 20,
  ALLOWED_FILE_TYPES: [".json", ".md", ".txt"] as const,
} as const;

/**
 * Export/Import Content Limits
 * Maximum length constraints for export and import payloads.
 * Prevents memory exhaustion and DoS vectors via oversized content.
 */
export const EXPORT_LIMITS = {
  /** Maximum blueprint content length (100KB) */
  MAX_BLUEPRINT_LENGTH: 100_000,
  /** Maximum tasks content length (100KB) */
  MAX_TASKS_LENGTH: 100_000,
  /** Maximum import data length (200KB - needs to accommodate JSON-serialized payload) */
  MAX_IMPORT_DATA_LENGTH: 200_000,
} as const;

/**
 * Type for retry options
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  maxDelay?: number;
}

/**
 * Type guards for config values
 */
export type RetryConfigValues = typeof RETRY_CONFIG;

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
} as const;

/**
 * ID Generation Configuration
 * Centralized settings for generating unique identifiers
 */
export const ID_GENERATION_CONFIG = {
  /** Start index for random string extraction from base-36 conversion */
  RANDOM_STRING_START_INDEX: 2,
  /** Length of random string portion in generated IDs */
  RANDOM_STRING_LENGTH: 9,
  /** Radix for Math.random().toString() to produce alphanumeric characters */
  ALPHANUMERIC_RADIX: 36,
} as const;

/**
 * Character sets for ID generation
 * Centralized to eliminate hardcoded character strings across the codebase
 */
export const ID_CHARS = {
  /** Full alphanumeric set (mixed case + digits) for share IDs, tokens etc. */
  FULL: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /** Lowercase alphanumeric set for database IDs, slugs etc. */
  LOWERCASE: "abcdefghijklmnopqrstuvwxyz0123456789",
} as const;

/**
 * Time Units Constants
 * Centralized time conversion values to avoid magic numbers
 */
export const TIME_UNITS = {
  /** Milliseconds per second */
  MS_PER_SECOND: 1000,
  /** Seconds per minute */
  SECONDS_PER_MINUTE: 60,
  /** Minutes per hour */
  MINUTES_PER_HOUR: 60,
  /** Seconds per hour */
  SECONDS_PER_HOUR: 3600,
  /** Hours per day */
  HOURS_PER_DAY: 24,
  /** Seconds per day */
  SECONDS_PER_DAY: 86400,
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

// ============================================================================
// Shared Route Paths
// Centralized source of truth for API route paths
// Used by both API and Web to eliminate hardcoded route strings
// ============================================================================

export const ROUTE_PATHS = {
  ROOT: "/",
  GENERATE: "/generate",
  TASKS: "/tasks",
  REFINE: "/refine",
  EXPORT: "/export",
  IMPORT: "/import",
  STORAGE: "/storage",
  SHARE: "/share",
  WARMUP: "/warmup",
} as const;

// Shared default URLs used by both API and Web
export const DEFAULT_URLS = {
  PROJECT_HOMEPAGE: "https://blueprint-generator.pages.dev",
  GITHUB: "https://github.com/cpa03/blueprintify",
} as const;

// Shared defaults for app-wide values across API and Web
export const SHARED_DEFAULTS = {
  APP_NAME: "Blueprintify",
  DEFAULT_PROJECT_NAME: "my-project",
  STORAGE_QUOTA_MB: 5,
  API_VERSION: "1.0.0",
  CORS_ORIGIN_DEV: "*",
  CORS_MAX_AGE: 86400,
} as const;

/**
 * AI Service Defaults
 * Centralized OpenAI/AI configuration defaults shared across API and Web.
 * Single source of truth to eliminate hardcoded AI config values.
 */
export const AI_DEFAULTS = {
  /** Default OpenAI API base URL */
  BASE_URL: "https://api.openai.com/v1",
  /** Default model identifier */
  MODEL: "gpt-4o-mini",
  /** Default request timeout in milliseconds */
  TIMEOUT_MS: 60000,
  /** Default max tokens for AI completion */
  MAX_TOKENS: 4000,
  /** Default temperature for AI completion */
  TEMPERATURE: 0.7,
} as const;

/**
 * Dev Server Defaults
 * Ports and URLs used during local development.
 * Single source of truth to eliminate hardcoded dev server addresses.
 */
export const DEV_DEFAULTS = {
  /** Frontend dev server port */
  WEB_PORT: 3000,
  /** API/dev server port */
  API_PORT: 8787,
  /** Default API base URL for web client (proxied via Vite) */
  API_PROXY_TARGET: "http://localhost:8787",
  /** Default test server URL for Playwright */
  PLAYWRIGHT_TEST_URL: "http://localhost:3000",
} as const;

/**
 * Rate Limiting Defaults
 * Centralized rate limit configuration for API endpoints.
 * Single source of truth to eliminate hardcoded rate limit values.
 */
export const RATE_LIMIT_DEFAULTS = {
  /** Rate limit window in milliseconds (1 minute) */
  WINDOW_MS: TIME_UNITS.MS_PER_SECOND * TIME_UNITS.SECONDS_PER_MINUTE,
  /** Strict limit: max requests per window */
  STRICT_MAX: 10,
  /** Standard limit: max requests per window */
  STANDARD_MAX: 60,
  /** Lenient limit: max requests per window */
  LENIENT_MAX: 120,
} as const;

/**
 * Circuit Breaker Defaults
 * Centralized circuit breaker configuration for service resilience.
 * Single source of truth to eliminate hardcoded circuit breaker values.
 */
export const CIRCUIT_BREAKER_DEFAULTS = {
  /** Number of consecutive failures before circuit opens */
  FAILURE_THRESHOLD: 5,
  /** Time in ms before circuit attempts half-open state (30 seconds) */
  RESET_TIMEOUT_MS: TIME_UNITS.MS_PER_SECOND * TIME_UNITS.SECONDS_PER_MINUTE,
  /** Max test calls allowed in half-open state */
  HALF_OPEN_MAX_CALLS: 3,
  /** Cold start window in ms (30 seconds) */
  COLD_START_WINDOW_MS: 30 * TIME_UNITS.MS_PER_SECOND,
} as const;

/**
 * Prompt Input Security Limits
 * Centralized limits for prompt sanitization and input validation.
 * Single source of truth to eliminate hardcoded input length values.
 */
export const MAX_INPUT_LENGTH = 5000;

/**
 * Byte Conversion Constants
 * Centralized byte multipliers to eliminate hardcoded 1024/KB/MB values.
 */
export const BYTE_CONVERSION = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;

/**
 * Playwright Test Configuration Defaults
 * Centralized Playwright test timeouts and thresholds.
 * Single source of truth for e2e test configuration.
 */
export const PLAYWRIGHT_DEFAULTS = {
  /** Web server startup timeout in ms */
  WEB_SERVER_TIMEOUT_MS: 120000,
  /** Expect assertion timeout in ms */
  EXPECT_TIMEOUT_MS: 10000,
  /** Screenshot max diff pixels for visual comparison */
  SCREENSHOT_MAX_DIFF_PIXELS: 100,
  /** Snapshot comparison threshold */
  SNAPSHOT_THRESHOLD: 0.2,
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
 * HTTP Header Names
 * Centralized header NAME strings to eliminate hardcoded header key literals.
 * Single source of truth for HTTP header field names used across API and Web.
 * Flexy says: Use these instead of hardcoded "Content-Type" strings in header objects!
 */
/**
 * Share Link Configuration
 * Centralized defaults for shareable blueprint link generation.
 * Flexy says: No magic numbers for share IDs or expiry!
 */
export const SHARE_DEFAULTS = {
  /** Length of randomly generated share IDs */
  ID_LENGTH: 12,
  /** Number of days before share links expire */
  EXPIRATION_DAYS: 30,
  /** Maximum length of share title */
  TITLE_MAX_LENGTH: 200,
  /** Maximum length of share blueprint content */
  BLUEPRINT_MAX_LENGTH: 50000,
} as const;

/**
 * Body Size Limits
 * Centralized body size limits for request validation.
 * Flexy says: No hardcoded MB/KB magic numbers!
 */
export const BODY_SIZE_LIMITS = {
  /** Default maximum body size in MB - for standard JSON API requests */
  DEFAULT_MB: 1,
  /** Strict limit in KB - for text-only endpoints */
  STRICT_KB: 100,
  /** Lenient limit in MB - for file upload endpoints */
  LENIENT_MB: 10,
} as const;

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

  /** CORS headers */
  ACCESS_CONTROL_ALLOW_ORIGIN: "Access-Control-Allow-Origin",
  ACCESS_CONTROL_ALLOW_METHODS: "Access-Control-Allow-Methods",
  ACCESS_CONTROL_ALLOW_HEADERS: "Access-Control-Allow-Headers",
} as const;
