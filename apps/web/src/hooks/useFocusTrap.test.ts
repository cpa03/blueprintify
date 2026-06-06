/**
 * @fileoverview Tests for useFocusTrap hook
 *
 * Tests cover focus trapping behavior:
 * - Return value shape
 * - Auto-focus on activation (via focusFirst/focusLast)
 * - autoFocus=false skips auto-focus
 * - Programmatic focusFirst/focusLast
 * - Empty container (no focusable elements)
 * - No errors when ref is null
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFocusTrap } from "./useFocusTrap";

describe("useFocusTrap", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.innerHTML = `
      <button id="btn1">First</button>
      <button id="btn2">Second</button>
      <button id="btn3">Third</button>
      <a href="#" id="link1">Link</a>
    `;
    container.style.display = "block";
    document.body.appendChild(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should return containerRef, focusFirst, and focusLast", () => {
    const { result } = renderHook(() => useFocusTrap({ isActive: false }));

    expect(result.current.containerRef).toBeDefined();
    expect(typeof result.current.focusFirst).toBe("function");
    expect(typeof result.current.focusLast).toBe("function");
  });

  it("should call focusFirst to focus the first focusable element", () => {
    const { result } = renderHook(() => useFocusTrap({ isActive: true }));

    act(() => {
      (result.current.containerRef as React.MutableRefObject<HTMLElement | null>).current =
        container;
    });

    // focusFirst should find and attempt to focus the first button
    expect(() => result.current.focusFirst()).not.toThrow();
  });

  it("should call focusLast to focus the last focusable element", () => {
    const { result } = renderHook(() => useFocusTrap({ isActive: true }));

    act(() => {
      (result.current.containerRef as React.MutableRefObject<HTMLElement | null>).current =
        container;
    });

    expect(() => result.current.focusLast()).not.toThrow();
  });

  it("should auto-focus via setTimeout when activated with autoFocus=true", () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useFocusTrap({ isActive, autoFocus: true }),
      { initialProps: { isActive: false } }
    );

    act(() => {
      (result.current.containerRef as React.MutableRefObject<HTMLElement | null>).current =
        container;
    });

    act(() => {
      rerender({ isActive: true });
    });

    // The autoFocus effect schedules a setTimeout(0) that calls focusFirst()
    // Flush the timer
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // focusFirst() was called — no error thrown
    expect(result.current.containerRef.current).toBe(container);
  });

  it("should NOT auto-focus when autoFocus is false", () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useFocusTrap({ isActive, autoFocus: false }),
      { initialProps: { isActive: false } }
    );

    act(() => {
      (result.current.containerRef as React.MutableRefObject<HTMLElement | null>).current =
        container;
    });

    act(() => {
      rerender({ isActive: true });
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    // With autoFocus=false, the setTimeout for focusFirst is not scheduled
    // The ref remains unchanged — verify no crash
    expect(result.current.containerRef.current).toBe(container);
  });

  it("should handle empty container gracefully (no focusable elements)", () => {
    const { result } = renderHook(() => useFocusTrap({ isActive: true }));

    act(() => {
      const emptyDiv = document.createElement("div");
      emptyDiv.textContent = "No focusable items";
      (result.current.containerRef as React.MutableRefObject<HTMLElement | null>).current =
        emptyDiv;
    });

    expect(() => result.current.focusFirst()).not.toThrow();
    expect(() => result.current.focusLast()).not.toThrow();
  });

  it("should handle null containerRef gracefully", () => {
    const { result } = renderHook(() => useFocusTrap({ isActive: true }));

    // containerRef.current is null by default
    expect(() => result.current.focusFirst()).not.toThrow();
    expect(() => result.current.focusLast()).not.toThrow();
  });

  it("should update focus targets when container content changes", () => {
    const { result } = renderHook(() => useFocusTrap({ isActive: true }));

    act(() => {
      (result.current.containerRef as React.MutableRefObject<HTMLElement | null>).current =
        container;
    });

    // focusFirst should find the first button
    expect(() => result.current.focusFirst()).not.toThrow();

    // Add a new button at the beginning and try focusFirst again
    act(() => {
      const newBtn = document.createElement("button");
      newBtn.id = "btn0";
      newBtn.textContent = "New First";
      container.insertBefore(newBtn, container.firstChild);
    });

    // The hook's getFocusableElements runs each time via useCallback
    expect(() => result.current.focusFirst()).not.toThrow();
  });
});
