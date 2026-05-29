/**
 * Prompt Security Configuration
 *
 * Flexy says: Extracted from services/prompts.ts for modularity and reusability.
 * Centralized injection detection patterns and sanitization limits.
 *
 * @module config/prompt-security
 */

import { MAX_INPUT_LENGTH } from "@blueprint/shared";
// Re-exported for backward compatibility with modules that import from ./prompt-security
export { MAX_INPUT_LENGTH };

/**
 * Patterns that indicate prompt injection attempts (case-insensitive).
 * Covers common prompt injection vectors to protect AI system prompts.
 *
 * @see https://owasp.org/www-community/attacks/Prompt_Injection
 */
export const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,
  /forget\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,
  /disregard\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,
  /system\s+prompts?:/gi,
  /you\s+(are\s+)?(now|will\s+now)\s+(an?\s+)?/gi,
  /act\s+as\s+(an?\s+)?/gi,
  /new\s+(instructions|prompts?|directives?):/gi,
  /over[-\s]?ride\s+(instructions|prompts?|directives?)/gi,
];

/**
 * Control characters that are filtered out during sanitization.
 * Allowed control characters: tab (9), newline (10), carriage return (13).
 * All other characters with charCode < 32 are removed.
 */
export const CONTROL_CHAR_FILTER = {
  /** Maximum allowed character code before filtering */
  MAX_ALLOWED_CODEPOINT: 31,
  /** Characters to allow even if below threshold: tab(9), newline(10), carriage return(13) */
  ALLOWED_CODEPOINTS: [9, 10, 13] as readonly number[],
} as const;
