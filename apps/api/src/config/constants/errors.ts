/**
 * Error Configuration Constants
 *
 * Error codes, messages, and validation messages.
 * Flexy says: All error messages reference @blueprint/shared as single source of truth.
 *
 * @module config/constants/errors
 */

import {
  ERROR_CODES as SHARED_ERROR_CODES,
  ERROR_STRINGS,
  API_MESSAGES,
  AUTH_MESSAGES,
  CIRCUIT_BREAKER_MESSAGES,
  PLATFORM_VALUES,
  API_VALIDATION_MESSAGES,
  NETWORK_ERROR_CODES as SHARED_NETWORK_ERROR_CODES,
} from "@blueprint/shared";

// Error codes - re-exported from @blueprint/shared single source of truth
export const ERROR_CODES = SHARED_ERROR_CODES;

export const RETRYABLE_ERROR_CODES = SHARED_NETWORK_ERROR_CODES;

/**
 * Comprehensive error message map for all API error scenarios.
 */
export const ERROR_MESSAGES = {
  VALIDATION: API_MESSAGES.VALIDATION_FAILED,
  NOT_FOUND: (route: string) => `Route not found: ${route}`,
  CONFIGURATION: API_MESSAGES.OPENAI_KEY_NOT_CONFIGURED,
  AI_SERVICE_UNAVAILABLE: API_MESSAGES.AI_SERVICE_UNAVAILABLE,
  AI_SERVICE_FAILURE: (detail: string) => `AI service error: ${detail}`,
  INTERNAL: ERROR_STRINGS.INTERNAL,
  INTERNAL_FALLBACK: API_MESSAGES.INTERNAL_FALLBACK,
  AUTHENTICATION: API_MESSAGES.AUTHENTICATION_REQUIRED,
  AUTHENTICATION_INVALID_KEY: AUTH_MESSAGES.INVALID_API_KEY,
  AUTHENTICATION_MISSING_CONFIG: AUTH_MESSAGES.API_KEY_NOT_CONFIGURED,
  AUTHORIZATION: API_MESSAGES.AUTHORIZATION_FAILED,
  RATE_LIMIT: API_MESSAGES.RATE_LIMIT_EXCEEDED,
  RATE_LIMITER_NOT_CONFIGURED: API_MESSAGES.RATE_LIMITER_NOT_CONFIGURED,
  CIRCUIT_BREAKER_OPEN: API_MESSAGES.CIRCUIT_BREAKER_OPEN,
  CONTAINER_NOT_INITIALIZED: API_MESSAGES.CONTAINER_NOT_INITIALIZED,
  JSON_PARSE_FAILURE: (detail: string) => `Failed to parse JSON: ${detail}`,
  PLATFORM_UNKNOWN: PLATFORM_VALUES.UNKNOWN,
  PLATFORM_RUNTIME: PLATFORM_VALUES.CLOUDFLARE_WORKERS,
  TIMEOUT_MESSAGE: (elapsed: number, timeout: number) =>
    `Retry operation timed out after ${elapsed}ms (timeout: ${timeout}ms)`,
  UNKNOWN_ERROR: ERROR_STRINGS.UNKNOWN,

  // Circuit breaker errors
  /** Circuit breaker is open - service unavailable */
  CIRCUIT_BREAKER_OPEN_MESSAGE: CIRCUIT_BREAKER_MESSAGES.OPEN,
  /** Circuit breaker is half-open and max test calls reached */
  CIRCUIT_BREAKER_HALF_OPEN_MAX: CIRCUIT_BREAKER_MESSAGES.HALF_OPEN_MAX_CALLS,

  // Timeout errors
  /** Default message template when an operation times out */
  TIMEOUT_OCCURRED: (timeoutMs: number) => `Operation timed out after ${timeoutMs}ms`,
} as const;

/**
 * Default error messages for error classes.
 * Flexy says: Reference ERROR_MESSAGES where identical to eliminate duplication.
 */
export const DEFAULT_ERROR_MESSAGES = {
  VALIDATION: ERROR_MESSAGES.VALIDATION,
  AUTHENTICATION: ERROR_MESSAGES.AUTHENTICATION,
  NOT_FOUND: ERROR_STRINGS.RESOURCE_NOT_FOUND,
  CONFIGURATION: AUTH_MESSAGES.SERVICE_CONFIG_ERROR,
  INTERNAL: ERROR_MESSAGES.INTERNAL,
} as const;

// Flexy says: NOT_FOUND uses literal because ERROR_MESSAGES.NOT_FOUND is a function (route: string) => string
// Cannot reference a function in a const object literal, so keeping as string value

/**
 * Validation-specific messages.
 * Flexy says: REQUEST_VALIDATION_FAILED moved - use ERROR_MESSAGES.VALIDATION instead.
 */
export const VALIDATION_MESSAGES = {
  INVALID_JSON_BODY: API_VALIDATION_MESSAGES.INVALID_JSON_BODY,
  VALIDATION_ERROR: API_VALIDATION_MESSAGES.VALIDATION_ERROR,
  BODY_TOO_LARGE: API_VALIDATION_MESSAGES.BODY_TOO_LARGE,
} as const;

/**
 * Configuration messages.
 * Flexy says: OPENAI_API_KEY_MISSING replaced - use ERROR_MESSAGES.CONFIGURATION instead.
 */
export const CONFIG_MESSAGES = {
  VALIDATED_DATA_NOT_FOUND: API_VALIDATION_MESSAGES.VALIDATED_DATA_NOT_FOUND,
} as const;
