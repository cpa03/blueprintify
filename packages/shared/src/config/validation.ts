/**
 * Shared constants and configuration
 * Centralized configuration used across frontend and backend
 */

/**
 * Validation Limits Configuration
 * Centralized validation constraints for forms and API requests
 */
export const VALIDATION_LIMITS = {
  PROJECT_NAME: {
    MIN: 1,
    MAX: 100,
    /** Warning threshold percentage for character counters */
    WARNING_THRESHOLD: 90,
  },
  DESCRIPTION: {
    MIN: 10,
    MAX: 2000,
  },
  TARGET_AUDIENCE: {
    MAX: 200,
  },
  CONSTRAINTS: {
    MAX: 1000,
  },
  FEATURE: {
    MAX: 100,
    MAX_COUNT: 20,
  },
  TECH_STACK: {
    MIN: 1,
    MAX: 10,
  },
  VERSION: {
    MAX: 50,
  },
} as const;

/**
 * Security Configuration
 * Centralized security limits for content validation
 */
export const SECURITY_LIMITS = {
  MAX_CONTENT_LENGTH: 1000000,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_JSON_DEPTH: 20,
  FILE_NAME_MIN_LENGTH: 1,
  FILE_NAME_MAX_LENGTH: 255,
  ALLOWED_FILE_TYPES: [".json", ".md", ".txt"] as const,
  /** Individual file extension constants for type-safe checks */
  FILE_EXTENSIONS: {
    /** JSON file extension */
    JSON: ".json" as const,
    /** Markdown file extension */
    MARKDOWN: ".md" as const,
    /** Plain text file extension */
    TEXT: ".txt" as const,
  } as const,
} as const;

/**
 * Export/Import Content Limits
 * Maximum length constraints for export and import payloads.
 * Prevents memory exhaustion and DoS vectors via oversized content.
 */
export const EXPORT_LIMITS = {
  /** Maximum blueprint content length (100KB) */
  MAX_BLUEPRINT_LENGTH: 100_000,
  /** Maximum tasks content length (100KB) */
  MAX_TASKS_LENGTH: 100_000,
  /** Maximum import data length (200KB - needs to accommodate JSON-serialized payload) */
  MAX_IMPORT_DATA_LENGTH: 200_000,
} as const;

/**
 * Body Size Limits
 * Centralized body size limits for request validation.
 * Flexy says: No hardcoded MB/KB magic numbers!
 */
export const BODY_SIZE_LIMITS = {
  /** Default maximum body size in MB - for standard JSON API requests */
  DEFAULT_MB: 1,
  /** Strict limit in KB - for text-only endpoints */
  STRICT_KB: 100,
  /** Lenient limit in MB - for file upload endpoints */
  LENIENT_MB: 10,
} as const;

/**
 * Input Validation States
 * Centralized source of truth for input validation state string values.
 * Flexy says: No hardcoded "valid"/"invalid"/"warning" in AnimatedInput validationState types!
 * Usage: import { INPUT_VALIDATION_STATES } from "@blueprint/shared";
 *        type ValidationState = (typeof INPUT_VALIDATION_STATES)[keyof typeof INPUT_VALIDATION_STATES];
 */
export const INPUT_VALIDATION_STATES = {
  /** Default/neutral input state */
  DEFAULT: "default",
  /** Valid input state */
  VALID: "valid",
  /** Invalid input state */
  INVALID: "invalid",
  /** Warning input state */
  WARNING: "warning",
} as const;

/**
 * Validation Checkmark Aria-Labels
 * Centralized source of truth for validation indicator accessibility labels.
 * Flexy says: No hardcoded "Field is valid" or "Field needs attention" in ValidationCheckmark!
 * Usage: import { VALIDATION_LABELS } from "@blueprint/shared";
 *        ariaLabel={VALIDATION_LABELS.FIELD_VALID}
 *        invalidAriaLabel={VALIDATION_LABELS.FIELD_INVALID}
 */
export const VALIDATION_LABELS = {
  /** Default label shown when a validated field passes validation */
  FIELD_VALID: "Field is valid",
  /** Default label shown when a validated field fails validation */
  FIELD_INVALID: "Field needs attention",
} as const;

/**
 * Character Counter Threshold Defaults
 * Threshold values used by character counter components for warning/danger states
 * and screen-reader announcements.
 * Flexy says: No hardcoded "10" near-limit or "80" warning threshold in character counters!
 * Usage: import { CHAR_COUNTER_THRESHOLDS } from "@blueprint/shared";
 *        if (remaining <= CHAR_COUNTER_THRESHOLDS.NEAR_LIMIT) { ... }
 */
export const CHAR_COUNTER_THRESHOLDS = {
  /** Characters remaining before "near limit" screen-reader announcement */
  NEAR_LIMIT: 10,
  /** Percentage at which the counter switches from normal to warning state */
  WARNING_PERCENT: 80,
  /** Percentage at which the counter switches from warning to danger state */
  DANGER_PERCENT: 100,
} as const;

/**
 * Character Counter Color Classes
 * Centralized source of truth for Tailwind CSS color class strings used by
 * the CharacterCounter component to indicate validation state (at-limit,
 * warning, valid, default). These classes reference design tokens defined
 * in tailwind.config.js and map to semantic component states.
 * Flexy says: No hardcoded "text-accent-pink" color class strings in CharacterCounter!
 * Usage: import { CHAR_COUNTER_COLORS } from "@blueprint/shared";
 *        className={CHAR_COUNTER_COLORS.AT_LIMIT}
 */
export const CHAR_COUNTER_COLORS = {
  /** Color class when character limit is reached — pink/destructive */
  AT_LIMIT: "text-accent-pink" as const,
  /** Color class when approaching the character limit — yellow/warning */
  WARNING: "text-yellow-500" as const,
  /** Color class when input meets minimum requirement — emerald/success */
  VALID: "text-accent-emerald" as const,
  /** Color class for default/empty state — dark/subtle */
  DEFAULT: "text-dark-500" as const,
} as const;

/**
 * Scrollbar Color Tokens
 * Centralized source of truth for scrollbar thumb and track color values.
 * Used by index.css to define CSS custom properties and by any component
 * that needs to reference scrollbar color values programmatically.
 * Flexy says: No hardcoded "#4b5563" or "#0f172a" hex values in CSS scrollbar rules!
 * Usage: CSS uses `var(--scrollbar-thumb)` and `var(--scrollbar-track)`
 */
export const SCROLLBAR_COLORS = {
  /** Scrollbar thumb color — dark gray-600, visible on dark backgrounds */
  THUMB: "#4b5563",
  /** Scrollbar track color — dark slate-900, subtle background for the scrollbar track */
  TRACK: "#0f172a",
} as const;

/**
 * Security Error Categories
 * Centralized source of truth for SecurityError category type strings.
 * Flexy says: No hardcoded "XSS" or "VALIDATION" strings in SecurityError class!
 * Usage: import { SECURITY_ERROR_CATEGORIES } from "@blueprint/shared";
 *        type SecurityErrorCategory = (typeof SECURITY_ERROR_CATEGORIES)[keyof typeof SECURITY_ERROR_CATEGORIES];
 */
export const SECURITY_ERROR_CATEGORIES = {
  /** Cross-site scripting (XSS) violation */
  XSS: "XSS",
  /** General validation failure */
  VALIDATION: "VALIDATION",
  /** Storage quota exceeded */
  QUOTA: "QUOTA",
  /** File validation failure */
  FILE: "FILE",
} as const;

// ============================================================================
// XSS Sanitization Configuration
// Centralized tag allowlists, attribute allowlists, forbidden tag names, and
// error strings used by the server-side HTML sanitizer (apps/api/src/utils/sanitize.ts).
// Flexy says: No hardcoded HTML tag names or attribute strings in sanitization code!
// Usage: import { SANITIZE_ALLOWED_TAGS, SANITIZE_ALLOWED_ATTR } from "@blueprint/shared";
//        ALLOWED_TAGS.has(SANITIZE_ALLOWED_TAGS[0]) // Build Set at module init
// ============================================================================

/**
 * Safe HTML Tag Allowlist
 * Centralized list of HTML tags permitted in sanitized Markdown/HTML content.
 * Only these tags survive the sanitization process — all others are stripped
 * (keeping their inner text content).
 * Flexy says: No hardcoded tag name arrays in sanitize.ts!
 * Usage: import { SANITIZE_ALLOWED_TAGS } from "@blueprint/shared";
 *        new Set(SANITIZE_ALLOWED_TAGS) // Build the Set once at module init
 */
export const SANITIZE_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "ins",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "pre",
  "code",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "a",
  "img",
  "hr",
] as const;

/**
 * Safe HTML Attribute Allowlist
 * Centralized list of HTML attributes permitted on allowed tags after sanitization.
 * All other attributes are stripped from the output.
 * Flexy says: No hardcoded "href" or "class" strings in sanitization attribute filters!
 */
export const SANITIZE_ALLOWED_ATTR = ["href", "title", "alt", "src", "class", "rel"] as const;

/**
 * Forbidden HTML Tag Names
 * Tags that are completely forbidden regardless of attributes or context.
 * These represent active content / injection vectors that should never appear
 * in sanitized content — even as self-closing tags.
 * Flexy says: No hardcoded "script" or "iframe" in regex patterns!
 */
export const SANITIZE_FORBIDDEN_TAG_NAMES = [
  "script",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "svg",
  "math",
  "base",
  "link",
  "meta",
  "noscript",
  "template",
  "style",
  "applet",
  "frame",
  "frameset",
  "textarea",
  "select",
  "option",
  "optgroup",
  "datalist",
  "keygen",
  "output",
  "marquee",
  "isindex",
] as const;

/**
 * Dangerous Container Tag Names
 * Tags for which BOTH the tag AND its inner content are completely removed
 * during sanitization. Unlike SANITIZE_FORBIDDEN_TAG_NAMES (which strips
 * just the tag but keeps text content), these tags are considered so
 * dangerous that their content must also be eliminated.
 * Flexy says: No hardcoded container tag lists in sanitize.ts regex!
 */
export const SANITIZE_DANGEROUS_CONTAINER_TAG_NAMES = [
  "script",
  "iframe",
  "object",
  "embed",
  "style",
  "noscript",
  "template",
  "applet",
  "frame",
  "frameset",
] as const;

/**
 * Sanitization Replacement Strings
 * Centralized placeholder and replacement strings used during the sanitization
 * process for neutralizing dangerous patterns.
 * Flexy says: No hardcoded replacement strings in sanitize.ts!
 */
export const SANITIZE_REPLACEMENT_STRINGS = {
  /** Replacement for dangerous URL scheme attribute values (e.g., javascript: URLs) */
  DANGEROUS_URL_PLACEHOLDER: "#dangerous-url-removed" as const,
  /** Replacement prefix for CSS expression/behavior attack patterns */
  CSS_ATTACK_BLOCKED_PREFIX: "blocked_" as const,
  /** Replacement string for prompt injection patterns removed from user input */
  PROMPT_INJECTION_REDACTED: "[redacted]" as const,
} as const;

/**
 * Sanitization Error Strings
 * Centralized error/diagnostic message strings used in XSS validation.
 * Flexy says: No hardcoded "script tag" or "dangerous HTML tag" in validation!
 */
export const SANITIZE_ERROR_STRINGS = {
  /** Diagnostic label for script tag detection */
  SCRIPT_TAG: "script tag",
  /** Diagnostic label for event handler attribute detection */
  EVENT_HANDLER_ATTR: "event handler attribute",
  /** Diagnostic label for javascript: URL detection */
  JAVASCRIPT_URL: "javascript: URL",
  /** Diagnostic label for dangerous HTML tag detection */
  DANGEROUS_HTML_TAG: "dangerous HTML tag",
  /** Error message template for XSS validation failures */
  VALIDATION_ERROR: "Content contains potentially unsafe HTML",
  /** User-facing action hint appended to validation error */
  REMOVAL_HINT: "Please remove embedded scripts or suspicious tags.",
} as const;
