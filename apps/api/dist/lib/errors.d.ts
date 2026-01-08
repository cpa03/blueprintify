/**
 * Error handling utilities for the API
 * Provides standardized error types and response formatting
 */
export declare enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INVALID_INPUT = "INVALID_INPUT",
    UNAUTHORIZED = "UNAUTHORIZED",
    MISSING_API_KEY = "MISSING_API_KEY",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
    OPENAI_NOT_CONFIGURED = "OPENAI_NOT_CONFIGURED",
    AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    STREAM_ERROR = "STREAM_ERROR"
}
export declare enum HttpStatusCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503
}
export declare class APIError extends Error {
    code: ErrorCode;
    statusCode: HttpStatusCode;
    details?: unknown | undefined;
    constructor(message: string, code: ErrorCode, statusCode?: HttpStatusCode, details?: unknown | undefined);
}
export declare class ValidationError extends APIError {
    constructor(message: string, details?: unknown);
}
export declare class ConfigurationError extends APIError {
    constructor(message: string, details?: unknown);
}
export declare class AIServiceError extends APIError {
    constructor(message: string, details?: unknown);
}
export declare class StreamError extends APIError {
    constructor(message: string, details?: unknown);
}
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
/**
 * Creates a standardized error response object
 */
export declare function createErrorResponse(code: ErrorCode, message: string, statusCode?: HttpStatusCode, details?: unknown): ErrorResponse;
/**
 * Creates an error response from an APIError instance
 */
export declare function errorToResponse(error: APIError): ErrorResponse;
/**
 * Creates a standardized success response object
 */
export declare function createSuccessResponse<T>(data: T): SuccessResponse<T>;
/**
 * Type guard to check if an error is an APIError
 */
export declare function isAPIError(error: unknown): error is APIError;
/**
 * Safely extracts error message from unknown error
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Creates a validation error for missing fields
 */
export declare function createValidationError(field: string): ValidationError;
/**
 * Creates an error for missing OpenAI configuration
 */
export declare function createOpenAIConfigError(): ConfigurationError;
/**
 * Wraps an error from the OpenAI service
 */
export declare function wrapOpenAIError(error: unknown): AIServiceError;
/**
 * Wraps a stream error
 */
export declare function wrapStreamError(error: unknown): StreamError;
