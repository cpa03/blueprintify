import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { TIMEOUTS } from "../config/constants";

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) {
    return "Saved just now";
  } else if (seconds < 60) {
    return `Saved ${seconds}s ago`;
  } else if (minutes < 60) {
    return `Saved ${minutes}m ago`;
  } else if (hours < 24) {
    return `Saved ${hours}h ago`;
  } else if (days < 30) {
    return `Saved ${days}d ago`;
  } else {
    return "Saved a while ago";
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

export function useLastSaved(
  initialTimestamp: number | null = null,
  updateInterval: number = TIMEOUTS.LAST_SAVED_REFRESH,
): UseLastSavedReturn {
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(
    initialTimestamp,
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [, forceUpdate] = useState({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const lastSavedText = useMemo(() => {
    if (lastSavedTimestamp) {
      return formatRelativeTime(lastSavedTimestamp);
    }
    return "";
  }, [lastSavedTimestamp]);

  const refreshDisplay = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      refreshDisplay();
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval, refreshDisplay]);

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
