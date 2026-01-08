/**
 * Tests for error handling utilities
 */

import { describe, it, expect } from "vitest";
import {
  APIError,
  ValidationError,
  ConfigurationError,
  AIServiceError,
  StreamError,
  ErrorCode,
  HttpStatusCode,
  createErrorResponse,
  errorToResponse,
  createSuccessResponse,
  isAPIError,
  getErrorMessage,
  createValidationError,
  createOpenAIConfigError,
  wrapOpenAIError,
  wrapStreamError,
} from "../lib/errors";

describe("Error Classes", () => {
  describe("APIError", () => {
    it("should create a basic APIError", () => {
      const error = new APIError(
        "Test error",
        ErrorCode.VALIDATION_ERROR,
        HttpStatusCode.BAD_REQUEST,
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("APIError");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    });

    it("should support optional details", () => {
      const details = { field: "testField" };
      const error = new APIError(
        "Test error",
        ErrorCode.VALIDATION_ERROR,
        HttpStatusCode.BAD_REQUEST,
        details,
      );

      expect(error.details).toEqual(details);
    });
  });

  describe("ValidationError", () => {
    it("should create a ValidationError with correct defaults", () => {
      const error = new ValidationError("Invalid input");

      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe("ValidationError");
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    });
  });

  describe("ConfigurationError", () => {
    it("should create a ConfigurationError with correct defaults", () => {
      const error = new ConfigurationError("Missing config");

      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe("ConfigurationError");
      expect(error.code).toBe(ErrorCode.CONFIGURATION_ERROR);
      expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    });
  });

  describe("AIServiceError", () => {
    it("should create an AIServiceError with correct defaults", () => {
      const error = new AIServiceError("AI service failed");

      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe("AIServiceError");
      expect(error.code).toBe(ErrorCode.AI_SERVICE_ERROR);
      expect(error.statusCode).toBe(HttpStatusCode.BAD_GATEWAY);
    });
  });

  describe("StreamError", () => {
    it("should create a StreamError with correct defaults", () => {
      const error = new StreamError("Stream failed");

      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe("StreamError");
      expect(error.code).toBe(ErrorCode.STREAM_ERROR);
      expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    });
  });
});

describe("Response Builders", () => {
  describe("createErrorResponse", () => {
    it("should create a standardized error response", () => {
      const response = createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid input",
        HttpStatusCode.BAD_REQUEST,
      );

      expect(response).toHaveProperty("error");
      expect(response.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(response.error.message).toBe("Invalid input");
      expect(response.error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(response.error.timestamp).toBeDefined();
    });

    it("should include optional details", () => {
      const details = { field: "testField" };
      const response = createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid input",
        HttpStatusCode.BAD_REQUEST,
        details,
      );

      expect(response.error.details).toEqual(details);
    });

    it("should generate a valid ISO timestamp", () => {
      const response = createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Invalid input",
        HttpStatusCode.BAD_REQUEST,
      );

      expect(() => new Date(response.error.timestamp)).not.toThrow();
    });
  });

  describe("errorToResponse", () => {
    it("should convert an APIError to error response", () => {
      const apiError = new APIError(
        "Test error",
        ErrorCode.VALIDATION_ERROR,
        HttpStatusCode.BAD_REQUEST,
      );
      const response = errorToResponse(apiError);

      expect(response.error.code).toBe(apiError.code);
      expect(response.error.message).toBe(apiError.message);
      expect(response.error.statusCode).toBe(apiError.statusCode);
    });
  });

  describe("createSuccessResponse", () => {
    it("should create a standardized success response", () => {
      const data = { id: "123", name: "Test" };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.timestamp).toBeDefined();
    });

    it("should generate a valid ISO timestamp", () => {
      const response = createSuccessResponse({});

      expect(() => new Date(response.timestamp)).not.toThrow();
    });
  });
});

describe("Type Guards", () => {
  describe("isAPIError", () => {
    it("should return true for APIError instances", () => {
      const error = new APIError(
        "Test",
        ErrorCode.VALIDATION_ERROR,
        HttpStatusCode.BAD_REQUEST,
      );
      expect(isAPIError(error)).toBe(true);
    });

    it("should return true for subclasses of APIError", () => {
      const error = new ValidationError("Test");
      expect(isAPIError(error)).toBe(true);
    });

    it("should return false for generic Error", () => {
      const error = new Error("Test");
      expect(isAPIError(error)).toBe(false);
    });

    it("should return false for non-Error values", () => {
      expect(isAPIError("string")).toBe(false);
      expect(isAPIError(null)).toBe(false);
      expect(isAPIError(undefined)).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from Error instance", () => {
      const error = new Error("Test error");
      expect(getErrorMessage(error)).toBe("Test error");
    });

    it("should return string as-is", () => {
      expect(getErrorMessage("Direct message")).toBe("Direct message");
    });

    it("should return default for unknown errors", () => {
      expect(getErrorMessage(null)).toBe("An unknown error occurred");
      expect(getErrorMessage(undefined)).toBe("An unknown error occurred");
      expect(getErrorMessage(123)).toBe("An unknown error occurred");
    });
  });
});

describe("Error Helpers", () => {
  describe("createValidationError", () => {
    it("should create a ValidationError with field-specific message", () => {
      const error = createValidationError("email");

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("email is required");
    });
  });

  describe("createOpenAIConfigError", () => {
    it("should create a ConfigurationError with helpful details", () => {
      const error = createOpenAIConfigError();

      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.message).toBe("OpenAI API key not configured");
      expect(error.details).toEqual({
        hint: "Set OPENAI_API_KEY in your environment variables",
      });
    });
  });

  describe("wrapOpenAIError", () => {
    it("should wrap an Error in AIServiceError", () => {
      const originalError = new Error("OpenAI connection failed");
      const wrapped = wrapOpenAIError(originalError);

      expect(wrapped).toBeInstanceOf(AIServiceError);
      expect(wrapped.details).toEqual({
        originalError: "OpenAI connection failed",
      });
    });

    it("should wrap unknown error in AIServiceError", () => {
      const wrapped = wrapOpenAIError("Unknown error");

      expect(wrapped).toBeInstanceOf(AIServiceError);
      expect(wrapped.details).toEqual({
        originalError: "Unknown OpenAI error",
      });
    });
  });

  describe("wrapStreamError", () => {
    it("should wrap an Error in StreamError", () => {
      const originalError = new Error("Stream interrupted");
      const wrapped = wrapStreamError(originalError);

      expect(wrapped).toBeInstanceOf(StreamError);
      expect(wrapped.details).toEqual({
        originalError: "Stream interrupted",
      });
    });

    it("should wrap unknown error in StreamError", () => {
      const wrapped = wrapStreamError("Unknown error");

      expect(wrapped).toBeInstanceOf(StreamError);
      expect(wrapped.details).toEqual({
        originalError: "Unknown stream error",
      });
    });
  });
});
