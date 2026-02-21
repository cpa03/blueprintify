/**
 * Retry Utilities
 * Provides exponential backoff retry logic for resilient API operations.
 * Automatically retries on transient failures like rate limits and server errors.
 *
 * @module utils/retry
 */

import {
  RETRY_CONFIG,
  RETRYABLE_ERROR_CODES,
  RETRY_LOGIC,
} from "../config/constants";

/**
 * Configuration options for retry behavior.
 *
 * @property retries - Maximum number of retry attempts (default from RETRY_CONFIG)
 * @property initialDelay - Initial delay in milliseconds before first retry
 * @property backoffFactor - Multiplier for exponential backoff between retries
 * @property onRetry - Optional callback invoked on each retry attempt
 */
export interface RetryOptions {
  retries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  onRetry?: (error: unknown, attempt: number) => void;
}

/**
 * Executes an operation with automatic retry on transient failures.
 * Uses exponential backoff to avoid overwhelming failing services.
 *
 * @param operation - Async function to execute with retry support
 * @param options - Optional retry configuration overrides
 * @returns Promise resolving to the operation result
 * @throws The last error if all retry attempts fail or error is non-retryable
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchExternalAPI(),
 *   { retries: 3, initialDelay: 1000, backoffFactor: 2 }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = RETRY_CONFIG.DEFAULT_RETRIES,
    initialDelay = RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
    backoffFactor = RETRY_CONFIG.DEFAULT_BACKOFF_FACTOR,
    onRetry,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      const shouldRetry = isRetryableError(error);

      if (!shouldRetry) {
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt + 1);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }

  throw lastError;
}

/**
 * Determines if an error is retryable based on status code or error code.
 *
 * Retryable conditions:
 * - HTTP 429 (rate limit)
 * - HTTP 5xx (server errors)
 * - Network error codes (ECONNRESET, ETIMEDOUT, etc.)
 *
 * @param error - The error to check
 * @returns True if the error is retryable, false otherwise
 */
function isRetryableError(error: unknown): boolean {
  if (!error) return true;

  const status =
    (error as { status?: number; response?: { status?: number } }).status ||
    (error as { response?: { status?: number } }).response?.status;

  if (status) {
    return (
      status === RETRY_LOGIC.RATE_LIMIT_STATUS ||
      status >= RETRY_LOGIC.SERVER_ERROR_THRESHOLD
    );
  }

  const errorCode = (error as { code?: string }).code;
  return RETRYABLE_ERROR_CODES.includes(
    (errorCode as (typeof RETRYABLE_ERROR_CODES)[number]) ||
      ("" as (typeof RETRYABLE_ERROR_CODES)[number]),
  );
}
