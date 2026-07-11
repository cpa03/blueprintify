/**
 * @fileoverview Hook for smart auto-scrolling behavior during content generation.
 *
 * This hook implements the familiar "smart scroll" pattern used by ChatGPT,
 * Claude, and other streaming content UIs:
 * - Auto-scrolls to follow new content during generation
 * - Pauses if the user scrolls up to read older content
 * - Resumes when the user scrolls back to the bottom
 *
 * @module hooks/useAutoScroll
 *
 * @example
 * ```tsx
 * function PreviewPane() {
 *   const previewRef = useRef<HTMLDivElement>(null);
 *   const isGenerating = useEditorStore((s) => s.isGenerating);
 *   const content = useEditorStore((s) => s.blueprintContent);
 *
 *   useAutoScroll({
 *     scrollContainerRef: previewRef,
 *     enabled: isGenerating,
 *     trigger: content,
 *   });
 *
 *   return <div ref={previewRef}>{content}</div>;
 * }
 * ```
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { AUTO_SCROLL_DEFAULTS } from "@blueprint/shared/config";

interface UseAutoScrollOptions {
  /** Ref to the scrollable container element */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Whether auto-scroll is active (typically tied to generation state) */
  enabled: boolean;
  /** Content value that triggers auto-scroll when it changes */
  trigger: string;
  /** Threshold in pixels from bottom to consider "near bottom" (default: AUTO_SCROLL_DEFAULTS.NEAR_BOTTOM_THRESHOLD_PX) */
  threshold?: number;
}

interface UseAutoScrollReturn {
  /** Whether the user is currently near the bottom of the scroll container */
  isNearBottom: boolean;
  /** Whether the user has manually scrolled away from the bottom */
  userScrolledAway: boolean;
  /** Programmatically scroll to the bottom */
  scrollToBottom: () => void;
}

/**
 * Hook that provides smart auto-scroll behavior for streaming content.
 *
 * During generation (`enabled`), the preview pane auto-scrolls to follow
 * new content — but only when the user hasn't manually scrolled up to
 * read previous content. When the user scrolls back near the bottom,
 * auto-scrolling resumes automatically.
 *
 * @param options - Configuration options
 * @returns Object with scroll state and controls
 */
export function useAutoScroll({
  scrollContainerRef,
  enabled,
  trigger,
  threshold = AUTO_SCROLL_DEFAULTS.NEAR_BOTTOM_THRESHOLD_PX,
}: UseAutoScrollOptions): UseAutoScrollReturn {
  const userScrolledAwayRef = useRef(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [userScrolledAway, setUserScrolledAway] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef(0);
  const previousTriggerRef = useRef(trigger);

  /**
   * Check if the container is scrolled near the bottom.
   */
  const checkNearBottom = useCallback((): boolean => {
    const el = scrollContainerRef.current;
    if (!el) return true;

    const { scrollTop, scrollHeight, clientHeight } = el;
    return scrollHeight - scrollTop - clientHeight <= threshold;
  }, [scrollContainerRef, threshold]);

  /**
   * Scroll the container to the bottom smoothly.
   */
  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [scrollContainerRef]);

  /**
   * Handle scroll events from the container — detects whether the user
   * has manually scrolled away from the bottom or returned to it.
   */
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const nearBottom = checkNearBottom();
      setIsNearBottom(nearBottom);
      setUserScrolledAway(!nearBottom);
      if (!nearBottom) {
        userScrolledAwayRef.current = true;
      } else {
        userScrolledAwayRef.current = false;
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef, checkNearBottom]);

  /**
   * When the trigger (content) changes during generation and the user
   * hasn't scrolled away, auto-scroll to follow new content.
   *
   * Uses requestAnimationFrame with a time throttle to avoid excessive
   * scroll calls during rapid content streaming.
   */
  useEffect(() => {
    if (!enabled) {
      previousTriggerRef.current = trigger;
      return;
    }

    const contentChanged = trigger !== previousTriggerRef.current;
    previousTriggerRef.current = trigger;

    if (!contentChanged) return;

    // If user has scrolled away, don't auto-scroll
    if (userScrolledAwayRef.current) return;

    // Throttle scroll calls during rapid streaming
    const now = Date.now();
    if (now - lastScrollTimeRef.current < AUTO_SCROLL_DEFAULTS.SCROLL_THROTTLE_MS) {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          lastScrollTimeRef.current = Date.now();
          scrollToBottom();
        });
      }
      return;
    }

    lastScrollTimeRef.current = now;
    scrollToBottom();
  }, [enabled, trigger, scrollToBottom]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    isNearBottom,
    userScrolledAway,
    scrollToBottom,
  };
}

export type { UseAutoScrollOptions, UseAutoScrollReturn };
