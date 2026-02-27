import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sanitizeString,
  sanitizeError,
  createSecureLogEntry,
  secureLogError,
  secureLogWarn,
} from "./secureLog";

describe("SecureLog Utilities", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe("sanitizeString", () => {
    it("should redact API keys", () => {
      expect(sanitizeString("api_key=sk-12345abcde")).toBe("api_key=[REDACTED]");
      expect(sanitizeString("apikey=my-secret-key")).toBe("apikey=[REDACTED]");
      expect(sanitizeString("token=abc123xyz")).toBe("token=[REDACTED]");
    });

    it("should redact bearer tokens", () => {
      expect(sanitizeString("bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")).toBe(
        "bearer [REDACTED]"
      );
    });

    it("should redact x-api-key headers", () => {
      expect(sanitizeString("x-api-key: my-api-key-123")).toBe("x-api-key=[REDACTED]");
    });

    it("should redact database connection strings", () => {
      expect(sanitizeString("mongodb://user:password@localhost:27017/mydb")).toBe(
        "mongodb://[REDACTED]"
      );
      expect(sanitizeString("mysql://user:pass@localhost:3306/db")).toBe("mysql://[REDACTED]");
    });

    it("should redact connection strings", () => {
      expect(sanitizeString("connection_string=Server=.;Database=mydb;")).toBe(
        "connection_string=[REDACTED]"
      );
    });

    it("should redact file paths", () => {
      expect(sanitizeString("/home/user/project/src/index.ts")).toBe("[PATH_REDACTED]");
      expect(sanitizeString("/var/log/app/error.log")).toBe("[PATH_REDACTED]");
      expect(sanitizeString("/Users/macbook/project/file.ts")).toBe("[PATH_REDACTED]");
      expect(sanitizeString("C:\\Users\\Admin\\file.txt")).toBe("[PATH_REDACTED]");
    });

    it("should redact IP addresses with ports", () => {
      expect(sanitizeString("192.168.1.1:8080")).toBe("[IP_REDACTED]");
      expect(sanitizeString("10.0.0.1:3000")).toBe("[IP_REDACTED]");
    });

    it("should redact email addresses", () => {
      expect(sanitizeString("user@example.com")).toBe("[EMAIL_REDACTED]");
      expect(sanitizeString("contact@company.org")).toBe("[EMAIL_REDACTED]");
    });

    it("should redact UUIDs", () => {
      expect(sanitizeString("550e8400-e29b-41d4-a716-446655440000")).toBe("[UUID_REDACTED]");
      expect(sanitizeString("12345678-1234-1234-1234-123456789012")).toBe("[UUID_REDACTED]");
    });

    it("should return unchanged string when no sensitive data", () => {
      const input = "This is a normal log message without sensitive data";
      expect(sanitizeString(input)).toBe(input);
    });

    it("should handle multiple sensitive patterns in same string", () => {
      const input = "User john@example.com with API key api_key=secret123 from 192.168.1.1:8080";
      const result = sanitizeString(input);
      expect(result).toContain("[EMAIL_REDACTED]");
      expect(result).toContain("[REDACTED]");
      expect(result).toContain("[IP_REDACTED]");
    });

    it("should be case insensitive for pattern matching", () => {
      expect(sanitizeString("API_KEY=mykey")).toBe("API_KEY=[REDACTED]");
      expect(sanitizeString("TOKEN=Mytoken")).toBe("TOKEN=[REDACTED]");
    });
  });

  describe("sanitizeError", () => {
    it("should sanitize Error instances", () => {
      const error = new Error("Failed to connect to mongodb://localhost:27017");
      const result = sanitizeError(error);

      expect(result.message).toBe("Failed to connect to mongodb://[REDACTED]");
      expect(result.name).toBe("Error");
      expect(result.stack).toBeDefined();
    });

    it("should sanitize Error with sensitive data in stack", () => {
      const error = new Error("Error message");
      error.stack = `Error: Error message
    at Object.<anonymous> (/home/user/project/src/index.ts:10:15)
    at processTicksAndRejections (node:internal/process/task_queues:95:96)`;

      const result = sanitizeError(error);

      expect(result.stack).toContain("[PATH_REDACTED]");
    });

    it("should sanitize string errors", () => {
      const error = "API key api_key=sk-test failed";
      const result = sanitizeError(error);

      expect(result.message).toContain("[REDACTED]");
      expect(result.name).toBe("Error");
    });

    it("should sanitize unknown error types", () => {
      const error = {
        code: "ECONNREFUSED",
        message: "Connection failed to 192.168.1.1:5432",
      };
      const result = sanitizeError(error);

      expect(result.message).toContain("[IP_REDACTED]");
      expect(result.name).toBe("UnknownError");
    });
  });

  describe("createSecureLogEntry", () => {
    it("should create structured log entry with sanitized error", () => {
      const error = new Error("Database connection mongodb://localhost failed");
      const entry = createSecureLogEntry("DatabaseOperation", error, {
        operation: "connect",
      });

      expect(entry.context).toBe("DatabaseOperation");
      expect(entry.timestamp).toBeDefined();
      expect(entry.error).toBeDefined();
      const sanitizedError = entry.error as { message: string };
      expect(sanitizedError.message).toContain("[REDACTED]");
      expect(entry.operation).toBe("connect");
    });

    it("should include timestamp in ISO format", () => {
      const entry = createSecureLogEntry("Test", "test error");
      const timestamp = new Date(entry.timestamp as string);

      expect(timestamp.toISOString()).toBe(entry.timestamp);
    });

    it("should handle undefined additionalInfo", () => {
      const entry = createSecureLogEntry("Test", "error");
      expect(entry.context).toBe("Test");
      expect(entry.error).toBeDefined();
    });
  });

  describe("secureLogError", () => {
    it("should log sanitized error to console.error", () => {
      const error = new Error("API token token=secret123");
      secureLogError("API Call", error, { endpoint: "/generate" });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const callArgs = consoleErrorSpy.mock.calls[0];
      expect(callArgs).toBeDefined();
      const loggedContent = callArgs![0] as string;
      const parsed = JSON.parse(loggedContent) as {
        context: string;
        endpoint: string;
        error: { message: string };
      };

      expect(parsed.context).toBe("API Call");
      expect(parsed.endpoint).toBe("/generate");
      expect(parsed.error.message).toContain("[REDACTED]");
    });
  });

  describe("secureLogWarn", () => {
    it("should log sanitized message to console.warn", () => {
      secureLogWarn("RateLimit", "Approaching limit at 192.168.1.1:3000", {
        remaining: 5,
      });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const callArgs = consoleWarnSpy.mock.calls[0];
      expect(callArgs).toBeDefined();
      const loggedContent = callArgs![0] as string;
      const parsed = JSON.parse(loggedContent) as {
        context: string;
        message: string;
        remaining: number;
      };

      expect(parsed.context).toBe("RateLimit");
      expect(parsed.message).toContain("[IP_REDACTED]");
      expect(parsed.remaining).toBe(5);
    });

    it("should handle missing additionalInfo", () => {
      secureLogWarn("Test", "Warning message");

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const callArgs = consoleWarnSpy.mock.calls[0];
      expect(callArgs).toBeDefined();
      const loggedContent = callArgs![0] as string;
      const parsed = JSON.parse(loggedContent) as {
        context: string;
        message: string;
      };

      expect(parsed.context).toBe("Test");
      expect(parsed.message).toBe("Warning message");
    });
  });
});
