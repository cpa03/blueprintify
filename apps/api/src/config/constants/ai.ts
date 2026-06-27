/**
 * AI Configuration Constants
 *
 * AI model, timeout, and metadata configuration.
 *
 * @module config/constants/ai
 */

import { API_NAME, API_STATUS_VALUES } from "@blueprint/shared";
import { getEnvConfig } from "./env";

/**
 * AI model configuration with env-based getters.
 */
export const AI_CONFIG = {
  get DEFAULT_MODEL(): string {
    return getEnvConfig().OPENAI_MODEL;
  },
  get DEFAULT_TIMEOUT(): number {
    return getEnvConfig().OPENAI_TIMEOUT_MS;
  },
  get DEFAULT_MAX_TOKENS(): number {
    return getEnvConfig().OPENAI_MAX_TOKENS;
  },
  get DEFAULT_TEMPERATURE(): number {
    return getEnvConfig().OPENAI_TEMPERATURE;
  },
};

/**
 * API metadata including name, version, and health status.
 */
export const API_METADATA = {
  NAME: API_NAME,
  get VERSION(): string {
    return getEnvConfig().API_VERSION;
  },
  STATUS: API_STATUS_VALUES.HEALTHY,
};
