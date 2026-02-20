/**
 * Structured logging utilities for external integrations
 *
 * Provides consistent JSON logging format for external API calls,
 * database operations, and other integration points.
 */

/**
 * Log entry for external API calls (OpenAI, etc.)
 */
export interface ExternalApiCallLog {
  type: "external_api_call";
  service: string;
  operation: string;
  status: "started" | "success" | "error";
  durationMs?: number;
  model?: string;
  error?: string;
  timestamp: string;
}

/**
 * Log entry for database operations
 */
export interface DatabaseOperationLog {
  type: "database_operation";
  operation: string;
  table?: string;
  status: "started" | "success" | "error";
  durationMs?: number;
  recordId?: string;
  error?: string;
  timestamp: string;
}

/**
 * Union type for all structured log entries
 */
export type StructuredLogEntry = ExternalApiCallLog | DatabaseOperationLog;

/**
 * Logs an external API call with structured JSON format
 */
export function logExternalApiCall(
  entry: Omit<ExternalApiCallLog, "timestamp">,
): void {
  console.log(
    JSON.stringify({ ...entry, timestamp: new Date().toISOString() }),
  );
}

/**
 * Logs a database operation with structured JSON format
 */
export function logDatabaseOperation(
  entry: Omit<DatabaseOperationLog, "timestamp">,
): void {
  console.log(
    JSON.stringify({ ...entry, timestamp: new Date().toISOString() }),
  );
}

/**
 * Wraps a database operation with structured logging
 * Automatically logs start, success, and error states with timing
 */
export async function withDatabaseLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  options?: {
    table?: string;
    recordId?: string;
  },
): Promise<T> {
  const startTime = Date.now();

  logDatabaseOperation({
    type: "database_operation",
    operation,
    table: options?.table,
    status: "started",
    recordId: options?.recordId,
  });

  try {
    const result = await fn();

    logDatabaseOperation({
      type: "database_operation",
      operation,
      table: options?.table,
      status: "success",
      durationMs: Date.now() - startTime,
      recordId: options?.recordId,
    });

    return result;
  } catch (error) {
    logDatabaseOperation({
      type: "database_operation",
      operation,
      table: options?.table,
      status: "error",
      durationMs: Date.now() - startTime,
      recordId: options?.recordId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}
