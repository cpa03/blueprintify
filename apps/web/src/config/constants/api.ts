/**
 * API Configuration Constants
 * Source of truth for API-related constants
 */

import { ENV } from "../env";
import {
  ROUTE_PATHS,
  RETRYABLE_STATUS_CODES,
  SSE_CONFIG,
  HTTP_STATUS,
  ERROR_STRINGS,
  DEV_DOMAIN_DEFAULTS,
  API_ERROR_MESSAGES as SHARED_API_ERROR_MESSAGES,
  GENERATION_MESSAGES as SHARED_GENERATION_MESSAGES,
  GENERATION_ESTIMATES as SHARED_GENERATION_ESTIMATES,
  EXTERNAL_REFERENCE_URLS,
} from "@blueprint/shared";

export { ROUTE_PATHS, RETRYABLE_STATUS_CODES, SSE_CONFIG, HTTP_STATUS };

/** API endpoints for the Blueprintify backend */
export const API_ENDPOINTS = {
  HEALTH: ROUTE_PATHS.ROOT,
  GENERATE: ROUTE_PATHS.GENERATE,
  TASKS: ROUTE_PATHS.TASKS,
  REFINE: ROUTE_PATHS.REFINE,
  EXPORT: ROUTE_PATHS.EXPORT,
  IMPORT: ROUTE_PATHS.IMPORT,
  STORAGE: ROUTE_PATHS.STORAGE,
  SHARE: ROUTE_PATHS.SHARE,
} as const;

/**
 * API Error Messages (from shared config)
 * Flexy says: Single source of truth in @blueprint/shared!
 */
export const API_ERROR_MESSAGES = SHARED_API_ERROR_MESSAGES;

/** Generation timing estimates (from shared config) */
export const GENERATION_ESTIMATES = {
  /** Typical generation duration estimate (30-60 seconds) */
  TYPICAL_DURATION_SECONDS: SHARED_GENERATION_ESTIMATES.TYPICAL,
  /** Short generation duration estimate (15-30 seconds) */
  SHORT: SHARED_GENERATION_ESTIMATES.SHORT,
  /** Long generation duration estimate (60-90 seconds) */
  LONG: SHARED_GENERATION_ESTIMATES.LONG,
} as const;

/** Generation progress messages (from shared config) */
export const GENERATION_MESSAGES = SHARED_GENERATION_MESSAGES;

/** External URLs used throughout the application */
export const EXTERNAL_URLS = {
  GITHUB: ENV.GITHUB_URL,
  PROJECT_HOMEPAGE: ENV.PROJECT_HOMEPAGE_URL,
  CLOUDFLARE_WORKERS: EXTERNAL_REFERENCE_URLS.CLOUDFLARE_WORKERS,
  REACT: EXTERNAL_REFERENCE_URLS.REACT,
} as const;

/**
 * Vercel deployment detection hostnames
 * Flexy says: No hardcoded hostnames - everything in config!
 */
export const VERCEL_DOMAINS = {
  LOCAL: DEV_DOMAIN_DEFAULTS.LOCAL_HOSTNAMES,
};

/** Frontend-specific error messages (supplemental) */
export const FRONTEND_ERROR_MESSAGES = {
  UNKNOWN_ERROR: ERROR_STRINGS.UNKNOWN,
} as const;
