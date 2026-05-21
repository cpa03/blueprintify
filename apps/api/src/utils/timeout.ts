/**
 * Timeout Utilities
 *
 * Provides timeout wrappers for async operations using AbortController.
 * Ensures operations don't hang indefinitely and provides proper cleanup.
 *
 * @module utils/timeout
 */

import { RETRY_CONFIG } from "../config/constants";

/**
 * Configuration options for timeout behavior
 */
export interface TimeoutOptions {
  /** Timeout duration in milliseconds */
  timeoutMs: number;
  /** Custom error message for timeout */
  errorMessage?: string;
}

/**
 * Error thrown when an operation times out
 */
export class TimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number, message?: string) {
    super(message ?? `Operation timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Wraps an async operation with a timeout using AbortController.
 * Automatically aborts the operation if it exceeds the specified duration.
 *
 * @param operation - Async function to execute with timeout protection
 * @param options - Timeout configuration options
 * @returns Promise resolving to the operation result
 * @throws {TimeoutError} When the operation exceeds the timeout
 * @throws {Error} Re-throws any error from the operation
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await withTimeout(
 *   () => fetchData(),
 *   { timeoutMs: 5000 }
 * );
 *
 * // With AbortSignal support
 * const result = await withTimeout(
 *   async (signal) => {
 *     const response = await fetch(url, { signal });
 *     return response.json();
 *   },
 *   { timeoutMs: 10000 }
 * );
 * ```
 */
export async function withTimeout<T>(
  operation: (signal?: AbortSignal) => Promise<T>,
  options: TimeoutOptions
): Promise<T> {
  const { timeoutMs, errorMessage } = options;
  const controller = new AbortController();
  const { signal } = controller;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let settled = false;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      if (!settled) {
        controller.abort();
        reject(new TimeoutError(timeoutMs, errorMessage));
      }
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([operation(signal), timeoutPromise]);
    settled = true;
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    return result;
  } catch (error) {
    settled = true;
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    if (error instanceof TimeoutError) {
      throw error;
    }
    throw error;
  }
}

/**
 * Creates a timeout wrapper with pre-configured options.
 * Useful for creating consistent timeout behavior across multiple operations.
 *
 * @typeParam T - The return type of the wrapped operation
 * @param defaultOptions - Default timeout options to use
 * @returns A function that wraps operations with the configured timeout
 *
 * @example
 * ```typescript
 * const withApiTimeout = createTimeoutWrapper({ timeoutMs: 5000 });
 *
 * // All operations will use 5s timeout with preserved type inference
 * const result = await withApiTimeout(() => fetchData()); // result is typed
 * ```
 */
export function createTimeoutWrapper<T = unknown>(
  defaultOptions: Omit<TimeoutOptions, "timeoutMs"> & { timeoutMs: number }
): (operation: (signal?: AbortSignal) => Promise<T>) => Promise<T> {
  return (operation) => withTimeout(operation, defaultOptions);
}

/**
 * Combines timeout with retry logic for resilient operations.
 * Each retry attempt is subject to the timeout.
 *
 * @param operation - Async function to execute
 * @param options - Combined timeout and retry options
 * @returns Promise resolving to the operation result
 */
export interface TimeoutRetryOptions extends TimeoutOptions {
  /** Maximum number of retry attempts */
  retries?: number;
  /** Delay between retries in milliseconds */
  retryDelayMs?: number;
}

export async function withTimeoutAndRetry<T>(
  operation: (signal?: AbortSignal) => Promise<T>,
  options: TimeoutRetryOptions
): Promise<T> {
  const {
    timeoutMs,
    errorMessage,
    retries = 0,
    retryDelayMs = RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout(operation, { timeoutMs, errorMessage });
    } catch (error) {
      lastError = error;

      // Don't retry on timeout errors if we have no retries left
      if (attempt === retries) {
        break;
      }

      // Wait before retrying
      if (retryDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  throw lastError;
}
