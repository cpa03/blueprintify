/**
 * Environment Configuration State
 *
 * Shared mutable state for environment configuration getters.
 * Falls back to default config if not explicitly set via setEnvConfig().
 *
 * @module config/constants/env
 */

import type { EnvConfig } from "../config-types";
import {
  AI_DEFAULTS,
  SHARED_DEFAULTS,
  RATE_LIMIT_DEFAULTS,
  CIRCUIT_BREAKER_DEFAULTS,
  RETRY_CONFIG as SHARED_RETRY_CONFIG,
  DEFAULT_URLS,
} from "@blueprint/shared";

let envConfig: EnvConfig | null = null;

/**
 * Default configuration values (same as apps/api/src/config/env.ts DEFAULTS)
 * Used when environment config has not been explicitly set.
 */
function getDefaultConfig(): EnvConfig {
  return {
    // AI Service Configuration
    OPENAI_API_KEY: "",
    OPENAI_BASE_URL: AI_DEFAULTS.BASE_URL,
    OPENAI_MODEL: AI_DEFAULTS.MODEL,
    OPENAI_TIMEOUT_MS: AI_DEFAULTS.TIMEOUT_MS,
    OPENAI_MAX_TOKENS: AI_DEFAULTS.MAX_TOKENS,
    OPENAI_TEMPERATURE: AI_DEFAULTS.TEMPERATURE,

    // API Configuration
    API_VERSION: SHARED_DEFAULTS.API_VERSION,
    CORS_ORIGIN: SHARED_DEFAULTS.CORS_ORIGIN_DEV,
    CORS_MAX_AGE: SHARED_DEFAULTS.CORS_MAX_AGE,

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: RATE_LIMIT_DEFAULTS.WINDOW_MS,
    RATE_LIMIT_STRICT_MAX: RATE_LIMIT_DEFAULTS.STRICT_MAX,
    RATE_LIMIT_STANDARD_MAX: RATE_LIMIT_DEFAULTS.STANDARD_MAX,
    RATE_LIMIT_LENIENT_MAX: RATE_LIMIT_DEFAULTS.LENIENT_MAX,

    // Storage Configuration
    STORAGE_QUOTA_MB: SHARED_DEFAULTS.STORAGE_QUOTA_MB,

    // Circuit Breaker
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: CIRCUIT_BREAKER_DEFAULTS.FAILURE_THRESHOLD,
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: CIRCUIT_BREAKER_DEFAULTS.RESET_TIMEOUT_MS,
    CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: CIRCUIT_BREAKER_DEFAULTS.HALF_OPEN_MAX_CALLS,
    CIRCUIT_BREAKER_COLD_START_WINDOW_MS: CIRCUIT_BREAKER_DEFAULTS.COLD_START_WINDOW_MS,

    // Retry Configuration
    RETRY_MAX_RETRIES: SHARED_RETRY_CONFIG.DEFAULT_RETRIES,
    RETRY_INITIAL_DELAY_MS: SHARED_RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
    RETRY_BACKOFF_FACTOR: SHARED_RETRY_CONFIG.DEFAULT_BACKOFF_FACTOR,
    RETRY_MAX_DELAY_MS: SHARED_RETRY_CONFIG.DEFAULT_MAX_DELAY,

    // External URLs
    PROJECT_HOMEPAGE_URL: DEFAULT_URLS.PROJECT_HOMEPAGE,
    GITHUB_URL: DEFAULT_URLS.GITHUB,
  };
}

/**
 * Sets the environment configuration for use by constant getters.
 * Must be called during application initialization.
 *
 * @param config - Environment configuration object or null to reset
 */
export function setEnvConfig(config: EnvConfig | null): void {
  envConfig = config;
}

/**
 * Gets the current environment configuration.
 * Falls back to default config if not explicitly set.
 *
 * @returns The environment configuration object
 */
export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    return getDefaultConfig();
  }
  return envConfig;
}
