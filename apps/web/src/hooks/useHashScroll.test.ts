/**
 * @fileoverview Tests for the useHashScroll hook.
 *
 * Verifies:
 * - Scrolls to the URL fragment target once it exists in the DOM
 * - No-op when there is no fragment or when disabled
 * - Retries for async-rendered targets, then gives up after the attempt budget
 * - Re-resolves on hashchange without re-scrolling an already-handled hash
 *   (no viewport yank when refreshKey changes, e.g. tab switches)
 * - Honors prefers-reduced-motion (instant instead of smooth)
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHashScroll } from "./useHashScroll";
import { HASH_SCROLL_CONFIG, SCROLL_BEHAVIOR } from "../config/constants";

function setHash(hash: string): void {
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
}

function addHashTarget(id: string): { scrollIntoView: ReturnType<typeof vi.fn> } {
  const el = document.createElement("div");
  el.id = id;
  el.scrollIntoView = vi.fn();
  document.body.appendChild(el);
  return { scrollIntoView: el.scrollIntoView as ReturnType<typeof vi.fn> };
}

describe("useHashScroll", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    setHash("");
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("scrolls to the hash target on mount", () => {
    setHash("#deployment-architecture");
    const target = addHashTarget("deployment-architecture");

    renderHook(() => useHashScroll(true));

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: SCROLL_BEHAVIOR.SMOOTH,
      block: "start",
    });
  });

  it("does nothing when there is no hash", () => {
    setHash("");
    const target = addHashTarget("deployment-architecture");

    renderHook(() => useHashScroll(true));

    expect(target.scrollIntoView).not.toHaveBeenCalled();
  });

  it("does nothing when disabled even if a target exists", () => {
    setHash("#deployment-architecture");
    const target = addHashTarget("deployment-architecture");

    renderHook(() => useHashScroll(false));

    act(() => {
      vi.advanceTimersByTime(HASH_SCROLL_CONFIG.RETRY_INTERVAL_MS * 5);
    });

    expect(target.scrollIntoView).not.toHaveBeenCalled();
  });

  it("retries for a target that renders late", () => {
    setHash("#late-section");

    renderHook(() => useHashScroll(true));

    act(() => {
      vi.advanceTimersByTime(HASH_SCROLL_CONFIG.RETRY_INTERVAL_MS * 2);
    });

    const target = addHashTarget("late-section");
    act(() => {
      vi.advanceTimersByTime(HASH_SCROLL_CONFIG.RETRY_INTERVAL_MS);
    });

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("stops retrying after the attempt budget when no target exists", () => {
    setHash("#never-appears");

    renderHook(() => useHashScroll(true));

    act(() => {
      vi.advanceTimersByTime(
        HASH_SCROLL_CONFIG.RETRY_INTERVAL_MS * (HASH_SCROLL_CONFIG.RETRY_ATTEMPTS + 5)
      );
    });

    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up pending retries on unmount", () => {
    setHash("#never-appears");

    const { unmount } = renderHook(() => useHashScroll(true));
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("re-resolves on hashchange", () => {
    setHash("#first");
    const first = addHashTarget("first");

    renderHook(() => useHashScroll(true));
    expect(first.scrollIntoView).toHaveBeenCalledTimes(1);

    setHash("#second");
    const second = addHashTarget("second");

    act(() => {
      window.dispatchEvent(new Event("hashchange"));
    });

    expect(second.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(first.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("does not re-scroll an already-handled hash when refreshKey changes", () => {
    setHash("#stable-section");
    const target = addHashTarget("stable-section");

    const { rerender } = renderHook((key: string) => useHashScroll(true, key), {
      initialProps: "blueprint:split",
    });
    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);

    rerender("tasks:split");
    rerender("tasks:preview");

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("re-attempts across refreshKey changes when the target was not found initially", () => {
    setHash("#other-tab-section");

    const { rerender } = renderHook((key: string) => useHashScroll(true, key), {
      initialProps: "blueprint:split",
    });

    act(() => {
      vi.advanceTimersByTime(
        HASH_SCROLL_CONFIG.RETRY_INTERVAL_MS * (HASH_SCROLL_CONFIG.RETRY_ATTEMPTS + 1)
      );
    });

    const target = addHashTarget("other-tab-section");
    rerender("tasks:split");

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("scrolls instantly under prefers-reduced-motion", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-reduced-motion"),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList
    );

    setHash("#reduced-motion-section");
    const target = addHashTarget("reduced-motion-section");

    renderHook(() => useHashScroll(true));

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: SCROLL_BEHAVIOR.INSTANT,
      block: "start",
    });
  });

  it("tolerates malformed percent-encoding in the hash", () => {
    setHash("#bad%ZZslug");
    const target = addHashTarget("bad%ZZslug");

    renderHook(() => useHashScroll(true));

    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
  });
});
