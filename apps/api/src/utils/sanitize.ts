/**
 * Content Sanitization Utilities
 *
 * Provides server-side sanitization for user-generated content to prevent
 * XSS attacks. Uses DOMPurify to safely sanitize HTML/Markdown content
 * before storage or rendering.
 *
 * @module utils/sanitize
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Configuration for blueprint content sanitization.
 * Allows safe markdown tags while preventing XSS attacks.
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "em",
    "strong",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "target", "rel"],
  ALLOW_DATA_ATTR: false,
};

/**
 * Sanitizes blueprint content to prevent XSS attacks.
 *
 * This function should be used for all user-generated content that will be:
 * - Stored in the database
 * - Retrieved and rendered by other clients
 * - Processed by AI models
 *
 * @param content - The raw content to sanitize
 * @returns Sanitized content safe for storage and rendering
 *
 * @example
 * ```typescript
 * const rawBlueprint = userProvidedContent;
 * const safeBlueprint = sanitizeBlueprintContent(rawBlueprint);
 * // safeBlueprint can now be safely stored/displayed
 * ```
 */
export function sanitizeBlueprintContent(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  return DOMPurify.sanitize(content, SANITIZE_CONFIG);
}

/**
 * Sanitizes content with stricter rules for trusted content.
 * Use this when you need to further restrict allowed tags.
 *
 * @param content - The raw content to sanitize
 * @returns Strictly sanitized content
 */
export function sanitizeStrict(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  const strictConfig = {
    ...SANITIZE_CONFIG,
    ALLOWED_TAGS: ["p", "br", "ul", "ol", "li", "pre", "code", "em", "strong"],
  };

  return DOMPurify.sanitize(content, strictConfig);
}

/**
 * Strips all HTML tags from content, returning plain text.
 *
 * @param content - The content to strip
 * @returns Plain text content
 */
export function stripHtml(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  return DOMPurify.sanitize(content, { WHOLE_DOCUMENT: false, RETURN_TRUSTED_TYPE: false });
}
