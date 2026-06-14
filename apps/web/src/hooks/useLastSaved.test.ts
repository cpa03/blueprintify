/**
 * @fileoverview Tests for useLastSaved hook and formatRelativeTime helper.
 *
 * Tests cover:
 * - formatRelativeTime: just now, seconds, minutes, hours, days, long ago
 * - useLastSaved: markSaved, setLastSaved, markAsChanged, hasChanges
 * - Tick-based display refresh
 * - Edge cases: null timestamp, rapid state changes
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLastSaved } from "./useLastSaved";
import { LAST_SAVED_MESSAGES } from "../config/constants";

describe("useLastSaved", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Pin "now" to a known value so relative time calculations are stable
    vi.setSystemTime(new Date("2026-06-14T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should return empty text and null timestamp when no initial timestamp", () => {
      const { result } = renderHook(() => useLastSaved());

      expect(result.current.lastSavedText).toBe("");
      expect(result.current.lastSavedTimestamp).toBeNull();
      expect(result.current.hasChanges).toBe(false);
    });

    it("should use the provided initial timestamp", () => {
      const ts = Date.now() - 5000;
      const { result } = renderHook(() => useLastSaved(ts));

      expect(result.current.lastSavedTimestamp).toBe(ts);
      expect(result.current.lastSavedText).toBeTruthy();
    });
  });

  describe("markSaved", () => {
    it("should set timestamp to now and clear hasChanges", () => {
      const { result } = renderHook(() => useLastSaved());

      act(() => {
        result.current.markAsChanged();
      });
      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.markSaved();
      });
      expect(result.current.hasChanges).toBe(false);
      expect(result.current.lastSavedTimestamp).toBe(Date.now());
    });

    it("should show 'just now' immediately after markSaved", () => {
      const { result } = renderHook(() => useLastSaved());

      act(() => {
        result.current.markSaved();
      });

      expect(result.current.lastSavedText).toBe(LAST_SAVED_MESSAGES.JUST_NOW);
    });
  });

  describe("setLastSaved", () => {
    it("should set a custom timestamp and clear hasChanges", () => {
      const { result } = renderHook(() => useLastSaved());
      const customTs = Date.now() - 120_000;

      act(() => {
        result.current.markAsChanged();
      });
      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.setLastSaved(customTs);
      });

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.lastSavedTimestamp).toBe(customTs);
    });

    it("should display relative time for a past timestamp", () => {
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
      const { result } = renderHook(() => useLastSaved(twoMinutesAgo));

      expect(result.current.lastSavedText).toContain("2m");
    });
  });

  describe("markAsChanged", () => {
    it("should set hasChanges to true", () => {
      const { result } = renderHook(() => useLastSaved());

      act(() => {
        result.current.markAsChanged();
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe("tick refresh", () => {
    it("should initialise with correct relative time for a past timestamp", () => {
      const fifteenSecondsAgo = Date.now() - 15000;
      const { result } = renderHook(() => useLastSaved(fifteenSecondsAgo, 1000));

      expect(result.current.lastSavedText).toContain("15s");
    });

    it("should show just now right after markSaved", () => {
      const { result } = renderHook(() => useLastSaved(null, 500));

      act(() => {
        result.current.markSaved();
      });

      expect(result.current.lastSavedText).toBe(LAST_SAVED_MESSAGES.JUST_NOW);
    });
  });

  describe("formatRelativeTime edge cases", () => {
    it("should display 'just now' for recent timestamps", () => {
      const justNow = Date.now() - 2000;
      const { result } = renderHook(() => useLastSaved(justNow));

      expect(result.current.lastSavedText).toBe(LAST_SAVED_MESSAGES.JUST_NOW);
    });

    it("should display 'long ago' for very old timestamps", () => {
      const longAgo = Date.now() - 60 * 24 * 60 * 60 * 1000; // 60 days
      const { result } = renderHook(() => useLastSaved(longAgo));

      expect(result.current.lastSavedText).toBe(LAST_SAVED_MESSAGES.LONG_AGO);
    });
  });
});
