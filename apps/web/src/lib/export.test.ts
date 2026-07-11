import { describe, it, expect, vi, beforeEach } from "vitest";
import JSZip from "jszip";
import { exportAsZip, copyToClipboard, formatForIDE } from "../lib/export";
import type { TechStackItemType } from "@blueprint/shared/types";

// Mock JSZip
vi.mock("jszip", () => {
  const mockJSZip = vi.fn(function () {
    return {
      folder: vi.fn().mockReturnValue({
        file: vi.fn(),
      }),
      file: vi.fn(),
      generateAsync: vi.fn().mockResolvedValue(new Blob()),
    };
  });
  return { default: mockJSZip };
});

// Mock document methods
Object.defineProperty(global, "document", {
  value: {
    createElement: vi.fn().mockReturnValue({
      href: "",
      download: "",
      click: vi.fn(),
    }),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(global, "URL", {
  value: {
    createObjectURL: vi.fn().mockReturnValue("blob-url"),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(global, "navigator", {
  value: {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  },
  writable: true,
});

describe("Export functionality", () => {
  const mockTechStack: TechStackItemType[] = [
    { name: "React", category: "frontend" as const },
    { name: "TypeScript", category: "frontend" as const },
  ];

  const mockFiles = {
    blueprint: "# Test Blueprint\n\nThis is a test blueprint.",
    tasks: "# Test Tasks\n\n- Task 1\n- Task 2",
    projectName: "test-project",
    techStack: mockTechStack,
    description: "A test project for unit testing",
    features: ["Feature 1", "Feature 2"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("exportAsZip", () => {
    it("should generate a ZIP file with project structure", async () => {
      await expect(exportAsZip(mockFiles)).resolves.not.toThrow();
    });

    it("should handle React projects correctly", async () => {
      const reactFiles = {
        ...mockFiles,
        techStack: [
          { name: "React", category: "frontend" as const },
          { name: "Next.js", category: "frontend" as const },
        ],
      };

      await expect(exportAsZip(reactFiles)).resolves.not.toThrow();
    });

    it("should handle Node.js projects correctly", async () => {
      const nodeFiles = {
        ...mockFiles,
        techStack: [
          { name: "Node.js", category: "backend" as const },
          { name: "Express", category: "backend" as const },
        ],
      };

      await expect(exportAsZip(nodeFiles)).resolves.not.toThrow();
    });

    it("should handle Python projects correctly", async () => {
      const pythonFiles = {
        ...mockFiles,
        techStack: [
          { name: "Python", category: "backend" as const },
          { name: "Django", category: "backend" as const },
        ],
      };

      await expect(exportAsZip(pythonFiles)).resolves.not.toThrow();
    });

    it("should handle static sites correctly", async () => {
      const staticFiles = {
        ...mockFiles,
        techStack: [
          { name: "HTML", category: "frontend" as const },
          { name: "CSS", category: "styling" as const },
        ],
      };

      await expect(exportAsZip(staticFiles)).resolves.not.toThrow();
    });

    it("should use default project name when none provided", async () => {
      const filesWithoutName = {
        ...mockFiles,
        projectName: "",
      };

      await expect(exportAsZip(filesWithoutName)).resolves.not.toThrow();
    });

    it("should create .docs folder with documentation files", async () => {
      const mockZip = {
        folder: vi.fn().mockReturnValue({
          file: vi.fn(),
        }),
        file: vi.fn(),
        generateAsync: vi.fn().mockResolvedValue(new Blob()),
      };

      (JSZip as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
        return mockZip;
      });

      await exportAsZip(mockFiles);

      expect(mockZip.folder).toHaveBeenCalledWith(".docs");
    });

    it("should trigger download with correct filename", async () => {
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      };

      const mockDocument = {
        createElement: vi.fn().mockReturnValue(mockLink),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      };

      Object.defineProperty(global, "document", {
        value: mockDocument,
        writable: true,
      });

      await exportAsZip(mockFiles);

      expect(mockDocument.createElement).toHaveBeenCalledWith("a");
      expect(mockLink.download).toMatch(/test-project-\d{4}-\d{2}-\d{2}\.zip/);
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe("copyToClipboard", () => {
    it("should copy text to clipboard using modern API", async () => {
      const text = "Test text to copy";

      const result = await copyToClipboard(text);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
      expect(result).toBe(true);
    });

    it("should fallback to legacy method when modern API fails", async () => {
      const text = "Test text to copy";
      const mockError = new Error("Clipboard API not available");

      (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(mockError);

      // Mock execCommand
      Object.defineProperty(global, "document", {
        value: {
          createElement: vi.fn().mockReturnValue({
            value: "",
            style: { position: "", left: "" },
            select: vi.fn(),
          }),
          body: {
            appendChild: vi.fn(),
            removeChild: vi.fn(),
          },
          execCommand: vi.fn().mockReturnValue(true),
        },
        writable: true,
      });

      const result = await copyToClipboard(text);

      expect(result).toBe(true);
    });

    it("should return false when both methods fail", async () => {
      const text = "Test text to copy";
      const mockError = new Error("Clipboard API not available");

      (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(mockError);

      // Mock execCommand failure
      Object.defineProperty(global, "document", {
        value: {
          createElement: vi.fn().mockReturnValue({
            value: "",
            style: { position: "", left: "" },
            select: vi.fn(),
          }),
          body: {
            appendChild: vi.fn(),
            removeChild: vi.fn(),
          },
          execCommand: vi.fn().mockReturnValue(false),
        },
        writable: true,
      });

      const result = await copyToClipboard(text);

      expect(result).toBe(false);
    });
  });

  describe("formatForIDE", () => {
    it("should normalize line endings to LF", () => {
      const textWithCRLF = "Line 1\r\nLine 2\r\nLine 3";
      const expected = "Line 1\nLine 2\nLine 3";

      expect(formatForIDE(textWithCRLF)).toBe(expected);
    });

    it("should normalize line endings from CR to LF", () => {
      const textWithCR = "Line 1\rLine 2\rLine 3";
      const expected = "Line 1\nLine 2\nLine 3";

      expect(formatForIDE(textWithCR)).toBe(expected);
    });

    it("should trim whitespace from content", () => {
      const textWithWhitespace = "  \n\n  Line 1\nLine 2\n  \n\n  ";
      const expected = "Line 1\nLine 2";

      expect(formatForIDE(textWithWhitespace)).toBe(expected);
    });

    it("should handle empty content", () => {
      const emptyText = "";
      const expected = "";

      expect(formatForIDE(emptyText)).toBe(expected);
    });

    it("should handle content with only whitespace", () => {
      const whitespaceOnly = "  \n\n  \t\t\n\n  ";
      const expected = "";

      expect(formatForIDE(whitespaceOnly)).toBe(expected);
    });
  });
});
