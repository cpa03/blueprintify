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

// ===== Safe HTML Tag Allowlist =====
// Tags allowed in sanitized content (Markdown-safe subset)

const ALLOWED_TAGS = new Set([
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
]);

const ALLOWED_ATTR = new Set(["href", "title", "alt", "src", "class", "rel"]);

// ===== Dangerous Tag Patterns =====

/**
 * Tags that are completely forbidden regardless of attributes.
 * These represent active content / injection vectors.
 */
const FORBIDDEN_TAGS =
  /<\s*\b(script|iframe|object|embed|form|input|button|svg|math|base|link|meta|noscript|template|style|applet|frame|frameset|textarea|select|option|optgroup|datalist|keygen|output|marquee|isindex)\b[^>]*>/gi;

/**
 * Event handler attributes (on* attributes like onclick, onload, etc.)
 */
const EVENT_HANDLER_ATTR = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

/**
 * Dangerous URL schemes used in XSS attacks.
 */
const DANGEROUS_URL_SCHEMES =
  /\b(href|src|action|formaction)\s*=\s*(?:"[^"]*|'[^']*)?\b(?:javascript:|vbscript:|blob:|data:text\/html)/gi;

/**
 * CSS expression / behavior patterns (IE-specific attack vectors)
 */
const CSS_ATTACK_PATTERNS = /(expression|behavior|binding|include-source)\s*\(/gi;

/**
 * HTML comments — attackers can hide payloads inside comments
 * that some parsers still interpret.
 */
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/**
 * Sanitizes a string by removing XSS attack vectors.
 * Designed for Markdown content that may contain embedded HTML.
 *
 * Strategy:
 * 1. Remove HTML comments (attackers hide payloads in comments)
 * 2. Strip forbidden tags entirely (script, iframe, etc.)
 * 3. Remove event handler attributes (onclick, onload, etc.)
 * 4. Remove dangerous URL schemes (javascript:, vbscript:, data:)
 * 5. Remove CSS expression patterns
 * 6. Strip tags NOT in the allowlist (keeping their content)
 *
 * @param input - The raw string to sanitize
 * @returns Sanitized string safe for storage/rendering
 *
 * @example
 * ```typescript
 * sanitizeHtml('<script>alert("xss")</script>Hello');
 * // Returns: 'alert("xss")Hello'
 *
 * sanitizeHtml('<p onclick="steal()">Click me</p>');
 * // Returns: '<p>Click me</p>'
 * ```
 */
export function sanitizeHtml(input: string): string {
  if (!input) return input;

  let sanitized = input;

  // Step 1: Remove HTML comments
  sanitized = sanitized.replace(HTML_COMMENT, "");

  // Step 2: Remove forbidden tags entirely (including content for script/iframe)
  // Special handling: script, iframe, object, embed, style, noscript, template
  // For these, we remove BOTH the tag AND its content
  const DANGEROUS_CONTAINER_TAGS =
    /<\s*\b(script|iframe|object|embed|style|noscript|template|applet|frame|frameset)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
  sanitized = sanitized.replace(DANGEROUS_CONTAINER_TAGS, "");

  // Single self-closing dangerous tags
  sanitized = sanitized.replace(FORBIDDEN_TAGS, "");

  // Step 3: Remove event handler attributes from any remaining tag
  sanitized = sanitized.replace(EVENT_HANDLER_ATTR, "");

  // Step 4: Remove dangerous URL schemes
  sanitized = sanitized.replace(DANGEROUS_URL_SCHEMES, (match) => {
    // Replace the attribute value with a safe placeholder
    return match.replace(/=(?:"[^"]*"|'[^']*'|[^\s>]+)/, '="#dangerous-url-removed"');
  });

  // Step 5: Remove CSS expression patterns
  sanitized = sanitized.replace(CSS_ATTACK_PATTERNS, "blocked_");

  // Step 6: Strip tags NOT in the allowlist (keeping their inner content)
  sanitized = sanitized.replace(
    /<(\/)?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g,
    (match, isClosing, tagName) => {
      const lowerTag = tagName.toLowerCase();
      if (ALLOWED_TAGS.has(lowerTag)) {
        return match; // Keep allowed tags
      }
      // For unknown tags, keep only the content (strip the tag)
      return "";
    }
  );

  // Step 7: Remove remaining dangerous attributes from allowed tags
  sanitized = sanitized.replace(
    /<(\/)?\s*([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g,
    (match, isClosing, tagName, attrs) => {
      if (isClosing) return match;
      const lowerTag = tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(lowerTag)) return match;

      // Filter attributes for allowed tags
      const filteredAttrs = attrs.replace(
        /([\w-]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/g,
        (attrMatch: string, attrName: string): string => {
          if (ALLOWED_ATTR.has(attrName.toLowerCase())) {
            return attrMatch;
          }
          return "";
        }
      );

      // Rebuild the tag — only if it has content or is self-closing
      if (filteredAttrs.trim() || match.endsWith("/>")) {
        return `<${tagName}${filteredAttrs}>`;
      }
      // If attributes were all stripped, just return a clean tag
      return `<${tagName}>`;
    }
  );

  // Step 8: Normalize whitespace — collapse multiple spaces from tag removal
  sanitized = sanitized.replace(/  +/g, " ");

  return sanitized.trim();
}

/**
 * Validates that content does not contain XSS attack vectors.
 * Throws an error if dangerous patterns are detected.
 *
 * @param input - The raw string to validate
 * @param fieldName - Optional field name for error context
 * @throws {Error} When XSS patterns are detected
 */
export function validateXssSafe(input: string, fieldName?: string): void {
  if (!input) return;

  const dangerousIndicators: string[] = [];

  // Check for script tags
  if (/<\s*script\b[^>]*>/i.test(input)) {
    dangerousIndicators.push("script tag");
  }

  // Check for event handlers
  if (/\s+on\w+\s*=/i.test(input)) {
    dangerousIndicators.push("event handler attribute");
  }

  // Check for javascript: URLs
  if (/javascript:/i.test(input)) {
    dangerousIndicators.push("javascript: URL");
  }

  // Check for dangerous tags
  if (/<\s*(iframe|object|embed|base|link)\b[^>]*>/i.test(input)) {
    dangerousIndicators.push("dangerous HTML tag");
  }

  if (dangerousIndicators.length > 0) {
    const context = fieldName ? ` in field '${fieldName}'` : "";
    throw new Error(
      `Content contains potentially unsafe HTML${context}: ${dangerousIndicators.join(", ")}. ` +
        "Please remove embedded scripts or suspicious tags."
    );
  }
}

/**
 * Zod refinement function for XSS-safe content validation.
 * Returns true if the content has no XSS attack vectors.
 *
 * @example
 * ```typescript
 * const SafeContentSchema = z.string().refine(
 *   (val) => isXssSafe(val),
 *   { message: "Content contains unsafe HTML" }
 * );
 * ```
 */
export function isXssSafe(input: string): boolean {
  try {
    validateXssSafe(input);
    return true;
  } catch {
    return false;
  }
}
