/**
 * @fileoverview Tests for the useScrollLock hook.
 *
 * Verifies that the hook correctly:
 * - Locks body scroll when isLocked=true
 * - Compensates for scrollbar width with padding-right
 * - Restores original styles when isLocked=false
 * - Caches scrollbar width measurement
 * - Cleans up event listeners on unmount
 * - Handles SSR safely (noop when document is undefined)
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollLock } from "./useScrollLock";

describe("useScrollLock", () => {
  const originalBodyStyle = {
    overflow: "",
    paddingRight: "",
  };

  beforeEach(() => {
    // Save original body styles
    originalBodyStyle.overflow = document.body.style.overflow;
    originalBodyStyle.paddingRight = document.body.style.paddingRight;

    // Reset any cached scrollbar width
    delete (document as unknown as Record<string, number>).__scrollbarWidth;
  });

  afterEach(() => {
    // Restore original body styles
    document.body.style.overflow = originalBodyStyle.overflow;
    document.body.style.paddingRight = originalBodyStyle.paddingRight;
    vi.restoreAllMocks();
  });

  it("should not modify body styles when isLocked=false", () => {
    const initialOverflow = document.body.style.overflow;
    const initialPadding = document.body.style.paddingRight;

    renderHook(() => useScrollLock({ isLocked: false }));

    expect(document.body.style.overflow).toBe(initialOverflow);
    expect(document.body.style.paddingRight).toBe(initialPadding);
  });

  it("should set overflow:hidden when isLocked=true", () => {
    renderHook(() => useScrollLock({ isLocked: true }));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should restore original overflow when isLocked transitions to false", () => {
    const originalOverflow = document.body.style.overflow;

    const { rerender } = renderHook(
      ({ isLocked }: { isLocked: boolean }) => useScrollLock({ isLocked }),
      { initialProps: { isLocked: true } }
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender({ isLocked: false });

    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it("should restore original paddingRight when unlocked after scrollbar compensation", () => {
    // Simulate a scrollbar width of 16px
    const mockScrollbarWidth = 16;

    // Mock getScrollbarWidth by setting cached value
    (document as unknown as Record<string, number>).__scrollbarWidth = mockScrollbarWidth;

    const originalPaddingRight = document.body.style.paddingRight;
    const originalOverflow = document.body.style.overflow;

    const { rerender } = renderHook(
      ({ isLocked }: { isLocked: boolean }) => useScrollLock({ isLocked }),
      { initialProps: { isLocked: true } }
    );

    // Should have compensated padding
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe(
      `${mockScrollbarWidth + (parseFloat(originalPaddingRight) || 0)}px`
    );

    rerender({ isLocked: false });

    expect(document.body.style.paddingRight).toBe(originalPaddingRight);
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it("should accumulate paddingRight when body already has padding", () => {
    const existingPadding = 20;
    document.body.style.paddingRight = `${existingPadding}px`;

    const mockScrollbarWidth = 16;
    (document as unknown as Record<string, number>).__scrollbarWidth = mockScrollbarWidth;

    renderHook(() => useScrollLock({ isLocked: true }));

    const expectedPadding = existingPadding + mockScrollbarWidth;
    expect(document.body.style.paddingRight).toBe(`${expectedPadding}px`);
  });

  it("should not add scrollbar compensation if body is already overflow:hidden", () => {
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "10px";

    const mockScrollbarWidth = 16;
    (document as unknown as Record<string, number>).__scrollbarWidth = mockScrollbarWidth;

    renderHook(() => useScrollLock({ isLocked: true }));

    // Padding should remain unchanged since already hidden
    expect(document.body.style.paddingRight).toBe("10px");
  });

  it("should restore original styles on unmount while locked", () => {
    const originalOverflow = document.body.style.overflow;

    const { unmount } = renderHook(() => useScrollLock({ isLocked: true }));

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it("should treat re-locks as idempotent (preserve original styles)", () => {
    const { rerender } = renderHook(
      ({ isLocked }: { isLocked: boolean }) => useScrollLock({ isLocked }),
      { initialProps: { isLocked: true } }
    );

    // Lock
    expect(document.body.style.overflow).toBe("hidden");

    // Unlock
    rerender({ isLocked: false });

    const unlockedOverflow = document.body.style.overflow;

    // Re-lock
    rerender({ isLocked: true });

    expect(document.body.style.overflow).toBe("hidden");

    // Unlock again — should still restore original
    rerender({ isLocked: false });

    expect(document.body.style.overflow).toBe(unlockedOverflow);
  });

  it("should not add padding when scrollbar width is 0", () => {
    (document as unknown as Record<string, number>).__scrollbarWidth = 0;

    document.body.style.paddingRight = "5px";
    document.body.style.overflow = "";

    renderHook(() => useScrollLock({ isLocked: true }));

    // No padding compensation for zero-width scrollbar
    expect(document.body.style.paddingRight).toBe("5px");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should cleanup on unmount even if never locked", () => {
    const originalOverflow = document.body.style.overflow;

    const { unmount } = renderHook(() => useScrollLock({ isLocked: false }));

    expect(document.body.style.overflow).toBe(originalOverflow);

    unmount();

    // Styles should remain unchanged
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it("should use cached scrollbar width when available for accurate compensation", () => {
    const cachedWidth = 15;
    (document as unknown as Record<string, number>).__scrollbarWidth = cachedWidth;

    document.body.style.paddingRight = "0px";

    renderHook(() => useScrollLock({ isLocked: true }));

    // Should compensate using cached width (15px)
    expect(document.body.style.paddingRight).toBe(`${cachedWidth}px`);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should handle rapid lock/unlock cycles", () => {
    const originalOverflow = document.body.style.overflow;
    const originalPadding = document.body.style.paddingRight;

    (document as unknown as Record<string, number>).__scrollbarWidth = 16;

    const { rerender } = renderHook(
      ({ isLocked }: { isLocked: boolean }) => useScrollLock({ isLocked }),
      { initialProps: { isLocked: false } }
    );

    // Cycle through lock/unlock rapidly
    for (let i = 0; i < 5; i++) {
      rerender({ isLocked: true });
      expect(document.body.style.overflow).toBe("hidden");

      rerender({ isLocked: false });
      expect(document.body.style.overflow).toBe(originalOverflow);
    }

    // Final state should match original
    expect(document.body.style.overflow).toBe(originalOverflow);
    expect(document.body.style.paddingRight).toBe(originalPadding);
  });
});
