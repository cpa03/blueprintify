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
    /** Warning threshold percentage for character counters */
    WARNING_THRESHOLD: 90,
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
  VERSION: {
    MAX: 50,
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
  /** Individual file extension constants for type-safe checks */
  FILE_EXTENSIONS: {
    /** JSON file extension */
    JSON: ".json" as const,
    /** Markdown file extension */
    MARKDOWN: ".md" as const,
    /** Plain text file extension */
    TEXT: ".txt" as const,
  } as const,
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
  /** Content-Type header for markdown files */
  CONTENT_TYPE_MARKDOWN: "text/markdown",
  /** Content-Type header for executable binaries */
  CONTENT_TYPE_EXECUTABLE: "application/x-executable",
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
 * Database Entity ID Prefixes
 * Centralized entity type prefixes used in database ID generation.
 * Flexy says: No hardcoded "user"/"project"/"blueprint" prefix strings!
 */
export const DB_ID_PREFIXES = {
  USER: "user",
  PROJECT: "project",
  BLUEPRINT: "blueprint",
  TASK: "task",
  TEMPLATE: "template",
  ANALYTICS: "analytics",
  SESSION: "session",
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

/**
 * View Mode Indicator Positioning Values
 * Centralized source of truth for the sliding indicator bar position and width
 * in the editor toolbar's view mode toggle (edit/split/preview).
 * These calc() and px values position the animated background indicator
 * behind the active view mode button.
 * Flexy says: No hardcoded "calc(33.33% + 2px)" or "4px" in view mode indicator!
 * Usage: import { VIEW_MODE_INDICATOR_POSITION } from "@blueprint/shared";
 *        animate={{ left: VIEW_MODE_INDICATOR_POSITION.EDIT_LEFT }}
 */
export const VIEW_MODE_INDICATOR_POSITION = {
  /** Left offset for EDIT view mode button indicator */
  EDIT_LEFT: "4px" as const,
  /** Left offset for SPLIT view mode button indicator (centered on middle button) */
  SPLIT_LEFT: "calc(33.33% + 2px)" as const,
  /** Left offset for PREVIEW view mode button indicator (on right button) */
  PREVIEW_LEFT: "calc(66.67% - 0px)" as const,
  /** Width of indicator in SPLIT mode (when middle button is active) */
  SPLIT_WIDTH: "calc(33.33% - 2px)" as const,
  /** Width of indicator in EDIT or PREVIEW mode (single button active) */
  SINGLE_WIDTH: "calc(33.33% - 4px)" as const,
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
  /** Namespace prefix for all localStorage keys */
  STORAGE_NAMESPACE: "blueprint" as const,
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

/**
 * Editor Tab Identifiers
 * Centralized identifiers for the split-pane editor tabs.
 * Flexy says: No hardcoded "blueprint"/"tasks" strings in editor components!
 * Usage: import { EDITOR_TABS } from "@blueprint/shared";
 *        editor.activeTab === EDITOR_TABS.BLUEPRINT
 */
export const EDITOR_TABS = {
  /** Blueprint/documentation tab identifier */
  BLUEPRINT: "blueprint" as const,
  /** Tasks tab identifier */
  TASKS: "tasks" as const,
} as const;

/**
 * Wizard Step Keys
 * Centralized identifiers for the project setup wizard steps.
 * Flexy says: No hardcoded "info"/"stack"/"features"/"review"/"generating" strings!
 * Usage: import { WIZARD_STEP_KEYS } from "@blueprint/shared";
 *        wizard.currentStep === WIZARD_STEP_KEYS.INFO
 */
export const WIZARD_STEP_KEYS = {
  /** Project info step - name, description, target audience */
  INFO: "info" as const,
  /** Tech stack selection step */
  STACK: "stack" as const,
  /** Features selection step */
  FEATURES: "features" as const,
  /** Review and confirm step */
  REVIEW: "review" as const,
  /** AI generation in progress step */
  GENERATING: "generating" as const,
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

/**
 * API Error Type Classifications
 * Centralized source of truth for the ErrorType enum string values used
 * across API middleware, error handlers, and error response objects.
 * Flexy says: No hardcoded "validation" or "not_found" in error classes!
 */
export const ERROR_TYPES = {
  /** Request validation failures */
  VALIDATION: "validation",
  /** Authentication failures (missing/invalid credentials) */
  AUTHENTICATION: "authentication",
  /** Authorization failures (insufficient permissions) */
  AUTHORIZATION: "authorization",
  /** Resource not found */
  NOT_FOUND: "not_found",
  /** Server configuration errors */
  CONFIGURATION: "configuration",
  /** Network-level failures */
  NETWORK: "network",
  /** AI service errors (OpenAI, etc.) */
  AI_SERVICE: "ai_service",
  /** Internal server errors */
  INTERNAL: "internal",
  /** Service temporarily unavailable */
  SERVICE_UNAVAILABLE: "service_unavailable",
} as const;

/**
 * API Status Values
 * Centralized status strings used in API JSON responses.
 * Flexy says: No hardcoded "healthy" or "ok" in health endpoints!
 */
export const API_STATUS_VALUES = {
  /** Service status for health check responses */
  HEALTHY: "healthy",
  /** Default status for operational state */
  OK: "ok",
  /** Error state */
  ERROR: "error",
} as const;

/**
 * Platform & Runtime Names
 * Centralized platform identifiers used across the API.
 * Flexy says: No hardcoded "unknown" or "cloudflare-workers" strings!
 */
export const PLATFORM_VALUES = {
  /** Fallback when platform cannot be determined */
  UNKNOWN: "unknown",
  /** Cloudflare Workers runtime identifier */
  CLOUDFLARE_WORKERS: "cloudflare-workers",
} as const;

/**
 * Common Error Strings
 * Centralized source of truth for frequently-used error message strings.
 * Flexy says: No hardcoded "Unknown error" or "Resource not found" in error handlers!
 */
export const ERROR_STRINGS = {
  /** Generic unknown error fallback */
  UNKNOWN: "Unknown error",
  /** Generic not-found error message */
  RESOURCE_NOT_FOUND: "Resource not found",
  /** Internal server error fallback */
  INTERNAL: "Internal server error",
} as const;

/**
 * Common UI Display Strings
 * Centralized source of truth for frequently-used UI text strings
 * used across both API and Web contexts.
 * Flexy says: No hardcoded status/notification strings in components!
 */
export const UI_MESSAGES = {
  /** Auto-save notification text */
  CHANGES_SAVED: "Changes saved",
  /** Generation cancelled notification */
  GENERATION_CANCELLED: "Generation cancelled",
  /** Generation complete notification */
  COMPLETE: "Complete!",
  /** Document title separator */
  TITLE_SEPARATOR: " | ",
} as const;

/**
 * Toast Notification Types
 * Centralized source of truth for all toast notification type strings.
 * Flexy says: No hardcoded "success"/"error"/"warning"/"info" in toast components!
 * Usage: import { TOAST_TYPES } from "@blueprint/shared";
 *        addToast("Done!", TOAST_TYPES.SUCCESS)
 *        type ToastType = (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES];
 */
export const TOAST_TYPES = {
  /** Success toast - green styling, indicates successful operations */
  SUCCESS: "success",
  /** Info toast - blue styling, provides informational messages */
  INFO: "info",
  /** Warning toast - yellow styling, indicates caution or potential issues */
  WARNING: "warning",
  /** Error toast - red styling, indicates errors or failures */
  ERROR: "error",
} as const;

/**
 * Animation Direction Constants
 * Centralized source of truth for wizard/step animation direction strings.
 * Flexy says: No hardcoded "forward"/"backward" in animation components!
 * Usage: import { ANIMATION_DIRECTIONS } from "@blueprint/shared";
 *        direction === ANIMATION_DIRECTIONS.FORWARD
 *        type AnimationDirection = (typeof ANIMATION_DIRECTIONS)[keyof typeof ANIMATION_DIRECTIONS];
 */
export const ANIMATION_DIRECTIONS = {
  /** Forward navigation direction (next step / page) */
  FORWARD: "forward",
  /** Backward navigation direction (previous step / page) */
  BACKWARD: "backward",
} as const;

/**
 * Storage Operation Type Constants
 * Centralized source of truth for storage adapter operation type strings.
 * Flexy says: No hardcoded "read"/"write"/"delete" strings in storage code!
 * Usage: import { STORAGE_OPERATIONS } from "@blueprint/shared";
 *        operation === STORAGE_OPERATIONS.READ
 *        type StorageOperation = (typeof STORAGE_OPERATIONS)[keyof typeof STORAGE_OPERATIONS];
 */
export const STORAGE_OPERATIONS = {
  /** Read operation - retrieving data from storage */
  READ: "read",
  /** Write operation - persisting data to storage */
  WRITE: "write",
  /** Delete operation - removing data from storage */
  DELETE: "delete",
  /** Clear operation - wiping all storage data */
  CLEAR: "clear",
  /** Migrate operation - migrating data between storage versions */
  MIGRATE: "migrate",
  /** Backup operation - creating a backup snapshot */
  BACKUP: "backup",
} as const;

/**
 * API Common Error Messages
 * Centralized source of truth for frequently-used API error message strings.
 * Flexy says: No hardcoded "Request validation failed" strings in middleware!
 * Usage: import { API_MESSAGES } from "@blueprint/shared";
 *        error.message === API_MESSAGES.VALIDATION_FAILED
 */
export const API_MESSAGES = {
  /** Request validation failure message */
  VALIDATION_FAILED: "Request validation failed",
  /** OpenAI API key missing from environment configuration */
  OPENAI_KEY_NOT_CONFIGURED: "OpenAI API key not configured",
  /** AI service temporarily unavailable */
  AI_SERVICE_UNAVAILABLE: "AI service temporarily unavailable",
  /** Authentication required */
  AUTHENTICATION_REQUIRED: "Authentication required",
  /** Insufficient permissions */
  AUTHORIZATION_FAILED: "Insufficient permissions",
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED: "Too many requests, please try again later",
  /** Internal fallback message */
  INTERNAL_FALLBACK: "Unknown error occurred",
  /** Circuit breaker open message */
  CIRCUIT_BREAKER_OPEN: "Service temporarily unavailable, please try again later",
  /** Rate limiter not configured */
  RATE_LIMITER_NOT_CONFIGURED: "Rate limiter not configured",
  /** DI container not initialized */
  CONTAINER_NOT_INITIALIZED:
    "DI Container not initialized. Call setDefaultContainer() before using services.",
  /** Import unsupported format template */
  UNSUPPORTED_IMPORT_FORMAT: (format: string): string => `Unsupported import format: ${format}`,
  /** Export unsupported format template */
  UNSUPPORTED_EXPORT_FORMAT: (format: string): string => `Unsupported export format: ${format}`,
} as const;

/**
 * KV Storage Key Names
 * Centralized source of truth for Cloudflare Workers KV storage key strings.
 * Flexy says: No hardcoded "storage:quota" KV keys!
 */
export const KV_STORAGE_KEYS = {
  /** Key for storing storage quota/tracking data */
  QUOTA_KEY: "storage:quota",
} as const;

/**
 * Share Route Messages
 * Centralized source of truth for share route response messages.
 * Flexy says: No hardcoded "Share deleted successfully" in route handlers!
 */
export const SHARE_MESSAGES = {
  /** Database not configured error */
  DATABASE_NOT_CONFIGURED: "Database not configured",
  /** Invalid share ID format */
  INVALID_SHARE_ID_FORMAT: "Invalid share ID format",
  /** Share not found or expired */
  NOT_FOUND_OR_EXPIRED: "Shared blueprint not found or expired",
  /** Share has expired */
  EXPIRED: "Shared blueprint has expired",
  /** Share deleted successfully */
  DELETED_SUCCESSFULLY: "Share deleted successfully",
} as const;

/**
 * Storage Route Messages
 * Centralized source of truth for storage route response messages.
 * Flexy says: No hardcoded storage response strings in route handlers!
 */
export const STORAGE_ROUTE_MESSAGES = {
  /** Note displayed in quota response */
  QUOTA_NOTE:
    "Server-side storage tracking. Client-side storage quota available via localStorage API.",
  /** Error when confirmation is not provided for clear operation */
  CONFIRMATION_REQUIRED: "Confirmation required to clear storage",
  /** Success message after clearing storage */
  CLEAR_SUCCESS:
    "Server-side storage cleared. Client-side storage must be cleared via localStorage API.",
} as const;

/**
 * Import Configuration Defaults
 * Centralized defaults for the import route and error messages.
 * Flexy says: No hardcoded "Imported Project" strings in import handlers!
 */
export const IMPORT_DEFAULTS = {
  /** Default project name when no name can be extracted from imported content */
  DEFAULT_PROJECT_NAME: "Imported Project",
  /** Missing required fields error */
  MISSING_REQUIRED_FIELDS: "Invalid import data: missing required fields (projectName, blueprint)",
  /** Invalid JSON format error */
  INVALID_JSON_FORMAT: "Invalid JSON format",
  /** Missing blueprint content error */
  MISSING_BLUEPRINT_CONTENT: "Invalid markdown format: could not extract blueprint content",
  /** Generic import failure */
  IMPORT_FAILED: "Import failed",
} as const;

/**
 * Export Error Messages
 * Centralized source of truth for export route error messages.
 * Flexy says: No hardcoded "Export failed" strings in export handlers!
 */
export const EXPORT_MESSAGES = {
  /** Generic export failure */
  EXPORT_FAILED: "Export failed",
} as const;

/**
 * Rate Limiter Binding Names
 * Centralized source of truth for Cloudflare Workers rate limiter binding names.
 * Flexy says: No hardcoded "STRICT_RATE_LIMITER" strings in rate limit config!
 */
export const RATE_LIMITER_BINDINGS = {
  /** Strict rate limiter binding */
  STRICT: "STRICT_RATE_LIMITER",
  /** Standard rate limiter binding */
  STANDARD: "STANDARD_RATE_LIMITER",
  /** Lenient rate limiter binding */
  LENIENT: "LENIENT_RATE_LIMITER",
} as const;

/**
 * Authentication Error Messages
 * Centralized source of truth for authentication-related error message strings.
 * Flexy says: No hardcoded "Invalid or missing API key" strings in auth middleware!
 * Usage: import { AUTH_MESSAGES } from "@blueprint/shared";
 *        error.message === AUTH_MESSAGES.INVALID_API_KEY
 */
export const AUTH_MESSAGES = {
  /** Invalid or missing API key */
  INVALID_API_KEY: "Invalid or missing API key",
  /** API key not configured on server */
  API_KEY_NOT_CONFIGURED: "API_KEY is not configured. Server authentication is unavailable.",
  /** Service configuration error fallback */
  SERVICE_CONFIG_ERROR: "Service configuration error",
} as const;

/**
 * API Validation Messages
 * Centralized source of truth for validation-related error message strings.
 * Flexy says: No hardcoded "Invalid JSON in request body" strings in validation middleware!
 * Usage: import { API_VALIDATION_MESSAGES } from "@blueprint/shared";
 */
export const API_VALIDATION_MESSAGES = {
  /** Invalid JSON payload */
  INVALID_JSON_BODY: "Invalid JSON in request body",
  /** Generic validation error */
  VALIDATION_ERROR: "Validation error",
  /** Validated data not found in Hono context */
  VALIDATED_DATA_NOT_FOUND: "Validated data not found in context",
  /** Request body exceeded maximum allowed size */
  BODY_TOO_LARGE: (maxSize: number): string =>
    `Request body too large. Maximum allowed size is ${maxSize} bytes.`,
} as const;

/**
 * Circuit Breaker Messages
 * Centralized source of truth for circuit breaker state message strings.
 * Flexy says: No hardcoded "Circuit breaker is OPEN" strings in circuit breaker code!
 * Usage: import { CIRCUIT_BREAKER_MESSAGES } from "@blueprint/shared";
 */
export const CIRCUIT_BREAKER_MESSAGES = {
  /** Circuit breaker open state message */
  OPEN: "Circuit breaker is OPEN",
  /** Circuit breaker half-open max calls reached */
  HALF_OPEN_MAX_CALLS: "Circuit breaker is HALF_OPEN - max calls reached",
} as const;

/**
 * Storage Error Messages
 * Centralized source of truth for storage-related error message strings.
 * Flexy says: No hardcoded "Failed to load state from storage" strings in storage adapters!
 * Usage: import { STORAGE_ERROR_MESSAGES } from "@blueprint/shared";
 */
export const STORAGE_ERROR_MESSAGES = {
  /** Failed to load data from storage */
  LOAD_FAILED: "Failed to load state from storage",
  /** Failed to save data to storage */
  SAVE_FAILED: "Failed to save state to storage",
  /** Failed to clear storage */
  CLEAR_FAILED: "Failed to clear storage",
  /** Failed to read from storage */
  READ_FAILED: "Failed to read from storage",
  /** Failed to write to storage */
  WRITE_FAILED: "Failed to write to storage",
  /** Failed to remove from storage */
  REMOVE_FAILED: "Failed to remove from storage",
  /** Failed to create backup */
  BACKUP_FAILED: "Failed to create backup",
  /** Generic recovery failure */
  RECOVERY_FAILED: "Recovery failed",
  /** localStorage not supported */
  STORAGE_UNSUPPORTED: "localStorage is not supported in this browser",
  /** Storage unavailable in private browsing */
  PRIVACY_MODE: "Storage is unavailable in private browsing mode",
  /** Storage quota exceeded */
  QUOTA_EXCEEDED: "Storage quota exceeded",
  /** Corrupted data detected */
  DATA_CORRUPTED: "Stored data appears to be corrupted. Attempting recovery...",
  /** Browser does not support local storage */
  BROWSER_UNSUPPORTED: "Your browser does not support local storage.",
  /** Validation failed */
  VALIDATION_FAILED: "Data validation failed.",
  /** Migration failed */
  MIGRATION_FAILED: "Data migration failed. Please clear storage and try again.",
  /** Unexpected storage error */
  UNEXPECTED_ERROR: "An unexpected storage error occurred.",
  /** Storage is full */
  STORAGE_FULL: "Storage is full. Please clear some data and try again.",
} as const;

/**
 * Input Validation States
 * Centralized source of truth for input validation state string values.
 * Flexy says: No hardcoded "valid"/"invalid"/"warning" in AnimatedInput validationState types!
 * Usage: import { INPUT_VALIDATION_STATES } from "@blueprint/shared";
 *        type ValidationState = (typeof INPUT_VALIDATION_STATES)[keyof typeof INPUT_VALIDATION_STATES];
 */
/**
 * API Shared Config Defaults
 * Centralized magic numbers and defaults for API configuration.
 * Flexy says: No magic numbers in API config constants!
 */
export const API_CONFIG_DEFAULTS = {
  /** Default limit for popular/trending template queries */
  DEFAULT_POPULAR_LIMIT: 10,
  /** Length of random suffix appended to request IDs (e.g., timestamp-abc1234) */
  REQUEST_ID_SUFFIX_LENGTH: 4,
} as const;

export const INPUT_VALIDATION_STATES = {
  /** Default/neutral input state */
  DEFAULT: "default",
  /** Valid input state */
  VALID: "valid",
  /** Invalid input state */
  INVALID: "invalid",
  /** Warning input state */
  WARNING: "warning",
} as const;

/**
 * Storage Route Fallback Messages
 * Centralized source of truth for storage route catch-block fallback messages.
 * Flexy says: No hardcoded "Failed to get storage quota" strings in route handlers!
 * Usage: import { STORAGE_FALLBACK_MESSAGES } from "@blueprint/shared";
 *        message: error instanceof Error ? error.message : STORAGE_FALLBACK_MESSAGES.QUOTA_GET
 */
export const STORAGE_FALLBACK_MESSAGES = {
  /** Fallback when getting storage quota fails with unknown error */
  QUOTA_GET: "Failed to get storage quota",
  /** Fallback when reporting storage usage fails with unknown error */
  REPORT_USAGE: "Failed to report storage usage",
  /** Fallback when clearing storage fails with unknown error */
  CLEAR_STORAGE: "Failed to clear storage",
} as const;

/**
 * Export/File Error Messages (non-API)
 * Centralized source of truth for frontend export and clipboard error strings.
 * Flexy says: No hardcoded "Failed to export project" or "Failed to create .docs folder" strings!
 * Usage: import { EXPORT_ERROR_STRINGS } from "@blueprint/shared";
 *        throw new Error(EXPORT_ERROR_STRINGS.ZIP_FOLDER_FAILED)
 */
export const EXPORT_ERROR_STRINGS = {
  /** ZIP folder creation failure — likely memory or library issue */
  ZIP_FOLDER_FAILED:
    "Failed to create .docs folder in ZIP archive. This may indicate a memory issue or ZIP library error. Try reducing the content size or refreshing the page.",
  /** Generic export failure displayed as toast */
  EXPORT_FAILED: "Failed to export project",
  /** Fallback when file validation fails with unknown reason */
  FILE_VALIDATION_FAILED: "File validation failed",
  /** Share metadata parsing failure logged server-side */
  SHARE_METADATA_PARSE_FAILED: "Failed to parse share metadata",
} as const;

/**
 * Local Development Domain Defaults
 * Centralized source of truth for local development hostnames used in
 * deployment detection, CORS configs, and environment checks.
 * Flexy says: No hardcoded "localhost" strings in deployment detection!
 * Usage: import { DEV_DOMAIN_DEFAULTS } from "@blueprint/shared";
 *        VERCEL_DOMAINS.LOCAL.includes(hostname)
 */
export const DEV_DOMAIN_DEFAULTS = {
  /** Local development hostnames for deployment detection */
  LOCAL_HOSTNAMES: ["localhost", "127.0.0.1"] as readonly string[],
} as const;

/**
 * Cold Start / Warmup Messages
 * Centralized source of truth for circuit breaker cold start recommendation strings.
 * Flexy says: No hardcoded "Circuit breaker is in cold start window" in index.ts!
 * Usage: import { COLD_START_MESSAGES } from "@blueprint/shared";
 */
export const COLD_START_MESSAGES = {
  /** Message shown when circuit breaker is within cold start window */
  ACTIVE: "Circuit breaker is in cold start window — reduced failure threshold active",
  /** Message shown when circuit breaker is fully warmed up */
  INACTIVE: "Circuit breaker is fully warmed up",
} as const;

/**
 * Vite Dev Server Proxy Path
 * Centralized source of truth for the API proxy path used in Vite config.
 * Flexy says: No hardcoded "/api" strings in vite.config.ts or env.ts!
 * Usage: import { API_PROXY_PATH } from "@blueprint/shared";
 */
export const API_PROXY_PATH = "/api" as const;

/**
 * Security Error Categories
 * Centralized source of truth for SecurityError category type strings.
 * Flexy says: No hardcoded "XSS" or "VALIDATION" strings in SecurityError class!
 * Usage: import { SECURITY_ERROR_CATEGORIES } from "@blueprint/shared";
 *        type SecurityErrorCategory = (typeof SECURITY_ERROR_CATEGORIES)[keyof typeof SECURITY_ERROR_CATEGORIES];
 */
export const SECURITY_ERROR_CATEGORIES = {
  /** Cross-site scripting (XSS) violation */
  XSS: "XSS",
  /** General validation failure */
  VALIDATION: "VALIDATION",
  /** Storage quota exceeded */
  QUOTA: "QUOTA",
  /** File validation failure */
  FILE: "FILE",
} as const;

/**
 * Editor View Mode Identifiers
 * Centralized source of truth for editor view mode strings.
 * Flexy says: No hardcoded "edit"/"preview"/"split" in EditorToolbar!
 * Usage: import { VIEW_MODES } from "@blueprint/shared";
 *        type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];
 */
export const VIEW_MODES = {
  /** Full-width code editing view */
  EDIT: "edit" as const,
  /** Full-width markdown preview view */
  PREVIEW: "preview" as const,
  /** Side-by-side editor and preview view */
  SPLIT: "split" as const,
} as const;

/**
 * Editor File Display Names
 * Centralized source of truth for editor tab filenames shown in UI.
 * Flexy says: No hardcoded "blueprint.md" or "task.md" in editor components!
 * Usage: import { EDITOR_FILENAMES } from "@blueprint/shared";
 *        label === EDITOR_FILENAMES.BLUEPRINT
 */
export const EDITOR_FILENAMES = {
  /** Display label for the blueprint tab */
  BLUEPRINT: "blueprint.md" as const,
  /** Display label for the tasks tab */
  TASKS: "task.md" as const,
  /** Screen reader announcement text for blueprint tab */
  BLUEPRINT_ANNOUNCE: "blueprint.md" as const,
  /** Screen reader announcement text for tasks tab */
  TASKS_ANNOUNCE: "tasks.md" as const,
  /** Human-readable display name for the blueprint tab (capitalized, no extension) */
  BLUEPRINT_DISPLAY: "Blueprint" as const,
  /** Human-readable display name for the tasks tab (capitalized, no extension) */
  TASKS_DISPLAY: "Tasks" as const,
} as const;

/**
 * Export File Name Constants
 * Centralized source of truth for file names used in project exports (ZIP/JSON/Markdown).
 * References EDITOR_FILENAMES to ensure export filenames stay in sync with display names.
 * Flexy says: No hardcoded "blueprint.md" or "task.md" in export config — single source of truth!
 * Usage: import { EXPORT_FILENAMES } from "@blueprint/shared";
 *        fileName: EXPORT_FILENAMES.BLUEPRINT
 */
export const EXPORT_FILENAMES = {
  /** Exported blueprint file name */
  BLUEPRINT: EDITOR_FILENAMES.BLUEPRINT,
  /** Exported tasks file name */
  TASKS: EDITOR_FILENAMES.TASKS,
} as const;

/**
 * Editor Tooltip Labels
 * Centralized source of truth for tooltip text in the editor toolbar.
 * Flexy says: No hardcoded "Copy to clipboard" strings in button tooltips!
 * Usage: import { TOOLTIP_LABELS } from "@blueprint/shared";
 *        tooltip={TOOLTIP_LABELS.EDITOR.COPY_TO_CLIPBOARD}
 */
export const TOOLTIP_LABELS = {
  EDITOR: {
    /** Tooltip when content is ready to copy */
    COPY_TO_CLIPBOARD: "Copy to clipboard",
    /** Tooltip when content has been copied */
    COPIED: "Copied!",
    /** Tooltip for export button default state */
    EXPORT_AS_ZIP: "Export as ZIP",
    /** Tooltip for export button success state */
    EXPORTED: "Exported!",
    /** Tooltip for new project button */
    START_NEW_PROJECT: "Start new project",
  },
} as const;

/**
 * Keyboard Shortcut Display Labels
 * Centralized source of truth for keyboard shortcut text shown in tooltips.
 * Flexy says: No hardcoded "Ctrl+C" strings in tooltip kbd elements!
 * Usage: import { SHORTCUT_LABELS } from "@blueprint/shared";
 *        kbd>{SHORTCUT_LABELS.COPY}</kbd>
 */
export const SHORTCUT_LABELS = {
  /** Copy keyboard shortcut display */
  COPY: "Ctrl+C",
  /** Export keyboard shortcut display */
  EXPORT: "Ctrl+Shift+E",
  /** New project keyboard shortcut display */
  NEW_PROJECT: "Ctrl+N",
  /** Keyboard shortcut modal trigger display */
  SHORTCUTS_MODAL: "?",
} as const;

/**
 * Keyboard Shortcut Tooltip Descriptions
 * Centralized source of truth for shortcut tooltip description strings
 * used in KeyboardShortcutTooltip components across the web app.
 * Flexy says: No hardcoded "Toggle editor" strings in component code!
 * Usage: import { SHORTCUT_DESCRIPTIONS } from "@blueprint/shared";
 *        <KeyboardShortcutTooltip description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR} />
 */
export const SHORTCUT_DESCRIPTIONS = {
  /** Toggle the editor pane open/closed */
  TOGGLE_EDITOR: "Toggle editor",
  /** Navigate to the previous wizard step */
  GO_BACK: "Go back",
  /** Proceed to the next wizard step */
  CONTINUE_NEXT_STEP: "Continue to next step",
  /** Confirm a dialog action */
  CONFIRM_ACTION: "Confirm action",
  /** Show or hide the keyboard shortcuts modal */
  SHOW_KEYBOARD_SHORTCUTS: "Show keyboard shortcuts",
} as const;

/**
 * UI Timing Defaults
 * Centralized source of truth for UI timing magic numbers.
 * Flexy says: No hardcoded timeout values in component code!
 * Usage: import { UI_TIMING } from "@blueprint/shared";
 *        setTimeout(fn, UI_TIMING.DISCOVERY_HINT_MS)
 */
export const UI_TIMING = {
  /** Duration in ms for the discovery hint glow animation on keyboard shortcuts button */
  DISCOVERY_HINT_MS: 3000,
  /** Duration in ms for auto-focus delay after editor mounts */
  EDITOR_FOCUS_DELAY_MS: 180,
  /** Duration in ms for editor focus highlight animation (should match CSS animation ~1.8s) */
  EDITOR_FOCUS_HIGHLIGHT_MS: 1900,
  /** Duration in ms for the ShowEditorButton arrival pop animation before removing the CSS class */
  ARRIVAL_POP_DISPLAY_MS: 600,
} as const;

/**
 * Environment Variable Error Messages
 * Centralized error message templates for environment variable validation.
 * Flexy says: No hardcoded "is required but not set" strings in env.ts!
 * Usage: import { ENV_ERROR_MESSAGES } from "@blueprint/shared";
 *        throw new Error(ENV_ERROR_MESSAGES.REQUIRED_NOT_SET("OPENAI_API_KEY"))
 */
export const ENV_ERROR_MESSAGES = {
  /** Template for required env var that is missing from environment */
  REQUIRED_NOT_SET: (key: string): string => `${key} is required but not set in environment.`,
  /** Template for required env var that is empty */
  REQUIRED_CANNOT_BE_EMPTY: (key: string): string => `${key} is required and cannot be empty.`,
  /** Template for CORS wildcard warning in production */
  CORS_WILDCARD_WARNING: (key: string): string =>
    `WARNING: ${key} is set to '*' (allow all). This is a security risk in production.`,
} as const;

/**
 * Log Type Identifiers
 * Centralized source of truth for structured log type strings used
 * in the logger middleware and secure logging utilities.
 * Flexy says: No hardcoded "request"/"response" strings in logger.ts!
 * Usage: import { LOG_TYPE_STRINGS } from "@blueprint/shared";
 *        type: LOG_TYPE_STRINGS.REQUEST
 */
export const LOG_TYPE_STRINGS = {
  /** Request log entry type */
  REQUEST: "request" as const,
  /** Response log entry type */
  RESPONSE: "response" as const,
} as const;

/**
 * Storage Key Prefixes
 * Centralized source of truth for internal storage key prefixes used
 * in backup, test, and privacy detection operations.
 * Flexy says: No hardcoded "__backup__"/__storage_test__" strings in keys.ts!
 * Usage: import { STORAGE_KEY_PREFIXES } from "@blueprint/shared";
 *       `{STORAGE_KEY_PREFIXES.BACKUP}${key}`
 */
export const STORAGE_KEY_PREFIXES = {
  /** Prefix for backup entries in localStorage */
  BACKUP: "__backup__" as const,
  /** Prefix for storage availability test keys */
  STORAGE_TEST: "__storage_test__" as const,
  /** Prefix for privacy mode detection test keys */
  PRIVACY_TEST: "__privacy_test__" as const,
} as const;

/**
 * Storage Error Type Identifiers
 * Centralized source of truth for all storage error type string values.
 * Flexy says: No hardcoded "QUOTA_EXCEEDED"/"CORRUPTED_DATA" string unions in storage.ts!
 * Usage: import { STORAGE_ERROR_TYPE_VALUES } from "@blueprint/shared";
 *        type StorageErrorType = (typeof STORAGE_ERROR_TYPE_VALUES)[keyof typeof STORAGE_ERROR_TYPE_VALUES];
 */
export const STORAGE_ERROR_TYPE_VALUES = {
  /** Storage quota exceeded error */
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED" as const,
  /** Corrupted or unparseable stored data */
  CORRUPTED_DATA: "CORRUPTED_DATA" as const,
  /** JSON serialization/deserialization failure */
  SERIALIZATION_ERROR: "SERIALIZATION_ERROR" as const,
  /** Browser does not support localStorage */
  BROWSER_UNSUPPORTED: "BROWSER_UNSUPPORTED" as const,
  /** Private browsing / incognito mode detected */
  PRIVACY_MODE: "PRIVACY_MODE" as const,
  /** Data validation failure */
  VALIDATION_ERROR: "VALIDATION_ERROR" as const,
  /** Schema/data migration failure */
  MIGRATION_ERROR: "MIGRATION_ERROR" as const,
  /** Backup operation failure */
  BACKUP_ERROR: "BACKUP_ERROR" as const,
  /** Recovery from backup failure */
  RECOVERY_ERROR: "RECOVERY_ERROR" as const,
} as const;

/**
 * Test Setup Prefix Strings
 * Centralized source of truth for test setup prefix strings.
 * Flexy says: No hardcoded "[test-setup]" prefix strings in test-setup.ts!
 * Usage: import { TEST_SETUP_STRINGS } from "@blueprint/shared";
 *        console.warn(`${TEST_SETUP_STRINGS.PREFIX}some message`);
 */
export const TEST_SETUP_STRINGS = {
  /** Prefix logged before unhandled rejection warnings in test setup */
  UNHANDLED_REJECTION_PREFIX: "[test-setup] ",
} as const;

/**
 * Storage Operation Error Template Functions
 * Centralized template functions for storage operation error messages.
 * Flexy says: No hardcoded "Storage X failed" strings in storage.ts!
 * Usage: import { STORAGE_OPERATION_ERROR_STRINGS } from "@blueprint/shared";
 *        console.warn(STORAGE_OPERATION_ERROR_STRINGS.OPERATION_FAILED(operation));
 */
export const STORAGE_OPERATION_ERROR_STRINGS = {
  /** Template for failed storage operation */
  OPERATION_FAILED: (operation: string): string => `Storage ${operation} failed`,
  /** Template for successful recovery from backup at timestamp */
  RECOVERY_SUCCESS: (timestamp: number): string =>
    `Successfully recovered from backup created at ${new Date(timestamp)}`,
  /** Template for duplicate storage service registration */
  SERVICE_EXISTS: (key: string): string => `Storage service for key "${key}" already exists`,
} as const;

/**
 * Error Class Name Constants
 * Centralized source of truth for Error subclass name strings used with `this.name = ...`.
 * Flexy says: No hardcoded "APIError" or "ValidationError" strings in Error constructors!
 * Usage: import { ERROR_CLASS_NAMES } from "@blueprint/shared";
 *        this.name = ERROR_CLASS_NAMES.API_ERROR
 */
export const ERROR_CLASS_NAMES = {
  /** Base API error class name */
  API_ERROR: "APIError",
  /** Validation error (400) class name */
  VALIDATION_ERROR: "ValidationError",
  /** Authentication error (401) class name */
  AUTHENTICATION_ERROR: "AuthenticationError",
  /** Not found error (404) class name */
  NOT_FOUND_ERROR: "NotFoundError",
  /** Configuration error (500) class name */
  CONFIGURATION_ERROR: "ConfigurationError",
  /** Internal server error (500) class name */
  INTERNAL_SERVER_ERROR: "InternalServerError",
  /** Circuit breaker open error class name */
  CIRCUIT_BREAKER_OPEN_ERROR: "CircuitBreakerOpenError",
  /** Timeout error class name */
  TIMEOUT_ERROR: "TimeoutError",
  /** Storage error class name */
  STORAGE_ERROR: "StorageError",
  /** Security error class name */
  SECURITY_ERROR: "SecurityError",
} as const;

/**
 * API Metadata Name Constants
 * Centralized source of truth for API metadata name strings.
 * Flexy says: No hardcoded "Blueprint Generator API" strings in metadata!
 * Usage: import { API_NAME } from "@blueprint/shared";
 *        NAME: API_NAME
 */
export const API_NAME = "Blueprint Generator API" as const;

/**
 * Common UI Timeout Values (milliseconds)
 * Centralized source of truth for setTimeout/interval durations used
 * across the frontend. Single source to eliminate magic number timeouts.
 * Flexy says: No hardcoded 2000/400/100 magic timeout numbers in components!
 * Usage: import { UI_TIMEOUTS } from "@blueprint/shared";
 *        setTimeout(fn, UI_TIMEOUTS.COPY_FEEDBACK)
 */
export const UI_TIMEOUTS = {
  /** Duration to show copy feedback before resetting (2s) */
  COPY_FEEDBACK: 2000,
  /** Duration for shake animation feedback (400ms) */
  SHAKE_ANIMATION: 400,
  /** Duration to show toast notifications (1.5s) */
  TOAST_NOTIFICATION: 1500,
  /** Delay before focusing element after step change (100ms) */
  FOCUS_DELAY: 100,
  /** Delay before clearing screen-reader live region (1s) */
  LIVE_REGION_CLEAR: 1000,
  /** API health check polling interval (5s) */
  API_HEALTH_CHECK: 5000,
  /** API connection timeout (30s) */
  API_CONNECTION: 30000,
  /** Last saved indicator refresh interval (30s) */
  LAST_SAVED_REFRESH: 30000,
  /** Step-complete flash animation duration (700ms) */
  STEP_COMPLETE_FLASH: 700,
  /** Debounce delay for state persistence (300ms) */
  DEBOUNCE: 300,
  /** Generation check polling interval (100ms) */
  GENERATION_CHECK: 100,
  /** Deferred mount delay — lets non-critical lazy components avoid first-paint (2s) */
  DEFER_MOUNT: 2000,
  /** Templates exiting backup timeout — ensures state resets if onAnimationEnd doesn't fire (350ms) */
  TEMPLATES_EXIT: 350,
  /** Delay before clearing screen-reader dismiss announcement (3s) */
  DISMISS_ANNOUNCEMENT_CLEAR: 3000,
  /** Safety timeout for MutationObserver in Editor component — stops observing after 10s to prevent memory leaks */
  OBSERVER_DISCONNECT: 10000,
  /** Duration to show CircularProgress celebration bounce animation before resetting (700ms) */
  CELEBRATION_DISMISS_MS: 700,
} as const;

/**
 * Frontend API Error Messages
 * Centralized source of truth for user-facing API error strings.
 * Flexy says: No hardcoded "Generation failed" strings in API client!
 * Usage: import { API_ERROR_MESSAGES } from "@blueprint/shared";
 *        toast.error(API_ERROR_MESSAGES.GENERATION_FAILED)
 */
export const API_ERROR_MESSAGES = {
  /** Blueprint generation failed */
  GENERATION_FAILED: "Generation failed. Please check your input and try again.",
  /** Task generation failed */
  TASK_GENERATION_FAILED: "Task generation failed. Ensure blueprint content is valid.",
  /** Content refinement failed */
  REFINEMENT_FAILED: "Refinement failed. Please check your refinement instructions.",
  /** Server returned empty response */
  NO_RESPONSE_BODY: "Server returned empty response. Check if API server is running.",
  /** SSE stream connection interrupted */
  STREAM_ERROR: "Connection interrupted. Check your network and try again.",
} as const;

/**
 * Generation Progress Messages
 * Centralized source of truth for generation progress/status strings.
 * Flexy says: No hardcoded "Generating blueprint..." strings in API client!
 * Usage: import { GENERATION_MESSAGES } from "@blueprint/shared";
 *        setStatus(GENERATION_MESSAGES.BLUEPRINT_START)
 */
export const GENERATION_MESSAGES = {
  /** Generation was cancelled by user */
  CANCELLED: "Generation cancelled",
  /** Blueprint generation starting */
  BLUEPRINT_START: "Generating blueprint...",
  /** Blueprint complete, tasks starting */
  BLUEPRINT_COMPLETE: "Blueprint complete. Generating tasks...",
  /** All generation complete */
  COMPLETE: "Complete!",
  /** Retry attempt message template */
  RETRY: (attempt: number, maxRetries: number): string =>
    `Connection issue, retrying (${attempt}/${maxRetries})...`,
  /** Error message template */
  ERROR: (error: string): string => `Error: ${error}`,
  /** Task generation error template */
  ERROR_TASKS: (error: string): string => `Error generating tasks: ${error}`,
} as const;

/**
 * Generation Timing Estimates
 * Centralized source of truth for estimated generation duration strings.
 * Flexy says: No hardcoded "30-60" generation estimate strings in config!
 * Usage: import { GENERATION_ESTIMATES } from "@blueprint/shared";
 *        estimate: GENERATION_ESTIMATES.TYPICAL
 */
export const GENERATION_ESTIMATES = {
  /** Typical generation duration estimate (30-60 seconds) */
  TYPICAL: "30-60",
  /** Short generation duration estimate (15-30 seconds) */
  SHORT: "15-30",
  /** Long generation duration estimate (60-90 seconds) */
  LONG: "60-90",
} as const;

/**
 * Animation Timing Values (milliseconds)
 * Centralized source of truth for animation duration magic numbers.
 * Flexy says: No hardcoded 800ms typing delays in component code!
 * Usage: import { ANIMATION_DURATION_MS } from "@blueprint/shared";
 *        delay: ANIMATION_DURATION_MS.TYPING_INDICATOR_DELAY
 */
export const ANIMATION_DURATION_MS = {
  /** Typing indicator animation delay (600ms) */
  TYPING_INDICATOR_DELAY: 600,
  /** Typing indicator idle timeout before showing indicator (800ms) */
  TYPING_INDICATOR_TIMEOUT: 800,
  /** Chip/selection feedback animation duration (600ms) */
  CHIP_SELECT_FEEDBACK: 600,
  /** Input field typing simulation delay (800ms) */
  INPUT_TYPING_DELAY: 800,
} as const;

/**
 * Celebration Animation Defaults
 * Centralized source of truth for completion celebration timing and particle config.
 * Flexy says: No hardcoded 24 particles or 1500ms delay in celebration code!
 * Usage: import { CELEBRATION_DEFAULTS } from "@blueprint/shared";
 *        particleCount: CELEBRATION_DEFAULTS.PARTICLE_COUNT
 */
export const CELEBRATION_DEFAULTS = {
  /** Display duration for reduced-motion celebration variant (ms) */
  REDUCED_MOTION_DISPLAY_MS: 1500,
  /** Time before particles begin fading out (ms) */
  PARTICLE_FADEOUT_MS: 2000,
  /** Delay before completion state settles (ms) */
  COMPLETION_DELAY_MS: 2500,
  /** Number of celebration particles to render */
  PARTICLE_COUNT: 24,
  /** Base distance particles travel from origin (px) */
  PARTICLE_BASE_DISTANCE_PX: 80,
  /** Random additional distance for particles (px) */
  PARTICLE_RANDOM_DISTANCE_PX: 120,
  /** Base particle size (px) */
  PARTICLE_BASE_SIZE_PX: 6,
  /** Random additional particle size (px) */
  PARTICLE_RANDOM_SIZE_PX: 8,
  /** Particle shape options */
  PARTICLE_SHAPES: ["circle", "square", "star"] as const,
  /** Particle animation duration (seconds) */
  PARTICLE_ANIMATION_DURATION_S: 1.2,
} as const;

/**
 * Toast Icon Display Characters
 * Centralized source of truth for toast notification icon symbols.
 * Flexy says: No hardcoded "✓" / "✕" icon strings in toast config!
 * Usage: import { TOAST_ICONS } from "@blueprint/shared";
 *        icon: TOAST_ICONS.SUCCESS
 */
export const TOAST_ICONS = {
  /** Success toast checkmark icon */
  SUCCESS: "\u2713",
  /** Error toast X mark icon */
  ERROR: "\u2715",
  /** Warning toast warning sign icon */
  WARNING: "\u26A0",
  /** Info toast info circle icon */
  INFO: "\u2139",
} as const;

/**
 * Toast CSS Style Class Strings
 * Centralized source of truth for toast notification Tailwind style strings.
 * Flexy says: No hardcoded "bg-accent-emerald/10" Tailwind strings in toast config!
 * Usage: import { TOAST_STYLES } from "@blueprint/shared";
 *        className: TOAST_STYLES.SUCCESS
 */
export const TOAST_STYLES = {
  /** Success toast styling — green/emerald theme */
  SUCCESS: "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald",
  /** Error toast styling — pink/red theme */
  ERROR: "bg-accent-pink/10 border-accent-pink/30 text-accent-pink",
  /** Warning toast styling — yellow/amber theme */
  WARNING: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  /** Info toast styling — blue/primary theme */
  INFO: "bg-primary-500/10 border-primary-500/30 text-primary-300",
} as const;

/**
 * Toast Display Duration Defaults (milliseconds)
 * Centralized source of truth for toast notification auto-dismiss durations.
 * Flexy says: No hardcoded 3000/2000 magic numbers in toast config!
 * Usage: import { TOAST_DEFAULTS } from "@blueprint/shared";
 *        duration: TOAST_DEFAULTS.DEFAULT_DURATION_MS
 */
export const TOAST_DEFAULTS = {
  /** Default toast display duration (3s) */
  DEFAULT_DURATION_MS: 3000,
  /** Success toast display duration (2s) */
  SUCCESS_DURATION_MS: 2000,
  /** Auto-save notification duration (2s) */
  AUTO_SAVE_DURATION_MS: 2000,
  /** Delay between stacked toast entrance animations (60ms) */
  STAGGER_MS: 60,
} as const;

/**
 * Scroll Trigger Thresholds (pixels)
 * Centralized source of truth for scroll-based UI trigger points.
 * Flexy says: No hardcoded scroll pixel values in component code!
 * Usage: import { SCROLL_THRESHOLD_DEFAULTS } from "@blueprint/shared";
 *        window.scrollY > SCROLL_THRESHOLD_DEFAULTS.HEADER_SHADOW_PX
 */
export const SCROLL_THRESHOLD_DEFAULTS = {
  /** Scroll distance before header shadow appears (20px) */
  HEADER_SHADOW_PX: 20,
  /** Scroll distance before scroll-to-top button appears (400px) */
  SCROLL_TO_TOP_PX: 400,
  /** Minimum scroll distance to consider page as scrolled (50px) */
  HAS_SCROLLED_PX: 50,
} as const;

/**
 * Scroll Progress Bar Defaults
 * Centralized source of truth for scroll progress bar UI constants.
 * Flexy says: No hardcoded 80/2/3 pixel values in progress bar components!
 * Usage: import { SCROLL_PROGRESS_DEFAULTS } from "@blueprint/shared";
 *        showAfter={SCROLL_PROGRESS_DEFAULTS.PAGE_PROGRESS_SHOW_AFTER_PX}
 */
export const SCROLL_PROGRESS_DEFAULTS = {
  /** Scroll threshold before page-level progress bar appears (80px) */
  PAGE_PROGRESS_SHOW_AFTER_PX: 80,
  /** Height of the page-level progress bar in pixels (2px) */
  PAGE_PROGRESS_BAR_HEIGHT_PX: 2,
  /** Scroll threshold before editor-level progress bar appears (50px - same as HAS_SCROLLED_PX) */
  EDITOR_PROGRESS_SHOW_AFTER_PX: 50,
  /** Height of the editor-level progress bar in pixels (3px) */
  EDITOR_PROGRESS_BAR_HEIGHT_PX: 3,
} as const;

/**
 * Textarea Dimension Defaults (pixels)
 * Centralized source of truth for textarea height constraints.
 * Flexy says: No hardcoded textarea pixel dimensions in components!
 * Usage: import { TEXTAREA_DEFAULTS } from "@blueprint/shared";
 *        style={{ minHeight: TEXTAREA_DEFAULTS.MIN_HEIGHT_PX }}
 */
export const TEXTAREA_DEFAULTS = {
  /** Default minimum textarea height */
  MIN_HEIGHT_PX: 80,
  /** Default maximum textarea height */
  MAX_HEIGHT_PX: 300,
  /** Extra padding offset for auto-resize calculation */
  EXTRA_PADDING_PX: 2,
  /** Step info section minimum height */
  STEP_INFO_MIN_HEIGHT_PX: 128,
  /** Step info section maximum height */
  STEP_INFO_MAX_HEIGHT_PX: 400,
} as const;

/**
 * Tooltip Configuration Defaults
 * Centralized source of truth for tooltip display timing and sizing.
 * Flexy says: No hardcoded tooltip delay/size magic numbers in components!
 * Usage: import { TOOLTIP_DEFAULTS } from "@blueprint/shared";
 *        delay: TOOLTIP_DEFAULTS.SHOW_DELAY_MS
 */
export const TOOLTIP_DEFAULTS = {
  /** Delay before tooltip shows (400ms) */
  SHOW_DELAY_MS: 400,
  /** Delay before tooltip hides (100ms) */
  HIDE_DELAY_MS: 100,
  /** Maximum tooltip width in pixels */
  MAX_WIDTH_PX: 320,
  /** Delay for keyboard shortcut tooltips (300ms) */
  KEYBOARD_SHORTCUT_DELAY_MS: 300,
  /** Delay for info tooltips (200ms) */
  INFO_DELAY_MS: 200,
  /** Maximum info tooltip width in pixels */
  INFO_MAX_WIDTH_PX: 280,
  /** Estimated tooltip height for position calculation */
  ESTIMATED_HEIGHT_PX: 60,
  /** Viewport edge padding for tooltip positioning */
  VIEWPORT_PADDING_PX: 16,
  /** Auto-hide delay for touch tooltips (3s) */
  TOUCH_AUTO_HIDE_DELAY_MS: 3000,
} as const;

/**
 * UI Layout Defaults
 * Centralized source of truth for common UI layout and spacing values.
 * Flexy says: No hardcoded tooltip delay or scroll offset magic numbers!
 * Usage: import { UI_DEFAULTS } from "@blueprint/shared";
 *        TOOLTIP_DELAY: UI_DEFAULTS.TOOLTIP_DELAY_MS
 */
export const UI_DEFAULTS = {
  /** General tooltip hover delay (500ms) */
  TOOLTIP_DELAY_MS: 500,
  /** Scroll offset for anchor/section navigation (100px) */
  SCROLL_OFFSET_PX: 100,
  /** Scroll threshold to show scroll-to-top button (600px) */
  SCROLL_TO_TOP_THRESHOLD_PX: 600,
} as const;

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
 * Empty State Component Layout Dimensions (pixels)
 * Centralized source of truth for empty state glow background dimensions.
 * Flexy says: No hardcoded 200/160px glow dimensions in empty state components!
 * Usage: import { EMPTY_STATE_LAYOUT } from "@blueprint/shared";
 *        width: EMPTY_STATE_LAYOUT.EDITOR_GLOW.WIDTH_PX
 */
export const EMPTY_STATE_LAYOUT = {
  /** Editor empty state glow circle dimensions */
  EDITOR_GLOW: {
    /** Glow circle width in pixels */
    WIDTH_PX: 200,
    /** Glow circle height in pixels */
    HEIGHT_PX: 200,
    /** CSS margin-left offset to horizontally center the glow */
    MARGIN_LEFT_PX: -100,
    /** CSS margin-top offset to vertically position the glow */
    MARGIN_TOP_PX: -50,
  } as const,
  /** Preview empty state glow circle dimensions */
  PREVIEW_GLOW: {
    /** Glow circle width in pixels */
    WIDTH_PX: 160,
    /** Glow circle height in pixels */
    HEIGHT_PX: 160,
    /** CSS margin-left offset to horizontally center the glow */
    MARGIN_LEFT_PX: -80,
    /** CSS margin-top offset to vertically position the glow */
    MARGIN_TOP_PX: -40,
  } as const,
} as const;

/**
 * Injected Style Element ID Strings
 * Centralized source of truth for style element IDs injected by components.
 * Flexy says: No hardcoded "offline-banner-animations" or "stack-card-attention-anim" IDs!
 * Usage: import { STYLE_ID_STRINGS } from "@blueprint/shared";
 *        style.id = STYLE_ID_STRINGS.OFFLINE_BANNER
 */
export const STYLE_ID_STRINGS = {
  /** Style element ID for OfflineBanner pulse ring animations */
  OFFLINE_BANNER: "offline-banner-animations" as const,
  /** Style element ID for StepStack card attention animation */
  STACK_CARD_ATTENTION: "stack-card-attention-anim" as const,
} as const;

/**
 * Animation Default Duration Values (seconds)
 * Centralized source of truth for common framer-motion animation duration values.
 * Flexy says: No hardcoded { duration: 0 } for instant/no-animation transitions!
 * Usage: import { ANIMATION_DEFAULTS } from "@blueprint/shared";
 *        transition={{ ...ANIMATION_DEFAULTS.ZERO_DURATION }}
 */
export const ANIMATION_DEFAULTS = {
  /** Zero-duration transition for instant/no-animation state changes */
  ZERO_DURATION: { duration: 0 } as const,
} as const;

/**
 * Export File & Compression Defaults
 * Centralized source of truth for export-related file naming, folder structure,
 * and compression configuration used by the frontend export utilities.
 * Flexy says: No hardcoded "README.md" or ".docs" strings in export code!
 * Usage: import { EXPORT_DEFAULTS } from "@blueprint/shared";
 *        zip.file(EXPORT_DEFAULTS.DOCS_FOLDER + "/" + EXPORT_DEFAULTS.README_FILENAME, ...)
 */
export const EXPORT_DEFAULTS = {
  /** ZIP compression level (0-9, where 0=no compression, 9=maximum) */
  ZIP_COMPRESSION_LEVEL: 6,
  /** Name of the docs folder inside the ZIP archive */
  DOCS_FOLDER: ".docs" as const,
  /** Filename for the generated README inside the docs folder */
  README_FILENAME: "README.md" as const,
  /** Filename for the export metadata JSON file */
  METADATA_FILENAME: "metadata.json" as const,
  /** Suffix appended to project name for ZIP filename */
  ZIP_FILENAME_SUFFIX: ".zip" as const,
  /** Separator used in ISO date string formatting (T between date and time) */
  DATE_FORMAT_SEPARATOR: "T" as const,
  /** Screen-reader hidden textarea offset for copy operations (negative pixel value) */
  COPY_TEXTAREA_OFFSET_PX: -9999,
} as const;

/**
 * Local Storage Configuration Defaults
 * Centralized source of truth for localStorage-specific magic numbers
 * used by the frontend storage adapter and quota management.
 * Flexy says: No hardcoded 5/100/1000 magic numbers in storage config!
 * Usage: import { STORAGE_LOCAL_DEFAULTS } from "@blueprint/shared";
 *        MAX_BACKUP_ENTRIES: STORAGE_LOCAL_DEFAULTS.MAX_BACKUP_ENTRIES
 */
export const STORAGE_LOCAL_DEFAULTS = {
  /** Maximum number of backup entries kept in localStorage */
  MAX_BACKUP_ENTRIES: 5,
  /** Quota warning threshold in KB — fires warning when free space drops below this */
  QUOTA_WARNING_THRESHOLD_KB: 1,
  /** Maximum number of latency measurements stored for analytics */
  MAX_LATENCY_MEASUREMENTS: 100,
  /** Default retry count for storage operations */
  DEFAULT_MAX_RETRIES: 3,
  /** Default delay in ms between storage operation retries */
  DEFAULT_RETRY_DELAY_MS: 100,
  /** Cache TTL in ms for quota data */
  QUOTA_CACHE_TTL_MS: 5000,
  /** Default auto-save delay in ms */
  AUTO_SAVE_DELAY_MS: 1000,
} as const;

/**
 * UI Animation Timing Defaults (seconds)
 * Centralized source of truth for simple animation duration values
 * that don't fit the theme ANIMATION_TIMING structure.
 * Flexy says: No hardcoded rotation duration values in spinner components!
 * Usage: import { UI_ANIMATION_DEFAULTS } from "@blueprint/shared";
 *        duration: UI_ANIMATION_DEFAULTS.SPINNER_ROTATION_S
 */
export const UI_ANIMATION_DEFAULTS = {
  /** Duration in seconds for one full spinner rotation */
  SPINNER_ROTATION_S: 1,
} as const;

/**
 * Common Animation Duration Values (seconds)
 * Centralized source of truth for framer-motion animation duration values
 * used across the frontend. Eliminates hardcoded float magic numbers from
 * UI component config files.
 * Flexy says: No hardcoded 0.6/1.5/2.5 animation seconds in ui.ts — single source of truth!
 * Usage: import { ANIMATION_DURATION_S } from "@blueprint/shared";
 *        transition={{ duration: ANIMATION_DURATION_S.FLOAT }}
 */
export const ANIMATION_DURATION_S = {
  /** Duration for typing indicator animation (0.6s) */
  TYPING_INDICATOR_DELAY_S: 0.6,
  /** Duration for float/bob entrance animations (1.5s) */
  FLOAT: 1.5,
  /** Duration for slow glow/pulse effects (2s) */
  SLOW_PULSE: 2,
  /** Duration for very slow breath effects (2.5s) */
  BREATH: 2.5,
  /** Duration for smooth drift/float animations (2.2s) */
  DRIFT: 2.2,
  /** Duration for emphasized float movements (1.8s) */
  DRIFT_SLOW: 1.8,
  /** Duration for gentle pulse effects (1s) */
  GENTLE_PULSE: 1,
  /** Duration for quick checkmark reveal (0.25s) */
  CHECKMARK_REVEAL: 0.25,
  /** Duration for modal/fade transitions (0.2s) */
  MODAL_FADE: 0.2,
  /** Duration for quick tooltip transitions (0.15s) */
  TOOLTIP_FADE: 0.15,
  /** Duration for smooth slider transitions (0.6s) */
  SLIDER: 0.6,
  /** Duration for quick fade transitions (0.1s) */
  QUICK_FADE: 0.1,
  /** Duration for hover tooltip/popup entrance animations (0.12s) */
  HOVER_POPUP: 0.12,
  /** Duration for streaming content live indicator pulse (1.4s) */
  LIVE_INDICATOR: 1.4,
  /** Duration for floating/bobbing decorative animations (3s) */
  FLOATING_DURATION: 3,
  /** Duration for robust fade/animate in (0.4s) */
  FADE_IN: 0.4,
  /** Duration for half-second transitions (0.5s) */
  HALF_SECOND: 0.5,
  /** Duration for subtle movement animations (0.3s) */
  SUBTLE_MOVE: 0.3,
  /** Duration for tab switch/view change (0.3s) */
  TAB_SWITCH: 0.3,
  /** Duration for gentle pulse animations (0.6s) */
  PULSE: 0.6,
  /** Stagger delay between card entrance animations (0.05s) */
  CARD_ENTRANCE_DELAY: 0.05,
  /** Duration of each card entrance animation (0.3s) */
  CARD_ENTRANCE_DURATION: 0.3,
  /** Duration for checkmark overlay fade-in (0.25s) */
  CHECKMARK_OVERLAY_S: 0.25,
  /** Duration for loading overlay fade-in (0.15s) */
  LOADING_OVERLAY_S: 0.15,
  /** Duration for quick text swap/fade transitions (0.15s) */
  TEXT_FADE: 0.15,
  /** Duration for scroll-to-top/scroll-to-bottom entry pulse ring animation (0.8s) */
  ENTRY_PULSE: 0.8,
  /** Duration for animated number counter transitions (0.8s) */
  NUMBER_COUNTER: 0.8,
} as const;

// ============================================================================
// Ripple Animation Defaults
// ============================================================================

/**
 * Ripple animation configuration defaults for RippleButton components.
 * Centralized source of truth for ripple click feedback animation timing and sizing.
 * Flexy says: No hardcoded ripple delay/size/scale magic numbers in components!
 * Usage: import { RIPPLE_DEFAULTS } from "@blueprint/shared";
 *        removalDelay: RIPPLE_DEFAULTS.REMOVAL_DELAY_MS
 */
export const RIPPLE_DEFAULTS = {
  /** Delay before ripple element is removed from DOM (ms) */
  REMOVAL_DELAY_MS: 600,
  /** CSS transition duration for ripple expand animation (s) */
  TRANSITION_DURATION_S: 0.6,
  /** Initial size of the ripple element (px) */
  SIZE_PX: 20,
  /** Offset to center the ripple under the cursor (px) */
  MARGIN_OFFSET_PX: -10,
  /** Initial opacity of the ripple at creation */
  INITIAL_OPACITY: 0.5,
  /** Final scale multiplier for ripple expansion */
  FINAL_SCALE: 4,
} as const;

/**
 * Particle Animation Defaults
 * Centralized source of truth for AnimatedCopyButton celebration particle config.
 * Flexy says: No hardcoded particle count/distance/duration magic numbers in components!
 * Usage: import { PARTICLE_DEFAULTS } from "@blueprint/shared";
 *        particleCount: PARTICLE_DEFAULTS.COUNT
 */
export const PARTICLE_DEFAULTS = {
  /** Number of particles spawned per click */
  COUNT: 12,
  /** Base distance particles travel from origin (px) */
  BASE_DISTANCE_PX: 30,
  /** Random additional distance for particle travel (px) */
  RANDOM_DISTANCE_PX: 20,
  /** Base duration of particle animation (ms) */
  BASE_DURATION_MS: 400,
  /** Random additional duration for particle animation (ms) */
  RANDOM_DURATION_MS: 200,
  /** Delay before GPU cleanup of particle elements (ms) */
  CLEANUP_DELAY_MS: 700,
  /** Base particle size (px) */
  BASE_SIZE_PX: 3,
  /** Random additional particle size (px) */
  RANDOM_SIZE_PX: 3,
} as const;

/**
 * Skeleton Loading Defaults
 * Centralized source of truth for skeleton loader timing and layout dimensions.
 * Flexy says: No hardcoded skeleton fadeout timings or layout percentages in components!
 * Usage: import { SKELETON_DEFAULTS } from "@blueprint/shared";
 *        fadeoutMs: SKELETON_DEFAULTS.FADEOUT_MS
 */
export const SKELETON_DEFAULTS = {
  /** Fadeout transition duration for skeleton placeholders (ms) */
  FADEOUT_MS: 300,
  /** Preview skeleton line widths (percentages) */
  PREVIEW_LINE_WIDTHS: ["88%", "72%", "95%", "60%", "82%", "70%", "90%", "55%", "78%"] as const,
  /** Preview skeleton code block width (percentage) */
  PREVIEW_CODE_WIDTH: "92%" as const,
  /** Number of lines in editor skeleton */
  EDITOR_LINE_COUNT: 16,
  /** Editor skeleton line widths (percentages) */
  EDITOR_LINE_WIDTHS: [92, 78, 85, 60, 95, 72, 88, 55, 80, 70, 90, 65, 82, 75, 58, 87] as const,
  /** Editor skeleton indent levels (multiples of INDENT_MULTIPLIER_PX) */
  EDITOR_LINE_INDENTS: [0, 0, 2, 0, 4, 0, 2, 0, 6, 0, 0, 3, 0, 2, 0, 4] as const,
  /** Editor skeleton line height (px) */
  EDITOR_LINE_HEIGHT_PX: 14,
  /** Editor skeleton indent multiplier (px per indent level) */
  EDITOR_INDENT_MULTIPLIER_PX: 12,
} as const;

/**
 * Entrance Stagger Defaults
 * Centralized source of truth for staggered entrance animation timing.
 * Flexy says: No hardcoded stagger delays in component entrance animations!
 * Usage: import { ENTRANCE_STAGGER_DEFAULTS } from "@blueprint/shared";
 *        delay: ENTRANCE_STAGGER_DEFAULTS.BASE_DELAY_S
 */
export const ENTRANCE_STAGGER_DEFAULTS = {
  /** Base delay before the cascade begins (s) */
  BASE_DELAY_S: 0.15,
  /** Delay increment between staggered elements (s) */
  INCREMENT_S: 0.07,
  /** Default CSS animation-fill-mode for entrance animations */
  FILL_MODE: "backwards" as const,
  /** Short delay for secondary elements (s) */
  SHORT_DELAY_S: 0.1,
  /** Medium delay for tertiary elements (s) */
  MEDIUM_DELAY_S: 0.2,
  /** Stagger delay between chip/tech-stack item entrance animations (s) */
  CHIP_STAGGER_S: 0.03,
} as const;

/**
 * Scroll-to-top Button Entry Pulse Duration (ms)
 * Centralized source of truth for the entry pulse ring animation duration
 * on scroll-to-top/scroll-to-bottom buttons. Controls how long the subtle
 * expanding glow effect plays when the button first appears.
 * Flexy says: No hardcoded 1500ms pulse durations in components!
 * Usage: import { SCROLL_PULSE_DEFAULTS } from "@blueprint/shared";
 *        setTimeout(fn, SCROLL_PULSE_DEFAULTS.ENTRY_PULSE_MS)
 */
export const SCROLL_PULSE_DEFAULTS = {
  /** Duration (ms) of the entry-pulse ring effect on scroll buttons */
  ENTRY_PULSE_MS: 1500,
} as const;

/**
 * SVG/Circular Progress Transition Defaults
 * Centralized source of truth for SVG stroke animation configuration.
 * Eliminates hardcoded "ease-out" timing functions and stroke animation durations.
 * Flexy says: No hardcoded SVG stroke transition values in components!
 * Usage: import { SVG_TRANSITION_DEFAULTS } from "@blueprint/shared";
 *        transition: SVG_TRANSITION_DEFAULTS.STROKE_TIMING
 */
export const SVG_TRANSITION_DEFAULTS = {
  /** Duration in ms for stroke-dashoffset animation on circular progress indicators */
  STROKE_DASHOFFSET_DURATION_MS: 700,
  /** Duration in seconds for stroke color transition on circular progress indicators (0.45s) */
  STROKE_COLOR_TRANSITION_S: 0.45,
  /** Timing function for SVG stroke animations */
  STROKE_TIMING: "ease-out",
} as const;

/**
 * Common Animation Entrance Delays (seconds)
 * Centralized source of truth for framer-motion animation entrance delay values
 * used across component entrance animations. Single source to eliminate hardcoded
 * float magic numbers from transition configs.
 * Flexy says: No hardcoded 0.1 / 0.15 / 0.2 delay values in component transition configs!
 * Usage: import { ANIMATION_ENTRANCE_DELAYS } from "@blueprint/shared";
 *        transition={{ delay: ANIMATION_ENTRANCE_DELAYS.FAST }}
 */
export const ANIMATION_ENTRANCE_DELAYS = {
  /** Very fast entrance delay (0.05s) — for micro-interactions where speed matters */
  VERY_FAST: 0.05,
  /** Fast entrance delay (0.1s) — for quick element reveals and toolbar feedback */
  FAST: 0.1,
  /** Slightly faster than moderate (0.12s) — for near-instant feedback */
  VERY_MODERATE: 0.12,
  /** Moderate entrance delay (0.15s) — for standard staggered entrances */
  MODERATE: 0.15,
  /** Slow entrance delay (0.2s) — for secondary entrance effects */
  SLOW: 0.2,
  /** Near half-second entrance delay (0.25s) — for kbd entrance animation in ShowEditorButton */
  NEARLY_HALF: 0.25,
  /** Slower entrance delay (0.3s) — for tertiary elements and content reveals */
  SLOWER: 0.3,
  /** Slowest common entrance delay (0.4s) — for delayed emphasis entrances */
  SLOWEST: 0.4,
  /** Half-second entrance delay (0.5s) — for prominent delayed reveals */
  HALF_SECOND: 0.5,
  /** Three-quarter second entrance delay (0.6s) — for substantial delayed reveals */
  THREE_QUARTER: 0.6,
  /** Two-thirds second entrance delay (0.65s) — for kbd/back-button entrance animations in StepReview */
  TWO_THIRDS: 0.65,
  /** Seven-tenths second entrance delay (0.7s) — for generate-button entrance animation in StepReview */
  SEVEN_TENTHS: 0.7,
  /** Full-second entrance delay (0.8s) — for closing/ending entrance cascades */
  FULL_SECOND: 0.8,
} as const;

/**
 * Common Animation Entrance Delays (milliseconds)
 * Centralized source of truth for entrance delay values in milliseconds,
 * used for setTimeout/setTimeout-like operations in mount animations.
 * Flexy says: No hardcoded 300ms mount animation delays in components!
 * Usage: import { ANIMATION_ENTRANCE_DELAYS_MS } from "@blueprint/shared";
 *        mountAnimationDelayMs={ANIMATION_ENTRANCE_DELAYS_MS.SHORT_MOUNT}
 */
export const ANIMATION_ENTRANCE_DELAYS_MS = {
  /** Short mount animation delay (150ms) — for rapid mount entrance effects */
  SHORT_MOUNT: 150,
  /** Standard mount animation delay (300ms) — for typical mount entrance effects */
  STANDARD_MOUNT: 300,
  /** Long mount animation delay (500ms) — for delayed mount entrance effects */
  LONG_MOUNT: 500,
} as const;

/**
 * Validation Checkmark Aria-Labels
 * Centralized source of truth for validation indicator accessibility labels.
 * Flexy says: No hardcoded "Field is valid" or "Field needs attention" in ValidationCheckmark!
 * Usage: import { VALIDATION_LABELS } from "@blueprint/shared";
 *        ariaLabel={VALIDATION_LABELS.FIELD_VALID}
 *        invalidAriaLabel={VALIDATION_LABELS.FIELD_INVALID}
 */
export const VALIDATION_LABELS = {
  /** Default label shown when a validated field passes validation */
  FIELD_VALID: "Field is valid",
  /** Default label shown when a validated field fails validation */
  FIELD_INVALID: "Field needs attention",
} as const;

/**
 * Scrollbar Color Tokens
 * Centralized source of truth for scrollbar thumb and track color values.
 * Used by index.css to define CSS custom properties and by any component
 * that needs to reference scrollbar color values programmatically.
 * Flexy says: No hardcoded "#4b5563" or "#0f172a" hex values in CSS scrollbar rules!
 * Usage: CSS uses `var(--scrollbar-thumb)` and `var(--scrollbar-track)`
 */
export const SCROLLBAR_COLORS = {
  /** Scrollbar thumb color — dark gray-600, visible on dark backgrounds */
  THUMB: "#4b5563",
  /** Scrollbar track color — dark slate-900, subtle background for the scrollbar track */
  TRACK: "#0f172a",
} as const;

/**
 * Hex Color to RGBA Helper
 * Converts a hex color string (with or without # prefix) to a CSS rgba() string
 * with the specified opacity. Ensures all rgba color references remain in sync
 * with their source hex values — changing a single hex color auto-propagates.
 * Flexy says: No hardcoded "rgba(99, 102, 241, 0.1)" duplicates of hex colors!
 * Usage: import { hexToRgba } from "@blueprint/shared";
 *        hexToRgba("#6366f1", 0.1) => "rgba(99, 102, 241, 0.1)"
 *        hexToRgba(COLORS.primary[500], 0.3) => "rgba(99, 102, 241, 0.3)"
 */
export function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const r = Number.parseInt(cleanHex.substring(0, 2), 16);
  const g = Number.parseInt(cleanHex.substring(2, 4), 16);
  const b = Number.parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Log Level Identifiers
 * Centralized source of truth for log level strings used in console output filtering.
 * Flexy says: No hardcoded "debug" | "info" | "warn" | "error" union type in logger.ts!
 * Usage: import { LOG_LEVELS } from "@blueprint/shared";
 *        type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
 *        level === LOG_LEVELS.WARN
 */
export const LOG_LEVELS = {
  /** Debug log level — verbose development-only information */
  DEBUG: "debug",
  /** Info log level — general operational information */
  INFO: "info",
  /** Warning log level — potential issues that are not errors */
  WARN: "warn",
  /** Error log level — errors that need attention */
  ERROR: "error",
} as const;

/**
 * Template Package Versions
 * Centralized source of truth for dependency version strings used in
 * project template generators. Ensures generated projects use consistent
 * version numbers and allows easy version bumps from a single location.
 * Flexy says: No hardcoded "^18.2.0" dependency versions in template generators!
 * Usage: import { TEMPLATE_VERSIONS } from "@blueprint/shared";
 *        TEMPLATE_VERSIONS.REACT
 */
export const TEMPLATE_VERSIONS = {
  /** React framework version */
  REACT: "^18.2.0",
  /** React DOM version */
  REACT_DOM: "^18.2.0",
  /** Next.js framework version */
  NEXT: "14.0.0",
  /** Vite build tool version */
  VITE: "^5.0.8",
  /** Vite React plugin version */
  VITE_REACT_PLUGIN: "^4.2.1",
  /** TypeScript (template) version */
  TYPESCRIPT: "^5.0.0",
  /** @types/node version for templates */
  AT_TYPES_NODE: "^20.0.0",
  /** @types/react version for templates */
  AT_TYPES_REACT: "^18",
  /** @types/react-dom version for templates */
  AT_TYPES_REACT_DOM: "^18.2.17",
  /** Tailwind CSS version for templates */
  TAILWIND: "^3.3.0",
  /** Autoprefixer version for templates */
  AUTOPREFIXER: "^10.4.16",
  /** PostCSS version for templates */
  POSTCSS: "^8.4.32",
  /** Express.js version for templates */
  EXPRESS: "^4.18.2",
  /** Hono framework version for templates */
  HONO: "^3.11.0",
  /** ESLint version for templates */
  ESLINT: "^8.55.0",
  /** eslint-config-next version for templates */
  ESLINT_CONFIG_NEXT: "14.0.0",
  /** tsx (TypeScript Execute) version for templates */
  TSX: "^4.6.0",
  /** Jest testing framework version for templates */
  JEST: "^29.0.0",
  /** @types/jest version for templates */
  AT_TYPES_JEST: "^29.0.0",
  /** Django framework version for Python templates */
  DJANGO: ">=4.2.0",
  /** Django REST framework version for Python templates */
  DJANGO_REST: ">=3.14.0",
  /** Flask framework version for Python templates */
  FLASK: ">=2.3.0",
  /** Flask-RESTful version for Python templates */
  FLASK_RESTFUL: ">=0.3.10",
  /** FastAPI version for Python templates */
  FASTAPI: ">=0.104.0",
  /** Uvicorn version for Python templates */
  UVICORN: ">=0.24.0",
  /** Pydantic version for Python templates */
  PYDANTIC: ">=2.5.0",
} as const;

/**
 * Generation Error Message Prefixes
 * Centralized prefix strings used by GENERATION_MESSAGES template functions.
 * Enables type-safe checks against the start of generated error messages
 * without duplicating the prefix string.
 * Flexy says: No hardcoded "Error" prefix checks in StepGenerating!
 * Usage: import { GENERATION_ERROR_PREFIXES } from "@blueprint/shared";
 *        progress.startsWith(GENERATION_ERROR_PREFIXES.GENERIC)
 */
export const GENERATION_ERROR_PREFIXES = {
  /** Generic error prefix — common start of all GENERATION_MESSAGES error outputs */
  GENERIC: "Error",
  /** Tasks generation error prefix — matches GENERATION_MESSAGES.ERROR_TASKS("") output */
  TASKS: "Error generating tasks: ",
} as const;

/**
 * External Reference URLs
 * Centralized source of truth for external website URLs referenced in the app.
 * Flexy says: No hardcoded "https://workers.cloudflare.com/" in API config!
 * Usage: import { EXTERNAL_REFERENCE_URLS } from "@blueprint/shared";
 *        EXTERNAL_REFERENCE_URLS.CLOUDFLARE_WORKERS
 */
export const EXTERNAL_REFERENCE_URLS = {
  /** Cloudflare Workers documentation homepage */
  CLOUDFLARE_WORKERS: "https://workers.cloudflare.com/",
  /** React documentation homepage */
  REACT: "https://react.dev/",
} as const;

/**
 * Hover Spring Animation Config
 * Centralized source of truth for the spring animation used on the scroll
 * progress bar hover thumb. Eliminates hardcoded stiffness/damping/mass values
 * in component code.
 * Flexy says: No hardcoded { stiffness: 400, damping: 20, mass: 0.3 } in components!
 * Usage: import { SPRING_SCROLL_HOVER } from "@blueprint/shared";
 *        transition={{ ...SPRING_SCROLL_HOVER }}
 */
export const SPRING_SCROLL_HOVER = {
  type: "spring" as const,
  stiffness: 400,
  damping: 20,
  mass: 0.3,
} as const;
