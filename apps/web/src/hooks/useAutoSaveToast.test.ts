/**
 * @fileoverview Tests for useAutoSaveToast hook
 *
 * Tests cover the auto-save toast notification behavior:
 * - Showing toast when dependencies change
 * - Debouncing rapid changes
 * - Skipping initial render
 * - Proper cleanup on unmount
 * - Custom message and delay support
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSaveToast } from "./useAutoSaveToast";
import { useToast } from "../store";
import { AUTO_SAVE_CONFIG, TOAST_CONFIG } from "../config/constants";

// Mock the toast store
vi.mock("../store", () => ({
  useToast: vi.fn(),
}));

describe("useAutoSaveToast", () => {
  const mockSuccess = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useToast).mockReturnValue({
      success: mockSuccess,
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    });
    mockSuccess.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should skip showing toast on initial render", () => {
    renderHook(() => useAutoSaveToast(["initial"]));

    // No toast should be shown on mount
    expect(mockSuccess).not.toHaveBeenCalled();
  });

  it("should show toast when dependencies change", () => {
    const { rerender } = renderHook(({ deps }) => useAutoSaveToast(deps), {
      initialProps: { deps: ["initial"] },
    });

    // Change deps
    rerender({ deps: ["changed"] });

    // Toast should be shown after delay
    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_CONFIG.DEFAULT_DELAY);
    });

    expect(mockSuccess).toHaveBeenCalledTimes(1);
    expect(mockSuccess).toHaveBeenCalledWith(
      AUTO_SAVE_CONFIG.DEFAULT_MESSAGE,
      TOAST_CONFIG.AUTO_SAVE_DURATION
    );
  });

  it("should debounce rapid dependency changes", () => {
    const { rerender } = renderHook(({ deps }) => useAutoSaveToast(deps), {
      initialProps: { deps: ["initial"] },
    });

    // Rapid changes
    rerender({ deps: ["change1"] });
    rerender({ deps: ["change2"] });
    rerender({ deps: ["change3"] });

    // Only one toast should be shown after the debounce period
    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_CONFIG.DEFAULT_DELAY);
    });

    expect(mockSuccess).toHaveBeenCalledTimes(1);
  });

  it("should use custom message when provided", () => {
    const { rerender } = renderHook(({ deps, message }) => useAutoSaveToast(deps, message), {
      initialProps: { deps: ["initial"], message: "Custom saved!" },
    });

    rerender({ deps: ["changed"], message: "Custom saved!" });

    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_CONFIG.DEFAULT_DELAY);
    });

    expect(mockSuccess).toHaveBeenCalledWith("Custom saved!", TOAST_CONFIG.AUTO_SAVE_DURATION);
  });

  it("should use custom delay when provided", () => {
    const customDelay = 500;
    const { rerender } = renderHook(({ deps, delay }) => useAutoSaveToast(deps, "Saved", delay), {
      initialProps: { deps: ["initial"], delay: customDelay },
    });

    rerender({ deps: ["changed"], delay: customDelay });

    // Should NOT fire before the custom delay
    act(() => {
      vi.advanceTimersByTime(customDelay - 1);
    });
    expect(mockSuccess).not.toHaveBeenCalled();

    // Should fire AT the custom delay
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(mockSuccess).toHaveBeenCalledTimes(1);
  });

  it("should clear pending timeout on unmount", () => {
    const { rerender, unmount } = renderHook(({ deps }) => useAutoSaveToast(deps), {
      initialProps: { deps: ["initial"] },
    });

    rerender({ deps: ["changed"] });

    // Unmount before the delay elapses
    unmount();

    // Advance timers - toast should NOT be shown
    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_CONFIG.DEFAULT_DELAY);
    });

    expect(mockSuccess).not.toHaveBeenCalled();
  });

  it("should debounce consecutive dependency changes within delay window", () => {
    const { rerender } = renderHook(({ deps }) => useAutoSaveToast(deps), {
      initialProps: { deps: ["initial"] },
    });

    // First change
    rerender({ deps: ["change1"] });

    // Advance partially through the delay
    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_CONFIG.DEFAULT_DELAY / 2);
    });

    // Second change resets the timer
    rerender({ deps: ["change2"] });

    // Advance past the original delay - should NOT have fired yet
    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_CONFIG.DEFAULT_DELAY / 2 + 1);
    });
    expect(mockSuccess).not.toHaveBeenCalled();

    // Advance to the new delayed time
    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_CONFIG.DEFAULT_DELAY / 2);
    });
    // At this point, total time since second change = DEFAULT_DELAY
    expect(mockSuccess).toHaveBeenCalledTimes(1);
  });

  it("should show toast with first change after initial render", () => {
    const { rerender } = renderHook(({ deps }) => useAutoSaveToast(deps), {
      initialProps: { deps: ["dep1", "dep2"] },
    });

    // First dependency change should trigger toast
    rerender({ deps: ["dep1", "changed"] });

    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_CONFIG.DEFAULT_DELAY);
    });

    expect(mockSuccess).toHaveBeenCalledTimes(1);
  });

  it("should use the correct toast success method", () => {
    const { rerender } = renderHook(({ deps }) => useAutoSaveToast(deps), {
      initialProps: { deps: ["initial"] },
    });

    rerender({ deps: ["changed"] });

    act(() => {
      vi.advanceTimersByTime(AUTO_SAVE_CONFIG.DEFAULT_DELAY);
    });

    // Verify it was called with the right method on useToast
    expect(mockSuccess).toHaveBeenCalled();
  });
});
