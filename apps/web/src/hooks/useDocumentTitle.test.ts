import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDocumentTitle } from "./useDocumentTitle";

describe("useDocumentTitle", () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    document.title = originalTitle;
    vi.restoreAllMocks();
  });

  it("should set document title with custom title and app name", () => {
    const { unmount } = renderHook(() => useDocumentTitle("My Project"));

    expect(document.title).toBe("My Project | Blueprintify");

    unmount();
  });

  it("should set default title when no title is provided", () => {
    const { unmount } = renderHook(() => useDocumentTitle(""));

    expect(document.title).toBe("Blueprintify");

    unmount();
  });

  it("should restore original title on unmount", () => {
    document.title = "Original Title";

    const { unmount } = renderHook(() => useDocumentTitle("New Title"));
    expect(document.title).toBe("New Title | Blueprintify");

    unmount();
    expect(document.title).toBe("Original Title");
  });

  it("should update title when title prop changes", () => {
    const { rerender, unmount } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: "First Title" },
    });

    expect(document.title).toBe("First Title | Blueprintify");

    rerender({ title: "Second Title" });
    expect(document.title).toBe("Second Title | Blueprintify");

    unmount();
  });

  it("should handle special characters in title", () => {
    const { unmount } = renderHook(() => useDocumentTitle("Test <script>alert(1)</script>"));

    // The hook should set the title as-is (sanitization should happen elsewhere)
    expect(document.title).toContain("Test");

    unmount();
  });

  it("should handle unicode characters in title", () => {
    const { unmount } = renderHook(() => useDocumentTitle("Проект"));

    expect(document.title).toBe("Проект | Blueprintify");

    unmount();
  });

  it("should handle empty string on initial render", () => {
    const { unmount } = renderHook(() => useDocumentTitle(""));

    expect(document.title).toBe("Blueprintify");

    unmount();
  });

  it("should preserve cleanup on multiple re-renders", () => {
    document.title = "Initial";

    const { rerender, unmount } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: "Title1" },
    });

    expect(document.title).toBe("Title1 | Blueprintify");

    rerender({ title: "Title2" });
    expect(document.title).toBe("Title2 | Blueprintify");

    rerender({ title: "Title3" });
    expect(document.title).toBe("Title3 | Blueprintify");

    unmount();
    expect(document.title).toBe("Initial");
  });
});
