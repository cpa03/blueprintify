/**
 * @fileoverview Hooks Unit Tests
 *
 * This file contains unit tests for custom React hooks in the application.
 * Tests cover:
 * - useLastSaved: Save state tracking and relative time formatting
 * - useDocumentTitle: Document title management
 * - useReducedMotion: Accessibility preference detection
 *
 * @module hooks/hooks.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLastSaved } from "./useLastSaved";
import { useDocumentTitle } from "./useDocumentTitle";
import {
  useReducedMotion,
  getAnimationDuration,
  getSpringConfig,
} from "./useReducedMotion";
import {
  DOCUMENT_TITLE_CONFIG,
  TIMEOUTS,
  SPRING_CONFIG,
} from "../config/constants";

describe("useLastSaved", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return empty string when no initial timestamp provided", () => {
      const { result } = renderHook(() => useLastSaved());
      expect(result.current.lastSavedText).toBe("");
    });

    it("should return empty string when null initial timestamp provided", () => {
      const { result } = renderHook(() => useLastSaved(null));
      expect(result.current.lastSavedText).toBe("");
    });

    it("should initialize with hasChanges as false", () => {
      const { result } = renderHook(() => useLastSaved());
      expect(result.current.hasChanges).toBe(false);
    });

    it("should initialize with null timestamp when not provided", () => {
      const { result } = renderHook(() => useLastSaved());
      expect(result.current.lastSavedTimestamp).toBeNull();
    });
  });

  describe("formatRelativeTime", () => {
    it("should return 'Saved just now' for timestamps less than 10 seconds ago", () => {
      const { result } = renderHook(() => useLastSaved(Date.now() - 5000));
      expect(result.current.lastSavedText).toBe("Saved just now");
    });

    it("should return seconds for timestamps between 10-60 seconds ago", () => {
      const { result } = renderHook(() => useLastSaved(Date.now() - 30000));
      expect(result.current.lastSavedText).toBe("Saved 30s ago");
    });

    it("should return minutes for timestamps between 1-60 minutes ago", () => {
      const { result } = renderHook(() => useLastSaved(Date.now() - 120000));
      expect(result.current.lastSavedText).toBe("Saved 2m ago");
    });

    it("should return hours for timestamps between 1-24 hours ago", () => {
      const { result } = renderHook(() => useLastSaved(Date.now() - 7200000));
      expect(result.current.lastSavedText).toBe("Saved 2h ago");
    });

    it("should return days for timestamps between 1-30 days ago", () => {
      const { result } = renderHook(() => useLastSaved(Date.now() - 86400000));
      expect(result.current.lastSavedText).toBe("Saved 1d ago");
    });

    it("should return 'Saved a while ago' for timestamps older than 30 days", () => {
      const { result } = renderHook(() =>
        useLastSaved(Date.now() - 31536000000),
      );
      expect(result.current.lastSavedText).toBe("Saved a while ago");
    });
  });

  describe("markSaved", () => {
    it("should update timestamp to current time when markSaved is called", () => {
      const beforeTime = Date.now();
      const { result } = renderHook(() => useLastSaved());

      act(() => {
        result.current.markSaved();
      });

      const afterTime = Date.now();
      expect(result.current.lastSavedTimestamp).toBeGreaterThanOrEqual(
        beforeTime,
      );
      expect(result.current.lastSavedTimestamp).toBeLessThanOrEqual(afterTime);
    });

    it("should set hasChanges to false when markSaved is called", () => {
      const { result } = renderHook(() => useLastSaved());

      act(() => {
        result.current.markAsChanged();
      });

      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.markSaved();
      });

      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe("setLastSaved", () => {
    it("should set the provided timestamp", () => {
      const { result } = renderHook(() => useLastSaved());
      const testTimestamp = 1700000000000;

      act(() => {
        result.current.setLastSaved(testTimestamp);
      });

      expect(result.current.lastSavedTimestamp).toBe(testTimestamp);
    });

    it("should set hasChanges to false when setLastSaved is called", () => {
      const { result } = renderHook(() => useLastSaved());

      act(() => {
        result.current.markAsChanged();
      });

      act(() => {
        result.current.setLastSaved(Date.now());
      });

      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe("markAsChanged", () => {
    it("should set hasChanges to true when markAsChanged is called", () => {
      const { result } = renderHook(() => useLastSaved());
      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.markAsChanged();
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe("update interval", () => {
    it("should accept custom update interval", () => {
      const customInterval = 5000;
      const { result } = renderHook(() => useLastSaved(null, customInterval));
      expect(result.current.lastSavedText).toBe("");
    });
  });
});

describe("useDocumentTitle", () => {
  beforeEach(() => {
    document.title = "Original Title";
  });

  afterEach(() => {
    document.title = "Original Title";
  });

  it("should set document title with separator and app name", () => {
    const { unmount } = renderHook(() => useDocumentTitle("Test Title"));

    expect(document.title).toBe(
      `Test Title${DOCUMENT_TITLE_CONFIG.SEPARATOR}${DOCUMENT_TITLE_CONFIG.APP_NAME}`,
    );

    unmount();
  });

  it("should use default title when empty string is provided", () => {
    const { unmount } = renderHook(() => useDocumentTitle(""));

    expect(document.title).toBe(DOCUMENT_TITLE_CONFIG.DEFAULT_TITLE);

    unmount();
  });

  it("should restore original title on unmount", () => {
    const originalTitle = document.title;
    const { unmount } = renderHook(() => useDocumentTitle("New Title"));

    expect(document.title).not.toBe(originalTitle);

    unmount();

    expect(document.title).toBe(originalTitle);
  });

  it("should update title when title prop changes", () => {
    const { rerender, unmount } = renderHook(
      ({ title }: { title: string }) => useDocumentTitle(title),
      { initialProps: { title: "First Title" } },
    );

    expect(document.title).toBe(
      `First Title${DOCUMENT_TITLE_CONFIG.SEPARATOR}${DOCUMENT_TITLE_CONFIG.APP_NAME}`,
    );

    rerender({ title: "Second Title" });

    expect(document.title).toBe(
      `Second Title${DOCUMENT_TITLE_CONFIG.SEPARATOR}${DOCUMENT_TITLE_CONFIG.APP_NAME}`,
    );

    unmount();
  });
});

describe("useReducedMotion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return false by default (from mock in setup)", () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("should return true when prefers-reduced-motion is set", () => {
    // Override the mock for this specific test
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });
});

describe("getAnimationDuration", () => {
  it("should return 0 when shouldReduceMotion is true", () => {
    const result = getAnimationDuration(true, 300);
    expect(result).toBe(0);
  });

  it("should return original duration when shouldReduceMotion is false", () => {
    const result = getAnimationDuration(false, 300);
    expect(result).toBe(300);
  });
});

describe("getSpringConfig", () => {
  it("should return REDUCED_MOTION config when shouldReduceMotion is true", () => {
    const result = getSpringConfig(true);
    expect(result).toEqual(SPRING_CONFIG.REDUCED_MOTION);
  });

  it("should return default config when shouldReduceMotion is false and no overrides", () => {
    const result = getSpringConfig(false);
    expect(result).toEqual(SPRING_CONFIG.DEFAULT);
  });

  it("should merge custom values with defaults", () => {
    const result = getSpringConfig(false, { stiffness: 500 });
    expect(result.stiffness).toBe(500);
    expect(result.damping).toBe(SPRING_CONFIG.DEFAULT.damping);
    expect(result.mass).toBe(SPRING_CONFIG.DEFAULT.mass);
  });

  it("should use custom values when provided", () => {
    const result = getSpringConfig(false, {
      stiffness: 600,
      damping: 30,
      mass: 1,
    });
    expect(result.stiffness).toBe(600);
    expect(result.damping).toBe(30);
    expect(result.mass).toBe(1);
  });
});
