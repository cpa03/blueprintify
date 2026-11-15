/**
 * @fileoverview Tests for usePageVisibilityAttribute.
 *
 * Verifies the hook mirrors document.visibilityState onto
 * documentElement[data-page-hidden] so index.css can pause decorative
 * loops while the tab is hidden (issue #3622 fix #2).
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { DOM_ATTRIBUTES, DOM_EVENTS, DATA_BOOLEAN_VALUES } from "@blueprint/shared";
import { usePageVisibilityAttribute } from "./usePageVisibilityAttribute";

function setVisibilityState(state: DocumentVisibilityState): void {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
}

describe("usePageVisibilityAttribute", () => {
  beforeEach(() => {
    setVisibilityState("visible");
    document.documentElement.removeAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN);
  });

  afterEach(() => {
    setVisibilityState("visible");
    document.documentElement.removeAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN);
  });

  it("sets data-page-hidden=false on mount when the page is visible", () => {
    renderHook(() => usePageVisibilityAttribute());
    expect(document.documentElement.getAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN)).toBe(
      DATA_BOOLEAN_VALUES.FALSE
    );
  });

  it("sets data-page-hidden=true on mount when the page starts hidden", () => {
    setVisibilityState("hidden");
    renderHook(() => usePageVisibilityAttribute());
    expect(document.documentElement.getAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN)).toBe(
      DATA_BOOLEAN_VALUES.TRUE
    );
  });

  it("flips the attribute to true when visibilitychange reports hidden", () => {
    renderHook(() => usePageVisibilityAttribute());
    expect(document.documentElement.getAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN)).toBe(
      DATA_BOOLEAN_VALUES.FALSE
    );

    act(() => {
      setVisibilityState("hidden");
      document.dispatchEvent(new Event(DOM_EVENTS.VISIBILITY_CHANGE));
    });

    expect(document.documentElement.getAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN)).toBe(
      DATA_BOOLEAN_VALUES.TRUE
    );
  });

  it("flips the attribute back to false when the page becomes visible again", () => {
    renderHook(() => usePageVisibilityAttribute());

    act(() => {
      setVisibilityState("hidden");
      document.dispatchEvent(new Event(DOM_EVENTS.VISIBILITY_CHANGE));
    });
    expect(document.documentElement.getAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN)).toBe(
      DATA_BOOLEAN_VALUES.TRUE
    );

    act(() => {
      setVisibilityState("visible");
      document.dispatchEvent(new Event(DOM_EVENTS.VISIBILITY_CHANGE));
    });
    expect(document.documentElement.getAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN)).toBe(
      DATA_BOOLEAN_VALUES.FALSE
    );
  });

  it("removes the attribute and the event listener on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => usePageVisibilityAttribute());

    expect(document.documentElement.hasAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN)).toBe(true);

    unmount();

    expect(document.documentElement.hasAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN)).toBe(false);
    expect(removeSpy).toHaveBeenCalledWith(DOM_EVENTS.VISIBILITY_CHANGE, expect.any(Function));
    removeSpy.mockRestore();
  });

  it("stops reacting to visibilitychange after unmount", () => {
    const { unmount } = renderHook(() => usePageVisibilityAttribute());
    unmount();

    act(() => {
      setVisibilityState("hidden");
      document.dispatchEvent(new Event(DOM_EVENTS.VISIBILITY_CHANGE));
    });

    expect(document.documentElement.hasAttribute(DOM_ATTRIBUTES.PAGE_HIDDEN)).toBe(false);
  });
});
