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

import { SECURITY_LIMITS, BYTE_CONVERSION } from "@blueprint/shared";
import { SECURITY_CONFIG } from "../config/security";
import { SECURITY_ERROR_MESSAGES } from "../config/constants";

// Lazy Zod - kept out of initial bundle; only needed for content/file validation on user action.

let _zod: { z: (typeof import("zod"))["z"] } | null = null;
let _zodPromise: Promise<void> | null = null;
function _initZod(): Promise<void> {
  if (!_zodPromise) {
    _zodPromise = import("zod").then((mod) => {
      _zod = mod;
    });
  }
  return _zodPromise;
}
void _initZod();

/**
 * Ensure Zod has loaded. Resolves immediately if already loaded.
 * Useful in tests and SSR contexts where timing guarantees are needed.
 */
export function ensureZodLoaded(): Promise<void> {
  return _initZod();
}

function _getZodOrThrow(): (typeof import("zod"))["z"] {
  if (!_zod) throw new Error("Zod not yet loaded");
  return _zod.z;
}

/**
 * Lazy DOMPurify - ~40KB kept out of main bundle; only used on user save/render.
 * Starts background import immediately; basic escape fallback before it resolves.
 * Fallback is safe because sanitizeHtml runs after user interaction (generation done,
 * content saved) by which time DOMPurify has loaded.
 */
import type { Config as DOMPurifyConfig } from "dompurify";

let _DOMPurify: ((html: string, config?: DOMPurifyConfig) => string) | null = null;
let _dompurifyPromise: Promise<void> | null = null;

/** Start loading DOMPurify in background immediately; don't block initial render. */
function _initDOMPurify(): Promise<void> {
  if (!_dompurifyPromise) {
    _dompurifyPromise = import("dompurify").then((mod) => {
      _DOMPurify = (html: string, config?: DOMPurifyConfig) => mod.default.sanitize(html, config);
    });
  }
  return _dompurifyPromise;
}

void _initDOMPurify();

/**
 * Ensure DOMPurify has loaded. Resolves immediately if already loaded.
 * Useful in tests and SSR contexts where timing guarantees are needed.
 */
export function ensureDOMPurifyLoaded(): Promise<void> {
  return _initDOMPurify();
}

/** Basic HTML escaping fallback before DOMPurify finishes loading. */
function basicEscapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
let _contentSchema: ReturnType<(typeof import("zod"))["z"]["object"]> | null = null;
function getContentSchema() {
  if (!_contentSchema) {
    const z = _getZodOrThrow();
    _contentSchema = z.object({
      blueprintContent: z
        .string()
        .max(SECURITY_CONFIG.MAX_CONTENT_LENGTH, "Blueprint content exceeds maximum length")
        .refine((content: string) => !containsXSSPatterns(content), {
          message: "Blueprint content contains potentially dangerous patterns",
        }),
      tasksContent: z
        .string()
        .max(SECURITY_CONFIG.MAX_CONTENT_LENGTH, "Tasks content exceeds maximum length")
        .refine((content: string) => !containsXSSPatterns(content), {
          message: "Tasks content contains potentially dangerous patterns",
        }),
    });
  }
  return _contentSchema;
}

let _fileSchema: ReturnType<(typeof import("zod"))["z"]["object"]> | null = null;
function getFileSchema() {
  if (!_fileSchema) {
    const z = _getZodOrThrow();
    _fileSchema = z.object({
      name: z.string().min(1).max(255),
      size: z.number().max(SECURITY_CONFIG.MAX_FILE_SIZE),
      type: z.string(),
      content: z.string().max(SECURITY_CONFIG.MAX_CONTENT_LENGTH),
    });
  }
  return _fileSchema;
}
export function containsXSSPatterns(content: string): boolean {
  return SECURITY_CONFIG.XSS_PATTERNS.some((pattern) => pattern.test(content));
}

export function sanitizeHtml(html: string): string {
  if (_DOMPurify) {
    return _DOMPurify(html, SECURITY_CONFIG.DOMPURIFY_CONFIG);
  }
  return basicEscapeHtml(html);
}

export function sanitizeMarkdown(markdown: string): string {
  if (containsXSSPatterns(markdown)) {
    throw new Error(SECURITY_ERROR_MESSAGES.XSS_PATTERNS_DETECTED);
  }

  if (SECURITY_CONFIG.CODEMIRROR_XSS_PATTERNS.some((pattern) => pattern.test(markdown))) {
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
    const schema = getContentSchema();
    const validated = schema.parse({
      blueprintContent:
        typeof content === "object" && content !== null ? contentInput.blueprintContent || "" : "",
      tasksContent:
        typeof content === "object" && content !== null ? contentInput.tasksContent || "" : "",
    }) as { blueprintContent: string; tasksContent: string };

    return {
      isValid: true,
      sanitizedContent: {
        blueprintContent: sanitizeMarkdown(validated.blueprintContent),
        tasksContent: sanitizeMarkdown(validated.tasksContent),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as unknown as { issues: Array<{ message: string }> };
      return {
        isValid: false,
        error: zodError.issues.map((e) => e.message).join(", "),
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
        SECURITY_CONFIG.MAX_FILE_SIZE / BYTE_CONVERSION.MB
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
    const fileSchema = getFileSchema();
    fileSchema.parse({
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
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as unknown as { issues: Array<{ message: string }> };
      return {
        isValid: false,
        error: zodError.issues.map((e) => e.message).join(", "),
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
    const foundSuspiciousKeys = findSuspiciousKeys(
      parsed,
      SECURITY_CONFIG.SUSPICIOUS_JSON_KEYS as unknown as string[]
    );
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
  return { ...SECURITY_CONFIG.SECURITY_HEADERS };
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

  if (error instanceof Error && error.name === "ZodError") {
    const zodError = error as unknown as { issues: Array<{ message: string }> };
    return new SecurityError(
      zodError.issues.map((e) => e.message).join(", "),
      "VALIDATION",
      zodError.issues
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

// Re-export SECURITY_CONFIG for backward compatibility
// Canonical source is now config/security.ts
export { SECURITY_CONFIG } from "../config/security";
