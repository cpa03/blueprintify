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

import React, { useState, useCallback, useRef, memo } from "react";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import { generateSlug } from "../utils/slug";
import {
  ANIMATION_DEFAULTS,
  ANIMATION_ENTRANCE_DELAYS,
  TOOLTIP_LABELS,
  UI_TIMEOUTS,
  FRAMER_TYPE,
} from "@blueprint/shared/config";
import {
  ANIMATION,
  EASING,
  SPRING_CONFIG,
  ACCESSIBILITY_LABELS,
  PARTICLE_CONFIG,
  CELEBRATION_COLORS,
} from "../config/constants";
import { copyToClipboard } from "../lib/export";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  duration: number;
}

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
  const [particles, setParticles] = useState<Particle[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  const slug = generateSlug(headingText);

  const createParticles = useCallback(() => {
    if (!buttonRef.current || shouldReduceMotion) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const newParticles: Particle[] = [];

    for (let i = 0; i < PARTICLE_CONFIG.COUNT; i++) {
      const angle = (i / PARTICLE_CONFIG.COUNT) * Math.PI * 2;
      const distance =
        PARTICLE_CONFIG.BASE_DISTANCE_PX + Math.random() * PARTICLE_CONFIG.RANDOM_DISTANCE_PX;
      const color =
        CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)] ?? "#34d399";
      const size = PARTICLE_CONFIG.BASE_SIZE_PX + Math.random() * PARTICLE_CONFIG.RANDOM_SIZE_PX;
      const duration =
        PARTICLE_CONFIG.BASE_DURATION_MS + Math.random() * PARTICLE_CONFIG.RANDOM_DURATION_MS;

      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        angle,
        distance,
        color,
        size,
        duration,
      });
    }

    setParticles(newParticles);

    setTimeout(() => {
      setParticles([]);
    }, PARTICLE_CONFIG.CLEANUP_DELAY_MS);
  }, [shouldReduceMotion]);

  const handleCopyLink = useCallback(async () => {
    const url = new URL(window.location.href);
    url.hash = slug;
    const success = await copyToClipboard(url.toString());

    if (success) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      createParticles();
      setShowCopied(true);
      timeoutRef.current = setTimeout(() => {
        setShowCopied(false);
      }, UI_TIMEOUTS.COPY_FEEDBACK);

      // Update URL hash without scrolling
      history.replaceState(null, "", url.toString());
    }
  }, [slug, createParticles]);

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
        ref={buttonRef}
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
                type: FRAMER_TYPE.SPRING,
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
          relative overflow-hidden
          ${showCopied ? "!border-accent-emerald/50 !bg-accent-emerald/15" : ""}
        `}
        aria-label={
          showCopied
            ? ACCESSIBILITY_LABELS.HEADING_ANCHOR.COPY_LINK_ARIA(headingText)
            : ACCESSIBILITY_LABELS.HEADING_ANCHOR.COPY_LINK_TITLE
        }
        title={ACCESSIBILITY_LABELS.HEADING_ANCHOR.COPY_LINK_TITLE}
        tabIndex={0}
      >
        <AnimatePresence mode="wait">
          {showCopied ? (
            /* Checkmark icon + "Copied!" — springs in replacing the link icon */
            <motion.span
              key="copied"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              transition={
                shouldReduceMotion
                  ? ANIMATION_DEFAULTS.ZERO_DURATION
                  : {
                      type: FRAMER_TYPE.SPRING,
                      ...SPRING_CONFIG.SNAPPY,
                    }
              }
              className="flex items-center gap-1"
            >
              <svg
                className="w-3.5 h-3.5 flex-shrink-0 text-accent-emerald"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: {
                      duration: ANIMATION.CHECKMARK_REVEAL,
                      ease: EASING.easeOut,
                      delay: ANIMATION_ENTRANCE_DELAYS.VERY_FAST,
                    },
                    opacity: {
                      duration: ANIMATION.QUICK_FADE,
                      delay: ANIMATION_ENTRANCE_DELAYS.VERY_FAST,
                    },
                  }}
                />
              </svg>
              <motion.span
                className="text-accent-emerald font-semibold whitespace-nowrap"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : ANIMATION.FAST,
                  ease: EASING.easeOut,
                  delay: ANIMATION_ENTRANCE_DELAYS.FAST,
                }}
                aria-live="polite"
              >
                {TOOLTIP_LABELS.EDITOR.COPIED}
              </motion.span>
            </motion.span>
          ) : (
            /* Link icon — springs back when copy feedback clears */
            <motion.span
              key="link"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={
                shouldReduceMotion
                  ? ANIMATION_DEFAULTS.ZERO_DURATION
                  : {
                      type: FRAMER_TYPE.SPRING,
                      ...SPRING_CONFIG.SNAPPY,
                    }
              }
            >
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
            </motion.span>
          )}
        </AnimatePresence>

        {/* Particle burst on copy — subtle celebration effect */}
        <AnimatePresence>
          {particles.map((particle) => {
            const endX = particle.x + Math.cos(particle.angle) * particle.distance;
            const endY = particle.y + Math.sin(particle.angle) * particle.distance;

            return (
              <motion.span
                key={particle.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  x: endX - particle.x,
                  y: endY - particle.y,
                  opacity: 0,
                  scale: [0, 1.5, 0.5],
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: particle.duration / 1000,
                  ease: EASING.PARTICLE_BURST,
                }}
              />
            );
          })}
        </AnimatePresence>
      </motion.button>
    </span>
  );
});

export default HeadingAnchor;
