/**
 * API Configuration Types
 *
 * Shared type definitions for environment configuration.
 * Extracted from env.ts to break circular dependency:
 *   constants.ts → env.ts (EnvConfig type)
 *   env.ts → constants.ts (getEnvConfig/setEnvConfig runtime)
 *
 * @module config/config-types
 */

/**
 * Environment configuration interface
 * Defines all configurable environment variables with their types
 * Values are loaded from Cloudflare Workers env bindings at startup
 */
export interface EnvConfig {
  // AI Service Configuration
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL: string;
  OPENAI_TIMEOUT_MS: number;
  OPENAI_MAX_TOKENS: number;
  OPENAI_TEMPERATURE: number;

  // API Configuration
  API_VERSION: string;
  CORS_ORIGIN: string;
  CORS_MAX_AGE: number;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_STRICT_MAX: number;
  RATE_LIMIT_STANDARD_MAX: number;
  RATE_LIMIT_LENIENT_MAX: number;

  // Storage Configuration
  STORAGE_QUOTA_MB: number;

  // Circuit Breaker
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: number;
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS: number;
  CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: number;
  CIRCUIT_BREAKER_COLD_START_WINDOW_MS: number;

  // Retry Configuration
  RETRY_MAX_RETRIES: number;
  RETRY_INITIAL_DELAY_MS: number;
  RETRY_BACKOFF_FACTOR: number;
  RETRY_MAX_DELAY_MS: number;

  // External URLs
  PROJECT_HOMEPAGE_URL: string;
  GITHUB_URL: string;
}
