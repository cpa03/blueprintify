/**
 * Retry Utilities
 * Provides exponential backoff retry logic for resilient API operations.
 * Automatically retries on transient failures like rate limits and server errors.
 */

import {
  RETRY_CONFIG,
  RETRYABLE_ERROR_CODES,
  RETRY_LOGIC,
} from "../config/constants";
import { getConfig } from "../config/env";
import { TimeoutError } from "./timeout";

/**
 * Configuration options for retry behavior
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default from RETRY_CONFIG) */
  retries?: number;
  /** Initial delay in milliseconds before first retry */
  initialDelay?: number;
  /** Multiplier for exponential backoff between retries */
  backoffFactor?: number;
  /** Maximum delay cap in milliseconds (prevents unbounded growth) */
  maxDelay?: number;
  /** Optional callback invoked on each retry attempt */
  onRetry?: (error: unknown, attempt: number) => void;
  /**
   * Optional overall timeout in milliseconds for the entire retry operation.
   * If the total elapsed time (including retries and delays) exceeds this value,
   * a TimeoutError is thrown. This prevents retry loops from extending indefinitely.
   * @since 2026-02-22
   */
  timeout?: number;
}

/**
 * Executes an operation with automatic retry on transient failures.
 * Uses exponential backoff to avoid overwhelming failing services.
 *
 * @param operation - Async function to execute with retry support
 * @param options - Optional retry configuration overrides
 * @returns Promise resolving to the operation result
 * @throws {TimeoutError} When the overall timeout is exceeded
 * @throws The last error if all retry attempts fail
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await withRetry(
 *   () => fetchExternalAPI(),
 *   { retries: 3, initialDelay: 1000, backoffFactor: 2 }
 * );
 *
 * // With overall timeout
 * const result = await withRetry(
 *   () => fetchExternalAPI(),
 *   { retries: 3, timeout: 30000 } // Max 30s for all attempts
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
    maxDelay = getConfig().RETRY_MAX_DELAY_MS,
    onRetry,
    timeout,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;
  const startTime = timeout !== undefined ? Date.now() : 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Check overall timeout before each attempt
    if (timeout !== undefined) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        throw new TimeoutError(
          timeout,
          `Retry operation timed out after ${elapsed}ms (timeout: ${timeout}ms)`,
        );
      }
    }

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

      // Check if delay would exceed timeout
      if (timeout !== undefined) {
        const elapsed = Date.now() - startTime;
        if (elapsed + delay >= timeout) {
          throw new TimeoutError(
            timeout,
            `Retry operation timed out after ${elapsed}ms (timeout: ${timeout}ms)`,
          );
        }
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Determines if an error is retryable based on its properties.
 *
 * Checks for retryable conditions:
 * - HTTP status codes indicating rate limiting (429) or server errors (5xx)
 * - Network error codes indicating transient failures (ECONNRESET, ETIMEDOUT, etc.)
 *
 * @param error - The error to evaluate (can be any type)
 * @returns True if the error indicates a transient failure that should be retried
 *
 * @example
 * ```typescript
 * if (isRetryableError(error)) {
 *   // Wait and retry the operation
 * }
 * ```
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
