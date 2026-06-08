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

/**
 * Preview Server Defaults
 * Centralized defaults for Vite preview and Lighthouse testing.
 * Flexy says: No hardcoded preview URLs or ports!
 */
export const PREVIEW_DEFAULTS = {
  /** Default port for Vite preview server */
  PREVIEW_PORT: 4173,
  /** Default preview server host */
  PREVIEW_HOST: "localhost",
  /** Full default preview URL */
  PREVIEW_URL: "http://localhost:4173",
} as const;

/**
 * Observability Configuration Defaults
 * Centralized sampling rates and limits for Cloudflare Workers observability.
 * Flexy says: No hardcoded sampling rates!
 */
export const OBSERVABILITY_DEFAULTS = {
  /** Trace sampling rate for production (0.0 - 1.0) */
  TRACES_SAMPLING_RATE: 0.1,
  /** Log sampling rate for production (0.0 - 1.0) */
  LOGS_SAMPLING_RATE: 0.5,
  /** CPU limit in ms for Cloudflare Workers */
  CPU_LIMIT_MS: 50000,
} as const;

/**
 * Worker Queue Configuration Defaults
 * Centralized defaults for Cloudflare Workers Queue bindings.
 * Flexy says: No hardcoded queue config values!
 */
export const QUEUE_DEFAULTS = {
  /** Default max batch size for queue consumers */
  MAX_BATCH_SIZE: 10,
  /** Default max batch timeout in seconds for queue consumers */
  MAX_BATCH_TIMEOUT_S: 30,
  /** Default max retries for queue consumers */
  MAX_RETRIES: 5,
  /** Default retry delay in seconds for queue consumers */
  RETRY_DELAY_S: 60,
} as const;

/**
 * Python Development Server Defaults
 * Centralized defaults for Python backend templates.
 * Flexy says: No hardcoded Python port numbers!
 */
export const PYTHON_DEV_DEFAULTS = {
  /** Default port for FastAPI/Flask dev servers in generated templates */
  DEV_PORT: 8000,
  /** Default host for Python dev servers */
  DEV_HOST: "0.0.0.0",
} as const;

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

/**
 * Playwright Test Configuration Defaults
 * Viewport, retries, and worker settings for e2e tests.
 * Flexy says: No hardcoded viewport dimensions or CI magic numbers!
 */
export const PLAYWRIGHT_CONFIG = {
  /** Default viewport for headless browser tests */
  VIEWPORT: { width: 1280, height: 720 } as const,
  /** Default retries on CI (2) vs local (0) */
  CI_RETRIES: 2,
  /** Default workers on CI (1 for stability) */
  CI_WORKERS: 1,
} as const;

/**
 * Node.js Template Port Defaults
 * Default port used in generated Node.js template code.
 * Flexy says: No hardcoded 3000 in template generators!
 */
export const TEMPLATE_NODE_PORT = 3000;

/**
 * Environment Names
 * Centralized string constants for environment names.
 * Flexy says: No hardcoded "production" strings in tests!
 */
export const ENVIRONMENT_NAMES = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  STAGING: "staging",
  TEST: "test",
} as const;

/**
 * Browser Quota Error Codes
 * Centralized quota error codes for localStorage quota management.
 * Flexy says: No hardcoded Chrome 22 / Firefox 1014 magic numbers!
 */
export const BROWSER_QUOTA_ERROR_CODES = {
  CHROME: 22,
  FIREFOX: 1014,
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
 * Common UI Display Strings
 * Centralized source of truth for frequently-used UI text to avoid hardcoded
 * strings in components. Flexy says: No "Loading editor..." in components!
 */
export const UI_STRINGS = {
  /** Loading display for lazy-loaded editor */
  LOADING_EDITOR: "Loading editor...",
  /** Loading display for lazy-loaded markdown preview */
  LOADING_PREVIEW: "Loading preview...",
  /** Unparsable body fallback for API logging */
  UNPARSABLE_BODY: "[unparsable]",
} as const;

/**
 * Prompt Input Delimiters
 * Centralized source of truth for delimiter strings used in prompt
 * construction and sanitization. Eliminates hardcoded XML-like tags
 * across the API source code.
 * Flexy says: No hardcoded "<user_input>" in prompt config!
 */
export const PROMPT_DELIMITERS = {
  /** Start delimiter wrapping user input in prompt templates */
  USER_INPUT_START: "<user_input>",
  /** End delimiter wrapping user input in prompt templates */
  USER_INPUT_END: "</user_input>",
} as const;

/**
 * Authentication Defaults
 * Centralized defaults for middleware auth configuration including
 * role names, anonymous user identifiers, and Hono context keys.
 * Flexy says: No hardcoded "user"/"admin" strings in auth middleware!
 */
export const AUTH_DEFAULTS = {
  /** Default user role assigned to authenticated users */
  DEFAULT_ROLE: "user" as const,
  /** Admin role for elevated access */
  ADMIN_ROLE: "admin" as const,
  /** Fallback anonymous user ID when no user header is provided */
  ANONYMOUS_USER_ID: "anonymous" as const,
  /** Hono context key for storing authenticated user object */
  USER_CONTEXT_KEY: "user" as const,
  /** Default role for authenticated users */
  DEFAULT_USER_ROLE: "user" as const,
} as const;

/**
 * Hono Context Keys
 * Centralized source of truth for all Hono context key strings used
 * with c.set() and c.get() across the API middleware and routes.
 * Flexy says: No hardcoded "requestId" context keys in middleware!
 */
export const CONTEXT_KEYS = {
  /** Request tracing identifier */
  REQUEST_ID: "requestId",
  /** Zod-validated request data */
  VALIDATED_DATA: "validatedData",
  /** Authenticated user object */
  USER: "user",
} as const;

/**
 * API Status Response Strings
 * Centralized status strings used in API JSON responses.
 * Flexy says: No hardcoded "ok" in health check endpoints!
 */
export const RESPONSE_STATUS = {
  /** Healthy / successful operation status */
  OK: "ok",
  /** Error / failed operation status */
  ERROR: "error",
} as const;

/**
 * Environment Variable Key Names
 * Centralized source of truth for environment variable name strings used
 * across both API (Cloudflare Workers) and Web (Vite) configurations.
 * Flexy says: No hardcoded "OPENAI_API_KEY" strings in env.ts!
 */
export const ENV_VAR_KEYS = {
  /** API-side env var names (Cloudflare Workers bindings) */
  API: {
    /** OpenAI API key (required) */
    OPENAI_API_KEY: "OPENAI_API_KEY",
    /** Custom OpenAI API base URL */
    OPENAI_BASE_URL: "OPENAI_BASE_URL",
    /** OpenAI model identifier */
    OPENAI_MODEL: "OPENAI_MODEL",
    /** OpenAI request timeout in milliseconds */
    OPENAI_TIMEOUT_MS: "OPENAI_TIMEOUT_MS",
    /** OpenAI max tokens for completion */
    OPENAI_MAX_TOKENS: "OPENAI_MAX_TOKENS",
    /** OpenAI temperature setting */
    OPENAI_TEMPERATURE: "OPENAI_TEMPERATURE",
    /** API version string */
    API_VERSION: "API_VERSION",
    /** CORS allowed origin */
    CORS_ORIGIN: "CORS_ORIGIN",
    /** CORS max age in seconds */
    CORS_MAX_AGE: "CORS_MAX_AGE",
    /** Rate limit window in milliseconds */
    RATE_LIMIT_WINDOW_MS: "RATE_LIMIT_WINDOW_MS",
    /** Strict rate limit max requests */
    RATE_LIMIT_STRICT_MAX: "RATE_LIMIT_STRICT_MAX",
    /** Standard rate limit max requests */
    RATE_LIMIT_STANDARD_MAX: "RATE_LIMIT_STANDARD_MAX",
    /** Lenient rate limit max requests */
    RATE_LIMIT_LENIENT_MAX: "RATE_LIMIT_LENIENT_MAX",
    /** Storage quota in megabytes */
    STORAGE_QUOTA_MB: "STORAGE_QUOTA_MB",
    /** Circuit breaker failure threshold */
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: "CIRCUIT_BREAKER_FAILURE_THRESHOLD",
    /** Circuit breaker reset timeout in ms */
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: "CIRCUIT_BREAKER_RESET_TIMEOUT_MS",
    /** Circuit breaker half-open max calls */
    CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: "CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS",
    /** Circuit breaker cold start window in ms */
    CIRCUIT_BREAKER_COLD_START_WINDOW_MS: "CIRCUIT_BREAKER_COLD_START_WINDOW_MS",
    /** Retry max retries */
    RETRY_MAX_RETRIES: "RETRY_MAX_RETRIES",
    /** Retry initial delay in ms */
    RETRY_INITIAL_DELAY_MS: "RETRY_INITIAL_DELAY_MS",
    /** Retry backoff factor */
    RETRY_BACKOFF_FACTOR: "RETRY_BACKOFF_FACTOR",
    /** Retry max delay in ms */
    RETRY_MAX_DELAY_MS: "RETRY_MAX_DELAY_MS",
    /** Project homepage URL */
    PROJECT_HOMEPAGE_URL: "PROJECT_HOMEPAGE_URL",
    /** GitHub repository URL */
    GITHUB_URL: "GITHUB_URL",
  } as const,
  /** Web-side env var names (Vite import.meta.env) */
  WEB: {
    /** API base URL for web client */
    VITE_API_BASE_URL: "VITE_API_BASE_URL",
    /** Enable analytics tracking */
    VITE_ENABLE_ANALYTICS: "VITE_ENABLE_ANALYTICS",
    /** Project homepage URL */
    VITE_PROJECT_HOMEPAGE_URL: "VITE_PROJECT_HOMEPAGE_URL",
    /** GitHub repository URL */
    VITE_GITHUB_URL: "VITE_GITHUB_URL",
    /** Storage quota in megabytes */
    VITE_STORAGE_QUOTA_MB: "VITE_STORAGE_QUOTA_MB",
    /** Application display name */
    VITE_APP_NAME: "VITE_APP_NAME",
    /** Default project name for new projects */
    VITE_DEFAULT_PROJECT_NAME: "VITE_DEFAULT_PROJECT_NAME",
  } as const,
} as const;

/**
 * API Error Codes
 * Centralized source of truth for all API error response codes.
 * Used by API middleware, controllers, and error classes for consistent
 * error code values in JSON error responses.
 * Flexy says: No hardcoded "VALIDATION_ERROR" strings in error handlers!
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  AI_SERVICE_ERROR: "AI_SERVICE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  CIRCUIT_BREAKER_OPEN: "CIRCUIT_BREAKER_OPEN",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
} as const;
