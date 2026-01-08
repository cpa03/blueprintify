/**
 * Standardized error response types and utilities for the API
 */

import type { Context } from "hono";

export interface ErrorResponse {
  error: string;
  status: number;
  timestamp?: string;
  details?: unknown;
}

export interface SuccessResponse<T = unknown> {
  data?: T;
  message?: string;
  status: number;
  timestamp?: string;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: unknown,
): ErrorResponse {
  const response: ErrorResponse = {
    error: message,
    status,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.details = details;
  }

  return response;
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T = unknown>(
  data?: T,
  message?: string,
  status: number = 200,
): SuccessResponse<T> {
  const response: SuccessResponse<T> = {
    data,
    message,
    status,
    timestamp: new Date().toISOString(),
  };

  return response;
}

/**
 * Error type codes for consistent error handling
 */
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",

  // Input Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // API Configuration
  API_KEY_MISSING = "API_KEY_MISSING",
  API_CONFIG_ERROR = "API_CONFIG_ERROR",

  // AI/Generation
  GENERATION_FAILED = "GENERATION_FAILED",
  STREAM_ERROR = "STREAM_ERROR",
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",

  // Network & Infrastructure
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // General Errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
}

/**
 * Mapping of error codes to HTTP status codes
 */
const ERROR_CODE_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,

  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,

  [ErrorCode.API_KEY_MISSING]: 500,
  [ErrorCode.API_CONFIG_ERROR]: 500,

  [ErrorCode.GENERATION_FAILED]: 500,
  [ErrorCode.STREAM_ERROR]: 500,
  [ErrorCode.AI_SERVICE_ERROR]: 502,

  [ErrorCode.NETWORK_ERROR]: 503,
  [ErrorCode.TIMEOUT_ERROR]: 504,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,

  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.CONFLICT]: 409,
};

/**
 * Gets the HTTP status code for an error code
 */
export function getStatusForErrorCode(code: ErrorCode): number {
  return ERROR_CODE_STATUS_MAP[code] || 500;
}

/**
 * Creates a detailed error response with code
 */
export function createDetailedErrorResponse(
  code: ErrorCode,
  message?: string,
  details?: unknown,
): ErrorResponse {
  const defaultMessage = getDefaultMessageForErrorCode(code);
  const status = getStatusForErrorCode(code);

  const response: ErrorResponse = {
    error: message || defaultMessage,
    status,
    timestamp: new Date().toISOString(),
  };

  if (details !== undefined) {
    response.details = { code, details };
  } else {
    response.details = { code };
  }

  return response;
}

/**
 * Gets a default human-readable message for an error code
 */
function getDefaultMessageForErrorCode(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.UNAUTHORIZED]: "Authentication required",
    [ErrorCode.FORBIDDEN]: "You do not have permission to perform this action",

    [ErrorCode.VALIDATION_ERROR]: "Invalid input data",
    [ErrorCode.INVALID_INPUT]: "Invalid input provided",
    [ErrorCode.MISSING_REQUIRED_FIELD]: "A required field is missing",

    [ErrorCode.API_KEY_MISSING]: "OpenAI API key not configured",
    [ErrorCode.API_CONFIG_ERROR]: "API configuration error",

    [ErrorCode.GENERATION_FAILED]: "Generation failed",
    [ErrorCode.STREAM_ERROR]: "Stream error occurred",
    [ErrorCode.AI_SERVICE_ERROR]: "AI service returned an error",

    [ErrorCode.NETWORK_ERROR]: "Network error occurred",
    [ErrorCode.TIMEOUT_ERROR]: "Request timed out",
    [ErrorCode.SERVICE_UNAVAILABLE]: "Service temporarily unavailable",

    [ErrorCode.INTERNAL_ERROR]: "Internal server error",
    [ErrorCode.NOT_FOUND]: "Resource not found",
    [ErrorCode.CONFLICT]: "Resource conflict",
  };

  return messages[code] || "An error occurred";
}

/**
 * Utility function to handle errors in controllers
 */
export function handleControllerError(
  error: unknown,
  c: Context,
  defaultErrorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
): Response {
  console.error("Controller Error:", error);

  if (error instanceof Error) {
    // Check for specific error patterns
    if (
      error.message.includes("API key") ||
      error.message.includes("OPENAI_API_KEY")
    ) {
      const response = createDetailedErrorResponse(ErrorCode.API_KEY_MISSING);
      return c.json(response, response.status as any);
    }

    if (
      error.message.includes("timeout") ||
      error.message.includes("Timeout")
    ) {
      const response = createDetailedErrorResponse(ErrorCode.TIMEOUT_ERROR);
      return c.json(response, response.status as any);
    }

    if (
      error.message.includes("network") ||
      error.message.includes("Network")
    ) {
      const response = createDetailedErrorResponse(ErrorCode.NETWORK_ERROR);
      return c.json(response, response.status as any);
    }

    if (
      error.message.includes("validation") ||
      error.message.includes("Validation")
    ) {
      const response = createDetailedErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        error.message,
      );
      return c.json(response, response.status as any);
    }
  }

  // Default error response
  const response = createDetailedErrorResponse(defaultErrorCode);
  return c.json(response, response.status as any);
}

/**
 * Validates that required environment variables are present
 */
export function validateEnvConfig<T extends Record<string, string | undefined>>(
  env: T,
  requiredKeys: (keyof T)[],
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const key of requiredKeys) {
    if (!env[key]) {
      missing.push(String(key));
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
