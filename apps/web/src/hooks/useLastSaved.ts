/**
 * @fileoverview Hook for tracking and displaying "last saved" timestamps
 *
 * This module provides a React hook that manages save state tracking with
 * relative time display (e.g., "Saved 2m ago"). It supports change detection
 * for unsaved changes indicators and automatic display refresh.
 *
 * @module useLastSaved
 * @see {@link https://blueprintify.dev/docs/hooks | Hook Documentation}
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { TIMEOUTS, LAST_SAVED_MESSAGES } from "../config/constants";

/**
 * Formats a timestamp as a human-readable relative time string
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Human-readable string like "Saved 2m ago" or "Saved just now"
 *
 * @example
 * ```ts
 * formatRelativeTime(Date.now() - 5000)  // "Saved 5s ago"
 * formatRelativeTime(Date.now() - 120000) // "Saved 2m ago"
 * ```
 * @internal
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / LAST_SAVED_MESSAGES.SECONDS_PER_MINUTE);
  const hours = Math.floor(minutes / LAST_SAVED_MESSAGES.MINUTES_PER_HOUR);
  const days = Math.floor(hours / LAST_SAVED_MESSAGES.HOURS_PER_DAY);

  if (seconds < LAST_SAVED_MESSAGES.JUST_NOW_THRESHOLD_S) {
    return LAST_SAVED_MESSAGES.JUST_NOW;
  } else if (seconds < LAST_SAVED_MESSAGES.SECONDS_PER_MINUTE) {
    return LAST_SAVED_MESSAGES.SECONDS_AGO(seconds);
  } else if (minutes < LAST_SAVED_MESSAGES.MINUTES_PER_HOUR) {
    return LAST_SAVED_MESSAGES.MINUTES_AGO(minutes);
  } else if (hours < LAST_SAVED_MESSAGES.HOURS_PER_DAY) {
    return LAST_SAVED_MESSAGES.HOURS_AGO(hours);
  } else if (days < LAST_SAVED_MESSAGES.DAYS_LONG_AGO_THRESHOLD) {
    return LAST_SAVED_MESSAGES.DAYS_AGO(days);
  } else {
    return LAST_SAVED_MESSAGES.LONG_AGO;
  }
}

export interface UseLastSavedReturn {
  lastSavedText: string;
  markSaved: () => void;
  setLastSaved: (timestamp: number) => void;
  lastSavedTimestamp: number | null;
  hasChanges: boolean;
  markAsChanged: () => void;
}

/**
 * Hook for tracking and displaying "last saved" timestamps
 *
 * Manages save state tracking with relative time display and change detection.
 * Useful for auto-save UI indicators and unsaved changes warnings.
 *
 * Features:
 * - Relative time display ("Saved 2m ago")
 * - Automatic display refresh at configurable intervals
 * - Change tracking for unsaved changes indicators
 * - Manual timestamp control via `setLastSaved`
 *
 * @param initialTimestamp - Initial save timestamp (default: null)
 * @param updateInterval - How often to refresh the display text (default: TIMEOUTS.LAST_SAVED_REFRESH)
 * @returns Object with save state and control methods
 *
 * @example
 * ```tsx
 * const { lastSavedText, markSaved, hasChanges, markAsChanged } = useLastSaved();
 *
 * // After saving
 * markSaved(); // Sets timestamp to now, clears hasChanges
 *
 * // Display
 * <span>{lastSavedText}</span> // "Saved 2m ago"
 *
 * // Change tracking
 * if (hasChanges) showUnsavedWarning();
 * ```
 */
export function useLastSaved(
  initialTimestamp: number | null = null,
  updateInterval: number = TIMEOUTS.LAST_SAVED_REFRESH
): UseLastSavedReturn {
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(initialTimestamp);
  const [hasChanges, setHasChanges] = useState(false);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // tick is intentionally used to trigger re-computation of relative time
  // every updateInterval milliseconds. Without it, "Saved 2m ago" would never
  // update to "Saved 3m ago" etc.
  const lastSavedText = useMemo(() => {
    if (lastSavedTimestamp) {
      return formatRelativeTime(lastSavedTimestamp);
    }
    return "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSavedTimestamp, tick]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval]);

  const markSaved = useCallback(() => {
    setLastSavedTimestamp(Date.now());
    setHasChanges(false);
  }, []);

  const setLastSaved = useCallback((timestamp: number) => {
    setLastSavedTimestamp(timestamp);
    setHasChanges(false);
  }, []);

  const markAsChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  return {
    lastSavedText,
    markSaved,
    setLastSaved,
    lastSavedTimestamp,
    hasChanges,
    markAsChanged,
  };
}
