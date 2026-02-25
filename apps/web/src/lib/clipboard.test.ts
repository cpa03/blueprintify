import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyToClipboard, formatForIDE } from "./clipboard";

describe("clipboard", () => {
  describe("copyToClipboard", () => {
    beforeEach(() => {
      vi.stubGlobal("navigator", {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("should copy text to clipboard using modern API", async () => {
      const text = "Hello, world!";
      const result = await copyToClipboard(text);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
      expect(result).toBe(true);
    });

    it("should return false when clipboard API throws an error and fallback also fails", async () => {
      vi.stubGlobal("navigator", {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error("Clipboard error")),
        },
      });

      vi.stubGlobal("document", {
        createElement: vi.fn().mockReturnValue({
          value: "test",
          style: {},
          select: vi.fn(),
        }),
        execCommand: vi.fn().mockReturnValue(false),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      });

      const result = await copyToClipboard("test");

      expect(result).toBe(false);
    });

    it("should use fallback method when clipboard API is not available", async () => {
      vi.stubGlobal("navigator", {
        clipboard: undefined,
      });

      const mockExecCommand = vi.fn().mockReturnValue(true);
      const mockSelect = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();

      const mockTextarea = {
        value: "test",
        style: {
          position: "",
          left: "",
        },
        select: mockSelect,
      };

      vi.stubGlobal("document", {
        createElement: vi.fn().mockReturnValue(mockTextarea),
        execCommand: mockExecCommand,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      });

      const result = await copyToClipboard("test");

      expect(result).toBe(true);
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockSelect).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it("should return false when fallback execCommand fails", async () => {
      vi.stubGlobal("navigator", {
        clipboard: undefined,
      });

      const mockExecCommand = vi.fn().mockReturnValue(false);
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();

      const mockTextarea = {
        value: "test",
        style: {
          position: "",
          left: "",
        },
        select: vi.fn(),
      };

      vi.stubGlobal("document", {
        createElement: vi.fn().mockReturnValue(mockTextarea),
        execCommand: mockExecCommand,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      });

      const result = await copyToClipboard("test");

      expect(result).toBe(false);
    });

    it("should handle empty string", async () => {
      const result = await copyToClipboard("");

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("");
      expect(result).toBe(true);
    });

    it("should handle multi-line text", async () => {
      const multiLineText = "Line 1\nLine 2\nLine 3";
      const result = await copyToClipboard(multiLineText);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(multiLineText);
      expect(result).toBe(true);
    });
  });

  describe("formatForIDE", () => {
    it("should convert Windows line endings to Unix", () => {
      const input = "Line 1\r\nLine 2\r\nLine 3";
      const result = formatForIDE(input);
      expect(result).toBe("Line 1\nLine 2\nLine 3");
    });

    it("should convert old Mac line endings to Unix", () => {
      const input = "Line 1\rLine 2\rLine 3";
      const result = formatForIDE(input);
      expect(result).toBe("Line 1\nLine 2\nLine 3");
    });

    it("should trim trailing whitespace", () => {
      const input = "content   \n  \n  ";
      const result = formatForIDE(input);
      expect(result).toBe("content");
    });

    it("should handle mixed line endings", () => {
      const input = "Line 1\r\nLine 2\rLine 3\n";
      const result = formatForIDE(input);
      expect(result).toBe("Line 1\nLine 2\nLine 3");
    });

    it("should handle already correct line endings", () => {
      const input = "Line 1\nLine 2\nLine 3";
      const result = formatForIDE(input);
      expect(result).toBe("Line 1\nLine 2\nLine 3");
    });

    it("should handle empty string", () => {
      const result = formatForIDE("");
      expect(result).toBe("");
    });

    it("should handle string with only whitespace", () => {
      const result = formatForIDE("   \r\n\r\n   ");
      expect(result).toBe("");
    });

    it("should preserve content between line endings", () => {
      const input = "prefix\r\nmiddle\r\nsuffix";
      const result = formatForIDE(input);
      expect(result).toBe("prefix\nmiddle\nsuffix");
    });
  });
});
