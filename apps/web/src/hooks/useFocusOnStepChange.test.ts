/**
 * @fileoverview Tests for useFocusOnStepChange and useStepAnnouncer hooks.
 *
 * Tests cover:
 * - useFocusOnStepChange: returns a ref, focuses first element on step change,
 *   skips initial mount, scrolls container to top, handles missing ref gracefully
 * - useStepAnnouncer: creates live region, announces step changes, clears
 *   announcement after timeout, cleans up live region on unmount
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFocusOnStepChange, useStepAnnouncer } from "./useFocusOnStepChange";
import { TIMEOUTS, FOCUS_ANNOUNCER } from "../config/constants";

describe("useFocusOnStepChange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return a ref object", () => {
    const { result } = renderHook(() => useFocusOnStepChange("step-1"));

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it("should skip focus on initial mount by default", () => {
    const focusSpy = vi.fn();
    const scrollIntoViewSpy = vi.fn();

    const { result } = renderHook(() => useFocusOnStepChange("step-1"));

    // Create a container with a focusable element
    const container = document.createElement("div");
    const input = document.createElement("input");
    input.focus = focusSpy;
    input.scrollIntoView = scrollIntoViewSpy;
    container.appendChild(input);
    (result.current as React.MutableRefObject<HTMLDivElement | null>).current = container;

    // Fast-forward any pending timers
    act(() => {
      vi.advanceTimersByTime(TIMEOUTS.FOCUS_DELAY);
    });

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("should focus first element when step changes", () => {
    const focusSpy = vi.fn();
    const scrollIntoViewSpy = vi.fn();

    const { result, rerender } = renderHook((stepId: string) => useFocusOnStepChange(stepId), {
      initialProps: "step-1",
    });

    // Attach container with focusable element
    const container = document.createElement("div");
    container.scrollTo = vi.fn();
    const input = document.createElement("input");
    input.focus = focusSpy;
    input.scrollIntoView = scrollIntoViewSpy;
    container.appendChild(input);
    (result.current as React.MutableRefObject<HTMLDivElement | null>).current = container;

    // Change step
    rerender("step-2");

    // Advance timers for setTimeout inside focusFirstElement
    act(() => {
      vi.advanceTimersByTime(TIMEOUTS.FOCUS_DELAY);
    });

    expect(focusSpy).toHaveBeenCalled();
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });

  it("should scroll container to top when step changes", () => {
    const scrollToSpy = vi.fn();

    const { result, rerender } = renderHook((stepId: string) => useFocusOnStepChange(stepId), {
      initialProps: "step-1",
    });

    const container = document.createElement("div");
    container.scrollTo = scrollToSpy;
    (result.current as React.MutableRefObject<HTMLDivElement | null>).current = container;

    rerender("step-2");

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("should select input text when input has value", () => {
    const selectSpy = vi.fn();
    const focusSpy = vi.fn();

    const { result, rerender } = renderHook((stepId: string) => useFocusOnStepChange(stepId), {
      initialProps: "step-1",
    });

    const container = document.createElement("div");
    container.scrollTo = vi.fn();
    const input = document.createElement("input");
    input.value = "existing text";
    input.focus = focusSpy;
    input.select = selectSpy;
    input.scrollIntoView = vi.fn();
    container.appendChild(input);
    (result.current as React.MutableRefObject<HTMLDivElement | null>).current = container;

    rerender("step-2");

    act(() => {
      vi.advanceTimersByTime(TIMEOUTS.FOCUS_DELAY);
    });

    expect(selectSpy).toHaveBeenCalled();
  });

  it("should not crash when container has no focusable elements", () => {
    const { result, rerender } = renderHook((stepId: string) => useFocusOnStepChange(stepId), {
      initialProps: "step-1",
    });

    const container = document.createElement("div");
    container.scrollTo = vi.fn();
    container.appendChild(document.createElement("div")); // non-focusable
    (result.current as React.MutableRefObject<HTMLDivElement | null>).current = container;

    // Should not throw
    expect(() => rerender("step-2")).not.toThrow();
  });

  it("should not crash when container is null", () => {
    const { rerender } = renderHook((stepId: string) => useFocusOnStepChange(stepId), {
      initialProps: "step-1",
    });

    // Container is null (default ref value)
    expect(() => rerender("step-2")).not.toThrow();
  });
});

describe("useStepAnnouncer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clean up any leftover live regions
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("should create a live region in the DOM", () => {
    const { unmount } = renderHook(() => useStepAnnouncer("step-1", "Project Info"));

    const liveRegion = document.querySelector(`[aria-live="polite"]`);
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.getAttribute("role")).toBe("status");

    // Clean up before afterEach clears the DOM
    unmount();
  });

  it("should announce when step changes", () => {
    const { rerender, unmount } = renderHook(
      ({ stepId, label }) => useStepAnnouncer(stepId, label),
      {
        initialProps: { stepId: "step-1", label: "Project Info" },
      }
    );

    const liveRegion = document.querySelector(`[aria-live="polite"]`);

    rerender({ stepId: "step-2", label: "Tech Stack" });

    expect(liveRegion?.textContent).toBe(FOCUS_ANNOUNCER.STEP_CHANGE("Tech Stack"));

    unmount();
  });

  it("should clear announcement after timeout", () => {
    const { rerender, unmount } = renderHook(
      ({ stepId, label }) => useStepAnnouncer(stepId, label),
      {
        initialProps: { stepId: "step-1", label: "Project Info" },
      }
    );

    const liveRegion = document.querySelector(`[aria-live="polite"]`);

    rerender({ stepId: "step-2", label: "Tech Stack" });

    expect(liveRegion?.textContent).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(TIMEOUTS.LIVE_REGION_CLEAR);
    });

    expect(liveRegion?.textContent).toBe("");

    unmount();
  });

  it("should remove live region on unmount", () => {
    const { unmount } = renderHook(() => useStepAnnouncer("step-1", "Project Info"));

    expect(document.querySelector(`[aria-live="polite"]`)).not.toBeNull();

    unmount();

    expect(document.querySelector(`[aria-live="polite"]`)).toBeNull();
  });

  it("should not re-announce the same step", () => {
    const { rerender, unmount } = renderHook(
      ({ stepId, label }) => useStepAnnouncer(stepId, label),
      {
        initialProps: { stepId: "step-1", label: "Project Info" },
      }
    );

    const liveRegion = document.querySelector(`[aria-live="polite"]`);

    // Clear the initial text content set by the hook's effect
    if (liveRegion) {
      (liveRegion as HTMLElement).textContent = "";
    }

    // Re-render with same step — should NOT announce
    rerender({ stepId: "step-1", label: "Project Info" });

    expect(liveRegion?.textContent).toBe("");

    unmount();
  });
});
