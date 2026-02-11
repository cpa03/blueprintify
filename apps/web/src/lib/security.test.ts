import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  sanitizeMarkdown,
  validateContent,
  validateFile,
  validateAndSanitizeFileContent,
  SECURITY_CONFIG,
  SecurityError,
  handleSecurityError,
  containsXSSPatterns,
  checkStorageQuota,
} from "../lib/security";

describe("Security Utilities", () => {
  describe("sanitizeHtml", () => {
    it("should allow safe HTML tags", () => {
      const safeHtml = "<p>Hello <strong>world</strong></p>";
      const result = sanitizeHtml(safeHtml);
      expect(result).toBe(safeHtml);
    });

    it("should remove script tags", () => {
      const maliciousHtml = '<script>alert("xss")</script><p>content</p>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).not.toContain("<script>");
      expect(result).toContain("<p>content</p>");
    });

    it("should remove event handlers", () => {
      const maliciousHtml = "<p onclick=\"alert('xss')\">Click me</p>";
      const result = sanitizeHtml(maliciousHtml);
      expect(result).not.toContain("onclick");
    });

    it("should remove dangerous attributes", () => {
      const maliciousHtml = '<img src="x" onerror="alert(\'xss\')">';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).not.toContain("onerror");
    });
  });

  describe("sanitizeMarkdown", () => {
    it("should pass through safe markdown", () => {
      const safeMarkdown = "# Hello\n\nThis is **safe** content.";
      const result = sanitizeMarkdown(safeMarkdown);
      expect(result).toBe(safeMarkdown);
    });

    it("should detect XSS patterns in markdown", () => {
      const maliciousMarkdown = 'Hello <script>alert("xss")</script>';
      expect(() => sanitizeMarkdown(maliciousMarkdown)).toThrow(
        "Content contains potentially dangerous patterns",
      );
    });

    it("should sanitize HTML within markdown", () => {
      const markdownWithHtml =
        'Text <p>paragraph</p> and <script>alert("xss")</script>';
      const result = sanitizeMarkdown(markdownWithHtml);
      expect(result).toContain("<p>paragraph</p>");
      expect(result).not.toContain("<script>");
    });
  });

  describe("validateContent", () => {
    it("should validate safe content", () => {
      const safeContent = {
        blueprintContent: "# Safe blueprint",
        tasksContent: "- Safe task 1\n- Safe task 2",
      };
      const result = validateContent(safeContent);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedContent).toBeDefined();
    });

    it("should reject content with XSS", () => {
      const maliciousContent = {
        blueprintContent: '<script>alert("xss")</script>',
        tasksContent: "Safe tasks",
      };
      const result = validateContent(maliciousContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("dangerous patterns");
    });

    it("should reject content that exceeds maximum length", () => {
      const longContent = "a".repeat(SECURITY_CONFIG.MAX_CONTENT_LENGTH + 1);
      const oversizedContent = {
        blueprintContent: longContent,
        tasksContent: "Safe",
      };
      const result = validateContent(oversizedContent);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("exceeds maximum length");
    });
  });

  describe("validateFile", () => {
    const createMockFile = (
      name: string,
      size: number,
      type: string = "text/plain",
    ): File => {
      const mockFile = new File(["content"], name, { type });
      Object.defineProperty(mockFile, "size", { value: size });
      return mockFile;
    };

    it("should allow valid file types", () => {
      const validFile = createMockFile("test.md", 1024, "text/markdown");
      const result = validateFile(validFile);
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid file types", () => {
      const invalidFile = createMockFile(
        "test.exe",
        1024,
        "application/x-executable",
      );
      const result = validateFile(invalidFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("not allowed");
    });

    it("should reject files that are too large", () => {
      const largeFile = createMockFile(
        "test.md",
        SECURITY_CONFIG.MAX_FILE_SIZE + 1,
      );
      const result = validateFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("exceeds maximum allowed size");
    });
  });

  describe("validateAndSanitizeFileContent", () => {
    it.skip("should validate and sanitize safe file content", async () => {
      const mockFile = new File(["# Safe content"], "test.md", {
        type: "text/plain",
      });
      Object.defineProperty(mockFile, "size", { value: 13 });
      const result = await validateAndSanitizeFileContent(mockFile);
      expect(result.isValid).toBe(true);
      expect(result.content).toBe("# Safe content");
    });

    it("should reject file with malicious content", async () => {
      const maliciousFile = new File(
        ['<script>alert("xss")</script>'],
        "test.md",
      );
      Object.defineProperty(maliciousFile, "size", { value: 31 });
      const result = await validateAndSanitizeFileContent(maliciousFile);
      expect(result.isValid).toBe(false);
    });
  });

  describe("containsXSSPatterns", () => {
    it("should detect script tags", () => {
      expect(containsXSSPatterns('<script>alert("xss")</script>')).toBe(true);
    });

    it("should detect javascript: URLs", () => {
      expect(
        containsXSSPatterns("<a href=\"javascript:alert('xss')\">link</a>"),
      ).toBe(true);
    });

    it("should detect event handlers", () => {
      expect(
        containsXSSPatterns("<div onclick=\"alert('xss')\">div</div>"),
      ).toBe(true);
    });

    it("should pass safe content", () => {
      expect(containsXSSPatterns("<p>Safe content</p>")).toBe(false);
    });
  });

  describe("checkStorageQuota", () => {
    it("should return storage quota information", () => {
      const quota = checkStorageQuota();
      expect(quota).toHaveProperty("available");
      expect(quota).toHaveProperty("used");
      expect(quota).toHaveProperty("remaining");
      expect(quota.used).toBeGreaterThanOrEqual(0);
      expect(quota.remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe("SecurityError", () => {
    it("should create security error with type", () => {
      const error = new SecurityError("Test error", "XSS", { details: "test" });
      expect(error.message).toBe("Test error");
      expect(error.type).toBe("XSS");
      expect(error.details).toEqual({ details: "test" });
      expect(error.name).toBe("SecurityError");
    });
  });

  describe("handleSecurityError", () => {
    it("should return SecurityError as-is", () => {
      const originalError = new SecurityError("test", "XSS");
      const result = handleSecurityError(originalError);
      expect(result).toBe(originalError);
    });

    it("should handle ZodError", () => {
      const zodError = new Error("Validation failed");
      (zodError as unknown as { errors: Array<{ message: string }> }).errors = [
        { message: "Field required" },
      ];
      const result = handleSecurityError(zodError);
      expect(result).toBeInstanceOf(SecurityError);
      expect(result.type).toBe("VALIDATION");
    });

    it("should handle regular Error", () => {
      const regularError = new Error("Regular error");
      const result = handleSecurityError(regularError);
      expect(result).toBeInstanceOf(SecurityError);
      expect(result.type).toBe("VALIDATION");
    });

    it("should handle unknown error", () => {
      const unknownError = { someProperty: "someValue" };
      const result = handleSecurityError(unknownError);
      expect(result).toBeInstanceOf(SecurityError);
      expect(result.type).toBe("VALIDATION");
    });
  });
});
