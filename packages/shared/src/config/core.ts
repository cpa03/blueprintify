import { RETRY_CONFIG } from "./http.js";

/**
 * Type for retry options
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  maxDelay?: number;
}

/**
 * Type guards for config values
 */
export type RetryConfigValues = typeof RETRY_CONFIG;

/**
 * Time Units Constants
 * Centralized time conversion values to avoid magic numbers
 */
export const TIME_UNITS = {
  /** Milliseconds per second */
  MS_PER_SECOND: 1000,
  /** Seconds per minute */
  SECONDS_PER_MINUTE: 60,
  /** Minutes per hour */
  MINUTES_PER_HOUR: 60,
  /** Seconds per hour */
  SECONDS_PER_HOUR: 3600,
  /** Hours per day */
  HOURS_PER_DAY: 24,
  /** Seconds per day */
  SECONDS_PER_DAY: 86400,
} as const;

/**
 * Percent Conversion Constants
 * Centralized scale for converting ratios to percentage values.
 * Flexy says: No hardcoded "* 100" percent-conversion multipliers in components!
 * Usage: import { PERCENT_SCALE } from "@blueprint/shared";
 *        const percent = Math.round(ratio * PERCENT_SCALE);
 */
export const PERCENT_SCALE = 100;

/**
 * ID Generation Configuration
 * Centralized settings for generating unique identifiers
 */
export const ID_GENERATION_CONFIG = {
  /** Start index for random string extraction from base-36 conversion */
  RANDOM_STRING_START_INDEX: 2,
  /** Length of random string portion in generated IDs */
  RANDOM_STRING_LENGTH: 9,
  /** Radix for Math.random().toString() to produce alphanumeric characters */
  ALPHANUMERIC_RADIX: 36,
  /** Number of random uint32 values generated for request-ID entropy */
  RANDOM_VALUES_COUNT: 2,
} as const;

/**
 * Cryptographic Configuration
 * Centralized constants for hashing and hex-encoding operations.
 * Flexy says: No hardcoded "SHA-256" / toString(16) / padStart(2) literals!
 * Usage: import { CRYPTO_CONFIG } from "@blueprint/shared";
 *        crypto.subtle.digest(CRYPTO_CONFIG.HASH_ALGORITHM, data)
 *        b.toString(CRYPTO_CONFIG.HEX_RADIX).padStart(CRYPTO_CONFIG.HEX_PADDING_WIDTH, "0")
 */
export const CRYPTO_CONFIG = {
  /** Hash algorithm used for password hashing and identity derivation */
  HASH_ALGORITHM: "SHA-256" as const,
  /** Radix used to convert bytes to hexadecimal strings */
  HEX_RADIX: 16,
  /** Minimum width for zero-padded hex byte output */
  HEX_PADDING_WIDTH: 2,
  /** Length of the derived user-ID hash (hex chars kept from the full digest) */
  USER_ID_HASH_LENGTH: 16,
} as const;

/**
 * Character sets for ID generation
 * Centralized to eliminate hardcoded character strings across the codebase
 */
export const ID_CHARS = {
  /** Full alphanumeric set (mixed case + digits) for share IDs, tokens etc. */
  FULL: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /** Lowercase alphanumeric set for database IDs, slugs etc. */
  LOWERCASE: "abcdefghijklmnopqrstuvwxyz0123456789",
} as const;

/**
 * Database Entity ID Prefixes
 * Centralized entity type prefixes used in database ID generation.
 * Flexy says: No hardcoded "user"/"project"/"blueprint" prefix strings!
 */
export const DB_ID_PREFIXES = {
  USER: "user",
  PROJECT: "project",
  BLUEPRINT: "blueprint",
  TASK: "task",
  TEMPLATE: "template",
  ANALYTICS: "analytics",
  SESSION: "session",
} as const;

// ============================================================================
// Shared Route Paths
// Centralized source of truth for API route paths
// Used by both API and Web to eliminate hardcoded route strings
// ============================================================================

export const ROUTE_PATHS = {
  ROOT: "/",
  GENERATE: "/generate",
  TASKS: "/tasks",
  REFINE: "/refine",
  EXPORT: "/export",
  IMPORT: "/import",
  STORAGE: "/storage",
  SHARE: "/share",
  WARMUP: "/warmup",
  HEALTH: "/health",
} as const;

// Shared default URLs used by both API and Web
export const DEFAULT_URLS = {
  PROJECT_HOMEPAGE: "https://blueprint-generator.pages.dev",
  GITHUB: "https://github.com/cpa03/blueprintify",
} as const;

// Shared defaults for app-wide values across API and Web
export const SHARED_DEFAULTS = {
  APP_NAME: "Blueprintify",
  DEFAULT_PROJECT_NAME: "my-project",
  STORAGE_QUOTA_MB: 5,
  API_VERSION: "1.0.0",
  CORS_ORIGIN_DEV: "*",
  CORS_MAX_AGE: 86400,
  /** Namespace prefix for all localStorage keys */
  STORAGE_NAMESPACE: "blueprint" as const,
} as const;

/**
 * Dev Server Defaults
 * Ports and URLs used during local development.
 * Single source of truth to eliminate hardcoded dev server addresses.
 */
export const DEV_DEFAULTS = {
  /** Frontend dev server port */
  WEB_PORT: 3000,
  /** API/dev server port */
  API_PORT: 8787,
  /** Default API base URL for web client (proxied via Vite) */
  API_PROXY_TARGET: "http://localhost:8787",
  /** Default test server URL for Playwright */
  PLAYWRIGHT_TEST_URL: "http://localhost:3000",
} as const;

/**
 * Prompt Input Security Limits
 * Centralized limits for prompt sanitization and input validation.
 * Single source of truth to eliminate hardcoded input length values.
 */
export const MAX_INPUT_LENGTH = 5000;

/**
 * Byte Conversion Constants
 * Centralized byte multipliers to eliminate hardcoded 1024/KB/MB values.
 */
export const BYTE_CONVERSION = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  /** Bytes per character for UTF-16 encoded strings (JS strings in localStorage) */
  UTF16_BYTES_PER_CHAR: 2,
} as const;

/**
 * Playwright Test Configuration Defaults
 * Centralized Playwright test timeouts and thresholds.
 * Single source of truth for e2e test configuration.
 */
export const PLAYWRIGHT_DEFAULTS = {
  /** Web server startup timeout in ms */
  WEB_SERVER_TIMEOUT_MS: 120000,
  /** Expect assertion timeout in ms */
  EXPECT_TIMEOUT_MS: 10000,
  /** Screenshot max diff pixels for visual comparison */
  SCREENSHOT_MAX_DIFF_PIXELS: 100,
  /** Snapshot comparison threshold */
  SNAPSHOT_THRESHOLD: 0.2,
} as const;

/**
 * Preview Server Defaults
 * Centralized defaults for Vite preview and Lighthouse testing.
 * Flexy says: No hardcoded preview URLs or ports!
 */
export const PREVIEW_DEFAULTS = {
  /** Default port for Vite preview server */
  PREVIEW_PORT: 4173,
  /** Default preview server host */
  PREVIEW_HOST: "localhost",
  /** Full default preview URL */
  PREVIEW_URL: "http://localhost:4173",
} as const;

/**
 * Observability Configuration Defaults
 * Centralized sampling rates and limits for Cloudflare Workers observability.
 * Flexy says: No hardcoded sampling rates!
 */
export const OBSERVABILITY_DEFAULTS = {
  /** Trace sampling rate for production (0.0 - 1.0) */
  TRACES_SAMPLING_RATE: 0.1,
  /** Log sampling rate for production (0.0 - 1.0) */
  LOGS_SAMPLING_RATE: 0.5,
  /** CPU limit in ms for Cloudflare Workers */
  CPU_LIMIT_MS: 50000,
} as const;

/**
 * Worker Queue Configuration Defaults
 * Centralized defaults for Cloudflare Workers Queue bindings.
 * Flexy says: No hardcoded queue config values!
 */
export const QUEUE_DEFAULTS = {
  /** Default max batch size for queue consumers */
  MAX_BATCH_SIZE: 10,
  /** Default max batch timeout in seconds for queue consumers */
  MAX_BATCH_TIMEOUT_S: 30,
  /** Default max retries for queue consumers */
  MAX_RETRIES: 5,
  /** Default retry delay in seconds for queue consumers */
  RETRY_DELAY_S: 60,
} as const;

/**
 * Python Development Server Defaults
 * Centralized defaults for Python backend templates.
 * Flexy says: No hardcoded Python port numbers!
 */
export const PYTHON_DEV_DEFAULTS = {
  /** Default port for FastAPI/Flask dev servers in generated templates */
  DEV_PORT: 8000,
  /** Default host for Python dev servers */
  DEV_HOST: "0.0.0.0",
} as const;

/**
 * Playwright Test Configuration Defaults
 * Viewport, retries, and worker settings for e2e tests.
 * Flexy says: No hardcoded viewport dimensions or CI magic numbers!
 */
export const PLAYWRIGHT_CONFIG = {
  /** Default viewport for headless browser tests */
  VIEWPORT: { width: 1280, height: 720 } as const,
  /** Default retries on CI (2) vs local (0) */
  CI_RETRIES: 2,
  /** Default workers on CI (1 for stability) */
  CI_WORKERS: 1,
} as const;

/**
 * Node.js Template Port Defaults
 * Default port used in generated Node.js template code.
 * Flexy says: No hardcoded 3000 in template generators!
 */
export const TEMPLATE_NODE_PORT = 3000;

/**
 * Environment Names
 * Centralized string constants for environment names.
 * Flexy says: No hardcoded "production" strings in tests!
 */
export const ENVIRONMENT_NAMES = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  STAGING: "staging",
  TEST: "test",
} as const;

/**
 * Platform & Runtime Names
 * Centralized platform identifiers used across the API.
 * Flexy says: No hardcoded "unknown" or "cloudflare-workers" strings!
 */
export const PLATFORM_VALUES = {
  /** Fallback when platform cannot be determined */
  UNKNOWN: "unknown",
  /** Cloudflare Workers runtime identifier */
  CLOUDFLARE_WORKERS: "cloudflare-workers",
} as const;

/**
 * Local Development Domain Defaults
 * Centralized source of truth for local development hostnames used in
 * deployment detection, CORS configs, and environment checks.
 * Flexy says: No hardcoded "localhost" strings in deployment detection!
 * Usage: import { DEV_DOMAIN_DEFAULTS } from "@blueprint/shared";
 *        VERCEL_DOMAINS.LOCAL.includes(hostname)
 */
export const DEV_DOMAIN_DEFAULTS = {
  /** Local development hostnames for deployment detection */
  LOCAL_HOSTNAMES: ["localhost", "127.0.0.1"] as readonly string[],
} as const;

/**
 * Hex Color to RGBA Helper
 * Converts a hex color string (with or without # prefix) to a CSS rgba() string
 * with the specified opacity. Ensures all rgba color references remain in sync
 * with their source hex values — changing a single hex color auto-propagates.
 * Flexy says: No hardcoded "rgba(99, 102, 241, 0.1)" duplicates of hex colors!
 * Usage: import { hexToRgba } from "@blueprint/shared";
 *        hexToRgba("#6366f1", 0.1) => "rgba(99, 102, 241, 0.1)"
 *        hexToRgba(COLORS.primary[500], 0.3) => "rgba(99, 102, 241, 0.3)"
 */
export function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const r = Number.parseInt(cleanHex.substring(0, 2), 16);
  const g = Number.parseInt(cleanHex.substring(2, 4), 16);
  const b = Number.parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * External Reference URLs
 * Centralized source of truth for external website URLs referenced in the app.
 * Flexy says: No hardcoded "https://workers.cloudflare.com/" in API config!
 * Usage: import { EXTERNAL_REFERENCE_URLS } from "@blueprint/shared";
 *        EXTERNAL_REFERENCE_URLS.CLOUDFLARE_WORKERS
 */
export const EXTERNAL_REFERENCE_URLS = {
  /** Cloudflare Workers documentation homepage */
  CLOUDFLARE_WORKERS: "https://workers.cloudflare.com/",
  /** React documentation homepage */
  REACT: "https://react.dev/",
} as const;

/**
 * Responsive Breakpoint Defaults (px)
 * Standard viewport width breakpoints used for responsive layout calculations,
 * corresponding to Tailwind's `md` (768px) and `lg` (1024px) breakpoints.
 * Flexy says: No hardcoded "1024" / "768" magic breakpoint numbers in components!
 * Usage: import { BREAKPOINT_DEFAULTS } from "@blueprint/shared";
 *        if (width >= BREAKPOINT_DEFAULTS.LG) { ... }
 */
export const BREAKPOINT_DEFAULTS = {
  /** Tailwind `md` breakpoint — tablet / small desktop */
  MD: 768,
  /** Tailwind `lg` breakpoint — desktop */
  LG: 1024,
} as const;
