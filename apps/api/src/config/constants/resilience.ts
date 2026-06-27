/**
 * Resilience Configuration Constants
 *
 * Retry logic, circuit breaker, and caching configuration.
 *
 * @module config/constants/resilience
 */

import {
  RETRY_CONFIG as SHARED_RETRY_CONFIG,
  RETRYABLE_STATUS_CODES,
  HTTP_STATUS as SHARED_HTTP_STATUS,
  TIME_UNITS,
} from "@blueprint/shared";
import { getEnvConfig } from "./env";

/**
 * Retry configuration from shared package.
 */
export const RETRY_CONFIG = SHARED_RETRY_CONFIG;

export { RETRYABLE_STATUS_CODES };

/**
 * Retry logic constants for rate limiting and server errors.
 */
export const RETRY_LOGIC = {
  RATE_LIMIT_STATUS: SHARED_HTTP_STATUS.TOO_MANY_REQUESTS,
  SERVER_ERROR_THRESHOLD: SHARED_HTTP_STATUS.INTERNAL_ERROR,
} as const;

/**
 * Circuit breaker configuration with env-based thresholds.
 */
export const CIRCUIT_BREAKER_CONFIG = {
  get DEFAULT_FAILURE_THRESHOLD(): number {
    return getEnvConfig().CIRCUIT_BREAKER_FAILURE_THRESHOLD;
  },
  get DEFAULT_RESET_TIMEOUT_MS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_RESET_TIMEOUT_MS;
  },
  get DEFAULT_HALF_OPEN_MAX_CALLS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS;
  },
  get DEFAULT_COLD_START_WINDOW_MS(): number {
    return getEnvConfig().CIRCUIT_BREAKER_COLD_START_WINDOW_MS;
  },
};

/**
 * Cache TTL configuration.
 */
export const CACHE_CONFIG = {
  /** Root cache: 1 minute */
  ROOT_MAX_AGE: TIME_UNITS.SECONDS_PER_MINUTE,
  /** Root stale-while-revalidate: 30 seconds */
  ROOT_STALE_WHILE_REVALIDATE: TIME_UNITS.SECONDS_PER_MINUTE / 2,
  /** Share route cache: 5 minutes */
  SHARE_MAX_AGE: TIME_UNITS.SECONDS_PER_MINUTE * 5,
  /** Share route cache stale-while-revalidate: 1 hour */
  SHARE_STALE_WHILE_REVALIDATE: TIME_UNITS.SECONDS_PER_HOUR,
} as const;
