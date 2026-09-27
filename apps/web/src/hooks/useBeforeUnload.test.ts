/**
 * @fileoverview Tests for the useBeforeUnload hook.
 *
 * Verifies that the hook correctly:
 * - Registers a beforeunload listener while the guard is active
 * - Triggers the browser's native confirmation (preventDefault) only when
 *   shouldWarn is true
 * - Reads the latest shouldWarn value through a ref (no stale closure)
 * - Removes the listener when the guard flips off or the hook unmounts
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBeforeUnload } from "./useBeforeUnload";

describe("useBeforeUnload", () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  /** Extracts the registered beforeunload handler from the window spy calls */
  const getHandler = (): ((event: BeforeUnloadEvent) => void) => {
    const calls = addEventListenerSpy.mock.calls as Array<[string, EventListener]>;
    const entry = calls.find(([event]) => event === "beforeunload");
    if (!entry) throw new Error("beforeunload listener was never registered");
    return entry[1] as unknown as (event: BeforeUnloadEvent) => void;
  };

  /** Builds a minimal beforeunload event with spies on the trigger properties */
  const createEvent = () => {
    const preventDefault = vi.fn();
    return {
      preventDefault,
      returnValue: "",
    } as unknown as BeforeUnloadEvent;
  };

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register a beforeunload listener on mount", () => {
    renderHook(() => useBeforeUnload(false));
    expect(addEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("should not prompt when shouldWarn is false", () => {
    renderHook(() => useBeforeUnload(false));
    const handler = getHandler();
    const event = createEvent();

    handler(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.returnValue).toBe("");
  });

  it("should prompt (preventDefault + returnValue) when shouldWarn is true", () => {
    renderHook(() => useBeforeUnload(true));
    const handler = getHandler();
    const event = createEvent();

    handler(event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.returnValue).toBe("");
  });

  it("should use the latest shouldWarn value after a re-render", () => {
    const { rerender } = renderHook(({ warn }) => useBeforeUnload(warn), {
      initialProps: { warn: true },
    });

    // Handler identity stays stable — the hook reads through a ref
    const handler = getHandler();

    act(() => {
      rerender({ warn: false });
    });
    const quietEvent = createEvent();
    handler(quietEvent);
    expect(quietEvent.preventDefault).not.toHaveBeenCalled();

    act(() => {
      rerender({ warn: true });
    });
    const warnEvent = createEvent();
    handler(warnEvent);
    expect(warnEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("should keep the listener registered but stay silent when shouldWarn flips to false", () => {
    const { rerender } = renderHook(({ warn }) => useBeforeUnload(warn), {
      initialProps: { warn: true },
    });

    const handler = getHandler();

    act(() => {
      rerender({ warn: false });
    });

    // The single listener stays registered (no churn) but no longer prompts
    const event = createEvent();
    handler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(removeEventListenerSpy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("should remove the beforeunload listener on unmount", () => {
    const { unmount } = renderHook(() => useBeforeUnload(true));

    expect(removeEventListenerSpy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });
});
