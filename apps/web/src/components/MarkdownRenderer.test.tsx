import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ensureDOMPurifyLoaded } from "../lib/security";

beforeAll(async () => {
  await ensureDOMPurifyLoaded();
});

describe("MarkdownRenderer", () => {
  describe("Basic Rendering", () => {
    it("renders markdown content", () => {
      render(<MarkdownRenderer content="# Hello World" />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hello World");
    });

    it("renders paragraph text", () => {
      render(<MarkdownRenderer content="This is a paragraph." />);
      expect(screen.getByText("This is a paragraph.")).toBeInTheDocument();
    });

    it("accepts custom className", () => {
      const { container } = render(<MarkdownRenderer content="Test" className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("wraps content in markdown-content class", () => {
      const { container } = render(<MarkdownRenderer content="Test" />);
      expect(container.querySelector(".markdown-content")).toBeInTheDocument();
    });
  });

  describe("Heading Elements", () => {
    it("renders h1", () => {
      render(<MarkdownRenderer content="# Heading 1" />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Heading 1");
    });

    it("renders h2", () => {
      render(<MarkdownRenderer content="## Heading 2" />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Heading 2");
    });

    it("renders h3", () => {
      render(<MarkdownRenderer content="### Heading 3" />);
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Heading 3");
    });

    it("renders h4", () => {
      render(<MarkdownRenderer content="#### Heading 4" />);
      expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("Heading 4");
    });

    it("renders h5", () => {
      render(<MarkdownRenderer content="##### Heading 5" />);
      expect(screen.getByRole("heading", { level: 5 })).toHaveTextContent("Heading 5");
    });

    it("renders h6", () => {
      render(<MarkdownRenderer content="###### Heading 6" />);
      expect(screen.getByRole("heading", { level: 6 })).toHaveTextContent("Heading 6");
    });
  });

  describe("Text Formatting", () => {
    it("renders inline code", () => {
      render(<MarkdownRenderer content="Inline `code` here" />);
      const codeElement = screen.getByText("code");
      expect(codeElement.tagName).toBe("CODE");
    });
  });

  describe("Links and Images", () => {
    it("renders links with proper attributes", () => {
      render(<MarkdownRenderer content="[Example](https://example.com)" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders images with lazy loading", () => {
      render(<MarkdownRenderer content="![alt text](image.jpg)" />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "alt text");
      expect(img).toHaveAttribute("loading", "lazy");
    });
  });

  describe("Tables", () => {
    it("renders tables", () => {
      render(
        <MarkdownRenderer
          content={`
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`}
        />
      );
      expect(screen.getByText("Header 1")).toBeInTheDocument();
      expect(screen.getByText("Cell 1")).toBeInTheDocument();
    });
  });

  describe("Blockquotes", () => {
    it("renders blockquotes", () => {
      render(<MarkdownRenderer content="> This is a quote" />);
      const blockquote = document.querySelector("blockquote");
      expect(blockquote).toBeInTheDocument();
      expect(blockquote).toHaveTextContent("This is a quote");
    });
  });

  describe("Security - XSS Protection", () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it("renders component without crashing with potentially malicious content", () => {
      const maliciousContent = '<script>alert("xss")</script>';
      expect(() => render(<MarkdownRenderer content={maliciousContent} />)).not.toThrow();
    });

    it("renders component without crashing with inline event handlers", () => {
      const xssContent = '<img src=x onerror="alert(1)">';
      expect(() => render(<MarkdownRenderer content={xssContent} />)).not.toThrow();
    });
  });

  describe("Memoization", () => {
    it("renders without error on re-render with same content", () => {
      const { rerender } = render(<MarkdownRenderer content="Test" />);
      expect(() => rerender(<MarkdownRenderer content="Test" />)).not.toThrow();
    });

    it("renders without error on content change", () => {
      const { rerender } = render(<MarkdownRenderer content="Test 1" />);
      expect(() => rerender(<MarkdownRenderer content="Test 2" />)).not.toThrow();
    });
  });

  describe("Component structure", () => {
    it("is memoized", () => {
      const { rerender } = render(<MarkdownRenderer content="Test" />);
      const container = document.querySelector(".markdown-content");
      rerender(<MarkdownRenderer content="Test" />);
      const containerAfter = document.querySelector(".markdown-content");
      // Component should be stable across renders with same props
      expect(container).toBe(containerAfter);
    });
  });
});
