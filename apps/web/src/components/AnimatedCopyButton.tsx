/**
 * @fileoverview Animated copy button component with particle celebration effects.
 *
 * This component provides a copy-to-clipboard button with:
 * - Particle explosion animation on click
 * - Visual feedback for copy success/failure
 * - Accessibility support with proper ARIA labels
 * - Reduced motion support
 *
 * @module components/AnimatedCopyButton
 */

import React, { useState, useCallback, useRef, memo } from "react";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  ANIMATION_SCALE,
  FRAMER_TYPE,
  TIME_UNITS,
  COPY_STATE_VALUES,
  SVG_ICON_DEFAULTS,
  ANIMATION_OPACITY,
  ANIMATION_X_OFFSET,
  ANIMATION_Y_OFFSET,
  DATA_BOOLEAN_VALUES,
} from "@blueprint/shared";
import {
  CELEBRATION_COLORS,
  ANIMATION_COLORS,
  SPRING_CONFIG,
  PARTICLE_CONFIG,
  ANIMATION,
  EASING,
  HOVER_SCALE,
  COPY_BUTTON_LABELS,
  FOCUS_ANNOUNCER,
  CSS_CLASSES,
} from "../config/constants";
import {
  ANIMATION_ENTRANCE_DELAYS,
  ARIA_LIVE_VALUES,
  ARIA_ROLES,
  CIRCLE_GEOMETRY,
  ICON_PATHS,
  ICON_RECTS,
} from "@blueprint/shared/config";
import { ANIMATE_PRESENCE_MODES } from "@blueprint/shared/config";
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

/**
 * Props for the AnimatedCopyButton component.
 */

interface AnimatedCopyButtonProps {
  onCopy: () => void;
  isCopied: boolean;
  hasContent: boolean;
  className?: string;
  "aria-describedby"?: string;
}

/**
 * Animated copy button with particle celebration effects.
 *
 * @param props - Component props
 * @param props.onCopy - Callback fired when copy button is clicked
 * @param props.isCopied - Whether content has been copied (shows checkmark)
 * @param props.hasContent - Whether there is content to copy (disables button if false)
 * @param props.className - Additional CSS classes
 * @returns The rendered copy button with particle effects
 *
 * @example
 * // Basic usage
 * <AnimatedCopyButton onCopy={() => copyToClipboard()} isCopied={false} hasContent={true} />
 *
 * @example
 * // With custom styling
 * <AnimatedCopyButton onCopy={handleCopy} isCopied={copied} hasContent={hasContent} className="ml-2" />
 */

function AnimatedCopyButtonComponent({
  onCopy,
  isCopied,
  hasContent,
  className = "",
  "aria-describedby": ariaDescribedby,
}: AnimatedCopyButtonProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);
  // Respect the user's prefers-reduced-motion preference: the particle burst
  // and springy hover/press transforms are purely decorative, so they are
  // skipped entirely for vestibular-sensitive users (WCAG 2.3.3). The copy
  // action itself and the Copied/Copy label swap remain fully functional.
  const shouldReduceMotion = useReducedMotion();

  const createParticles = useCallback(() => {
    if (shouldReduceMotion || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const newParticles: Particle[] = [];

    for (let i = 0; i < PARTICLE_CONFIG.COUNT; i++) {
      const angle = (i / PARTICLE_CONFIG.COUNT) * CIRCLE_GEOMETRY.FULL_TURN_RAD;
      const distance =
        PARTICLE_CONFIG.BASE_DISTANCE_PX + Math.random() * PARTICLE_CONFIG.RANDOM_DISTANCE_PX;
      const color: string =
        CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)] ??
        ANIMATION_COLORS.POSITIVE;
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

  const handleClick = useCallback(
    (_e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hasContent) return;
      createParticles();
      onCopy();
    },
    [hasContent, onCopy, createParticles]
  );

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      // aria-disabled (not native disabled) so the button stays in the tab
      // order and screen readers can announce WHY it is unavailable (WCAG
      // 2.4.3 / 4.1.2). Native `disabled` removes the control from the tab
      // order and silently drops focus to <body> if it loses content while
      // focused. Mirrors the Export button's pattern in EditorToolbar.
      aria-disabled={!hasContent}
      aria-describedby={ariaDescribedby}
      className={clsx(
        "relative text-sm px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50",
        isCopied
          ? "bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/50"
          : "btn-ghost text-dark-300 hover:text-white hover:bg-dark-800/50",
        !hasContent ? CSS_CLASSES.DISABLED_BUTTON_STATE : "",
        className
      )}
      data-state={isCopied ? COPY_STATE_VALUES.COPIED : COPY_STATE_VALUES.IDLE}
      data-reduced-motion={
        shouldReduceMotion ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
      }
      data-has-content={hasContent ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
      title={
        !hasContent
          ? COPY_BUTTON_LABELS.NO_CONTENT
          : isCopied
            ? COPY_BUTTON_LABELS.COPIED
            : COPY_BUTTON_LABELS.COPY
      }
      aria-label={
        !hasContent
          ? COPY_BUTTON_LABELS.NO_CONTENT
          : isCopied
            ? COPY_BUTTON_LABELS.COPIED
            : COPY_BUTTON_LABELS.COPY
      }
      animate={{
        scale: shouldReduceMotion ? 1 : isPressed ? 0.92 : 1,
      }}
      transition={{
        type: FRAMER_TYPE.SPRING,
        ...SPRING_CONFIG.DEFAULT,
      }}
      whileHover={!shouldReduceMotion && hasContent ? { ...HOVER_SCALE.MICRO } : undefined}
    >
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
                duration: particle.duration / TIME_UNITS.MS_PER_SECOND,
                ease: EASING.PARTICLE_BURST,
              }}
            />
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {isCopied && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-accent-emerald pointer-events-none"
            initial={{ scale: ANIMATION_SCALE.STANDARD, opacity: ANIMATION_OPACITY.SUBTLE }}
            animate={{ scale: ANIMATION_SCALE.PARTICLE_EXPAND, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ANIMATION.HALF_SECOND, ease: EASING.easeOut }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCopied && (
          <motion.div
            className="absolute inset-0 bg-accent-emerald/20 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: ANIMATION.SLIDER }}
          />
        )}
      </AnimatePresence>

      {/* Screen reader announcement for copy status */}
      <span
        className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}
        role={ARIA_ROLES.STATUS}
        aria-live={ARIA_LIVE_VALUES.POLITE}
      >
        {isCopied ? COPY_BUTTON_LABELS.COPIED : null}
      </span>

      <span className="relative z-10 flex items-center gap-2">
        <AnimatePresence mode={ANIMATE_PRESENCE_MODES.WAIT}>
          {isCopied ? (
            <motion.span
              key="copied"
              className="flex items-center gap-2"
              initial={{
                opacity: 0,
                y: ANIMATION_Y_OFFSET.DROP_SUBTLE,
                scale: ANIMATION_SCALE.MODAL,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_SUBTLE, scale: ANIMATION_SCALE.MODAL }}
              transition={{
                type: FRAMER_TYPE.SPRING,
                ...SPRING_CONFIG.SNAPPY,
              }}
            >
              <motion.svg
                width="16"
                height="16"
                viewBox={SVG_ICON_DEFAULTS.VIEW_BOX_SMALL}
                fill={SVG_ICON_DEFAULTS.FILL_NONE}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: FRAMER_TYPE.SPRING,
                  ...SPRING_CONFIG.CHECKMARK,
                  delay: ANIMATION_ENTRANCE_DELAYS.VERY_FAST,
                }}
              >
                <motion.path
                  d="M3 8L6.5 11.5L13 5"
                  stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                  strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_MEDIUM}
                  strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                  strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: ANIMATION.CHECKMARK_REVEAL,
                    delay: ANIMATION_ENTRANCE_DELAYS.FAST,
                  }}
                />
              </motion.svg>
              <motion.span
                className="font-medium"
                initial={{ opacity: 0, x: ANIMATION_X_OFFSET.SLIDE_LEFT_SMALL }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ANIMATION_ENTRANCE_DELAYS.MODERATE }}
              >
                {COPY_BUTTON_LABELS.DISPLAY_COPIED}
              </motion.span>
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: ANIMATION_Y_OFFSET.DROP_SUBTLE }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: ANIMATION_Y_OFFSET.RISE_SUBTLE }}
              transition={{ duration: ANIMATION.NORMAL }}
            >
              <motion.svg
                width="16"
                height="16"
                viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
                fill={SVG_ICON_DEFAULTS.FILL_NONE}
                stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                whileHover={
                  !shouldReduceMotion && hasContent
                    ? {
                        rotate: [0, -10, 10, -5, 5, 0],
                        transition: { duration: ANIMATION.HALF_SECOND },
                      }
                    : undefined
                }
              >
                <rect {...ICON_RECTS.COPY_BODY} />
                <path d={ICON_PATHS.COPY_SQUARE} />
              </motion.svg>
              <span>{COPY_BUTTON_LABELS.DISPLAY_COPY}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

export const AnimatedCopyButton = memo(AnimatedCopyButtonComponent);
