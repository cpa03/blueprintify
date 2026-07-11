/**
 * @fileoverview Tests for useAutoScroll hook.
 *
 * Tests cover:
 * - Initial state: isNearBottom, userScrolledAway defaults
 * - Auto-scroll to bottom when trigger changes during generation
 * - Stops auto-scrolling when user scrolls away from bottom
 * - Resumes auto-scrolling when user returns to bottom
 * - Programmatic scrollToBottom
 * - Disabled when not generating
 * - Cleanup on unmount
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AUTO_SCROLL_DEFAULTS } from "@blueprint/shared/config";
import { useAutoScroll } from "./useAutoScroll";

/**
 * Creates a mock scroll container with configurable dimensions and scroll position.
 */
function createMockContainer(
  overrides: Partial<{
    scrollHeight: number;
    clientHeight: number;
    scrollTop: number;
  }> = {}
) {
  const mockScrollTo = vi.fn();
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();
  const container = {
    scrollHeight: overrides.scrollHeight ?? 1000,
    clientHeight: overrides.clientHeight ?? 500,
    scrollTop: overrides.scrollTop ?? 500,
    scrollTo: mockScrollTo,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  };
  return { container, mockScrollTo, mockAddEventListener, mockRemoveEventListener };
}

describe("useAutoScroll", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialise with isNearBottom=true when scrolled to bottom", () => {
    const { container } = createMockContainer({ scrollTop: 420 });
    const scrollContainerRef = { current: container as unknown as HTMLElement };

    const { result } = renderHook(() =>
      useAutoScroll({
        scrollContainerRef,
        enabled: false,
        trigger: "hello",
        threshold: AUTO_SCROLL_DEFAULTS.NEAR_BOTTOM_THRESHOLD_PX,
      })
    );

    expect(result.current.isNearBottom).toBe(true);
    expect(result.current.userScrolledAway).toBe(false);
  });

  it("should register isNearBottom=false after scroll event shows user scrolled away", () => {
    const { container } = createMockContainer({ scrollTop: 0 });
    const scrollContainerRef = { current: container as unknown as HTMLElement };
    let scrollHandler: EventListener | null = null;
    container.addEventListener = vi.fn((_event: string, handler: EventListener) => {
      scrollHandler = handler;
    });

    const { result } = renderHook(() =>
      useAutoScroll({
        scrollContainerRef,
        enabled: false,
        trigger: "hello",
      })
    );

    // Initially true because scroll event hasn't fired yet
    expect(result.current.isNearBottom).toBe(true);

    // Simulate scroll event showing user at the top (not near bottom)
    act(() => {
      if (scrollHandler) {
        scrollHandler(new Event("scroll"));
      }
    });

    expect(result.current.isNearBottom).toBe(false);
    expect(result.current.userScrolledAway).toBe(true);
  });

  it("should return isNearBottom=true when container is null", () => {
    const scrollContainerRef = { current: null };

    const { result } = renderHook(() =>
      useAutoScroll({
        scrollContainerRef,
        enabled: false,
        trigger: "hello",
      })
    );

    expect(result.current.isNearBottom).toBe(true);
  });

  it("should auto-scroll when trigger changes and user is near bottom", () => {
    const { container, mockScrollTo } = createMockContainer({ scrollTop: 420 });
    const scrollContainerRef = { current: container as unknown as HTMLElement };
    // Capture the scroll event listener
    let scrollHandler: EventListener | null = null;
    container.addEventListener = vi.fn((_event: string, handler: EventListener) => {
      scrollHandler = handler;
    });

    const { rerender } = renderHook(
      ({ trigger }) =>
        useAutoScroll({
          scrollContainerRef,
          enabled: true,
          trigger,
        }),
      { initialProps: { trigger: "initial" } }
    );

    // Fire the scroll handler so the hook registers "near bottom"
    act(() => {
      if (scrollHandler) {
        Object.defineProperty(container, "scrollTop", { value: 420 });
        scrollHandler(new Event("scroll"));
      }
    });

    expect(mockScrollTo).not.toHaveBeenCalled();

    // Change trigger while user is near bottom
    rerender({ trigger: "new content streaming in" });

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  });

  it("should NOT auto-scroll when user has scrolled away from bottom", () => {
    const { container, mockScrollTo } = createMockContainer({ scrollTop: 420 });
    const scrollContainerRef = { current: container as unknown as HTMLElement };
    let scrollHandler: EventListener | null = null;
    container.addEventListener = vi.fn((_event: string, handler: EventListener) => {
      scrollHandler = handler;
    });

    const { rerender } = renderHook(
      ({ trigger }) =>
        useAutoScroll({
          scrollContainerRef,
          enabled: true,
          trigger,
        }),
      { initialProps: { trigger: "initial" } }
    );

    // Simulate user scrolling away from bottom
    act(() => {
      if (scrollHandler) {
        Object.defineProperty(container, "scrollTop", { value: 100 });
        scrollHandler(new Event("scroll"));
      }
    });

    // Change trigger
    rerender({ trigger: "more content" });

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should resume auto-scroll when user returns to bottom", () => {
    const { container, mockScrollTo } = createMockContainer({ scrollTop: 420 });
    const scrollContainerRef = { current: container as unknown as HTMLElement };
    let scrollHandler: EventListener | null = null;
    container.addEventListener = vi.fn((_event: string, handler: EventListener) => {
      scrollHandler = handler;
    });

    const { rerender } = renderHook(
      ({ trigger }) =>
        useAutoScroll({
          scrollContainerRef,
          enabled: true,
          trigger,
        }),
      { initialProps: { trigger: "initial" } }
    );

    // Scroll away
    act(() => {
      if (scrollHandler) {
        Object.defineProperty(container, "scrollTop", { value: 100 });
        scrollHandler(new Event("scroll"));
      }
    });

    // Scroll back near bottom
    act(() => {
      if (scrollHandler) {
        Object.defineProperty(container, "scrollTop", { value: 420 });
        scrollHandler(new Event("scroll"));
      }
    });

    // Change trigger — should now auto-scroll
    rerender({ trigger: "even more content" });

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  });

  it("should NOT auto-scroll when enabled is false", () => {
    const { container, mockScrollTo } = createMockContainer({ scrollTop: 420 });
    const scrollContainerRef = { current: container as unknown as HTMLElement };

    const { rerender } = renderHook(
      ({ enabled, trigger }) =>
        useAutoScroll({
          scrollContainerRef,
          enabled,
          trigger,
        }),
      { initialProps: { enabled: false, trigger: "initial" } }
    );

    // Change trigger while not enabled
    rerender({ enabled: false, trigger: "new content" });

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it("should provide scrollToBottom for programmatic scrolling", () => {
    const { container, mockScrollTo } = createMockContainer({ scrollTop: 0 });
    const scrollContainerRef = { current: container as unknown as HTMLElement };

    const { result } = renderHook(() =>
      useAutoScroll({
        scrollContainerRef,
        enabled: false,
        trigger: "test",
      })
    );

    act(() => {
      result.current.scrollToBottom();
    });

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  });

  it("should not crash when scrollContainerRef.current is null", () => {
    const scrollContainerRef = { current: null };

    const { result } = renderHook(() =>
      useAutoScroll({
        scrollContainerRef,
        enabled: true,
        trigger: "test",
      })
    );

    act(() => {
      result.current.scrollToBottom();
    });

    expect(result.current.isNearBottom).toBe(true);
  });

  it("should clean up event listeners on unmount", () => {
    const { container, mockRemoveEventListener } = createMockContainer({ scrollTop: 420 });
    const scrollContainerRef = { current: container as unknown as HTMLElement };
    container.addEventListener = vi.fn();
    container.removeEventListener = mockRemoveEventListener;

    const { unmount } = renderHook(() =>
      useAutoScroll({
        scrollContainerRef,
        enabled: true,
        trigger: "test",
      })
    );

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalled();
  });
});
