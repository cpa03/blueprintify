/**
 * Rate Limiting Configuration Constants
 *
 * Rate limit windows, thresholds, and limiter bindings.
 * Flexy says: LIMITER_BINDINGS references shared RATE_LIMITER_BINDINGS — single source of truth!
 *
 * @module config/constants/ratelimit
 */

import { AUTH_DEFAULTS, RATE_LIMITER_BINDINGS } from "@blueprint/shared";
import { getEnvConfig } from "./env";

/**
 * Rate limiting configuration with env-based thresholds.
 */
export const RATE_LIMIT_CONFIG = {
  get WINDOW_MS(): number {
    return getEnvConfig().RATE_LIMIT_WINDOW_MS;
  },
  get STRICT_MAX(): number {
    return getEnvConfig().RATE_LIMIT_STRICT_MAX;
  },
  get STANDARD_MAX(): number {
    return getEnvConfig().RATE_LIMIT_STANDARD_MAX;
  },
  get LENIENT_MAX(): number {
    return getEnvConfig().RATE_LIMIT_LENIENT_MAX;
  },
};

/**
 * Rate limiter binding constants.
 * Flexy says: LIMITER_BINDINGS references shared RATE_LIMITER_BINDINGS — single source of truth!
 */
export const RATE_LIMIT_CONSTANTS = {
  ANONYMOUS_CLIENT_KEY: AUTH_DEFAULTS.ANONYMOUS_USER_ID,
  LIMITER_BINDINGS: {
    STRICT: RATE_LIMITER_BINDINGS.STRICT,
    STANDARD: RATE_LIMITER_BINDINGS.STANDARD,
    LENIENT: RATE_LIMITER_BINDINGS.LENIENT,
  },
} as const;
