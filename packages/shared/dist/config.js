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
};
