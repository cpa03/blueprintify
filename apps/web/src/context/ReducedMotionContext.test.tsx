/**
 * @fileoverview Tests for ReducedMotionContext provider and useReducedMotionContext hook.
 *
 * Verifies:
 * - Default provider values when no override and no system reduced-motion preference
 * - getDuration returns 0 when reduced motion is active, normal duration otherwise
 * - setUserOverride updates context state and persists to localStorage
 * - resetToSystemPreference clears the override and localStorage
 * - Initial override is hydrated from localStorage
 * - System media-query changes propagate to the context value
 * - useReducedMotionContext throws when used outside the provider
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ReducedMotionProvider, useReducedMotionContext } from "./ReducedMotionContext";
import { STORAGE_KEYS } from "../config/keys";

/**
 * Creates a controllable matchMedia mock that notifies listeners on change.
 */
function createMatchMediaMock(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<EventListener>();

  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn((_event: string, callback: EventListener) => {
      listeners.add(callback);
    }),
    removeEventListener: vi.fn((_event: string, callback: EventListener) => {
      listeners.delete(callback);
    }),
    addListener: vi.fn((callback: EventListener) => {
      listeners.add(callback);
    }),
    removeListener: vi.fn((callback: EventListener) => {
      listeners.delete(callback);
    }),
    dispatchEvent: vi.fn(),
    /** Test helper: update matches and notify listeners */
    _setMatches(newMatches: boolean) {
      matches = newMatches;
      listeners.forEach((cb) => cb({ matches: newMatches } as unknown as Event));
    },
  };

  return mediaQueryList;
}

function renderWithProvider(options?: { defaultReducedMotion?: boolean }) {
  return renderHook(() => useReducedMotionContext(), {
    wrapper: ({ children }) => (
      <ReducedMotionProvider defaultReducedMotion={options?.defaultReducedMotion}>
        {children}
      </ReducedMotionProvider>
    ),
  });
}

describe("ReducedMotionContext", () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    localStorage.clear();
    matchMediaMock = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(
      (_query: string) => matchMediaMock as unknown as MediaQueryList
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("should provide default values when no override or system preference is set", () => {
    const { result } = renderWithProvider();

    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.userOverride).toBeNull();
    expect(result.current.shouldAnimate).toBe(true);
  });

  it("should return the normal duration when reduced motion is not preferred", () => {
    const { result } = renderWithProvider();

    expect(result.current.getDuration(300)).toBe(300);
    expect(result.current.getDuration(0)).toBe(0);
  });

  it("should return 0 duration when reduced motion is preferred", () => {
    matchMediaMock._setMatches(true);
    const { result } = renderWithProvider();

    expect(result.current.getDuration(300)).toBe(0);
    expect(result.current.getDuration(1000)).toBe(0);
    expect(result.current.shouldAnimate).toBe(false);
  });

  it("should persist a user override to localStorage", () => {
    const { result } = renderWithProvider();

    act(() => {
      result.current.setUserOverride(true);
    });

    expect(result.current.userOverride).toBe(true);
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION)).toBe("true");
  });

  it("should respect a false user override even when the system prefers reduced motion", () => {
    matchMediaMock._setMatches(true);
    const { result } = renderWithProvider();

    act(() => {
      result.current.setUserOverride(false);
    });

    expect(result.current.userOverride).toBe(false);
    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.shouldAnimate).toBe(true);
  });

  it("should clear the stored override when setUserOverride is called with null", () => {
    const { result } = renderWithProvider();

    act(() => {
      result.current.setUserOverride(true);
    });
    act(() => {
      result.current.setUserOverride(null);
    });

    expect(result.current.userOverride).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION)).toBeNull();
  });

  it("should hydrate the initial override from localStorage", () => {
    localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, "true");
    const { result } = renderWithProvider();

    expect(result.current.userOverride).toBe(true);
    expect(result.current.prefersReducedMotion).toBe(true);
  });

  it("should treat any non-true stored value as a false override", () => {
    localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, "not-a-boolean");
    const { result } = renderWithProvider();

    expect(result.current.userOverride).toBe(false);
    expect(result.current.prefersReducedMotion).toBe(false);
  });

  it("should reset to the system preference and clear localStorage", () => {
    const { result } = renderWithProvider();

    act(() => {
      result.current.setUserOverride(true);
    });
    act(() => {
      result.current.resetToSystemPreference();
    });

    expect(result.current.userOverride).toBeNull();
    expect(result.current.prefersReducedMotion).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION)).toBeNull();
  });

  it("should react to system media-query changes", () => {
    const { result } = renderWithProvider();
    expect(result.current.shouldAnimate).toBe(true);

    act(() => {
      matchMediaMock._setMatches(true);
    });
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.shouldAnimate).toBe(false);

    act(() => {
      matchMediaMock._setMatches(false);
    });
    expect(result.current.prefersReducedMotion).toBe(false);
  });

  it("should throw when useReducedMotionContext is used outside the provider", () => {
    expect(() => renderHook(() => useReducedMotionContext())).toThrow(
      "useReducedMotionContext must be used within a ReducedMotionProvider"
    );
  });
});
