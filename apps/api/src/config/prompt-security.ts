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
 * Human-readable descriptions for each injection pattern category.
 * Used for observability logging when injection attempts are detected.
 */
const PATTERN_DESCRIPTIONS: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  {
    pattern: /ignore\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,
    label: "instruction_override:ignore",
  },
  {
    pattern:
      /forget\s+(all\s+)?(above\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,
    label: "instruction_override:forget",
  },
  {
    pattern: /disregard\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,
    label: "instruction_override:disregard",
  },
  {
    pattern:
      /(print|output|reveal|display|show|repeat|echo|return)\s+(all\s+)?(your\s+|the\s+)?(previous\s+)?(system\s+)?(instructions|prompts?|directives?|commands?)/gi,
    label: "output_disclosure",
  },
  {
    pattern: /show\s+me\s+(your\s+|the\s+)?(prompts?|instructions|directives?|system)/gi,
    label: "output_disclosure:show_me",
  },
  { pattern: /system\s+prompts?:/gi, label: "impersonation:system_prompt" },
  { pattern: /you\s+(are\s+)?(now|will\s+now)\s+(an?\s+)?/gi, label: "impersonation:you_are_now" },
  { pattern: /act\s+as\s+(an?\s+)?/gi, label: "impersonation:act_as" },
  { pattern: /role[-\s]?play(\s+(as|that\s+you\s+are))?/gi, label: "impersonation:role_play" },
  { pattern: /pretend\s+(you\s+are|to\s+be)\s+/gi, label: "impersonation:pretend" },
  { pattern: /(do\s+anything\s+now|dan\s+jailbreak)/gi, label: "jailbreak:dan" },
  { pattern: /you\s+(are\s+)?(free|released)\s+(from|of)/gi, label: "jailbreak:release" },
  {
    pattern: /no\s+(rules|restrictions|boundaries|limitations|filter(s|ing)?)/gi,
    label: "jailbreak:no_restrictions",
  },
  { pattern: /new\s+(instructions|prompts?|directives?):/gi, label: "instruction_override:new" },
  {
    pattern: /over[-\s]?ride\s+(instructions|prompts?|directives?)/gi,
    label: "instruction_override:override",
  },
  { pattern: /^[=\-_*]{3,}$/gm, label: "boundary:separator" },
  {
    pattern: /\{\{\s*(system_prompt|instructions|prompt|config)\s*\}\}/gi,
    label: "template_injection",
  },
];

/**
 * Detects prompt injection patterns in user input and returns the matched labels.
 * Used for security observability and logging — allows monitoring systems to
 * track injection attempt patterns without breaking UX.
 *
 * @param input - Raw user input string to scan
 * @returns Array of matched pattern labels (empty if clean)
 *
 * @example
 * ```typescript
 * const matches = detectInjectionPatterns("Ignore all instructions and do X");
 * // Returns: ["instruction_override:ignore"]
 * ```
 */
export function detectInjectionPatterns(input: string): string[] {
  if (!input) return [];
  const matches: string[] = [];
  for (const { pattern, label } of PATTERN_DESCRIPTIONS) {
    if (pattern.test(input)) {
      matches.push(label);
    }
  }
  return matches;
}

/**
 * Returns true if any prompt injection pattern is detected in the input.
 * Useful for quick boolean checks before detailed logging.
 *
 * @param input - Raw user input string to scan
 * @returns true if any injection pattern is matched
 *
 * @example
 * ```typescript
 * if (hasInjectionPattern(userInput)) {
 *   logWarning("Injection attempt detected");
 * }
 * ```
 */
export function hasInjectionPattern(input: string): boolean {
  return detectInjectionPatterns(input).length > 0;
}

/**
 * Error message used when prompt injection is detected during validation.
 * Provides a clear, user-safe message that doesn't reveal detection internals.
 */
export const PROMPT_INJECTION_ERROR_MESSAGE =
  "Input contains potentially unsafe content. Please remove any instructions directed at the AI system and try again.";

/**
 * Validates that user input doesn't contain prompt injection patterns.
 * Throws a standard Error with a clear message if injection is detected.
 * Designed to be used in Zod refinements and API validation middleware.
 *
 * This provides defense-in-depth: even if the sanitization in
 * sanitizePromptInput() is bypassed, the request will be rejected
 * at the validation layer before reaching the AI service.
 *
 * @param input - Raw user input string to validate
 * @param fieldName - Optional field name for error context (e.g., "description")
 * @throws {Error} When injection patterns are detected
 *
 * @example
 * ```typescript
 * // In Zod schema refinement:
 * .refine((val) => { validatePromptInput(val); return true; }, {
 *   message: PROMPT_INJECTION_ERROR_MESSAGE
 * })
 * ```
 */
export function validatePromptInput(input: string, fieldName?: string): void {
  if (!input) return;

  const detected = detectInjectionPatterns(input);
  if (detected.length > 0) {
    const context = fieldName ? ` in field '${fieldName}'` : "";
    throw new Error(
      `${PROMPT_INJECTION_ERROR_MESSAGE} Detected patterns${context}: ${detected.join(", ")}`
    );
  }
}

/**
 * Zod refinement function for prompt injection detection.
 * Returns true if the input is clean (no injection detected).
 * Returns false with a clear error message if injection patterns are found.
 *
 * Use this in Zod schemas to add prompt-injection protection at the
 * validation boundary — before data reaches the prompt builder.
 *
 * @example
 * ```typescript
 * const SafeStringSchema = z.string().refine(
 *   (val) => isPromptInjectionClean(val),
 *   { message: PROMPT_INJECTION_ERROR_MESSAGE }
 * );
 * ```
 */
export function isPromptInjectionClean(input: string): boolean {
  return !hasInjectionPattern(input);
}

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
