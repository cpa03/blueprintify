/**
 * @fileoverview Tests for useReducedMotion hook and related utilities.
 *
 * Verifies:
 * - useReducedMotion detects prefers-reduced-motion media query
 * - Updates reactively when preference changes
 * - Cleans up media query listeners on unmount
 * - getAnimationDuration respects reduced motion preference
 * - getSpringConfig returns reduced motion spring when needed
 * - useAccessibleAnimation returns appropriate animation props
 * - useAccessibilityPreferences detects multiple accessibility settings
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useReducedMotion,
  getAnimationDuration,
  getSpringConfig,
  useAccessibleAnimation,
  useAccessibilityPreferences,
} from "./useReducedMotion";
import { SPRING_CONFIG } from "../config/constants";

/**
 * Creates a mock matchMedia implementation that allows changing matches.
 * Returns a MediaQueryList-like object with change event support.
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

describe("useReducedMotion", () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    matchMediaMock = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(
      (_query: string) => matchMediaMock as unknown as MediaQueryList
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return false when prefers-reduced-motion is not set", () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("should return true when prefers-reduced-motion: reduce is set", () => {
    matchMediaMock._setMatches(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("should update when media query change event fires", () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      matchMediaMock._setMatches(true);
    });

    expect(result.current).toBe(true);

    act(() => {
      matchMediaMock._setMatches(false);
    });

    expect(result.current).toBe(false);
  });

  it("should subscribe to media query change events on mount", () => {
    const addEventListenerSpy = vi.spyOn(matchMediaMock, "addEventListener");

    renderHook(() => useReducedMotion());

    expect(addEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("should clean up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(matchMediaMock, "removeEventListener");

    const { unmount } = renderHook(() => useReducedMotion());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function));
  });
});

describe("getAnimationDuration", () => {
  it("should return 0 when reduced motion is preferred", () => {
    expect(getAnimationDuration(true, 300)).toBe(0);
    expect(getAnimationDuration(true, 1000)).toBe(0);
    expect(getAnimationDuration(true, 0)).toBe(0);
  });

  it("should return original duration when reduced motion is not preferred", () => {
    expect(getAnimationDuration(false, 300)).toBe(300);
    expect(getAnimationDuration(false, 1000)).toBe(1000);
    expect(getAnimationDuration(false, 0)).toBe(0);
  });
});

describe("getSpringConfig", () => {
  it("should return REDUCED_MOTION config when reduced motion is preferred", () => {
    const config = getSpringConfig(true);
    expect(config).toEqual(SPRING_CONFIG.REDUCED_MOTION);
  });

  it("should return reduced motion config regardless of provided config", () => {
    const config = getSpringConfig(true, {
      stiffness: 300,
      damping: 50,
      mass: 0.5,
    });
    expect(config).toEqual(SPRING_CONFIG.REDUCED_MOTION);
  });

  it("should return default spring config when no config provided", () => {
    const config = getSpringConfig(false);
    expect(config).toEqual(SPRING_CONFIG.DEFAULT);
  });

  it("should merge provided config with defaults", () => {
    const config = getSpringConfig(false, { stiffness: 200 });
    expect(config.stiffness).toBe(200);
    expect(config.damping).toBe(SPRING_CONFIG.DEFAULT.damping);
    expect(config.mass).toBe(SPRING_CONFIG.DEFAULT.mass);
  });

  it("should return empty object defaults when no config provided", () => {
    const config = getSpringConfig(false, {});
    expect(config).toEqual(SPRING_CONFIG.DEFAULT);
  });
});

describe("useAccessibleAnimation", () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    matchMediaMock = createMatchMediaMock(false);
    vi.spyOn(window, "matchMedia").mockImplementation(
      (_query: string) => matchMediaMock as unknown as MediaQueryList
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return animation props when reduced motion is not preferred", () => {
    const normalProps = { opacity: 1, x: 100 };

    const { result } = renderHook(() => useAccessibleAnimation(normalProps));

    expect(result.current).toEqual(normalProps);
  });

  it("should return reduced motion props when reduced motion is preferred", () => {
    matchMediaMock._setMatches(true);

    const normalProps = { opacity: 1, x: 100 };
    const reducedProps = { opacity: 1, x: 0 };

    const { result } = renderHook(() => useAccessibleAnimation(normalProps, reducedProps));

    expect(result.current).toEqual(reducedProps);
  });

  it("should return empty object when no reduced motion props provided", () => {
    matchMediaMock._setMatches(true);

    const { result } = renderHook(() => useAccessibleAnimation({ opacity: 1 }));

    expect(result.current).toEqual({});
  });

  it("should transition when preference changes", () => {
    const normalProps = { opacity: 1, x: 100 };
    const reducedProps = { opacity: 1, x: 0 };

    const { result } = renderHook(() => useAccessibleAnimation(normalProps, reducedProps));

    expect(result.current).toEqual(normalProps);

    act(() => {
      matchMediaMock._setMatches(true);
    });

    expect(result.current).toEqual(reducedProps);

    act(() => {
      matchMediaMock._setMatches(false);
    });

    expect(result.current).toEqual(normalProps);
  });
});

describe("useAccessibilityPreferences", () => {
  let reducedMotionMock: ReturnType<typeof createMatchMediaMock>;
  let highContrastMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    reducedMotionMock = createMatchMediaMock(false);
    highContrastMock = createMatchMediaMock(false);

    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
      if (query.includes("prefers-reduced-motion")) {
        return reducedMotionMock as unknown as MediaQueryList;
      }
      if (query.includes("prefers-contrast")) {
        return highContrastMock as unknown as MediaQueryList;
      }
      return { matches: false } as MediaQueryList;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return both preferences as false by default", () => {
    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current).toEqual({
      prefersReducedMotion: false,
      prefersHighContrast: false,
    });
  });

  it("should detect prefers-reduced-motion: reduce", () => {
    reducedMotionMock._setMatches(true);

    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.prefersHighContrast).toBe(false);
  });

  it("should detect prefers-contrast: more", () => {
    highContrastMock._setMatches(true);

    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.prefersHighContrast).toBe(true);
  });

  it("should detect both preferences simultaneously", () => {
    reducedMotionMock._setMatches(true);
    highContrastMock._setMatches(true);

    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current).toEqual({
      prefersReducedMotion: true,
      prefersHighContrast: true,
    });
  });

  it("should update reactively when preferences change", () => {
    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.prefersReducedMotion).toBe(false);

    act(() => {
      reducedMotionMock._setMatches(true);
    });

    expect(result.current.prefersReducedMotion).toBe(true);

    act(() => {
      reducedMotionMock._setMatches(false);
    });

    expect(result.current.prefersReducedMotion).toBe(false);
  });
});
