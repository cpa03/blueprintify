/**
 * Timeout Utilities
 *
 * Provides timeout wrappers for async operations using AbortController.
 * Ensures operations don't hang indefinitely and provides proper cleanup.
 *
 * @module utils/timeout
 */

import { ERROR_CLASS_NAMES } from "@blueprint/shared";
import { ERROR_MESSAGES } from "../config/constants";

/**
 * Configuration options for timeout behavior
 */
interface TimeoutOptions {
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
    super(message ?? ERROR_MESSAGES.TIMEOUT_OCCURRED(timeoutMs));
    this.name = ERROR_CLASS_NAMES.TIMEOUT_ERROR;
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

  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        controller.abort();
        reject(new TimeoutError(timeoutMs, errorMessage));
      }
    }, timeoutMs);

    // Start the operation. Whichever settles first (operation or timeout)
    // wins the race; the loser's rejection is silently ignored via settled flag.
    Promise.resolve(operation(signal)).then(
      (value) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeoutId);
          resolve(value);
        }
      },
      (error) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeoutId);
          reject(error);
        }
      }
    );
  });
}
