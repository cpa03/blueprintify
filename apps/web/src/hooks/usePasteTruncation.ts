/**
 * @fileoverview Hook detecting paste events that would exceed a field's maxLength.
 *
 * Browsers silently truncate pasted content that overflows an input's
 * maxLength attribute — the excess characters vanish with no feedback,
 * which is a classic silent-data-loss UX pitfall. This hook inspects the
 * paste against the current value + selection and, when the paste would be
 * truncated, returns an announcement string for a status live region so
 * both sighted and screen-reader users know their content was cut.
 *
 * The announcement follows the established live-region lifecycle used
 * across the app (HeadingAnchor, LastSavedIndicator, OfflineBanner):
 * it auto-clears after TIMEOUTS.LIVE_REGION_CLEAR so stale text never
 * re-announces.
 *
 * @module hooks/usePasteTruncation
 *
 * @example
 * ```tsx
 * const { announcement, handlePaste } = usePasteTruncation(description, FORM_LIMITS.DESCRIPTION.MAX);
 *
 * <textarea onPaste={handlePaste} maxLength={FORM_LIMITS.DESCRIPTION.MAX} ... />
 * <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
 *   {announcement}
 * </span>
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClipboardEvent as ReactClipboardEvent } from "react";
import { ACCESSIBILITY_LABELS, TIMEOUTS } from "../config/constants";

type PasteTarget = HTMLInputElement | HTMLTextAreaElement;

export interface PasteTruncationResult {
  /** Announcement text for a persistent role="status" live region; empty when idle. */
  announcement: string;
  /** Attach to an input/textarea onPaste. Never prevents default (maxLength still applies). */
  handlePaste: (e: ReactClipboardEvent<PasteTarget>) => void;
}

/**
 * Detects and announces paste truncation for a maxLength-limited field.
 *
 * @param currentValue - Current value of the field (controlled value)
 * @param maxLength - The field's maxLength limit
 * @returns Announcement string and an onPaste handler
 */
export function usePasteTruncation(currentValue: string, maxLength: number): PasteTruncationResult {
  const [announcement, setAnnouncement] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending announcement timer on unmount to avoid state updates
  // after unmount (matches HeadingAnchor / OfflineBanner cleanup pattern).
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handlePaste = useCallback(
    (e: ReactClipboardEvent<PasteTarget>) => {
      const pastedText = e.clipboardData?.getData("text") ?? "";
      if (pastedText.length === 0) return;

      const target = e.currentTarget;
      const selectionStart = target.selectionStart ?? currentValue.length;
      const selectionEnd = target.selectionEnd ?? currentValue.length;

      // Simulate the post-paste value before the browser applies maxLength.
      const nextValue =
        currentValue.slice(0, selectionStart) + pastedText + currentValue.slice(selectionEnd);

      if (nextValue.length > maxLength) {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }
        setAnnouncement(ACCESSIBILITY_LABELS.WIZARD_INFO.PASTE_TRUNCATED(maxLength));
        timeoutRef.current = setTimeout(() => {
          setAnnouncement("");
          timeoutRef.current = null;
        }, TIMEOUTS.LIVE_REGION_CLEAR);
      }
    },
    [currentValue, maxLength]
  );

  return { announcement, handlePaste };
}

export default usePasteTruncation;
