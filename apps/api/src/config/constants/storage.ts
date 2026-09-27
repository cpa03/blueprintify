/**
 * Storage Configuration Constants
 *
 * Database IDs, KV storage, body size limits, and storage quota.
 * Flexy says: No hardcoded strings - everything in config!
 *
 * @module config/constants/storage
 */

import {
  KV_STORAGE_KEYS,
  TIME_UNITS,
  BYTE_CONVERSION,
  BODY_SIZE_LIMITS as SHARED_BODY_SIZE_LIMITS,
} from "@blueprint/shared";
import { getEnvConfig } from "./env";

/**
 * Storage KV configuration.
 * Flexible: KV key + TTL, no hardcoded strings!
 */
export const STORAGE_KV_CONFIG = {
  QUOTA_KEY: KV_STORAGE_KEYS.QUOTA_KEY,
  /** TTL for storage reports in seconds (30 days) */
  REPORT_TTL_SECONDS: TIME_UNITS.SECONDS_PER_DAY * 30,
} as const;

/**
 * Storage quota configuration with env-based getter.
 */
export const STORAGE_CONFIG = {
  get QUOTA_MB(): number {
    return getEnvConfig().STORAGE_QUOTA_MB;
  },
  get QUOTA_BYTES(): number {
    return getEnvConfig().STORAGE_QUOTA_MB * BYTE_CONVERSION.MB;
  },
};

/**
 * Body size limits configuration.
 * Flexy says: extracted from middleware/bodyLimit.ts for shared access.
 */
export const BODY_SIZE_LIMITS = {
  /** Default maximum body size (from shared single source of truth) */
  DEFAULT_MB: SHARED_BODY_SIZE_LIMITS.DEFAULT_MB,
  /** Strict limit in KB (from shared single source of truth) */
  STRICT_KB: SHARED_BODY_SIZE_LIMITS.STRICT_KB,
  /** Lenient limit in MB (from shared single source of truth) */
  LENIENT_MB: SHARED_BODY_SIZE_LIMITS.LENIENT_MB,
} as const;

/** Pre-computed body size limits */
export const BODY_SIZE_MAX = {
  DEFAULT: BODY_SIZE_LIMITS.DEFAULT_MB * BYTE_CONVERSION.MB,
  STRICT: BODY_SIZE_LIMITS.STRICT_KB * BYTE_CONVERSION.KB,
  LENIENT: BODY_SIZE_LIMITS.LENIENT_MB * BYTE_CONVERSION.MB,
} as const;

/**
 * Storage route query parameters.
 * Flexy says: no hardcoded query param strings!
 */
export const STORAGE_QUERY_PARAMS = {
  CONFIRM: "confirm",
  CONFIRM_TRUE: "true",
} as const;
