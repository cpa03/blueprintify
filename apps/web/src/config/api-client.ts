/**
 * API Client Configuration Module
 *
 * Centralized configuration for the API client library.
 * Flexy says: No hardcoded values - everything configurable and modular!
 *
 * @module config/api-client
 */

import {
  RETRY_CONFIG,
  HTTP_HEADERS,
  RETRYABLE_STATUS_CODES,
  HTTP_METHODS,
} from "@blueprint/shared/config";
import type { RetryOptions as SharedRetryOptions } from "@blueprint/shared/config";
import { TIMEOUTS } from "./constants";
import { ENV } from "./env";

// ============================================================================
// API Base URL
// ============================================================================

/**
 * Base URL for all API requests.
 * Flexy says: Uses ENV.API_BASE_URL instead of direct import.meta.env access!
 */
export const API_BASE: string = ENV.API_BASE_URL;

// ============================================================================
// Stream Event Types
// ============================================================================

export interface StreamEventHandlers {
  onChunk: (content: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
  onRetry?: (attempt: number, maxRetries: number) => void;
}

// ============================================================================
// Retry Configuration
// ============================================================================

/**
 * Default retry options for API calls.
 * Uses shared RETRY_CONFIG values to avoid duplication.
 */
export const DEFAULT_RETRY_OPTIONS: Required<SharedRetryOptions> = {
  maxRetries: RETRY_CONFIG.DEFAULT_RETRIES,
  initialDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
  backoffFactor: RETRY_CONFIG.DEFAULT_BACKOFF_FACTOR,
  maxDelay: RETRY_CONFIG.DEFAULT_MAX_DELAY,
};

// Re-export shared retry types
export type RetryOptions = SharedRetryOptions;

// ============================================================================
// Retry Logic Utilities
// ============================================================================

/**
 * Calculates delay with exponential backoff.
 * Extracted as a pure utility function for testability.
 */
export function calculateRetryDelay(attempt: number, options: RetryOptions = {}): number {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const delay = opts.initialDelay * Math.pow(opts.backoffFactor, attempt);
  return Math.min(delay, opts.maxDelay);
}

/**
 * Sleep utility for retry delays.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines if an error is retryable based on response status or network error.
 */
export function isRetryableError(_error: unknown, response?: Response): boolean {
  if (!response) {
    return true;
  }
  return (RETRYABLE_STATUS_CODES as readonly number[]).includes(response.status);
}

// ============================================================================
// API Call Configuration
// ============================================================================

export const API_CALL_CONFIG = {
  METHOD: HTTP_METHODS.POST,
  CONTENT_TYPE: HTTP_HEADERS.CONTENT_TYPE_JSON,
  CONNECTION_TIMEOUT: TIMEOUTS.API_CONNECTION,
} as const;
