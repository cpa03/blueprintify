/**
 * API Configuration Constants
 *
 * Centralized configuration constants for the Blueprint Generator API.
 * Values are dynamically loaded from environment configuration via getters.
 *
 * @module config/constants
 */

import {
  RETRY_CONFIG as SHARED_RETRY_CONFIG,
  RETRYABLE_STATUS_CODES,
  SSE_CONFIG as SHARED_SSE_CONFIG,
  SSE_HEADERS as SHARED_SSE_HEADERS,
  HTTP_STATUS as SHARED_HTTP_STATUS,
  ID_GENERATION_CONFIG,
  ID_CHARS,
  ROUTE_PATHS as SHARED_ROUTE_PATHS,
  TIME_UNITS,
  BYTE_CONVERSION,
  SHARED_DEFAULTS,
  NETWORK_ERROR_CODES as SHARED_NETWORK_ERROR_CODES,
  CORS_DEFAULTS as SHARED_CORS_DEFAULTS,
} from "@blueprint/shared";
import type { EnvConfig } from "./env";
import {
  ARCHITECT_SYSTEM_TEMPLATE,
  TASK_SPLITTER_SYSTEM_TEMPLATE,
  REFINER_SYSTEM_TEMPLATE,
} from "./prompts";
import { MAX_INPUT_LENGTH } from "./prompt-security";

let envConfig: EnvConfig | null = null;

/**
 * Sets the environment configuration for use by constant getters.
 * Must be called during application initialization.
 *
 * @param config - Environment configuration object or null to reset
 */
export function setEnvConfig(config: EnvConfig | null): void {
  envConfig = config;
}

/**
 * Gets the current environment configuration.
 *
 * @returns The environment configuration object
 * @throws Error if configuration has not been set
 */
export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    throw new Error(
      "Environment config not set. Call setEnvConfig() first during application initialization. This typically happens automatically in the main entry point (index.ts)."
    );
  }
  return envConfig;
}

export const RETRY_CONFIG = SHARED_RETRY_CONFIG;

export const AI_CONFIG = {
  get DEFAULT_MODEL(): string {
    return getEnvConfig().OPENAI_MODEL;
  },
  get DEFAULT_TIMEOUT(): number {
    return getEnvConfig().OPENAI_TIMEOUT_MS;
  },
  get DEFAULT_MAX_TOKENS(): number {
    return getEnvConfig().OPENAI_MAX_TOKENS;
  },
  get DEFAULT_TEMPERATURE(): number {
    return getEnvConfig().OPENAI_TEMPERATURE;
  },
};

export const API_METADATA = {
  NAME: "Blueprint Generator API",
  get VERSION(): string {
    return getEnvConfig().API_VERSION;
  },
  STATUS: "healthy",
};

// API Endpoints configuration
// Uses shared ROUTE_PATHS as the single source of truth for paths
export const API_ENDPOINTS = {
  GENERATE: {
    path: SHARED_ROUTE_PATHS.GENERATE,
    method: "POST",
    description: "Generate blueprint",
  },
  TASKS: {
    path: SHARED_ROUTE_PATHS.TASKS,
    method: "POST",
    description: "Generate tasks",
  },
  REFINE: {
    path: SHARED_ROUTE_PATHS.REFINE,
    method: "POST",
    description: "Refine content",
  },
  EXPORT: {
    path: SHARED_ROUTE_PATHS.EXPORT,
    method: "POST",
    description: "Export project",
  },
  IMPORT: {
    path: SHARED_ROUTE_PATHS.IMPORT,
    method: "POST",
    description: "Import project",
  },
  STORAGE_QUOTA: {
    path: `${SHARED_ROUTE_PATHS.STORAGE}/quota`,
    method: "GET",
    description: "Get storage quota",
  },
  STORAGE_CLEAR: {
    path: `${SHARED_ROUTE_PATHS.STORAGE}/clear`,
    method: "DELETE",
    description: "Clear storage",
  },
  SHARE_CREATE: {
    path: SHARED_ROUTE_PATHS.SHARE,
    method: "POST",
    description: "Create shareable blueprint link",
  },
  SHARE_GET: {
    path: `${SHARED_ROUTE_PATHS.SHARE}/:id`,
    method: "GET",
    description: "Get shared blueprint by ID",
  },
  SHARE_DELETE: {
    path: `${SHARED_ROUTE_PATHS.SHARE}/:id`,
    method: "DELETE",
    description: "Delete shared blueprint",
  },
} as const;

export { RETRYABLE_STATUS_CODES };

export const RETRYABLE_ERROR_CODES = SHARED_NETWORK_ERROR_CODES;

// Error codes
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

// Error messages
export const ERROR_MESSAGES = {
  VALIDATION: "Request validation failed",
  NOT_FOUND: (route: string) => `Route not found: ${route}`,
  CONFIGURATION: "OpenAI API key not configured",
  NETWORK: "Network error occurred",
  AI_SERVICE: "AI service error",
  AI_SERVICE_UNAVAILABLE: "AI service temporarily unavailable",
  AI_SERVICE_FAILURE: (detail: string) => `AI service error: ${detail}`,
  INTERNAL: "Internal server error",
  INTERNAL_FALLBACK: "Unknown error occurred",
  AUTHENTICATION: "Authentication required",
  AUTHENTICATION_INVALID_KEY: "Invalid or missing API key",
  AUTHENTICATION_MISSING_CONFIG: "API_KEY is not configured. Server authentication is unavailable.",
  AUTHORIZATION: "Insufficient permissions",
  RATE_LIMIT: "Too many requests, please try again later",
  RATE_LIMITER_NOT_CONFIGURED: "Rate limiter not configured",
  CIRCUIT_BREAKER_OPEN: "Service temporarily unavailable, please try again later",
  CONTAINER_NOT_INITIALIZED:
    "DI Container not initialized. Call setDefaultContainer() before using services.",
  JSON_PARSE_FAILURE: (detail: string) => `Failed to parse JSON: ${detail}`,
  PLATFORM_UNKNOWN: "unknown",
  PLATFORM_RUNTIME: "cloudflare-workers",
  SSE_UNKNOWN_ERROR: "Unknown error",
  TIMEOUT_MESSAGE: (elapsed: number, timeout: number) =>
    `Retry operation timed out after ${elapsed}ms (timeout: ${timeout}ms)`,
  UNKNOWN_ERROR: "Unknown error",

  // Circuit breaker errors
  /** Circuit breaker is open - service unavailable */
  CIRCUIT_BREAKER_OPEN_MESSAGE: "Circuit breaker is OPEN",
  /** Circuit breaker is half-open and max test calls reached */
  CIRCUIT_BREAKER_HALF_OPEN_MAX: "Circuit breaker is HALF_OPEN - max calls reached",

  // Timeout errors
  /** Default message template when an operation times out */
  TIMEOUT_OCCURRED: (timeoutMs: number) => `Operation timed out after ${timeoutMs}ms`,
} as const;

// Default error messages for error classes
// Flexy says: Reference ERROR_MESSAGES where identical to eliminate duplication
export const DEFAULT_ERROR_MESSAGES = {
  VALIDATION: ERROR_MESSAGES.VALIDATION,
  AUTHENTICATION: ERROR_MESSAGES.AUTHENTICATION,
  AUTHORIZATION: ERROR_MESSAGES.AUTHORIZATION,
  NOT_FOUND: "Resource not found",
  CONFIGURATION: "Service configuration error",
  NETWORK: ERROR_MESSAGES.NETWORK,
  AI_SERVICE: ERROR_MESSAGES.AI_SERVICE,
  INTERNAL: ERROR_MESSAGES.INTERNAL,
} as const;

export const PROMPT_CONFIG = {
  ARCHITECT_SYSTEM: ARCHITECT_SYSTEM_TEMPLATE,
  TASK_SPLITTER_SYSTEM: TASK_SPLITTER_SYSTEM_TEMPLATE,
  REFINER_SYSTEM: REFINER_SYSTEM_TEMPLATE,
};

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
 * API Headers Configuration
 * Flexy says: No hardcoded header strings - everything in config!
 */
export const API_HEADERS = {
  /** Custom headers for API identification and tracing */
  CUSTOM: {
    /** API key authentication header */
    API_KEY: "x-api-key",
    /** Request tracing identifier */
    REQUEST_ID: "x-request-id",
  },
  /** Standard cache-control directives */
  CACHE_CONTROL: {
    /** The header name for Cache-Control */
    HEADER_NAME: "Cache-Control",
    /** Public cache directive with only max-age */
    PUBLIC_MAX_AGE: (maxAge: number): string => `public, max-age=${maxAge}`,
    /** Public cache directive with max-age and stale-while-revalidate */
    PUBLIC_WITH_REVALIDATE: (maxAge: number, staleWhileRevalidate: number): string =>
      `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  },
  /** CDN-specific cache headers */
  CDN: {
    /** Cloudflare CDN cache control header name */
    CLOUDFLARE_CACHE_CONTROL: "Cloudflare-CDN-Cache-Control",
    /** Standard CDN cache control header name */
    CDN_CACHE_CONTROL: "CDN-Cache-Control",
  },
  /** Server timing header */
  SERVER_TIMING: {
    HEADER: "Server-Timing",
    /** Format a server-timing entry */
    ENTRY: (name: string, description: string, duration: number): string =>
      `${name};desc="${description}";dur=${duration}`,
  },
  /** SSE-specific headers for streaming responses */
  SSE: {
    /** Nginx buffering disable header */
    X_ACCEL_BUFFERING: "X-Accel-Buffering",
    /** Value to disable Nginx buffering */
    X_ACCEL_BUFFERING_NO: "no",
  },

  /** Security-related HTTP headers */
  SECURITY: {
    /** Cross-Origin-Opener-Policy header name */
    CROSS_ORIGIN_OPENER_POLICY: "Cross-Origin-Opener-Policy",
    /** Cross-Origin-Resource-Policy header name */
    CROSS_ORIGIN_RESOURCE_POLICY: "Cross-Origin-Resource-Policy",
    /** Same-origin policy value */
    SAME_ORIGIN: "same-origin",
  },

  /** CF properties from request headers */
  CF_PROPERTIES: {
    /** Cloudflare request country header */
    IP_COUNTRY: "cf-ipcountry",
    /** Cloudflare Ray ID for request tracing */
    RAY_ID: "cf-ray",
    /** Cloudflare connecting IP */
    CONNECTING_IP: "cf-connecting-ip",
    /** Cloudflare client city */
    CITY: "cf-ipcity",
    /** Cloudflare worker datacenter */
    DATACENTER: "cf-worker-dc",
  },
  /** Standard HTTP request headers used by middleware */
  REQUEST: {
    /** Forwarded-for IP header */
    FORWARDED_FOR: "x-forwarded-for",
    /** User agent header */
    USER_AGENT: "user-agent",
    /** Content type header */
    CONTENT_TYPE: "content-type",
    /** Content length header */
    CONTENT_LENGTH: "content-length",
  },
  /** Standard HTTP connection header */
  CONNECTION: "Connection",
  /** Standard HTTP content type header */
  CONTENT_TYPE: "Content-Type",
  /** Standard HTTP response headers set by middleware */
  RESPONSE: {
    /** Request ID for distributed tracing */
    REQUEST_ID: "X-Request-ID",
    /** Response time in milliseconds */
    RESPONSE_TIME: "X-Response-Time",
    /** Cloudflare Ray ID response header */
    CF_RAY: "X-CF-Ray",
  },
  /** Rate limiting response headers */
  RATE_LIMIT: {
    /** Maximum requests allowed in window */
    LIMIT: "X-RateLimit-Limit",
    /** Remaining requests in current window */
    REMAINING: "X-RateLimit-Remaining",
    /** Timestamp when rate limit resets */
    RESET: "X-RateLimit-Reset",
    /** Seconds until client can retry */
    RETRY_AFTER: "Retry-After",
  },
} as const;

export const CIRCUIT_BREAKER_CONFIG = {
  get DEFAULT_FAILURE_THRESHOLD(): number {
    return getEnvConfig().CIRCUIT_BREAKER_FAILURE_THRESHOLD;
  },
  get DEFAULT_RESET_TIMEOUT_MS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_RESET_TIMEOUT_MS;
  },
  get DEFAULT_HALF_OPEN_MAX_CALLS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS;
  },
  get DEFAULT_COLD_START_WINDOW_MS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_COLD_START_WINDOW_MS;
  },
};

export { SHARED_SSE_CONFIG as SSE_CONFIG, SHARED_SSE_HEADERS as SSE_HEADERS };

/**
 * Database ID Generation Configuration
 * Flexy says: No hardcoded strings - everything in config!
 */
export const DB_ID_CONFIG = {
  /** Characters used for generating secure random IDs */
  ID_CHARS: ID_CHARS.LOWERCASE,
  /** Prefixes for different entity types */
  ID_PREFIXES: {
    USER: "user",
    PROJECT: "project",
    BLUEPRINT: "blueprint",
    TASK: "task",
    TEMPLATE: "template",
    ANALYTICS: "analytics",
    SESSION: "session",
  } as const,
  /** Default limit for popular templates query */
  DEFAULT_POPULAR_LIMIT: 10,
  /** String length for random ID portion (uses shared config) */
  RANDOM_STRING_LENGTH: ID_GENERATION_CONFIG.RANDOM_STRING_LENGTH,
} as const;

/**
 * Storage KV Configuration
 * Flexible: KV key + TTL, no hardcoded strings!
 */
export const STORAGE_KV_CONFIG = {
  QUOTA_KEY: "storage:quota",
  /** TTL for storage reports in seconds (30 days) */
  REPORT_TTL_SECONDS: TIME_UNITS.SECONDS_PER_DAY * 30,
} as const;

/**
 * Prompt Input Configuration
 * Centralized limits for prompt sanitization
 */
export const PROMPT_INPUT_CONFIG = {
  MAX_LENGTH: MAX_INPUT_LENGTH,
  USER_DELIMITER_START: "<user_input>",
  USER_DELIMITER_END: "</user_input>",
} as const;

/**
 * SSE CORS headers for streaming responses
 * Flexy says: No hardcoded CORS header strings - everything in config!
 */
export const SSE_CORS_HEADERS = {
  ACCESS_CONTROL_ALLOW_ORIGIN: "Access-Control-Allow-Origin",
  ACCESS_CONTROL_ALLOW_METHODS: "Access-Control-Allow-Methods",
  ACCESS_CONTROL_ALLOW_HEADERS: "Access-Control-Allow-Headers",
} as const;

/**
 * Export template builders
 * Flexy says: No hardcoded template strings - everything in config!
 */
export const EXPORT_TEMPLATES = {
  MARKDOWN: {
    HEADER: (projectName: string): string => `# ${projectName}\n\n`,
    EXPORTED_LINE: (timestamp: string): string => `Exported: ${timestamp}\n\n`,
    BLUEPRINT_SECTION: (blueprint: string): string => `## Blueprint\n\n${blueprint}\n\n`,
    TASKS_SECTION: (tasks: string): string => `## Tasks\n\n${tasks}\n\n`,
  },
} as const;

/**
 * Body Size Limits Configuration
 * Flexy says: extracted from middleware/bodyLimit.ts for shared access
 */
export const BODY_SIZE_LIMITS = {
  /** Default maximum body size: 1MB - reasonable for JSON API requests */
  DEFAULT_MB: 1,
  /** Strict limit: 100KB - for text-only endpoints */
  STRICT_KB: 100,
  /** Lenient limit: 10MB - for file upload endpoints */
  LENIENT_MB: 10,
} as const;

/** Bytes per kilobyte (from shared single source of truth) */
export const KB = BYTE_CONVERSION.KB;
/** Bytes per megabyte (from shared single source of truth) */
export const MB = BYTE_CONVERSION.MB;

/** Pre-computed body size limits */
export const BODY_SIZE_MAX = {
  DEFAULT: BODY_SIZE_LIMITS.DEFAULT_MB * MB,
  STRICT: BODY_SIZE_LIMITS.STRICT_KB * KB,
  LENIENT: BODY_SIZE_LIMITS.LENIENT_MB * MB,
} as const;

// HTTP Status codes
export const HTTP_STATUS = SHARED_HTTP_STATUS;

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUEST_VALIDATION_FAILED: "Request validation failed",
  INVALID_JSON_BODY: "Invalid JSON in request body",
  VALIDATION_ERROR: "Validation error",
  BODY_TOO_LARGE: (maxSize: number) =>
    `Request body too large. Maximum allowed size is ${maxSize} bytes.`,
} as const;

// Configuration messages
export const CONFIG_MESSAGES = {
  OPENAI_API_KEY_MISSING: "OpenAI API key not configured",
  VALIDATED_DATA_NOT_FOUND: "Validated data not found in context",
} as const;

// Retry logic configuration
export const RETRY_LOGIC = {
  RATE_LIMIT_STATUS: SHARED_HTTP_STATUS.TOO_MANY_REQUESTS,
  SERVER_ERROR_THRESHOLD: SHARED_HTTP_STATUS.INTERNAL_ERROR,
} as const;

export const CACHE_CONFIG = {
  /** Root cache: 1 minute */
  ROOT_MAX_AGE: TIME_UNITS.SECONDS_PER_MINUTE,
  /** Root stale-while-revalidate: 30 seconds */
  ROOT_STALE_WHILE_REVALIDATE: TIME_UNITS.SECONDS_PER_MINUTE / 2,
  /** Share route cache: 5 minutes */
  SHARE_MAX_AGE: TIME_UNITS.SECONDS_PER_MINUTE * 5,
  /** Share route cache stale-while-revalidate: 1 hour */
  SHARE_STALE_WHILE_REVALIDATE: TIME_UNITS.SECONDS_PER_HOUR,
  /** CDN cache control format template */
  CDN_MAX_AGE_FORMAT: "public, max-age=",
} as const;

// Route paths - re-exported from shared package as single source of truth
export { SHARED_ROUTE_PATHS as ROUTE_PATHS };

export const RATE_LIMIT_CONFIG = {
  get WINDOW_MS(): number {
    return getEnvConfig().RATE_LIMIT_WINDOW_MS;
  },
  get STRICT_MAX(): number {
    return getEnvConfig().RATE_LIMIT_STRICT_MAX;
  },
  get STANDARD_MAX(): number {
    return getEnvConfig().RATE_LIMIT_STANDARD_MAX;
  },
  get LENIENT_MAX(): number {
    return getEnvConfig().RATE_LIMIT_LENIENT_MAX;
  },
};

export const STORAGE_CONFIG = {
  get QUOTA_MB(): number {
    return getEnvConfig().STORAGE_QUOTA_MB;
  },
  get QUOTA_BYTES(): number {
    return getEnvConfig().STORAGE_QUOTA_MB * BYTE_CONVERSION.MB;
  },
};

export const EXTERNAL_URLS = {
  get GITHUB(): string {
    return getEnvConfig().GITHUB_URL;
  },
  get PROJECT_HOMEPAGE(): string {
    return getEnvConfig().PROJECT_HOMEPAGE_URL;
  },
};

export const SHARE_CONFIG = {
  ID_LENGTH: 12,
  ALPHANUMERIC_CHARS: ID_CHARS.FULL,
  EXPIRATION_DAYS: 30,
  TITLE_MAX_LENGTH: 200,
  BLUEPRINT_MAX_LENGTH: 50000,
} as const;

// Share route error messages
export const SHARE_ERROR_MESSAGES = {
  DATABASE_NOT_CONFIGURED: "Database not configured",
  INVALID_SHARE_ID_FORMAT: "Invalid share ID format",
  SHARE_NOT_FOUND_OR_EXPIRED: "Shared blueprint not found or expired",
  SHARE_EXPIRED: "Shared blueprint has expired",
  SHARE_DELETED_SUCCESSFULLY: "Share deleted successfully",
} as const;

// Storage route messages
export const STORAGE_MESSAGES = {
  /** Note displayed in quota response */
  QUOTA_NOTE:
    "Server-side storage tracking. Client-side storage quota available via localStorage API.",
  /** Error when confirmation is not provided for clear operation */
  CONFIRMATION_REQUIRED: "Confirmation required to clear storage",
  /** Success message after clearing storage */
  CLEAR_SUCCESS:
    "Server-side storage cleared. Client-side storage must be cleared via localStorage API.",
} as const;

// Import route configuration
export const IMPORT_CONFIG = {
  /** Default project name when no name can be extracted from imported content */
  DEFAULT_PROJECT_NAME: "Imported Project",
  /** Expected import data version */
  EXPECTED_VERSION: SHARED_DEFAULTS.API_VERSION,
} as const;

export const IMPORT_REGEX = {
  PROJECT_NAME: /^#[^#](.+)$/m,
  BLUEPRINT_SECTION: /## Blueprint\s*\n\n?([\s\S]*?)(?=\n## |$)/,
  TASKS_SECTION: /## Tasks\s*\n\n?([\s\S]*?)(?=\n## |$)/,
} as const;

export const IMPORT_ERROR_MESSAGES = {
  MISSING_REQUIRED_FIELDS: "Invalid import data: missing required fields (projectName, blueprint)",
  INVALID_JSON_FORMAT: "Invalid JSON format",
  MISSING_BLUEPRINT_CONTENT: "Invalid markdown format: could not extract blueprint content",
  UNSUPPORTED_FORMAT: (format: string) => `Unsupported import format: ${format}`,
  IMPORT_FAILED: "Import failed",
} as const;

export const EXPORT_ERROR_MESSAGES = {
  UNSUPPORTED_FORMAT: (format: string) => `Unsupported export format: ${format}`,
  EXPORT_FAILED: "Export failed",
} as const;

// Logger middleware configuration
export const LOGGER_CONFIG = {
  /** Length of random suffix in request ID (e.g., timestamp-abc1234 -> 4 chars) */
  REQUEST_ID_SUFFIX_LENGTH: 4,
  /** Default paths excluded from request logging */
  DEFAULT_EXCLUDE_PATHS: [SHARED_ROUTE_PATHS.ROOT] as const,
  SANITIZED_HEADER_EXCLUDE: ["authorization", "cookie"] as const,
  UNPARSABLE_BODY: "[unparsable]",
} as const;

export const RATE_LIMIT_CONSTANTS = {
  ANONYMOUS_CLIENT_KEY: "anonymous",
  LIMITER_BINDINGS: {
    STRICT: "STRICT_RATE_LIMITER",
    STANDARD: "STANDARD_RATE_LIMITER",
    LENIENT: "LENIENT_RATE_LIMITER",
  },
} as const;
