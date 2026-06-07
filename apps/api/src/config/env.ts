/**
 * API Environment Configuration
 * Centralized environment variable handling with type safety
 * Flexy says: No hardcoded values - everything configurable!
 */

import type { EnvConfig } from "./config-types";
export type { EnvConfig };

/**
 * Default configuration values
 * These are used when environment variables are not set
 * Exported for use in test utilities to avoid duplication
 */
export const DEFAULTS: Omit<EnvConfig, "OPENAI_API_KEY"> = {
  // AI Service (from shared single source of truth)
  OPENAI_BASE_URL: AI_DEFAULTS.BASE_URL,
  OPENAI_MODEL: AI_DEFAULTS.MODEL,
  OPENAI_TIMEOUT_MS: AI_DEFAULTS.TIMEOUT_MS,
  OPENAI_MAX_TOKENS: AI_DEFAULTS.MAX_TOKENS,
  OPENAI_TEMPERATURE: AI_DEFAULTS.TEMPERATURE,

  // API
  API_VERSION: SHARED_DEFAULTS.API_VERSION,
  CORS_ORIGIN: SHARED_DEFAULTS.CORS_ORIGIN_DEV,
  CORS_MAX_AGE: SHARED_DEFAULTS.CORS_MAX_AGE,

  // Rate Limiting (from shared single source of truth)
  RATE_LIMIT_WINDOW_MS: RATE_LIMIT_DEFAULTS.WINDOW_MS,
  RATE_LIMIT_STRICT_MAX: RATE_LIMIT_DEFAULTS.STRICT_MAX,
  RATE_LIMIT_STANDARD_MAX: RATE_LIMIT_DEFAULTS.STANDARD_MAX,
  RATE_LIMIT_LENIENT_MAX: RATE_LIMIT_DEFAULTS.LENIENT_MAX,

  // Storage
  STORAGE_QUOTA_MB: SHARED_DEFAULTS.STORAGE_QUOTA_MB,

  // Circuit Breaker (from shared single source of truth)
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: CIRCUIT_BREAKER_DEFAULTS.FAILURE_THRESHOLD,
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS: CIRCUIT_BREAKER_DEFAULTS.RESET_TIMEOUT_MS,
  CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: CIRCUIT_BREAKER_DEFAULTS.HALF_OPEN_MAX_CALLS,
  CIRCUIT_BREAKER_COLD_START_WINDOW_MS: CIRCUIT_BREAKER_DEFAULTS.COLD_START_WINDOW_MS,

  // Retry (from shared single source of truth)
  RETRY_MAX_RETRIES: SHARED_RETRY_CONFIG.DEFAULT_RETRIES,
  RETRY_INITIAL_DELAY_MS: SHARED_RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
  RETRY_BACKOFF_FACTOR: SHARED_RETRY_CONFIG.DEFAULT_BACKOFF_FACTOR,
  RETRY_MAX_DELAY_MS: SHARED_RETRY_CONFIG.DEFAULT_MAX_DELAY,

  // External URLs
  PROJECT_HOMEPAGE_URL: DEFAULT_URLS.PROJECT_HOMEPAGE,
  GITHUB_URL: DEFAULT_URLS.GITHUB,
};

/**
 * Get environment variable with fallback to default
 */
function getEnvVar(
  key: keyof EnvConfig,
  env: Record<string, string | undefined>
): string | undefined {
  return env[key] ?? undefined;
}

/**
 * Get numeric environment variable with fallback to default
 */
function getNumericEnvVar(
  key: keyof EnvConfig,
  env: Record<string, string | undefined>,
  defaultValue: number
): number {
  const value = env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get float environment variable with fallback to default
 */
function getFloatEnvVar(
  key: keyof EnvConfig,
  env: Record<string, string | undefined>,
  defaultValue: number
): number {
  const value = env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Load configuration from environment
 * This function should be called once at startup
 */
export function loadConfig(env: Record<string, string | undefined>): EnvConfig {
  // Validate required variables
  const openaiApiKey = getEnvVar(ENV_VAR_KEYS.API.OPENAI_API_KEY, env);
  if (!openaiApiKey) {
    throw new Error(`${ENV_VAR_KEYS.API.OPENAI_API_KEY} is required but not set in environment.`);
  }

  // Validate CORS_ORIGIN is not empty - empty string allows any origin which is a security risk
  const corsOrigin = getEnvVar(ENV_VAR_KEYS.API.CORS_ORIGIN, env) ?? DEFAULTS.CORS_ORIGIN;
  if (!corsOrigin || corsOrigin.trim() === "") {
    throw new Error(`${ENV_VAR_KEYS.API.CORS_ORIGIN} is required and cannot be empty.`);
  }

  if (corsOrigin === "*" && env.NODE_ENV === ENVIRONMENT_NAMES.PRODUCTION) {
    console.warn(
      `WARNING: ${ENV_VAR_KEYS.API.CORS_ORIGIN} is set to '*' (allow all). This is a security risk in production.`
    );
  }

  return {
    OPENAI_API_KEY: openaiApiKey,
    OPENAI_BASE_URL: getEnvVar(ENV_VAR_KEYS.API.OPENAI_BASE_URL, env) ?? DEFAULTS.OPENAI_BASE_URL,
    OPENAI_MODEL: getEnvVar(ENV_VAR_KEYS.API.OPENAI_MODEL, env) ?? DEFAULTS.OPENAI_MODEL,
    OPENAI_TIMEOUT_MS: getNumericEnvVar(
      ENV_VAR_KEYS.API.OPENAI_TIMEOUT_MS,
      env,
      DEFAULTS.OPENAI_TIMEOUT_MS
    ),
    OPENAI_MAX_TOKENS: getNumericEnvVar(
      ENV_VAR_KEYS.API.OPENAI_MAX_TOKENS,
      env,
      DEFAULTS.OPENAI_MAX_TOKENS
    ),
    OPENAI_TEMPERATURE: getFloatEnvVar(
      ENV_VAR_KEYS.API.OPENAI_TEMPERATURE,
      env,
      DEFAULTS.OPENAI_TEMPERATURE
    ),

    API_VERSION: getEnvVar(ENV_VAR_KEYS.API.API_VERSION, env) ?? DEFAULTS.API_VERSION,

    CORS_ORIGIN: corsOrigin,
    CORS_MAX_AGE: getNumericEnvVar(ENV_VAR_KEYS.API.CORS_MAX_AGE, env, DEFAULTS.CORS_MAX_AGE),

    RATE_LIMIT_WINDOW_MS: getNumericEnvVar(
      ENV_VAR_KEYS.API.RATE_LIMIT_WINDOW_MS,
      env,
      DEFAULTS.RATE_LIMIT_WINDOW_MS
    ),
    RATE_LIMIT_STRICT_MAX: getNumericEnvVar(
      ENV_VAR_KEYS.API.RATE_LIMIT_STRICT_MAX,
      env,
      DEFAULTS.RATE_LIMIT_STRICT_MAX
    ),
    RATE_LIMIT_STANDARD_MAX: getNumericEnvVar(
      ENV_VAR_KEYS.API.RATE_LIMIT_STANDARD_MAX,
      env,
      DEFAULTS.RATE_LIMIT_STANDARD_MAX
    ),
    RATE_LIMIT_LENIENT_MAX: getNumericEnvVar(
      ENV_VAR_KEYS.API.RATE_LIMIT_LENIENT_MAX,
      env,
      DEFAULTS.RATE_LIMIT_LENIENT_MAX
    ),

    STORAGE_QUOTA_MB: getNumericEnvVar(
      ENV_VAR_KEYS.API.STORAGE_QUOTA_MB,
      env,
      DEFAULTS.STORAGE_QUOTA_MB
    ),

    CIRCUIT_BREAKER_FAILURE_THRESHOLD: getNumericEnvVar(
      ENV_VAR_KEYS.API.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
      env,
      DEFAULTS.CIRCUIT_BREAKER_FAILURE_THRESHOLD
    ),
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: getNumericEnvVar(
      ENV_VAR_KEYS.API.CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
      env,
      DEFAULTS.CIRCUIT_BREAKER_RESET_TIMEOUT_MS
    ),
    CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: getNumericEnvVar(
      ENV_VAR_KEYS.API.CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS,
      env,
      DEFAULTS.CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS
    ),
    CIRCUIT_BREAKER_COLD_START_WINDOW_MS: getNumericEnvVar(
      ENV_VAR_KEYS.API.CIRCUIT_BREAKER_COLD_START_WINDOW_MS,
      env,
      DEFAULTS.CIRCUIT_BREAKER_COLD_START_WINDOW_MS
    ),

    RETRY_MAX_RETRIES: getNumericEnvVar(
      ENV_VAR_KEYS.API.RETRY_MAX_RETRIES,
      env,
      DEFAULTS.RETRY_MAX_RETRIES
    ),
    RETRY_INITIAL_DELAY_MS: getNumericEnvVar(
      ENV_VAR_KEYS.API.RETRY_INITIAL_DELAY_MS,
      env,
      DEFAULTS.RETRY_INITIAL_DELAY_MS
    ),
    RETRY_BACKOFF_FACTOR: getNumericEnvVar(
      ENV_VAR_KEYS.API.RETRY_BACKOFF_FACTOR,
      env,
      DEFAULTS.RETRY_BACKOFF_FACTOR
    ),
    RETRY_MAX_DELAY_MS: getNumericEnvVar(
      ENV_VAR_KEYS.API.RETRY_MAX_DELAY_MS,
      env,
      DEFAULTS.RETRY_MAX_DELAY_MS
    ),

    PROJECT_HOMEPAGE_URL:
      getEnvVar(ENV_VAR_KEYS.API.PROJECT_HOMEPAGE_URL, env) ?? DEFAULTS.PROJECT_HOMEPAGE_URL,
    GITHUB_URL: getEnvVar(ENV_VAR_KEYS.API.GITHUB_URL, env) ?? DEFAULTS.GITHUB_URL,
  };
}

// Singleton config instance - delegates to constants.ts for unified state
import {
  AI_DEFAULTS,
  DEFAULT_URLS,
  SHARED_DEFAULTS,
  RETRY_CONFIG as SHARED_RETRY_CONFIG,
  RATE_LIMIT_DEFAULTS,
  CIRCUIT_BREAKER_DEFAULTS,
  ENV_VAR_KEYS,
  ENVIRONMENT_NAMES,
} from "@blueprint/shared";
import { getEnvConfig, setEnvConfig as setConstantsConfig } from "./constants";

/**
 * Get the loaded configuration
 * Must call loadConfig() or setEnvConfig() first
 */
export function getConfig(): EnvConfig {
  return getEnvConfig();
}

/**
 * Initialize configuration (for use in tests or manual initialization)
 */
export function initializeConfig(env: Record<string, string | undefined>): void {
  const config = loadConfig(env);
  setConstantsConfig(config);
}

/**
 * Reset configuration (mainly for testing)
 */
export function resetConfig(): void {
  setConstantsConfig(null as unknown as EnvConfig);
}
