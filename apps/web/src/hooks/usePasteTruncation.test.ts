/**
 * @fileoverview Tests for usePasteTruncation hook.
 *
 * Tests cover:
 * - Overflow detection: paste that exceeds maxLength sets announcement
 * - No-op: paste that fits within maxLength leaves announcement empty
 * - Selection-aware: paste replacing selected text computes the right length
 * - Announcement lifecycle: auto-clears after TIMEOUTS.LIVE_REGION_CLEAR
 * - Empty clipboard: no announcement for empty pastes
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePasteTruncation } from "./usePasteTruncation";
import { ACCESSIBILITY_LABELS, TIMEOUTS } from "../config/constants";

function createPasteEvent(pastedText: string, selectionStart = 0, selectionEnd = 0) {
  return {
    clipboardData: { getData: () => pastedText },
    currentTarget: { selectionStart, selectionEnd },
  } as unknown as React.ClipboardEvent<HTMLInputElement>;
}

describe("usePasteTruncation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("announces truncation when paste exceeds maxLength", () => {
    const { result } = renderHook(() => usePasteTruncation("", 10));

    act(() => {
      result.current.handlePaste(createPasteEvent("0123456789ABCDEF"));
    });

    expect(result.current.announcement).toBe(ACCESSIBILITY_LABELS.WIZARD_INFO.PASTE_TRUNCATED(10));
  });

  it("does not announce when paste fits within maxLength", () => {
    const { result } = renderHook(() => usePasteTruncation("", 10));

    act(() => {
      result.current.handlePaste(createPasteEvent("0123456789"));
    });

    expect(result.current.announcement).toBe("");
  });

  it("accounts for existing content when computing overflow", () => {
    const { result } = renderHook(() => usePasteTruncation("0123456789", 10));

    act(() => {
      result.current.handlePaste(createPasteEvent("AB", 10, 10));
    });

    expect(result.current.announcement).toBe(ACCESSIBILITY_LABELS.WIZARD_INFO.PASTE_TRUNCATED(10));
  });

  it("does not announce when pasting over a selection keeps length within limit", () => {
    const { result } = renderHook(() => usePasteTruncation("0123456789", 10));

    // Paste "AB" replacing the last 9 chars — result stays within limit
    act(() => {
      result.current.handlePaste(createPasteEvent("AB", 1, 10));
    });

    expect(result.current.announcement).toBe("");
  });

  it("does not announce for empty paste", () => {
    const { result } = renderHook(() => usePasteTruncation("0123456789", 10));

    act(() => {
      result.current.handlePaste(createPasteEvent(""));
    });

    expect(result.current.announcement).toBe("");
  });

  it("clears the announcement after LIVE_REGION_CLEAR", () => {
    const { result } = renderHook(() => usePasteTruncation("", 10));

    act(() => {
      result.current.handlePaste(createPasteEvent("0123456789ABCDEF"));
    });
    expect(result.current.announcement).not.toBe("");

    act(() => {
      vi.advanceTimersByTime(TIMEOUTS.LIVE_REGION_CLEAR + 1);
    });
    expect(result.current.announcement).toBe("");
  });

  it("re-announces on a second truncating paste and restarts the clear timer", () => {
    const { result } = renderHook(() => usePasteTruncation("", 10));

    act(() => {
      result.current.handlePaste(createPasteEvent("0123456789ABCDEF"));
    });

    act(() => {
      vi.advanceTimersByTime(TIMEOUTS.LIVE_REGION_CLEAR / 2);
      result.current.handlePaste(createPasteEvent("0123456789XYZ"));
    });

    expect(result.current.announcement).toBe(ACCESSIBILITY_LABELS.WIZARD_INFO.PASTE_TRUNCATED(10));

    // The first timer was cleared; advancing past the second timer clears it
    act(() => {
      vi.advanceTimersByTime(TIMEOUTS.LIVE_REGION_CLEAR + 1);
    });
    expect(result.current.announcement).toBe("");
  });
});
