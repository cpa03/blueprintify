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
 * Sanitizes a string by removing sensitive information patterns.
 *
 * Applies a series of regex replacements to remove or redact sensitive data
 * such as API keys, tokens, database connection strings, file paths, IP addresses,
 * email addresses, and UUIDs.
 *
 * @param input - The string to sanitize
 * @returns The sanitized string with sensitive patterns replaced by [REDACTED] markers
 *
 * @example
 * ```typescript
 * const sanitized = sanitizeString('api_key=sk-12345');
 * // Returns: 'api_key=[REDACTED]'
 * ```
 */
export function sanitizeString(input: string): string {
  let result = input;
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Sanitizes an error object for safe logging.
 *
 * Converts any error type into a sanitized object that can be safely logged
 * without exposing sensitive information. Handles Error instances, strings,
 * and unknown error types.
 *
 * @param error - The error to sanitize (can be any type)
 * @returns A sanitized error object with message, name, and optional stack trace
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const sanitized = sanitizeError(error);
 *   console.log(sanitized.message); // Safe to log
 * }
 * ```
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
 * Creates a sanitized log entry for error logging.
 *
 * Combines context, sanitized error, and additional information into a
 * structured log entry suitable for JSON logging.
 *
 * @param context - A string describing the context where the error occurred
 * @param error - The error to log (will be sanitized)
 * @param additionalInfo - Optional additional information to include in the log
 * @returns A structured log entry object ready for JSON serialization
 *
 * @example
 * ```typescript
 * const logEntry = createSecureLogEntry('API Error', error, { path: '/generate' });
 * console.log(JSON.stringify(logEntry));
 * ```
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
 * Secure console.error wrapper that sanitizes output.
 *
 * Use this instead of console.error for any error logging to ensure
 * sensitive information is never leaked in logs.
 *
 * @param context - A string describing the context where the error occurred
 * @param error - The error to log (will be sanitized)
 * @param additionalInfo - Optional additional information to include in the log
 *
 * @example
 * ```typescript
 * try {
 *   await fetchData();
 * } catch (error) {
 *   secureLogError('DataFetch', error, { url: '/api/data' });
 * }
 * ```
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
 * Secure console.warn wrapper that sanitizes output.
 *
 * Use this instead of console.warn for any warning logging to ensure
 * sensitive information is never leaked in logs.
 *
 * @param context - A string describing the context where the warning occurred
 * @param message - The warning message (will be sanitized)
 * @param additionalInfo - Optional additional information to include in the log
 *
 * @example
 * ```typescript
 * secureLogWarn('RateLimit', 'Rate limit approaching', { remaining: 5 });
 * ```
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


/**
 * Secure console.info wrapper that sanitizes output.
 *
 * Use this instead of console.log for any informational logging to ensure
 * sensitive information is never leaked in logs.
 *
 * @param context - A string describing the context where the info log occurred
 * @param message - The info message (will be sanitized)
 * @param additionalInfo - Optional additional information to include in the log
 *
 * @example
 * ```typescript
 * secureLogInfo('RequestLogger', 'Incoming request', { path: '/api/generate' });
 * ```
 */
export function secureLogInfo(
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
  console.log(JSON.stringify(logEntry));
}

/**
 * Secure structured log wrapper for complex objects.
 *
 * Use this for logging structured data (like request/response logs) that
 * may contain sensitive information in nested fields.
 *
 * @param context - A string describing the context where the log occurred
 * @param data - The data object to log (will be JSON stringified and sanitized)
 *
 * @example
 * ```typescript
 * secureLogData('RequestLog', { type: 'request', method: 'POST', path: '/api/generate' });
 * ```
 */
export function secureLogData(
  context: string,
  data: Record<string, unknown>,
): void {
  const sanitizedData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitizedData[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitizedData[key] = JSON.parse(sanitizeString(JSON.stringify(value)));
    } else {
      sanitizedData[key] = value;
    }
  }
  console.log(
    JSON.stringify({
      context,
      ...sanitizedData,
      timestamp: new Date().toISOString(),
    }),
  );
}