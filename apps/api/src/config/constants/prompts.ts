/**
 * Prompt Configuration Constants
 *
 * AI prompt templates and input configuration.
 *
 * @module config/constants/prompts
 */

import { PROMPT_DELIMITERS } from "@blueprint/shared";
import {
  ARCHITECT_SYSTEM_TEMPLATE,
  TASK_SPLITTER_SYSTEM_TEMPLATE,
  REFINER_SYSTEM_TEMPLATE,
} from "../prompts";
import { MAX_INPUT_LENGTH } from "../prompt-security";

/**
 * AI system prompt templates for blueprint generation.
 */
export const PROMPT_CONFIG = {
  ARCHITECT_SYSTEM: ARCHITECT_SYSTEM_TEMPLATE,
  TASK_SPLITTER_SYSTEM: TASK_SPLITTER_SYSTEM_TEMPLATE,
  REFINER_SYSTEM: REFINER_SYSTEM_TEMPLATE,
};

/**
 * Prompt input limits and sanitization configuration.
 */
export const PROMPT_INPUT_CONFIG = {
  MAX_LENGTH: MAX_INPUT_LENGTH,
  USER_DELIMITER_START: PROMPT_DELIMITERS.USER_INPUT_START,
  USER_DELIMITER_END: PROMPT_DELIMITERS.USER_INPUT_END,
} as const;
