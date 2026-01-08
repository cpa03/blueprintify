/**
 * Error handling utilities for the API
 * Provides standardized error types and response formatting
 */
// ===== Error Types =====
export var ErrorCode;
(function (ErrorCode) {
    // Validation Errors (400)
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    // Authentication Errors (401)
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["MISSING_API_KEY"] = "MISSING_API_KEY";
    // Configuration Errors (500)
    ErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    ErrorCode["OPENAI_NOT_CONFIGURED"] = "OPENAI_NOT_CONFIGURED";
    // External Service Errors (502, 503)
    ErrorCode["AI_SERVICE_ERROR"] = "AI_SERVICE_ERROR";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    // Internal Server Errors (500)
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["STREAM_ERROR"] = "STREAM_ERROR";
})(ErrorCode || (ErrorCode = {}));
export var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatusCode[HttpStatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatusCode[HttpStatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatusCode[HttpStatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatusCode[HttpStatusCode["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatusCode[HttpStatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatusCode[HttpStatusCode["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HttpStatusCode[HttpStatusCode["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(HttpStatusCode || (HttpStatusCode = {}));
// ===== Error Classes =====
export class APIError extends Error {
    code;
    statusCode;
    details;
    constructor(message, code, statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = "APIError";
    }
}
export class ValidationError extends APIError {
    constructor(message, details) {
        super(message, ErrorCode.VALIDATION_ERROR, HttpStatusCode.BAD_REQUEST, details);
        this.name = "ValidationError";
    }
}
export class ConfigurationError extends APIError {
    constructor(message, details) {
        super(message, ErrorCode.CONFIGURATION_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, details);
        this.name = "ConfigurationError";
    }
}
export class AIServiceError extends APIError {
    constructor(message, details) {
        super(message, ErrorCode.AI_SERVICE_ERROR, HttpStatusCode.BAD_GATEWAY, details);
        this.name = "AIServiceError";
    }
}
export class StreamError extends APIError {
    constructor(message, details) {
        super(message, ErrorCode.STREAM_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, details);
        this.name = "StreamError";
    }
}
// ===== Error Response Builders =====
/**
 * Creates a standardized error response object
 */
export function createErrorResponse(code, message, statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR, details) {
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
export function errorToResponse(error) {
    return createErrorResponse(error.code, error.message, error.statusCode, error.details);
}
/**
 * Creates a standardized success response object
 */
export function createSuccessResponse(data) {
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
export function isAPIError(error) {
    return error instanceof APIError;
}
/**
 * Safely extracts error message from unknown error
 */
export function getErrorMessage(error) {
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
export function createValidationError(field) {
    return new ValidationError(`${field} is required`);
}
/**
 * Creates an error for missing OpenAI configuration
 */
export function createOpenAIConfigError() {
    return new ConfigurationError("OpenAI API key not configured", {
        hint: "Set OPENAI_API_KEY in your environment variables",
    });
}
/**
 * Wraps an error from the OpenAI service
 */
export function wrapOpenAIError(error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI error";
    return new AIServiceError("Failed to communicate with AI service", {
        originalError: message,
    });
}
/**
 * Wraps a stream error
 */
export function wrapStreamError(error) {
    const message = error instanceof Error ? error.message : "Unknown stream error";
    return new StreamError("Stream processing failed", {
        originalError: message,
    });
}
