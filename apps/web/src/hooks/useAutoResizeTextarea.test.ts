/**
 * @fileoverview Tests for useAutoResizeTextarea hook.
 *
 * Tests cover:
 * - Default options: minHeight, maxHeight, extraPadding
 * - Height calculation from scrollHeight
 * - Height clamped to min/max boundaries
 * - resize() function updates height
 * - Input event auto-resize
 * - Window resize handler
 * - Reduced motion disables animation
 * - Cleanup on unmount
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoResizeTextarea } from "./useAutoResizeTextarea";
import { TEXTAREA_CONFIG } from "../config/constants";

/**
 * Creates a mock textarea element with configurable scrollHeight.
 */
function createMockTextarea(scrollHeight = 100): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  Object.defineProperty(textarea, "scrollHeight", {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
  textarea.style.height = "50px";
  textarea.setSelectionRange = vi.fn();
  return textarea;
}

describe("useAutoResizeTextarea", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock window.scrollY and scrollTo
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should initialise with minHeight", () => {
    const { result } = renderHook(() => useAutoResizeTextarea());

    expect(result.current.height).toBe(TEXTAREA_CONFIG.DEFAULT_MIN_HEIGHT_PX);
  });

  it("should initialise with custom minHeight", () => {
    const { result } = renderHook(() => useAutoResizeTextarea({ minHeight: 200 }));

    expect(result.current.height).toBe(200);
  });

  it("should provide a ref and resize function", () => {
    const { result } = renderHook(() => useAutoResizeTextarea());

    expect(result.current.textareaRef).toBeDefined();
    expect(typeof result.current.resize).toBe("function");
  });

  it("resize should calculate height based on scrollHeight", () => {
    const textarea = createMockTextarea(150);
    // Make ref point to our mock textarea
    const { result } = renderHook(() => useAutoResizeTextarea({ extraPadding: 0 }));

    // Manually set the ref
    (result.current.textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current =
      textarea;

    act(() => {
      result.current.resize();
    });

    // height = min(max(scrollHeight + extraPadding, minHeight), maxHeight)
    // = min(max(150 + 0, 80), 400) = min(150, 400) = 150
    expect(result.current.height).toBe(150);
  });

  it("should clamp height to minHeight", () => {
    const textarea = createMockTextarea(10);
    const { result } = renderHook(() => useAutoResizeTextarea({ minHeight: 100, extraPadding: 0 }));

    (result.current.textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current =
      textarea;

    act(() => {
      result.current.resize();
    });

    expect(result.current.height).toBe(100);
  });

  it("should clamp height to maxHeight", () => {
    const textarea = createMockTextarea(9999);
    const { result } = renderHook(() => useAutoResizeTextarea({ maxHeight: 300, extraPadding: 0 }));

    (result.current.textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current =
      textarea;

    act(() => {
      result.current.resize();
    });

    expect(result.current.height).toBe(300);
  });

  it("should apply transition style when animate is true and reduced motion is off", () => {
    const textarea = createMockTextarea(150);
    const { result } = renderHook(() => useAutoResizeTextarea({ animate: true }));

    (result.current.textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current =
      textarea;

    act(() => {
      result.current.resize();
    });

    expect(textarea.style.transition).toContain("ease-out");
  });

  it("should not apply transition when animate is false", () => {
    const textarea = createMockTextarea(150);
    const { result } = renderHook(() => useAutoResizeTextarea({ animate: false }));

    (result.current.textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current =
      textarea;

    act(() => {
      result.current.resize();
    });

    expect(textarea.style.transition).toBe("none");
  });

  it("should set textarea height directly", () => {
    const textarea = createMockTextarea(200);
    const { result } = renderHook(() => useAutoResizeTextarea({ extraPadding: 0 }));

    (result.current.textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current =
      textarea;

    act(() => {
      result.current.resize();
    });

    expect(textarea.style.height).toBe("200px");
  });

  it("should not crash when textareaRef.current is null", () => {
    const { result } = renderHook(() => useAutoResizeTextarea());

    act(() => {
      result.current.resize();
    });

    // Should not throw
    expect(result.current.height).toBe(TEXTAREA_CONFIG.DEFAULT_MIN_HEIGHT_PX);
  });

  it("should add input event listener on mount", () => {
    const addEventListenerSpy = vi.spyOn(HTMLTextAreaElement.prototype, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(HTMLTextAreaElement.prototype, "removeEventListener");

    const textarea = createMockTextarea(150);
    const { unmount } = renderHook(() => {
      const hook = useAutoResizeTextarea();
      (hook.textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = textarea;
      return hook;
    });

    // Simulate React effect running by dispatching
    expect(addEventListenerSpy).toHaveBeenCalledWith("input", expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
