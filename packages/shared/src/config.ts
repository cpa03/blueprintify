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
