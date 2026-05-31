/**
 * @fileoverview Hook for tracking browser online/offline status.
 *
 * This hook monitors navigator.onLine and listens for online/offline
 * events on window to provide real-time connectivity status. It's useful
 * for showing connectivity indicators, disabling network-dependent features,
 * or triggering appropriate user feedback when connectivity changes.
 *
 * Features:
 * - Tracks current online/offline state via navigator.onLine
 * - Listens for window online/offline events
 * - Properly cleans up event listeners on unmount
 * - Returns whether the status has just changed (for toast triggers)
 *
 * @module hooks/useOnlineStatus
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
 *
 * @example
 * ```tsx
 * const { isOnline, wasOffline, wasOnline } = useOnlineStatus();
 * ```
 */

import { useState, useEffect, useCallback } from "react";

export interface OnlineStatus {
  /** Whether the browser currently reports being online */
  isOnline: boolean;
}

/**
 * Hook that tracks the browser's online/offline connection status.
 *
 * Uses navigator.onLine for initial state and window online/offline events
 * for real-time updates. Returns the current status and change detection flags.
 *
 * @returns Current online status
 *
 * @example
 * ```tsx
 * function ConnectivityBanner() {
 *   const { isOnline } = useOnlineStatus();
 *
 *   if (isOnline) return null;
 *   return <div className="bg-accent-pink text-white p-2 text-center text-sm">
 *     You are offline. Some features may be unavailable.
 *   </div>;
 * }
 * ```
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  const handleOnline = useCallback(() => setIsOnline(true), []);
  const handleOffline = useCallback(() => setIsOnline(false), []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline };
}
