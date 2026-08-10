/**
 * Security Configuration Module
 *
 * Centralized security configuration extracted from lib/security.ts
 * Flexy says: No hardcoded values - everything configurable and modular!
 *
 * @module config/security
 */

import {
  SECURITY_LIMITS,
  STORAGE_CONFIG,
  HTTP_HEADER_NAMES,
  SECURITY_VALUES,
  SANITIZE_ALLOWED_TAGS,
  SANITIZE_ALLOWED_ATTR,
  CSP_CONNECT_DOMAINS,
} from "@blueprint/shared/config";

// ============================================================================
// DOMPurify Configuration
// ============================================================================

export const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [...SANITIZE_ALLOWED_TAGS] as string[],
  ALLOWED_ATTR: [...SANITIZE_ALLOWED_ATTR] as string[],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: [
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
  ] as string[],
  FORBID_ATTR: ["onclick", "onload", "onerror", "onmouseover", "style", "formaction"] as string[],
  SANITIZE_DOM: true,
  SANITIZE_NAMED_PROPS: true,
  KEEP_CONTENT: true,
} as const;

// ============================================================================
// XSS Pattern Detection
// ============================================================================

/**
 * XSS attack pattern detection library.
 * Covers traditional vectors and modern attack techniques including:
 * - Script injection, event handlers, javascript: URLs
 * - SVG/math elements with embedded scripts
 * - DOM clobbering and mutation XSS
 * - CSS-based attacks (expression, behavior, binding)
 * @see https://owasp.org/www-community/xss-filter-evasion-cheatsheet
 */
export const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /<iframe\b[^>]*>/i,
  /<object\b[^>]*>/i,
  /<embed\b[^>]*>/i,
  /<form\b[^>]*>/i,
  /<input\b[^>]*>/i,
  /<button\b[^>]*>/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /@import/i,
  /vbscript:/i,
  /data:text\/html/i,
  // SVG-based XSS vectors
  /<svg\b[^>]*>/i,
  /<math\b[^>]*>/i,
  /<animate\b[^>]*>/i,
  /<set\b[^>]*>/i,
  /<use\b[^>]*>/i,
  // Protocol handlers
  /data:\s*[^,]*;base64/i,
  /blob:/i,
  // DOM clobbering patterns
  /id\s*=\s*["']?__proto__["']?/i,
  /id\s*=\s*["']?constructor["']?/i,
  // Mutation XSS patterns
  /<noscript\b[^>]*>/i,
  /<template\b[^>]*>/i,
] as const;

/**
 * CodeMirror-specific dangerous patterns for markdown sanitization.
 * Additional patterns checked during markdown rendering.
 */
export const CODEMIRROR_XSS_PATTERNS = [
  /data:text\/html/i,
  /vbscript:/i,
  /@import\s+url/i,
  /expression\s*\(/i,
  /behavior\s*:/i,
  /binding\s*:/i,
  /include-source\s*:/i,
] as const;

/**
 * Suspicious JSON key names to check during JSON validation.
 * Used for prototype pollution and injection detection.
 */
export const SUSPICIOUS_JSON_KEYS = [
  "__proto__",
  "constructor",
  "prototype",
  "eval",
  "function",
  "script",
] as const;

// ============================================================================
// Security Error Messages
// ============================================================================

export const SECURITY_ERROR_MESSAGES = {
  CONTENT_VALIDATION_FAILED: "Content validation failed",
  XSS_PATTERNS_DETECTED:
    "Content contains potentially dangerous XSS patterns. This may include script tags, event handlers, or javascript: URLs. Please remove any embedded scripts or suspicious HTML.",
  XSS_DANGEROUS_PATTERNS: "Content contains potentially dangerous patterns",
  CODEMIRROR_DANGEROUS_PATTERNS:
    "Content contains CodeMirror-specific dangerous patterns (data: URLs, vbscript, CSS expressions, or IE-specific behaviors). These are blocked for security reasons.",
  FILE_TYPE_NOT_ALLOWED: (extension: string, allowedTypes: string) =>
    `File type ${extension} is not allowed. Allowed types: ${allowedTypes}`,
  FILE_SIZE_EXCEEDED: (maxSizeMB: number) =>
    `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
  FILE_VALIDATION_FAILED: "File validation failed",
  PROTOTYPE_POLLUTION_DETECTED: "JSON contains potential prototype pollution vulnerabilities",
  JSON_DEPTH_EXCEEDED: (maxDepth: number) =>
    `JSON object depth exceeds maximum allowed limit (${maxDepth})`,
  JSON_SUSPICIOUS_KEYS: (keys: string) => `JSON contains suspicious keys: ${keys}`,
  INVALID_JSON_FORMAT: "Invalid JSON format",
  STORAGE_QUOTA_EXCEEDED: "Storage quota exceeded. Please clear some data.",
  UNKNOWN_SECURITY_ERROR: "An unknown security error occurred",
} as const;

// ============================================================================
// Security Headers Configuration
// ============================================================================

/**
 * Content Security Policy directives
 * Modular - easily add/remove CSP directives
 *
 * VERIFIED against the production build (`apps/web/dist/index.html`) with
 * Chromium 151: zero violations with every inline handler and the inline
 * critical-CSS block loading correctly. The two hashes below are the SHA-256
 * of the EXACT inline `onload` attribute values found in the built HTML:
 *   - `this.media='all';this.onload=null`  (preloadCssPlugin stylesheet handler)
 *   - `\n        this.media = 'all';\n        this.onload = null;\n      `
 *     (fonts.googleapis.com stylesheet handlers in index.html — identified by
 *     the awareness that the sync returning from the previous `this.media`
 *     line is part of the hashed value, including leading/trailing whitespace)
 *
 * ⚠️ Do NOT "fix" these hashes by eye — recompute them from dist/index.html:
 *   node -e "console.log(require('crypto').createHash('sha256').update(
 *     <exact attribute value>).digest('base64'))"
 * A stale hash silently blocks the async stylesheet `onload` switch, leaving
 * fonts and critical CSS dead in production (see issue #955).
 */
const CSP_DIRECTIVES = {
  DEFAULT_SRC: ["'self'"],
  SCRIPT_SRC: [
    "'self'",
    "'unsafe-hashes'",
    "'sha256-p5PnWJvMOnsZyLjxblLBMDwBfOASHA7CQcLYb5mwepY='",
    "'sha256-0J0eLBGw8ud/UAeoy6YUEYy1j5N+6CTyFGIzTUiVskY='",
  ],
  STYLE_SRC: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  IMG_SRC: ["'self'", "data:", "https:"],
  FONT_SRC: ["'self'", "https://fonts.gstatic.com"],
  CONNECT_SRC: ["'self'", CSP_CONNECT_DOMAINS.PRODUCTION_API, CSP_CONNECT_DOMAINS.STAGING_API],
  OBJECT_SRC: ["'none'"],
  FRAME_ANCESTORS: ["'none'"],
  BASE_URI: ["'self'"],
  FORM_ACTION: ["'self'"],
} as const;

/**
 * Standard security headers
 * Used by API responses
 */
export const SECURITY_HEADERS = {
  [HTTP_HEADER_NAMES.CONTENT_SECURITY_POLICY]: Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      const directive = key.toLowerCase().replace(/_/g, "-");
      return `${directive} ${values.join(" ")}`;
    })
    .join("; "),
  [HTTP_HEADER_NAMES.X_CONTENT_TYPE_OPTIONS]: SECURITY_VALUES.X_CONTENT_TYPE_OPTIONS_NOSNIFF,
  [HTTP_HEADER_NAMES.X_FRAME_OPTIONS]: SECURITY_VALUES.X_FRAME_OPTIONS_DENY,
  [HTTP_HEADER_NAMES.X_XSS_PROTECTION]: SECURITY_VALUES.X_XSS_PROTECTION_VALUE,
  [HTTP_HEADER_NAMES.REFERRER_POLICY]: SECURITY_VALUES.REFERRER_POLICY_STRICT_ORIGIN,
  [HTTP_HEADER_NAMES.STRICT_TRANSPORT_SECURITY]: SECURITY_VALUES.STRICT_TRANSPORT_SECURITY_VALUE,
  [HTTP_HEADER_NAMES.PERMISSIONS_POLICY]: [
    SECURITY_VALUES.PERMISSIONS_POLICY.ACCELEROMETER_NONE,
    SECURITY_VALUES.PERMISSIONS_POLICY.CAMERA_NONE,
    SECURITY_VALUES.PERMISSIONS_POLICY.GEOLOCATION_NONE,
    SECURITY_VALUES.PERMISSIONS_POLICY.GYROSCOPE_NONE,
    SECURITY_VALUES.PERMISSIONS_POLICY.MAGNETOMETER_NONE,
    SECURITY_VALUES.PERMISSIONS_POLICY.MICROPHONE_NONE,
    SECURITY_VALUES.PERMISSIONS_POLICY.PAYMENT_NONE,
    SECURITY_VALUES.PERMISSIONS_POLICY.USB_NONE,
  ].join(", "),
} as const;

// ============================================================================
// Security Config Aggregation
// ============================================================================

/**
 * Complete security configuration object
 * Aggregates all security-related configs for easy import
 */
export const SECURITY_CONFIG = {
  DOMPURIFY_CONFIG,
  MAX_CONTENT_LENGTH: SECURITY_LIMITS.MAX_CONTENT_LENGTH,
  MAX_FILE_SIZE: SECURITY_LIMITS.MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES: [...SECURITY_LIMITS.ALLOWED_FILE_TYPES],
  STORAGE_QUOTA: STORAGE_CONFIG.QUOTA_BYTES,
  XSS_PATTERNS,
  CODEMIRROR_XSS_PATTERNS,
  SUSPICIOUS_JSON_KEYS,
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
} as const;
