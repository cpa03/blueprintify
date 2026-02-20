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
 * Time Units Constants
 * Centralized time conversion values to avoid magic numbers
 */
export const TIME_UNITS = {
  /** Milliseconds per second */
  MS_PER_SECOND: 1000,
  /** Seconds per minute */
  SECONDS_PER_MINUTE: 60,
  /** Seconds per hour */
  SECONDS_PER_HOUR: 3600,
  /** Seconds per day */
  SECONDS_PER_DAY: 86400,
} as const;
