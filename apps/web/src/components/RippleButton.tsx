import {
  useState,
  useCallback,
  memo,
  type ReactNode,
  type MouseEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

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
      }, 600);
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
    <button
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
              opacity: 0.5,
              x: ripple.x,
              y: ripple.y,
            }}
            animate={{
              scale: 4,
              opacity: 0,
              x: ripple.x,
              y: ripple.y,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            className="absolute pointer-events-none bg-white/30 rounded-full"
            style={{
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              left: ripple.x,
              top: ripple.y,
            }}
          />
        ))}
      </AnimatePresence>
    </button>
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
      }, 600);
    },
    [shouldReduceMotion],
  );

  const RippleOverlay = useCallback(
    () => (
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute pointer-events-none bg-white/30 rounded-full"
            style={{
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
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
