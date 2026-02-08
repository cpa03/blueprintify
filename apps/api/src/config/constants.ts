import { RETRY_CONFIG as SHARED_RETRY_CONFIG } from "@blueprint/shared";

/**
 * API configuration constants
 */

export const RETRY_CONFIG = SHARED_RETRY_CONFIG;

// AI service configuration
export const AI_CONFIG = {
  DEFAULT_MODEL: "gpt-4o-mini",
  DEFAULT_TIMEOUT: 60000,
  DEFAULT_MAX_TOKENS: 4000,
  DEFAULT_TEMPERATURE: 0.7,
} as const;
