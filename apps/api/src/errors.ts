/**
 * API Error Types and Classes
 * Defines standardized error types for the Blueprint Generator API
 */

// ===== Error Types =====
export enum ErrorType {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  CONFIGURATION = "configuration",
  NETWORK = "network",
  AI_SERVICE = "ai_service",
  INTERNAL = "internal",
}

// ===== Error Response Interface =====
export interface ErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId?: string;
  };
}

// ===== Base API Error Class =====
export class APIError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;
  public readonly requestId?: string;

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "APIError";
    this.type = type;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        code: this.code,
        details: this.details,
        timestamp: new Date().toISOString(),
        requestId: this.requestId,
      },
    };
  }
}

// ===== Validation Error (400) =====
export class ValidationError extends APIError {
  constructor(
    message: string = "Invalid request data",
    details?: Record<string, unknown>,
  ) {
    super(ErrorType.VALIDATION, message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

// ===== Authentication Error (401) =====
export class AuthenticationError extends APIError {
  constructor(message: string = "Authentication required") {
    super(ErrorType.AUTHENTICATION, message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

// ===== Authorization Error (403) =====
export class AuthorizationError extends APIError {
  constructor(message: string = "Insufficient permissions") {
    super(ErrorType.AUTHORIZATION, message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

// ===== Not Found Error (404) =====
export class NotFoundError extends APIError {
  constructor(resource: string = "Resource not found") {
    super(ErrorType.NOT_FOUND, resource, 404, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}

// ===== Configuration Error (500) =====
export class ConfigurationError extends APIError {
  constructor(message: string = "Service configuration error") {
    super(ErrorType.CONFIGURATION, message, 500, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
  }
}

// ===== Network Error (502) =====
export class NetworkError extends APIError {
  constructor(
    message: string = "Network error occurred",
    details?: Record<string, unknown>,
  ) {
    super(ErrorType.NETWORK, message, 502, "NETWORK_ERROR", details);
    this.name = "NetworkError";
  }
}

// ===== AI Service Error (502) =====
export class AIServiceError extends APIError {
  constructor(
    message: string = "AI service error",
    details?: Record<string, unknown>,
  ) {
    super(ErrorType.AI_SERVICE, message, 502, "AI_SERVICE_ERROR", details);
    this.name = "AIServiceError";
  }
}

// ===== Internal Server Error (500) =====
export class InternalServerError extends APIError {
  constructor(message: string = "Internal server error") {
    super(ErrorType.INTERNAL, message, 500, "INTERNAL_ERROR");
    this.name = "InternalServerError";
  }
}

// ===== Error Type Guard =====
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

// ===== Error Factory =====
export function createErrorResponse(error: unknown): ErrorResponse {
  if (isAPIError(error)) {
    return error.toJSON();
  }

  // Handle Zod validation errors
  if (error && typeof error === "object" && "issues" in error) {
    const validationError = new ValidationError("Request validation failed", {
      issues: (error as { issues: unknown[] }).issues,
    });
    return validationError.toJSON();
  }

  // Handle generic errors
  const internalError = new InternalServerError(
    error instanceof Error ? error.message : "Unknown error occurred",
  );
  return internalError.toJSON();
}
