/**
 * Secure Logging Utilities
 *
 * Sanitizes error logs to prevent information leakage (OWASP A09:2021).
 * Removes sensitive data patterns from error messages and stack traces
 * before logging to prevent exposure of:
 * - API keys and tokens
 * - Database connection strings
 * - File paths
 * - Internal implementation details
 */

/**
 * Patterns that indicate sensitive information in logs
 */
const SENSITIVE_PATTERNS = [
  // API keys and tokens
  {
    pattern:
      /(api[_-]?key|apikey|token|secret|password|auth)[=:]\s*['"]?[\w-]+['"]?/gi,
    replacement: "$1=[REDACTED]",
  },
  { pattern: /bearer\s+[\w-]+/gi, replacement: "bearer [REDACTED]" },
  { pattern: /x-api-key:\s*[\w-]+/gi, replacement: "x-api-key: [REDACTED]" },

  // Database connection strings
  {
    pattern: /(mongodb|postgres|mysql|redis):\/\/[^\s]+/gi,
    replacement: "$1://[REDACTED]",
  },
  {
    pattern: /connection[_-]?string[=:]\s*['"]?[^'"\s]+['"]?/gi,
    replacement: "connection_string=[REDACTED]",
  },

  // File paths (internal structure exposure)
  {
    pattern: /\/(?:home|Users|var|etc|tmp)\/[^\s]+/gi,
    replacement: "[PATH_REDACTED]",
  },
  { pattern: /[A-Z]:\\[^\s]+/gi, replacement: "[PATH_REDACTED]" },

  // IP addresses (in some contexts)
  { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}:\d+\b/g, replacement: "[IP_REDACTED]" },

  // Email addresses
  { pattern: /[\w.-]+@[\w.-]+\.\w+/gi, replacement: "[EMAIL_REDACTED]" },

  // UUIDs (could be sensitive identifiers)
  {
    pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    replacement: "[UUID_REDACTED]",
  },
];

/**
 * Sanitizes a string by removing sensitive information patterns
 */
export function sanitizeString(input: string): string {
  let result = input;
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Sanitizes an error object for safe logging
 * Returns a sanitized version that can be safely logged
 */
export function sanitizeError(error: unknown): {
  message: string;
  name: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      message: sanitizeString(error.message),
      name: error.name,
      stack: error.stack ? sanitizeString(error.stack) : undefined,
    };
  }

  if (typeof error === "string") {
    return {
      message: sanitizeString(error),
      name: "Error",
    };
  }

  return {
    message: sanitizeString(JSON.stringify(error)),
    name: "UnknownError",
  };
}

/**
 * Creates a sanitized log entry for error logging
 */
export function createSecureLogEntry(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>,
): Record<string, unknown> {
  const sanitizedError = sanitizeError(error);

  return {
    context,
    error: sanitizedError,
    timestamp: new Date().toISOString(),
    ...additionalInfo,
  };
}

/**
 * Secure console.error wrapper that sanitizes output
 * Use this instead of console.error for any error logging
 */
export function secureLogError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>,
): void {
  const logEntry = createSecureLogEntry(context, error, additionalInfo);
  console.error(JSON.stringify(logEntry));
}

/**
 * Secure console.warn wrapper that sanitizes output
 */
export function secureLogWarn(
  context: string,
  message: string,
  additionalInfo?: Record<string, unknown>,
): void {
  const logEntry = {
    context,
    message: sanitizeString(message),
    timestamp: new Date().toISOString(),
    ...additionalInfo,
  };
  console.warn(JSON.stringify(logEntry));
}
