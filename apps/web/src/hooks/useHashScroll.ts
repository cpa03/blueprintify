/**
 * @fileoverview Restores URL fragment deep links (#section) after content mounts.
 *
 * HeadingAnchor's "Copy link" produces URLs such as /#deployment-architecture,
 * but the heading elements only exist after React renders the markdown — long
 * after the browser's native one-shot hash scroll on page load has run and
 * missed. Without this hook, opening a copied deep link lands users at the top
 * of the page with no way to reach the section.
 *
 * Strategy: once the markdown surface is ready, look up location.hash in the
 * DOM and scrollIntoView it (through getScrollBehavior so reduced-motion users
 * get an instant jump instead of an animation). Retries briefly to cover
 * async-rendered content, re-attempts on hashchange, and never re-scrolls a
 * hash that was already handled — so tab switches and re-renders do not yank
 * the viewport away from where the user is reading.
 *
 * Note: HeadingAnchor copies via history.replaceState, which intentionally
 * does NOT fire hashchange — copying a link must not move the viewport.
 *
 * @module useHashScroll
 *
 * @example
 * ```tsx
 * useHashScroll(Boolean(currentContent), `${activeTab}:${viewMode}`);
 * ```
 */

import { useEffect, useRef } from "react";
import { DOM_EVENTS } from "@blueprint/shared/config";
import { HASH_SCROLL_CONFIG, SCROLL_INTO_VIEW_BLOCK } from "../config/constants";
import { getScrollBehavior } from "../utils/scroll";

function readHashId(): string | null {
  if (typeof window === "undefined") return null;
  const { hash } = window.location;
  if (!hash || hash.length <= 1) return null;
  const raw = hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Scrolls the element identified by the current URL fragment into view once it
 * exists in the DOM.
 *
 * @param enabled - Whether the markdown surface that can contain hash targets
 *   is mounted (e.g. non-empty content)
 * @param refreshKey - Changes when the visible surface changes (tab or
 *   view-mode switch); re-runs resolution so a target living in another tab is
 *   found after the user switches to it
 */
export function useHashScroll(enabled: boolean, refreshKey?: string): void {
  const handledHashRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const clearRetry = () => {
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const attempt = () => {
      clearRetry();
      const hashId = readHashId();
      if (hashId === null) return;
      if (handledHashRef.current === hashId) return;

      const target = document.getElementById(hashId);
      if (target) {
        target.scrollIntoView({
          behavior: getScrollBehavior(),
          block: SCROLL_INTO_VIEW_BLOCK.START,
        });
        handledHashRef.current = hashId;
        return;
      }

      if (attempts < HASH_SCROLL_CONFIG.RETRY_ATTEMPTS) {
        attempts += 1;
        retryTimer = setTimeout(attempt, HASH_SCROLL_CONFIG.RETRY_INTERVAL_MS);
      }
    };

    const handleHashChange = () => {
      attempts = 0;
      attempt();
    };

    attempt();
    window.addEventListener(DOM_EVENTS.HASH_CHANGE, handleHashChange);

    return () => {
      clearRetry();
      window.removeEventListener(DOM_EVENTS.HASH_CHANGE, handleHashChange);
    };
  }, [enabled, refreshKey]);
}

export default useHashScroll;
