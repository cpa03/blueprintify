/**
 * Security Utilities Module
 *
 * Provides comprehensive security measures for the frontend application including:
 * - XSS prevention via DOMPurify sanitization
 * - Content validation with pattern detection
 * - File validation and sanitization
 * - JSON security validation (prototype pollution protection)
 * - Storage quota management
 * - Content Security Policy headers
 *
 * @module lib/security
 * @see https://owasp.org/www-community/xss-filter-evasion-cheatsheet
 */

import DOMPurify from "dompurify";
import { z } from "zod";
import { STORAGE_CONFIG, SECURITY_LIMITS } from "@blueprint/shared";
import { SECURITY_ERROR_MESSAGES } from "../config/constants";

export const SECURITY_CONFIG = {
  DOMPURIFY_CONFIG: {
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
  },

  MAX_CONTENT_LENGTH: SECURITY_LIMITS.MAX_CONTENT_LENGTH,
  MAX_FILE_SIZE: SECURITY_LIMITS.MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES: [...SECURITY_LIMITS.ALLOWED_FILE_TYPES],

  STORAGE_QUOTA: STORAGE_CONFIG.QUOTA_BYTES,
} as const;
export const ContentValidationSchema = z.object({
  blueprintContent: z
    .string()
    .max(SECURITY_CONFIG.MAX_CONTENT_LENGTH, "Blueprint content exceeds maximum length")
    .refine((content) => !containsXSSPatterns(content), {
      message: "Blueprint content contains potentially dangerous patterns",
    }),
  tasksContent: z
    .string()
    .max(SECURITY_CONFIG.MAX_CONTENT_LENGTH, "Tasks content exceeds maximum length")
    .refine((content) => !containsXSSPatterns(content), {
      message: "Tasks content contains potentially dangerous patterns",
    }),
});

export const FileValidationSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().max(SECURITY_CONFIG.MAX_FILE_SIZE),
  type: z.string(),
  content: z.string().max(SECURITY_CONFIG.MAX_CONTENT_LENGTH),
});
/**
 * XSS attack pattern detection library.
 * Covers traditional vectors and modern attack techniques including:
 * - Script injection, event handlers, javascript: URLs
 * - SVG/math elements with embedded scripts
 * - DOM clobbering and mutation XSS
 * - CSS-based attacks (expression, behavior, binding)
 * @see https://owasp.org/www-community/xss-filter-evasion-cheatsheet
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<form\b[^>]*>/gi,
  /<input\b[^>]*>/gi,
  /<button\b[^>]*>/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /@import/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  // SVG-based XSS vectors
  /<svg\b[^>]*>/gi,
  /<math\b[^>]*>/gi,
  /<animate\b[^>]*>/gi,
  /<set\b[^>]*>/gi,
  /<use\b[^>]*>/gi,
  // Protocol handlers
  /data:\s*[^,]*;base64/gi,
  /blob:/gi,
  // DOM clobbering patterns
  /id\s*=\s*["']?__proto__["']?/gi,
  /id\s*=\s*["']?constructor["']?/gi,
  // Mutation XSS patterns
  /<noscript\b[^>]*>/gi,
  /<template\b[^>]*>/gi,
];

export function containsXSSPatterns(content: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(content));
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SECURITY_CONFIG.DOMPURIFY_CONFIG);
}

export function sanitizeMarkdown(markdown: string): string {
  if (containsXSSPatterns(markdown)) {
    throw new Error(SECURITY_ERROR_MESSAGES.XSS_PATTERNS_DETECTED);
  }

  // Additional CodeMirror-specific security patterns
  const CODEMIRROR_PATTERNS = [
    /data:text\/html/gi,
    /vbscript:/gi,
    /@import\s+url/gi,
    /expression\s*\(/gi,
    /behavior\s*:/gi,
    /binding\s*:/gi,
    /include-source\s*:/gi,
  ];

  if (CODEMIRROR_PATTERNS.some((pattern) => pattern.test(markdown))) {
    throw new Error(SECURITY_ERROR_MESSAGES.CODEMIRROR_DANGEROUS_PATTERNS);
  }

  const htmlRegex = /<[^>]+>/g;
  const matches = markdown.match(htmlRegex);

  if (matches) {
    let sanitized = markdown;
    matches.forEach((match) => {
      const sanitizedMatch = sanitizeHtml(match);
      sanitized = sanitized.replace(match, sanitizedMatch);
    });
    return sanitized;
  }

  return markdown;
}

interface ContentInput {
  blueprintContent?: string;
  tasksContent?: string;
}

export function validateContent(content: unknown): {
  isValid: boolean;
  error?: string;
  sanitizedContent?: {
    blueprintContent: string;
    tasksContent: string;
  };
} {
  try {
    const contentInput = content as ContentInput;
    const validated = ContentValidationSchema.parse({
      blueprintContent:
        typeof content === "object" && content !== null ? contentInput.blueprintContent || "" : "",
      tasksContent:
        typeof content === "object" && content !== null ? contentInput.tasksContent || "" : "",
    });

    return {
      isValid: true,
      sanitizedContent: {
        blueprintContent: sanitizeMarkdown(validated.blueprintContent),
        tasksContent: sanitizeMarkdown(validated.tasksContent),
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    return {
      isValid: false,
      error: SECURITY_ERROR_MESSAGES.CONTENT_VALIDATION_FAILED,
    };
  }
}

// ===== File Validation =====
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file extension
  const fileNameParts = file.name.split(".");
  const extension = fileNameParts.length > 1 ? "." + fileNameParts.pop()?.toLowerCase() : "";
  if (
    !SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(
      extension as (typeof SECURITY_CONFIG.ALLOWED_FILE_TYPES)[number]
    )
  ) {
    return {
      isValid: false,
      error: SECURITY_ERROR_MESSAGES.FILE_TYPE_NOT_ALLOWED(
        extension,
        SECURITY_CONFIG.ALLOWED_FILE_TYPES.join(", ")
      ),
    };
  }

  if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: SECURITY_ERROR_MESSAGES.FILE_SIZE_EXCEEDED(
        SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
      ),
    };
  }

  return { isValid: true };
}

export async function validateAndSanitizeFileContent(file: File): Promise<{
  isValid: boolean;
  error?: string;
  content?: string;
}> {
  // First validate file metadata
  const metadataValidation = validateFile(file);
  if (!metadataValidation.isValid) {
    return metadataValidation;
  }

  try {
    const content = await file.text();

    // Additional security checks for JSON files
    if (file.name.endsWith(".json")) {
      const jsonValidation = validateJSONSecurity(content);
      if (!jsonValidation.isValid) {
        return jsonValidation;
      }
    }

    // Validate content with schema
    FileValidationSchema.parse({
      name: file.name,
      size: file.size,
      type: file.type,
      content,
    });

    const sanitizedContent = sanitizeMarkdown(content);

    return {
      isValid: true,
      content: sanitizedContent,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    return {
      isValid: false,
      error: SECURITY_ERROR_MESSAGES.FILE_VALIDATION_FAILED,
    };
  }
}

export function validateJSONSecurity(content: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    // Check for prototype pollution patterns in raw string BEFORE parsing
    // This is necessary because JSON.stringify ignores __proto__
    const prototypePollutionPattern = /["']__proto__["']\s*:/;
    const constructorPattern = /["']constructor["']\s*:\s*\{[^}]*["']prototype["']/;
    if (prototypePollutionPattern.test(content) || constructorPattern.test(content)) {
      return {
        isValid: false,
        error: SECURITY_ERROR_MESSAGES.PROTOTYPE_POLLUTION_DETECTED,
      };
    }

    const parsed = JSON.parse(content);

    // Check for deeply nested objects (DoS protection)
    const depth = getObjectDepth(parsed);
    if (depth > SECURITY_LIMITS.MAX_JSON_DEPTH) {
      return {
        isValid: false,
        error: SECURITY_ERROR_MESSAGES.JSON_DEPTH_EXCEEDED(SECURITY_LIMITS.MAX_JSON_DEPTH),
      };
    }

    // Check for suspicious key names
    const suspiciousKeys = ["__proto__", "constructor", "prototype", "eval", "function", "script"];
    const foundSuspiciousKeys = findSuspiciousKeys(parsed, suspiciousKeys);
    if (foundSuspiciousKeys.length > 0) {
      return {
        isValid: false,
        error: SECURITY_ERROR_MESSAGES.JSON_SUSPICIOUS_KEYS(foundSuspiciousKeys.join(", ")),
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: SECURITY_ERROR_MESSAGES.INVALID_JSON_FORMAT,
    };
  }
}

/**
 * Recursively calculates the maximum depth of a nested object.
 * Used for DoS protection by limiting JSON object nesting levels.
 *
 * @param obj - The object to measure depth for
 * @param currentDepth - Current recursion depth (default: 0)
 * @returns The maximum depth of nested objects
 */
function getObjectDepth(obj: unknown, currentDepth = 0): number {
  if (currentDepth > SECURITY_LIMITS.MAX_JSON_DEPTH) return currentDepth;
  if (obj === null || typeof obj !== "object") return currentDepth;

  let maxDepth = currentDepth;
  const objAsRecord = obj as Record<string, unknown>;
  for (const key in objAsRecord) {
    if (Object.prototype.hasOwnProperty.call(objAsRecord, key)) {
      const depth = getObjectDepth(objAsRecord[key], currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth;
}

/**
 * Recursively searches an object for keys that match suspicious patterns.
 * Used for security validation to detect potential injection attacks.
 *
 * @param obj - The object to search for suspicious keys
 * @param suspiciousKeys - Array of key names to look for
 * @param path - Current object path for error reporting (default: "")
 * @returns Array of paths where suspicious keys were found
 */
function findSuspiciousKeys(obj: unknown, suspiciousKeys: string[], path = ""): string[] {
  const found: string[] = [];

  if (obj && typeof obj === "object") {
    const objAsRecord = obj as Record<string, unknown>;
    for (const key in objAsRecord) {
      if (Object.prototype.hasOwnProperty.call(objAsRecord, key)) {
        const currentPath = path ? `${path}.${key}` : key;

        // Check for exact match against suspicious keys (not substring)
        if (suspiciousKeys.some((suspicious) => key.toLowerCase() === suspicious.toLowerCase())) {
          found.push(currentPath);
        }

        found.push(...findSuspiciousKeys(objAsRecord[key], suspiciousKeys, currentPath));
      }
    }
  }

  return found;
}
export function checkStorageQuota(): {
  available: boolean;
  used: number;
  remaining: number;
} {
  const used = new Blob([JSON.stringify(localStorage)]).size;
  const remaining = SECURITY_CONFIG.STORAGE_QUOTA - used;

  return {
    available: remaining > 0,
    used,
    remaining,
  };
}

export function sanitizeForStorage(data: unknown): {
  isValid: boolean;
  error?: string;
  sanitized?: unknown;
} {
  const quota = checkStorageQuota();
  if (!quota.available) {
    return {
      isValid: false,
      error: SECURITY_ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED,
    };
  }

  const validation = validateContent(data);
  if (!validation.isValid) {
    return validation;
  }

  return {
    isValid: true,
    sanitized: validation.sanitizedContent,
  };
}
export function getContentSecurityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
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
  };
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public readonly type: "XSS" | "VALIDATION" | "QUOTA" | "FILE",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "SecurityError";
  }
}

export function handleSecurityError(error: unknown): SecurityError {
  if (error instanceof SecurityError) {
    return error;
  }

  if (error instanceof z.ZodError) {
    return new SecurityError(
      error.errors.map((e) => e.message).join(", "),
      "VALIDATION",
      error.errors
    );
  }

  if (error instanceof Error) {
    if (containsXSSPatterns(error.message)) {
      return new SecurityError(SECURITY_ERROR_MESSAGES.XSS_DANGEROUS_PATTERNS, "XSS");
    }
    return new SecurityError(error.message, "VALIDATION", error);
  }

  return new SecurityError(SECURITY_ERROR_MESSAGES.UNKNOWN_SECURITY_ERROR, "VALIDATION", error);
}
