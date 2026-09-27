/**
 * Content Sanitization Utility
 *
 * Server-side HTML/Markdown sanitization for XSS prevention.
 * Designed for Cloudflare Workers (no DOM, no JSDOM dependency).
 * Uses regex-based allowlist approach to strip dangerous content
 * while preserving safe Markdown/HTML.
 *
 * Provides defense-in-depth: even if frontend sanitization is bypassed,
 * the backend will clean stored/served content before it reaches other users.
 *
 * @module utils/sanitize
 */

import {
  SANITIZE_ALLOWED_TAGS,
  SANITIZE_ALLOWED_ATTR,
  SANITIZE_FORBIDDEN_TAG_NAMES,
  SANITIZE_DANGEROUS_CONTAINER_TAG_NAMES,
  SANITIZE_REPLACEMENT_STRINGS,
} from "@blueprint/shared";

// ===== Safe HTML Tag Allowlist (built from shared config) =====

const ALLOWED_TAGS = new Set<string>(SANITIZE_ALLOWED_TAGS);
const ALLOWED_ATTR = new Set<string>(SANITIZE_ALLOWED_ATTR);

// ===== Dangerous Tag Patterns (built from shared config) =====

const FORBIDDEN_TAGS_PATTERN = new RegExp(
  `<\\s*\\b(${SANITIZE_FORBIDDEN_TAG_NAMES.join("|")})\\b[^>]*>`,
  "gi"
);

const DANGEROUS_CONTAINER_PATTERN = new RegExp(
  `<\\s*\\b(${SANITIZE_DANGEROUS_CONTAINER_TAG_NAMES.join("|")})\\b[^>]*>[\\s\\S]*?<\\s*/\\s*\\1\\s*>`,
  "gi"
);

const EVENT_HANDLER_ATTR = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const DANGEROUS_URL_SCHEMES =
  /\b(href|src|action|formaction)\s*=\s*(?:"[^"]*|'[^']*)?\b(?:javascript:|vbscript:|blob:|data:text\/html)/gi;

const CSS_ATTACK_PATTERNS = /(expression|behavior|binding|include-source)\s*\(/gi;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/**
 * Sanitizes a string by removing XSS attack vectors.
 * Designed for Markdown content that may contain embedded HTML.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return input;

  let sanitized = input;

  sanitized = sanitized.replace(HTML_COMMENT, "");
  sanitized = sanitized.replace(DANGEROUS_CONTAINER_PATTERN, "");
  sanitized = sanitized.replace(FORBIDDEN_TAGS_PATTERN, "");
  sanitized = sanitized.replace(EVENT_HANDLER_ATTR, "");
  sanitized = sanitized.replace(DANGEROUS_URL_SCHEMES, (match) =>
    match.replace(
      /=(?:"[^"]*"|'[^']*'|[^\s>]+)/,
      `="${SANITIZE_REPLACEMENT_STRINGS.DANGEROUS_URL_PLACEHOLDER}"`
    )
  );
  sanitized = sanitized.replace(
    CSS_ATTACK_PATTERNS,
    SANITIZE_REPLACEMENT_STRINGS.CSS_ATTACK_BLOCKED_PREFIX
  );

  sanitized = sanitized.replace(
    /<(\/)?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g,
    (match, isClosing, tagName) => {
      const lowerTag = tagName.toLowerCase();
      if (ALLOWED_TAGS.has(lowerTag)) {
        return match;
      }
      return "";
    }
  );

  sanitized = sanitized.replace(
    /<(\/)?\s*([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g,
    (match, isClosing, tagName, attrs) => {
      if (isClosing) return match;
      const lowerTag = tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(lowerTag)) return match;

      const filteredAttrs = attrs.replace(
        /([\w-]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/g,
        (attrMatch: string, attrName: string): string => {
          if (ALLOWED_ATTR.has(attrName.toLowerCase())) {
            return attrMatch;
          }
          return "";
        }
      );

      if (filteredAttrs.trim() || match.endsWith("/>")) {
        return `<${tagName}${filteredAttrs}>`;
      }
      return `<${tagName}>`;
    }
  );

  sanitized = sanitized.replace(/  +/g, " ");

  return sanitized.trim();
}
