import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportAsZip, copyToClipboard, formatForIDE } from "../lib/export";
import { TechStackItemType } from "@blueprint/shared";

vi.mock("jszip", () => ({
  default: vi.fn().mockImplementation(() => ({
    folder: vi.fn(),
    file: vi.fn(),
    generateAsync: vi.fn().mockResolvedValue(new Blob()),
  })),
}));
Object.defineProperty(global, "document", {
  value: {
    createElement: vi.fn().mockReturnValue({
      href: "",
      download: "",
      click: vi.fn(),
      style: { position: "", left: "" },
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
    createObjectURL: vi.fn().mockReturnValue("mock-url"),
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

describe("export functionality", () => {
  const mockFiles = {
    blueprint: "# Test Blueprint\n\nThis is a test blueprint.",
    tasks: "# Test Tasks\n\nThis is a test task list.",
    projectName: "Test Project",
    techStack: [
      { name: "React", category: "frontend" as const },
      { name: "Express", category: "backend" as const },
    ],
    description: "A test project",
    targetAudience: "Developers",
    features: ["Feature 1", "Feature 2"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("exportAsZip", () => {
    it("should export files as ZIP with progress callback", async () => {
      const onProgress = vi.fn();

      await expect(exportAsZip(mockFiles, onProgress)).resolves.not.toThrow();

      expect(onProgress).toHaveBeenCalled();

      const progressCalls = onProgress.mock.calls.map((call) => call[0]);
      expect(progressCalls.some((p) => p.stage.includes("Generating"))).toBe(
        true,
      );
      expect(progressCalls.some((p) => p.stage.includes("Complete"))).toBe(
        true,
      );
    });

    it("should handle React tech stack correctly", async () => {
      const reactFiles = {
        ...mockFiles,
        techStack: [{ name: "React", category: "frontend" as const }],
      };

      await expect(exportAsZip(reactFiles)).resolves.not.toThrow();
    });

    it("should handle Node.js tech stack correctly", async () => {
      const nodeFiles = {
        ...mockFiles,
        techStack: [{ name: "Node.js", category: "backend" as const }],
      };

      await expect(exportAsZip(nodeFiles)).resolves.not.toThrow();
    });

    it("should handle Python tech stack correctly", async () => {
      const pythonFiles = {
        ...mockFiles,
        techStack: [{ name: "Python", category: "backend" as const }],
      };

      await expect(exportAsZip(pythonFiles)).resolves.not.toThrow();
    });

    it("should handle static site tech stack correctly", async () => {
      const staticFiles = {
        ...mockFiles,
        techStack: [{ name: "HTML", category: "hosting" as const }],
      };

      await expect(exportAsZip(staticFiles)).resolves.not.toThrow();
    });

    it("should generate proper filename with date", async () => {
      const mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      };

      document.createElement = vi.fn().mockReturnValue(mockLink);

      await exportAsZip(mockFiles);

      expect(mockLink.download).toMatch(/test-project-\d{4}-\d{2}-\d{2}\.zip/);
    });

    it("should handle empty tech stack gracefully", async () => {
      const filesWithoutStack = {
        ...mockFiles,
        techStack: [],
      };

      await expect(exportAsZip(filesWithoutStack)).resolves.not.toThrow();
    });

    it("should handle export errors gracefully", async () => {
      const JSZip = await import("jszip");
      const mockZip = {
        folder: vi.fn(),
        file: vi.fn(),
        generateAsync: vi.fn().mockRejectedValue(new Error("Test error")),
      };

      (JSZip.default as any).mockImplementation(() => mockZip);

      await expect(exportAsZip(mockFiles)).rejects.toThrow(
        "Failed to generate ZIP file",
      );
    });
  });

  describe("copyToClipboard", () => {
    it("should copy text to clipboard using navigator.clipboard", async () => {
      const result = await copyToClipboard("Test text");

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Test text");
      expect(result).toBe(true);
    });

    it("should fallback to execCommand when clipboard API fails", async () => {
      (navigator.clipboard.writeText as any).mockRejectedValue(
        new Error("Not supported"),
      );

      Object.defineProperty(document, "execCommand", {
        value: vi.fn().mockReturnValue(true),
        writable: true,
      });

      const result = await copyToClipboard("Test text");

      expect(result).toBe(true);
    });

    it("should return false when both methods fail", async () => {
      (navigator.clipboard.writeText as any).mockRejectedValue(
        new Error("Not supported"),
      );

      Object.defineProperty(document, "execCommand", {
        value: vi.fn().mockReturnValue(false),
        writable: true,
      });

      const result = await copyToClipboard("Test text");

      expect(result).toBe(false);
    });
  });

  describe("formatForIDE", () => {
    it("should normalize line endings to LF", () => {
      const input = "Line 1\r\nLine 2\rLine 3\n";
      const expected = "Line 1\nLine 2\nLine 3";

      expect(formatForIDE(input)).toBe(expected);
    });

    it("should trim whitespace from start and end", () => {
      const input = "  \nContent here\n  ";
      const expected = "Content here";

      expect(formatForIDE(input)).toBe(expected);
    });

    it("should handle empty strings", () => {
      expect(formatForIDE("")).toBe("");
    });

    it("should handle strings with only whitespace", () => {
      expect(formatForIDE("   \n  \n  ")).toBe("");
    });
  });
});
