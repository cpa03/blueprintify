import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSaveToast } from "./useAutoSaveToast";

// Mock the toast store at module level
const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockInfo = vi.fn();

vi.mock("../store", () => ({
  useToast: vi.fn(() => ({
    success: mockSuccess,
    error: mockError,
    info: mockInfo,
  })),
}));

// Mock constants
vi.mock("../config/constants", () => ({
  AUTO_SAVE_CONFIG: {
    DEFAULT_MESSAGE: "Changes saved",
    DEFAULT_DELAY: 1000,
  },
  TOAST_CONFIG: {
    AUTO_SAVE_DURATION: 3000,
  },
}));

describe("useAutoSaveToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not show toast on initial render", () => {
    renderHook(({ deps }: { deps: unknown[] }) => useAutoSaveToast(deps), {
      initialProps: { deps: ["initial"] },
    });

    // The effect should have run but skipped the initial render
    // Since it's the first render, hasShownInitial should be set but no toast shown
    expect(mockSuccess).not.toHaveBeenCalled();
  });

  it("should show toast after delay when deps change", () => {
    const { rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoSaveToast(deps, "Saved!", 1000),
      { initialProps: { deps: ["initial"] } },
    );

    // Trigger a re-render with new deps
    rerender({ deps: ["updated"] });

    // Toast should not be shown immediately (delayed)
    expect(mockSuccess).not.toHaveBeenCalled();

    // Advance timers past the delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Now toast should be shown
    expect(mockSuccess).toHaveBeenCalledWith("Saved!", 3000);
  });

  it("should debounce rapid changes", () => {
    const { rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) =>
        useAutoSaveToast(deps, "Auto-saved", 500),
      { initialProps: { deps: ["initial"] } },
    );

    // Rapid changes - each should reset the timer
    rerender({ deps: ["change1"] });
    rerender({ deps: ["change2"] });
    rerender({ deps: ["change3"] });

    // Advance timers but not enough to trigger
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(mockSuccess).not.toHaveBeenCalled();

    // Advance past the final delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should only be called once (debounced)
    expect(mockSuccess).toHaveBeenCalledTimes(1);
    expect(mockSuccess).toHaveBeenCalledWith("Auto-saved", 3000);
  });

  it("should clear timeout on cleanup", () => {
    const { rerender, unmount } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoSaveToast(deps, "Saved", 1000),
      { initialProps: { deps: ["initial"] } },
    );

    // Trigger change
    rerender({ deps: ["change"] });

    // Unmount before timer fires
    unmount();

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should not have called toast because component was unmounted
    expect(mockSuccess).not.toHaveBeenCalled();
  });

  it("should use default message when not provided", () => {
    const { rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoSaveToast(deps),
      { initialProps: { deps: ["initial"] } },
    );

    rerender({ deps: ["change"] });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should use default message
    expect(mockSuccess).toHaveBeenCalledWith("Changes saved", 3000);
  });

  it("should use default delay when not provided", () => {
    const { rerender } = renderHook(
      ({ deps }: { deps: unknown[] }) => useAutoSaveToast(deps, "Test"),
      { initialProps: { deps: ["initial"] } },
    );

    rerender({ deps: ["change"] });

    // Should not fire before default delay
    act(() => {
      vi.advanceTimersByTime(999);
    });

    expect(mockSuccess).not.toHaveBeenCalled();

    // Should fire after default delay (1000ms)
    act(() => {
      vi.advanceTimersByTime(2);
    });

    expect(mockSuccess).toHaveBeenCalled();
  });
});
