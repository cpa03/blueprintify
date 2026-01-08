/**
 * Error handling utilities for the API
 * Provides standardized error types and response formatting
 */

// ===== Error Types =====

export enum ErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Authentication Errors (401)
  UNAUTHORIZED = "UNAUTHORIZED",
  MISSING_API_KEY = "MISSING_API_KEY",

  // Configuration Errors (500)
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  OPENAI_NOT_CONFIGURED = "OPENAI_NOT_CONFIGURED",

  // External Service Errors (502, 503)
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Internal Server Errors (500)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  STREAM_ERROR = "STREAM_ERROR",
}

export enum HttpStatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

// ===== Error Classes =====

export class APIError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    public details?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      HttpStatusCode.BAD_REQUEST,
      details,
    );
    this.name = "ValidationError";
  }
}

export class ConfigurationError extends APIError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      ErrorCode.CONFIGURATION_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      details,
    );
    this.name = "ConfigurationError";
  }
}

export class AIServiceError extends APIError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      ErrorCode.AI_SERVICE_ERROR,
      HttpStatusCode.BAD_GATEWAY,
      details,
    );
    this.name = "AIServiceError";
  }
}

export class StreamError extends APIError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      ErrorCode.STREAM_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      details,
    );
    this.name = "StreamError";
  }
}

// ===== Response Types =====

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    statusCode: HttpStatusCode;
    details?: unknown;
    timestamp: string;
  };
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

// ===== Error Response Builders =====

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
  details?: unknown,
): ErrorResponse {
  return {
    error: {
      code,
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Creates an error response from an APIError instance
 */
export function errorToResponse(error: APIError): ErrorResponse {
  return createErrorResponse(
    error.code,
    error.message,
    error.statusCode,
    error.details,
  );
}

/**
 * Creates a standardized success response object
 */
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

// ===== Error Type Guards =====

/**
 * Type guard to check if an error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Safely extracts error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}

// ===== Common Error Helpers =====

/**
 * Creates a validation error for missing fields
 */
export function createValidationError(field: string): ValidationError {
  return new ValidationError(`${field} is required`);
}

/**
 * Creates an error for missing OpenAI configuration
 */
export function createOpenAIConfigError(): ConfigurationError {
  return new ConfigurationError("OpenAI API key not configured", {
    hint: "Set OPENAI_API_KEY in your environment variables",
  });
}

/**
 * Wraps an error from the OpenAI service
 */
export function wrapOpenAIError(error: unknown): AIServiceError {
  const message =
    error instanceof Error ? error.message : "Unknown OpenAI error";
  return new AIServiceError("Failed to communicate with AI service", {
    originalError: message,
  });
}

/**
 * Wraps a stream error
 */
export function wrapStreamError(error: unknown): StreamError {
  const message =
    error instanceof Error ? error.message : "Unknown stream error";
  return new StreamError("Stream processing failed", {
    originalError: message,
  });
}
