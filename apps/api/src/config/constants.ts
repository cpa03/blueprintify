/**
 * API configuration constants
 */

// Retry configuration
export const RETRY_CONFIG = {
  DEFAULT_RETRIES: 3,
  DEFAULT_INITIAL_DELAY: 1000,
  DEFAULT_BACKOFF_FACTOR: 2,
  DEFAULT_MAX_DELAY: 30000,
} as const;

// AI service configuration
export const AI_CONFIG = {
  DEFAULT_MODEL: "gpt-4o-mini",
  DEFAULT_TIMEOUT: 60000,
  DEFAULT_MAX_TOKENS: 4000,
  DEFAULT_TEMPERATURE: 0.7,
} as const;
