/**
 * API Environment Configuration
 * Centralized environment variable handling with type safety
 * Flexy says: No hardcoded values - everything configurable!
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

  // Retry Configuration
  RETRY_MAX_RETRIES: number;
  RETRY_INITIAL_DELAY_MS: number;
  RETRY_BACKOFF_FACTOR: number;
  RETRY_MAX_DELAY_MS: number;

  // External URLs
  PROJECT_HOMEPAGE_URL: string;
  GITHUB_URL: string;
}

/**
 * Default configuration values
 * These are used when environment variables are not set
 * Exported for use in test utilities to avoid duplication
 */
export const DEFAULTS: Omit<EnvConfig, "OPENAI_API_KEY"> = {
  // AI Service
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  OPENAI_MODEL: "gpt-4o-mini",
  OPENAI_TIMEOUT_MS: 60000,
  OPENAI_MAX_TOKENS: 4000,
  OPENAI_TEMPERATURE: 0.7,

  // API
  API_VERSION: SHARED_DEFAULTS.API_VERSION,
  CORS_ORIGIN: SHARED_DEFAULTS.CORS_ORIGIN_DEV,
  CORS_MAX_AGE: SHARED_DEFAULTS.CORS_MAX_AGE,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 60000,
  RATE_LIMIT_STRICT_MAX: 10,
  RATE_LIMIT_STANDARD_MAX: 60,
  RATE_LIMIT_LENIENT_MAX: 120,

  // Storage
  STORAGE_QUOTA_MB: SHARED_DEFAULTS.STORAGE_QUOTA_MB,

  // Circuit Breaker
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: 5,
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS: 60000,
  CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: 3,

  // Retry
  RETRY_MAX_RETRIES: 3,
  RETRY_INITIAL_DELAY_MS: 1000,
  RETRY_BACKOFF_FACTOR: 2,
  RETRY_MAX_DELAY_MS: 10000,

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
  const openaiApiKey = getEnvVar("OPENAI_API_KEY", env);
  if (!openaiApiKey) {
    throw new Error(
      "OPENAI_API_KEY is required but not set in environment. Please set the OPENAI_API_KEY environment variable in your .dev.vars file (for local development) or in your Cloudflare Workers secrets (for production)."
    );
  }

  // Validate CORS_ORIGIN is not empty - empty string allows any origin which is a security risk
  const corsOrigin = getEnvVar("CORS_ORIGIN", env) ?? DEFAULTS.CORS_ORIGIN;
  if (!corsOrigin || corsOrigin.trim() === "") {
    throw new Error(
      "CORS_ORIGIN is required and cannot be empty. Please set a valid origin (e.g., 'https://yourdomain.com') in your .dev.vars file (for local development) or in your Cloudflare Workers secrets (for production). Do not use '*' in production."
    );
  }

  if (corsOrigin === "*" && env.NODE_ENV === "production") {
    console.warn(
      "WARNING: CORS_ORIGIN is set to '*' (allow all). This is a security risk in production. Please set a specific origin."
    );
  }

  return {
    OPENAI_API_KEY: openaiApiKey,
    OPENAI_BASE_URL: getEnvVar("OPENAI_BASE_URL", env) ?? DEFAULTS.OPENAI_BASE_URL,
    OPENAI_MODEL: getEnvVar("OPENAI_MODEL", env) ?? DEFAULTS.OPENAI_MODEL,
    OPENAI_TIMEOUT_MS: getNumericEnvVar("OPENAI_TIMEOUT_MS", env, DEFAULTS.OPENAI_TIMEOUT_MS),
    OPENAI_MAX_TOKENS: getNumericEnvVar("OPENAI_MAX_TOKENS", env, DEFAULTS.OPENAI_MAX_TOKENS),
    OPENAI_TEMPERATURE: getFloatEnvVar("OPENAI_TEMPERATURE", env, DEFAULTS.OPENAI_TEMPERATURE),

    API_VERSION: getEnvVar("API_VERSION", env) ?? DEFAULTS.API_VERSION,

    CORS_ORIGIN: corsOrigin,
    CORS_MAX_AGE: getNumericEnvVar("CORS_MAX_AGE", env, DEFAULTS.CORS_MAX_AGE),

    RATE_LIMIT_WINDOW_MS: getNumericEnvVar(
      "RATE_LIMIT_WINDOW_MS",
      env,
      DEFAULTS.RATE_LIMIT_WINDOW_MS
    ),
    RATE_LIMIT_STRICT_MAX: getNumericEnvVar(
      "RATE_LIMIT_STRICT_MAX",
      env,
      DEFAULTS.RATE_LIMIT_STRICT_MAX
    ),
    RATE_LIMIT_STANDARD_MAX: getNumericEnvVar(
      "RATE_LIMIT_STANDARD_MAX",
      env,
      DEFAULTS.RATE_LIMIT_STANDARD_MAX
    ),
    RATE_LIMIT_LENIENT_MAX: getNumericEnvVar(
      "RATE_LIMIT_LENIENT_MAX",
      env,
      DEFAULTS.RATE_LIMIT_LENIENT_MAX
    ),

    STORAGE_QUOTA_MB: getNumericEnvVar("STORAGE_QUOTA_MB", env, DEFAULTS.STORAGE_QUOTA_MB),

    CIRCUIT_BREAKER_FAILURE_THRESHOLD: getNumericEnvVar(
      "CIRCUIT_BREAKER_FAILURE_THRESHOLD",
      env,
      DEFAULTS.CIRCUIT_BREAKER_FAILURE_THRESHOLD
    ),
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: getNumericEnvVar(
      "CIRCUIT_BREAKER_RESET_TIMEOUT_MS",
      env,
      DEFAULTS.CIRCUIT_BREAKER_RESET_TIMEOUT_MS
    ),
    CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: getNumericEnvVar(
      "CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS",
      env,
      DEFAULTS.CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS
    ),

    RETRY_MAX_RETRIES: getNumericEnvVar("RETRY_MAX_RETRIES", env, DEFAULTS.RETRY_MAX_RETRIES),
    RETRY_INITIAL_DELAY_MS: getNumericEnvVar(
      "RETRY_INITIAL_DELAY_MS",
      env,
      DEFAULTS.RETRY_INITIAL_DELAY_MS
    ),
    RETRY_BACKOFF_FACTOR: getNumericEnvVar(
      "RETRY_BACKOFF_FACTOR",
      env,
      DEFAULTS.RETRY_BACKOFF_FACTOR
    ),
    RETRY_MAX_DELAY_MS: getNumericEnvVar("RETRY_MAX_DELAY_MS", env, DEFAULTS.RETRY_MAX_DELAY_MS),

    PROJECT_HOMEPAGE_URL: getEnvVar("PROJECT_HOMEPAGE_URL", env) ?? DEFAULTS.PROJECT_HOMEPAGE_URL,
    GITHUB_URL: getEnvVar("GITHUB_URL", env) ?? DEFAULTS.GITHUB_URL,
  };
}

// Singleton config instance - delegates to constants.ts for unified state
import { DEFAULT_URLS, SHARED_DEFAULTS } from "@blueprint/shared";
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
