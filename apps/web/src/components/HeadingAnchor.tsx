/**
 * HeadingAnchor - Adds a hover-visible anchor link to heading elements
 *
 * When hovering over a heading (h1-h6), a subtle link icon appears.
 * Clicking it copies a deep anchor URL to that section to the clipboard
 * and shows a brief "Link copied!" confirmation.
 *
 * This follows the GitHub/Notion pattern where documentation headings
 * are easily linkable for sharing and reference.
 *
 * Features:
 * - Anchor icon appears on hover/focus-within with spring animation
 * - Click copies full anchor URL to clipboard
 * - Brief "Copied!" toast-style feedback near the icon
 * - Proper ARIA labels for accessibility
 * - Reduced motion support
 * - Keyboard accessible (Enter/Space to copy)
 *
 * @module components/HeadingAnchor
 *
 * @example
 * ```tsx
 * <h2 className={MARKDOWN.H2}>
 *   <HeadingAnchor headingText="Installation">
 *     Installation
 *   </HeadingAnchor>
 * </h2>
 * ```
 */

import { useState, useCallback, useRef, memo } from "react";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { generateSlug } from "../utils/slug";
import { ANIMATION_DEFAULTS, TOOLTIP_LABELS, UI_TIMEOUTS } from "@blueprint/shared";
import { ANIMATION, SPRING_CONFIG, ACCESSIBILITY_LABELS } from "../config/constants";
import { copyToClipboard } from "../lib/export";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface HeadingAnchorProps {
  /** Text content of the heading (used to generate the slug) */
  headingText: string;
  /** The heading content (text, inline code, etc.) */
  children: React.ReactNode;
}

export const HeadingAnchor = memo(function HeadingAnchor({
  headingText,
  children,
}: HeadingAnchorProps) {
  const [showCopied, setShowCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const slug = generateSlug(headingText);

  const handleCopyLink = useCallback(async () => {
    const url = new URL(window.location.href);
    url.hash = slug;
    const success = await copyToClipboard(url.toString());

    if (success) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowCopied(true);
      timeoutRef.current = setTimeout(() => {
        setShowCopied(false);
      }, UI_TIMEOUTS.COPY_FEEDBACK);

      // Update URL hash without scrolling
      history.replaceState(null, "", url.toString());
    }
  }, [slug]);

  const isVisible = isHovered || isFocused || showCopied;

  return (
    <span
      className="relative inline group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}

      {/* Anchor link button — visible on hover/focus/active */}
      <motion.button
        onClick={handleCopyLink}
        initial={false}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.7,
          width: isVisible ? "auto" : 0,
        }}
        transition={
          shouldReduceMotion
            ? ANIMATION_DEFAULTS.ZERO_DURATION
            : {
                type: "spring",
                ...SPRING_CONFIG.SNAPPY,
              }
        }
        className={`
          inline-flex items-center gap-1 ml-2 px-1.5 py-0.5
          rounded-md text-xs font-medium
          text-primary-400 hover:text-primary-300
          bg-primary-500/10 hover:bg-primary-500/20
          border border-primary-500/20 hover:border-primary-500/40
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50
          transition-colors duration-150
          -translate-y-px
        `}
        aria-label={ACCESSIBILITY_LABELS.HEADING_ANCHOR.COPY_LINK_ARIA(headingText)}
        title={ACCESSIBILITY_LABELS.HEADING_ANCHOR.COPY_LINK_TITLE}
        tabIndex={0}
      >
        {/* Link icon */}
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>

        {/* "Copied!" feedback */}
        <AnimatePresence>
          {showCopied && (
            <motion.span
              initial={{ opacity: 0, x: -4, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -4, scale: 0.9 }}
              transition={{
                duration: shouldReduceMotion ? 0 : ANIMATION.FAST,
                ease: "easeOut",
              }}
              className="text-accent-emerald font-semibold whitespace-nowrap"
              aria-live="polite"
            >
              {TOOLTIP_LABELS.EDITOR.COPIED}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </span>
  );
});

export default HeadingAnchor;
