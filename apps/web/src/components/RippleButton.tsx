/**
 * Ripple Button Component
 *
 * A button component with ripple effect animation on click.
 * Provides accessible button functionality with motion preferences support.
 *
 * @module components/RippleButton
 * @see {@link RIPPLE_CONFIG} - Ripple animation configuration
 * @see {@link useReducedMotion} - Reduced motion preference hook
 *
 * @param {RippleButtonProps} props - Component props
 * @param {ReactNode} props.children - Button content
 * @param {(e: MouseEvent) => void} [props.onClick] - Click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Disabled state
 * @param {"button"|"submit"|"reset"} [props.type] - Button type
 * @param {string} [props.ariaLabel] - ARIA label for accessibility
 * @param {string} [props.title] - Tooltip title
 * @returns {JSX.Element} Button with ripple effect
 *
 * @example
 * ```tsx
 * <RippleButton onClick={() => console.log('clicked')}>
 *   Click Me
 * </RippleButton>
 * ```
 */

import {
  useState,
  useCallback,
  memo,
  type ReactNode,
  type MouseEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { RIPPLE_CONFIG } from "../config/constants";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  title?: string;
}

function RippleButtonComponent({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  ariaLabel,
  title,
}: RippleButtonProps): JSX.Element {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const createRipple = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (shouldReduceMotion) return;

      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, RIPPLE_CONFIG.REMOVAL_DELAY_MS);
    },
    [shouldReduceMotion],
  );

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      createRipple(e);
      onClick?.(e);
    },
    [createRipple, onClick],
  );

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      aria-label={ariaLabel}
      title={title}
      style={{ position: "relative" }}
    >
      <span className="relative z-10">{children}</span>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{
              scale: 0,
              opacity: RIPPLE_CONFIG.INITIAL_OPACITY,
              x: ripple.x,
              y: ripple.y,
            }}
            animate={{
              scale: RIPPLE_CONFIG.FINAL_SCALE,
              opacity: 0,
              x: ripple.x,
              y: ripple.y,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: RIPPLE_CONFIG.TRANSITION_DURATION_S,
              ease: "easeOut",
            }}
            className="absolute pointer-events-none bg-white/30 rounded-full"
            style={{
              width: RIPPLE_CONFIG.SIZE_PX,
              height: RIPPLE_CONFIG.SIZE_PX,
              marginLeft: RIPPLE_CONFIG.MARGIN_OFFSET_PX,
              marginTop: RIPPLE_CONFIG.MARGIN_OFFSET_PX,
              left: ripple.x,
              top: ripple.y,
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}

export const RippleButton = memo(RippleButtonComponent);

export function useRipple(): {
  createRipple: (event: MouseEvent<HTMLElement>) => void;
  RippleOverlay: () => JSX.Element;
  ripples: Ripple[];
} {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const createRipple = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (shouldReduceMotion) return;

      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, RIPPLE_CONFIG.REMOVAL_DELAY_MS);
    },
    [shouldReduceMotion],
  );

  const RippleOverlay = useCallback(
    () => (
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: RIPPLE_CONFIG.INITIAL_OPACITY }}
            animate={{ scale: RIPPLE_CONFIG.FINAL_SCALE, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: RIPPLE_CONFIG.TRANSITION_DURATION_S,
              ease: "easeOut",
            }}
            className="absolute pointer-events-none bg-white/30 rounded-full"
            style={{
              width: RIPPLE_CONFIG.SIZE_PX,
              height: RIPPLE_CONFIG.SIZE_PX,
              marginLeft: RIPPLE_CONFIG.MARGIN_OFFSET_PX,
              marginTop: RIPPLE_CONFIG.MARGIN_OFFSET_PX,
              left: ripple.x,
              top: ripple.y,
            }}
          />
        ))}
      </AnimatePresence>
    ),
    [ripples],
  );

  return { createRipple, RippleOverlay, ripples };
}
