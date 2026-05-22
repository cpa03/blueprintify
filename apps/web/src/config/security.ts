/**
 * Security Configuration Module
 *
 * Centralized security configuration extracted from lib/security.ts
 * Flexy says: No hardcoded values - everything configurable and modular!
 *
 * @module config/security
 */

import { SECURITY_LIMITS, STORAGE_CONFIG } from "@blueprint/shared";

// ============================================================================
// DOMPurify Configuration
// ============================================================================

export const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
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
  ] as string[],
  ALLOWED_ATTR: ["href", "title", "alt", "src", "class", "rel"] as string[],
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
// Security Headers Configuration
// ============================================================================

/**
 * Content Security Policy directives
 * Modular - easily add/remove CSP directives
 */
export const CSP_DIRECTIVES = {
  DEFAULT_SRC: ["'self'"],
  SCRIPT_SRC: [
    "'self'",
    "'unsafe-hashes'",
    "'sha256-87uI7LZJ8azkq44HKb4qqF/0VgaCUXD27d5/XHXT3yQ='",
  ],
  STYLE_SRC: ["'self'"],
  IMG_SRC: ["'self'", "data:", "https:"],
  FONT_SRC: ["'self'"],
  CONNECT_SRC: ["'self'"],
  OBJECT_SRC: ["'none'"],
  FRAME_ANCESTORS: ["'none'"],
  BASE_URI: ["'self'"],
  FORM_ACTION: ["'self'"],
} as const;

/**
 * Standard security headers
 * Used by getContentSecurityHeaders() and API responses
 */
export const SECURITY_HEADERS = {
  "Content-Security-Policy": Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      const directive = key.toLowerCase().replace(/_/g, "-");
      return `${directive} ${values.join(" ")}`;
    })
    .join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Permissions-Policy": [
    "accelerometer=()",
    "camera=()",
    "geolocation=()",
    "gyroscope=()",
    "magnetometer=()",
    "microphone=()",
    "payment=()",
    "usb=()",
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

export type SecurityConfig = typeof SECURITY_CONFIG;
