/**
 * Shared constants and configuration
 * Centralized configuration used across frontend and backend
 */
/**
 * Retry Configuration
 * Shared retry settings for API calls
 */
export declare const RETRY_CONFIG: {
    readonly DEFAULT_RETRIES: 3;
    readonly DEFAULT_INITIAL_DELAY: 1000;
    readonly DEFAULT_BACKOFF_FACTOR: 2;
    readonly DEFAULT_MAX_DELAY: 10000;
};
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
