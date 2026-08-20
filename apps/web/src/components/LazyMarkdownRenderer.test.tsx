/**
 * Tests for LazyMarkdownRenderer
 *
 * Covers:
 * - Renders the skeleton while the renderer is still loading
 * - Renders a custom fallback when provided during load
 * - Mounts the real MarkdownRenderer once loaded
 * - Forwards content/className to the loaded renderer
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

let markdownContent: string | undefined;
let markdownClassName: string | undefined;

vi.mock("./MarkdownRenderer", () => ({
  MarkdownRenderer: vi.fn(({ content, className }: { content: string; className?: string }) => {
    markdownContent = content;
    markdownClassName = className;
    return <div data-testid="markdown-renderer" />;
  }),
}));

import { LazyMarkdownRenderer } from "./LazyMarkdownRenderer";
import { ACCESSIBILITY_LABELS } from "../config/constants/content";

describe("LazyMarkdownRenderer", () => {
  beforeEach(() => {
    markdownContent = undefined;
    markdownClassName = undefined;
  });

  it("renders a skeleton while the renderer loads", () => {
    render(<LazyMarkdownRenderer content="## Title" />);

    expect(document.querySelector(".preview-skeleton")).toBeInTheDocument();
  });

  it("announces the preview loading state through a polite status region", () => {
    render(<LazyMarkdownRenderer content="## Title" />);

    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveAttribute(
      "aria-label",
      ACCESSIBILITY_LABELS.LAZY_MARKDOWN_RENDERER.LOADING
    );
  });

  it("renders a custom fallback instead of the skeleton when provided", () => {
    render(
      <LazyMarkdownRenderer content="x" fallback={<div data-testid="fallback">loading</div>} />
    );

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });

  it("mounts the MarkdownRenderer after the dynamic import resolves", async () => {
    render(<LazyMarkdownRenderer content="# Hi" className="preview" />);

    await waitFor(() => {
      expect(screen.getByTestId("markdown-renderer")).toBeInTheDocument();
    });

    expect(markdownContent).toBe("# Hi");
    expect(markdownClassName).toBe("preview");
  });

  it("announces readiness once the renderer is available", async () => {
    render(<LazyMarkdownRenderer content="# Hi" />);

    await waitFor(() => {
      expect(screen.getByTestId("markdown-renderer")).toBeInTheDocument();
    });

    expect(screen.getByText(ACCESSIBILITY_LABELS.LAZY_MARKDOWN_RENDERER.READY)).toBeDefined();
  });
});
