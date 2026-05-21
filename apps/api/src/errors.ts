import { HTTP_STATUS } from "@blueprint/shared";
import { DEFAULT_ERROR_MESSAGES } from "./config/constants";

/**
 * API Error Types and Classes
 * Defines standardized error types for the Blueprint Generator API
 */

// ===== Error Types =====
/**
 * Enumeration of error type classifications used throughout the API.
 * Each type maps to a specific HTTP status code and error category.
 */
export enum ErrorType {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  CONFIGURATION = "configuration",
  NETWORK = "network",
  AI_SERVICE = "ai_service",
  INTERNAL = "internal",
  SERVICE_UNAVAILABLE = "service_unavailable",
}

// ===== Error Response Interface =====
/**
 * Standard error response format returned by all API endpoints.
 * Provides consistent error structure for client-side handling.
 */
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

/**
 * Base class for all API errors.
 * Provides standardized error handling with type information, HTTP status codes,
 * and optional details for debugging.
 *
 * @example
 * ```typescript
 * throw new APIError(ErrorType.VALIDATION, "Invalid input", 400, "VALIDATION_ERROR", { field: "email" });
 * ```
 */
export class APIError extends Error {
  /** The error type classification */
  public readonly type: ErrorType;
  /** HTTP status code for the error response */
  public readonly statusCode: number;
  /** Optional error code for client-side handling */
  public readonly code?: string;
  /** Optional additional details about the error */
  public readonly details?: Record<string, unknown>;
  /** Optional request ID for traceability */
  public readonly requestId?: string;

  /**
   * Creates a new APIError instance.
   * @param type - The error type classification
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code for the response
   * @param code - Optional error code for client-side handling
   * @param details - Optional additional error details
   */
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

    // Maintains proper stack trace for where our error was thrown (V8 environments only)
    // Cloudflare Workers may not support captureStackTrace
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts the error to a JSON response format.
   * @returns Standardized error response object
   */
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

/**
 * Error for request validation failures (HTTP 400).
 * Used when request data fails schema validation or business rule checks.
 *
 * @example
 * ```typescript
 * throw new ValidationError("Invalid email format", { field: "email", value: "not-an-email" });
 * ```
 */
export class ValidationError extends APIError {
  /**
   * Creates a new ValidationError instance.
   * @param message - Human-readable validation error message
   * @param details - Optional object containing validation failure details
   */
  constructor(
    message: string = DEFAULT_ERROR_MESSAGES.VALIDATION,
    details?: Record<string, unknown>,
  ) {
    super(ErrorType.VALIDATION, message, HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

// ===== Authentication Error (401) =====

/**
 * Error for authentication failures (HTTP 401).
 * Used when a request lacks valid authentication credentials.
 */
export class AuthenticationError extends APIError {
  /**
   * Creates a new AuthenticationError instance.
   * @param message - Human-readable authentication error message
   */
  constructor(message: string = DEFAULT_ERROR_MESSAGES.AUTHENTICATION) {
    super(ErrorType.AUTHENTICATION, message, HTTP_STATUS.UNAUTHORIZED, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

// ===== Authorization Error (403) =====

/**
 * Error for authorization failures (HTTP 403).
 * Used when authenticated user lacks permission for the requested resource.
 */
export class AuthorizationError extends APIError {
  /**
   * Creates a new AuthorizationError instance.
   * @param message - Human-readable authorization error message
   */
  constructor(message: string = DEFAULT_ERROR_MESSAGES.AUTHORIZATION) {
    super(ErrorType.AUTHORIZATION, message, HTTP_STATUS.FORBIDDEN, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

// ===== Not Found Error (404) =====

/**
 * Error for resource not found (HTTP 404).
 * Used when a requested resource does not exist.
 */
export class NotFoundError extends APIError {
  /**
   * Creates a new NotFoundError instance.
   * @param resource - Description of the resource that was not found
   */
  constructor(resource: string = DEFAULT_ERROR_MESSAGES.NOT_FOUND) {
    super(ErrorType.NOT_FOUND, resource, HTTP_STATUS.NOT_FOUND, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}

// ===== Configuration Error (500) =====

/**
 * Error for server configuration issues (HTTP 500).
 * Used when required server configuration is missing or invalid.
 */
export class ConfigurationError extends APIError {
  /**
   * Creates a new ConfigurationError instance.
   * @param message - Human-readable configuration error message
   */
  constructor(message: string = DEFAULT_ERROR_MESSAGES.CONFIGURATION) {
    super(ErrorType.CONFIGURATION, message, HTTP_STATUS.INTERNAL_ERROR, "CONFIGURATION_ERROR");
    this.name = "ConfigurationError";
  }
}

// ===== Network Error (502) =====

/**
 * Error for network-related failures (HTTP 502).
 * Used when external service communication fails.
 */
export class NetworkError extends APIError {
  /**
   * Creates a new NetworkError instance.
   * @param message - Human-readable network error message
   * @param details - Optional details about the network failure
   */
  constructor(
    message: string = DEFAULT_ERROR_MESSAGES.NETWORK,
    details?: Record<string, unknown>,
  ) {
    super(ErrorType.NETWORK, message, HTTP_STATUS.BAD_GATEWAY, "NETWORK_ERROR", details);
    this.name = "NetworkError";
  }
}

// ===== AI Service Error (502) =====

/**
 * Error for AI service failures (HTTP 502).
 * Used when the AI provider returns an error or is unavailable.
 */
export class AIServiceError extends APIError {
  /**
   * Creates a new AIServiceError instance.
   * @param message - Human-readable AI service error message
   * @param details - Optional details about the AI service failure
   */
  constructor(
    message: string = DEFAULT_ERROR_MESSAGES.AI_SERVICE,
    details?: Record<string, unknown>,
  ) {
    super(ErrorType.AI_SERVICE, message, HTTP_STATUS.BAD_GATEWAY, "AI_SERVICE_ERROR", details);
    this.name = "AIServiceError";
  }
}

// ===== Internal Server Error (500) =====

/**
 * Error for unexpected internal failures (HTTP 500).
 * Used as a catch-all for unhandled errors.
 */
export class InternalServerError extends APIError {
  /**
   * Creates a new InternalServerError instance.
   * @param message - Human-readable internal error message
   */
  constructor(message: string = DEFAULT_ERROR_MESSAGES.INTERNAL) {
    super(ErrorType.INTERNAL, message, HTTP_STATUS.INTERNAL_ERROR, "INTERNAL_ERROR");
    this.name = "InternalServerError";
  }
}

// ===== Error Type Guard =====

/**
 * Type guard to check if an error is an APIError instance.
 * @param error - Unknown error to check
 * @returns True if the error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

// ===== Error Factory =====

/**
 * Creates a standardized error response from any error type.
 * Handles APIError instances, Zod validation errors, and generic errors.
 * @param error - The error to convert
 * @returns Standardized error response object
 */
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
