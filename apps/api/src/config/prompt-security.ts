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
 * Based on OWASP Prompt Injection Guide and known jailbreak techniques:
 * - Direct injection: overriding system instructions
 * - Role-switch / impersonation: pretending to be a different entity
 * - Output manipulation: requesting instruction disclosure
 * - Separator / boundary attacks: injecting delimiters to confuse prompt structure
 * - Template injection: attempting to access internal template variables
 *
 * @see https://owasp.org/www-community/attacks/Prompt_Injection
 */
export const INJECTION_PATTERNS: readonly RegExp[] = [
  // === Core instruction override patterns ===
  // "ignore all previous instructions", "ignore all prompts"
  /ignore\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,

  // "forget all previous instructions"
  /forget\s+(all\s+)?(above\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,

  // "disregard all previous instructions"
  /disregard\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,

  // === Output disclosure patterns ===
  // "print/system prompt", "repeat/instructions above", "reveal/prompts",
  // "reveal all previous commands", "show your system instructions"
  /(print|output|reveal|display|show|repeat|echo|return)\s+(all\s+)?(your\s+|the\s+)?(previous\s+)?(system\s+)?(instructions|prompts?|directives?|commands?)/gi,

  // "show me the prompt", "show me your instructions"
  /show\s+me\s+(your\s+|the\s+)?(prompts?|instructions|directives?|system)/gi,

  // === Role / impersonation patterns ===
  /system\s+prompts?:/gi,
  /you\s+(are\s+)?(now|will\s+now)\s+(an?\s+)?/gi,
  /act\s+as\s+(an?\s+)?/gi,

  // "role-play", "pretend you are", "pretend to be"
  /role[-\s]?play(\s+(as|that\s+you\s+are))?/gi,
  /pretend\s+(you\s+are|to\s+be)\s+/gi,

  // === Jailbreak / DAN patterns ===
  // "Do Anything Now", "DAN" jailbreak
  /(do\s+anything\s+now|dan\s+jailbreak)/gi,

  // "you are free", "you have been released", "no restrictions"
  /you\s+(are\s+)?(free|released)\s+(from|of)/gi,
  /no\s+(rules|restrictions|boundaries|limitations|filter(s|ing)?)/gi,

  // === New instruction injection patterns ===
  /new\s+(instructions|prompts?|directives?):/gi,
  /over[-\s]?ride\s+(instructions|prompts?|directives?)/gi,

  // === Separator / boundary attack patterns ===
  // Lines of 3+ repeated separator characters (e.g., ---, ===, ___)
  /^[=\-_*]{3,}$/gm,

  // === Template injection patterns ===
  // Attempts to access template variables like {{...}}
  /\{\{\s*(system_prompt|instructions|prompt|config)\s*\}\}/gi,
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
