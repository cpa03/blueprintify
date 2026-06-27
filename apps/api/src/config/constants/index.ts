/**
 * API Configuration Constants - Modular Re-export Hub
 *
 * Each constant domain is defined in its own module under config/constants/.
 * Import directly from the specific module for tree-shaking,
 * or from this index for convenience.
 *
 * @example
 * ```typescript
 * // Import from specific module (preferred)
 * import { AI_CONFIG } from "../config/constants/ai";
 *
 * // Import from index (convenience - same as before)
 * import { AI_CONFIG } from "../config/constants";
 * ```
 *
 * @module config/constants
 */

export { setEnvConfig, getEnvConfig } from "./env";

export { AI_CONFIG, API_METADATA } from "./ai";
export { API_ENDPOINTS, ROUTE_PATHS } from "./endpoints";
export {
  ERROR_CODES,
  RETRYABLE_ERROR_CODES,
  ERROR_MESSAGES,
  DEFAULT_ERROR_MESSAGES,
  VALIDATION_MESSAGES,
  CONFIG_MESSAGES,
} from "./errors";
export {
  CORS_CONFIG,
  API_HEADERS,
  SSE_CORS_HEADERS,
  HTTP_STATUS,
  SSE_CONFIG,
  SSE_HEADERS,
} from "./network";
export { PROMPT_CONFIG, PROMPT_INPUT_CONFIG } from "./prompts";
export {
  RETRY_CONFIG,
  RETRYABLE_STATUS_CODES,
  RETRY_LOGIC,
  CIRCUIT_BREAKER_CONFIG,
  CACHE_CONFIG,
} from "./resilience";
export {
  DB_ID_CONFIG,
  STORAGE_KV_CONFIG,
  STORAGE_CONFIG,
  BODY_SIZE_LIMITS,
  BODY_SIZE_MAX,
  KB,
  MB,
} from "./storage";
export { RATE_LIMIT_CONFIG, RATE_LIMIT_CONSTANTS } from "./ratelimit";
export {
  SHARE_CONFIG,
  SHARE_ERROR_MESSAGES,
  STORAGE_MESSAGES,
  IMPORT_CONFIG,
  IMPORT_REGEX,
  IMPORT_ERROR_MESSAGES,
  EXPORT_TEMPLATES,
  EXPORT_ERROR_MESSAGES,
} from "./share";
export { LOGGER_CONFIG } from "./logger";
export { EXTERNAL_URLS } from "./external";
