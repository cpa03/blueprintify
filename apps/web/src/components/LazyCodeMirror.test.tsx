/**
 * Tests for LazyCodeMirror
 *
 * Covers:
 * - Renders a loading skeleton with a status region while CodeMirror loads
 * - Switches to the live CodeMirror editor once dynamically loaded
 * - Forwards value/onChange/className to the loaded editor
 * - Provides a screen-reader readiness announcement after loading
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

let codeMirrorValue: string | undefined;
let codeMirrorOnChange: ((value: string) => void) | undefined;
let codeMirrorClassName: string | undefined;

const { contentAttributesOf } = vi.hoisted(() => ({
  contentAttributesOf: vi.fn((attrs: Record<string, string>) => ({
    __contentAttributes: attrs,
  })),
}));

vi.mock("@codemirror/view", () => ({
  EditorView: {
    contentAttributes: {
      of: contentAttributesOf,
    },
  },
}));

vi.mock("@uiw/react-codemirror", async () => {
  const React = await import("react");
  const MockCodeMirror = React.forwardRef((props: Record<string, unknown>, _ref: unknown) => {
    codeMirrorValue = props.value as string;
    codeMirrorOnChange = props.onChange as (value: string) => void;
    codeMirrorClassName = props.className as string;
    return React.createElement("div", { "data-testid": "codemirror" });
  });
  MockCodeMirror.displayName = "MockCodeMirror";
  return {
    default: MockCodeMirror,
  };
});

vi.mock("@codemirror/lang-markdown", () => ({
  markdown: vi.fn(() => ({ name: "markdown" })),
}));

vi.mock("@codemirror/theme-one-dark", () => ({
  oneDark: { name: "oneDark" },
}));

import { LazyCodeMirror } from "./LazyCodeMirror";
import { ACCESSIBILITY_LABELS } from "../config/constants/content";

describe("LazyCodeMirror", () => {
  beforeEach(() => {
    codeMirrorValue = undefined;
    codeMirrorOnChange = undefined;
    codeMirrorClassName = undefined;
    contentAttributesOf.mockClear();
  });

  it("renders a skeleton with a status region before the editor loads", () => {
    render(<LazyCodeMirror value="" onChange={() => undefined} />);

    const skeleton = screen.getByRole("status");
    expect(skeleton).toHaveAttribute("aria-label", ACCESSIBILITY_LABELS.LAZY_CODEMIRROR.LOADING);
  });

  it("mounts the CodeMirror editor after the dynamic import resolves", async () => {
    render(<LazyCodeMirror value="# Hello" onChange={() => undefined} className="editor" />);

    await waitFor(() => {
      expect(screen.getByTestId("codemirror")).toBeInTheDocument();
    });

    expect(codeMirrorValue).toBe("# Hello");
    expect(codeMirrorClassName).toBe("editor");
    expect(codeMirrorOnChange).toBeDefined();
  });

  it("announces readiness once the editor is available", async () => {
    render(<LazyCodeMirror value="" onChange={() => undefined} />);

    await waitFor(() => {
      expect(screen.getByTestId("codemirror")).toBeInTheDocument();
    });

    // Readiness is announced through a polite live region
    expect(screen.getByText(ACCESSIBILITY_LABELS.LAZY_CODEMIRROR.READY)).toBeDefined();
  });

  it("names the editor content for screen readers when ariaLabel is provided", async () => {
    render(
      <LazyCodeMirror
        value="# Hello"
        onChange={() => undefined}
        ariaLabel="Blueprint markdown editor"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("codemirror")).toBeInTheDocument();
    });

    expect(contentAttributesOf).toHaveBeenCalledWith({ "aria-label": "Blueprint markdown editor" });
  });

  it("omits the contentAttributes naming facet when ariaLabel is not provided", async () => {
    render(<LazyCodeMirror value="# Hello" onChange={() => undefined} />);

    await waitFor(() => {
      expect(screen.getByTestId("codemirror")).toBeInTheDocument();
    });

    expect(contentAttributesOf).not.toHaveBeenCalled();
  });
});
