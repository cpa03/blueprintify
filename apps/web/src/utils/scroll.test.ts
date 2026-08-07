/**
 * @fileoverview Tests for the accessible scroll utilities in utils/scroll.ts.
 *
 * Tests cover:
 * - getScrollBehavior: returns "smooth" for default motion preferences,
 *   returns "instant" when prefers-reduced-motion is active,
 *   returns "auto" when window is unavailable (SSR-safe)
 */

import { describe, expect, it, vi, afterEach } from "vitest";
import { getScrollBehavior } from "./scroll";
import { SCROLL_BEHAVIOR } from "../config/constants";

describe("getScrollBehavior", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    globalThis.window = originalWindow;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns smooth behavior by default (no reduced motion)", () => {
    expect(getScrollBehavior()).toBe(SCROLL_BEHAVIOR.SMOOTH);
  });

  it("returns instant behavior when prefers-reduced-motion is active", () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });

    expect(getScrollBehavior()).toBe(SCROLL_BEHAVIOR.INSTANT);
  });

  it("returns auto behavior when window is undefined (SSR-safe)", () => {
    vi.stubGlobal("window", undefined);
    expect(getScrollBehavior()).toBe(SCROLL_BEHAVIOR.AUTO);
  });
});
