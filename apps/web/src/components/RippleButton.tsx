import {
  useState,
  useCallback,
  memo,
  type ReactNode,
  type MouseEvent,
  type ButtonHTMLAttributes,
} from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { RIPPLE_CONFIG } from "../config/constants";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface TransformStyle {
  scale?: number;
  y?: number;
  filter?: string;
}

interface RippleButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "children"
  | "className"
  | "type"
  | "disabled"
  | "title"
  | "onClick"
  | "aria-label"
  | "data-autofocus"
> {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  title?: string;
  whileHover?: TransformStyle;
  whileTap?: TransformStyle;
  "data-autofocus"?: string;
}

function toTransformString(s?: TransformStyle): string {
  if (!s) return "";
  const parts: string[] = [];
  if (s.scale) parts.push(`scale(${s.scale})`);
  if (s.y) parts.push(`translateY(${s.y}px)`);
  return parts.join(" ");
}

function RippleButtonComponent({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  ariaLabel,
  title,
  whileHover,
  whileTap,
  "data-autofocus": dataAutofocus,
  ...rest
}: RippleButtonProps): JSX.Element {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [hoverTransform, setHoverTransform] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const createRipple = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (shouldReduceMotion) return;

      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      // Keyboard-triggered clicks (Enter/Space) set clientX/Y to 0,
      // which places the ripple at the button's top-left corner or
      // even outside it. Detect this and center the ripple instead,
      // giving keyboard users the same visual feedback as mouse users.
      const isKeyboardClick = event.clientX === 0 && event.clientY === 0;
      const x = isKeyboardClick ? rect.width / 2 : event.clientX - rect.left;
      const y = isKeyboardClick ? rect.height / 2 : event.clientY - rect.top;

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
    [shouldReduceMotion]
  );

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      createRipple(e);
      onClick?.(e);
    },
    [createRipple, onClick]
  );

  const handleMouseEnter = useCallback(() => {
    if (!disabled && whileHover) {
      setHoverTransform(toTransformString(whileHover));
    }
  }, [disabled, whileHover]);

  const handleMouseLeave = useCallback(() => {
    setHoverTransform("");
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!disabled && whileTap) {
      setHoverTransform(toTransformString(whileTap));
    }
  }, [disabled, whileTap]);

  const handleMouseUp = useCallback(() => {
    if (!disabled && whileHover) {
      setHoverTransform(toTransformString(whileHover));
    } else {
      setHoverTransform("");
    }
  }, [disabled, whileHover]);

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 transition-transform duration-150 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      style={{ transform: hoverTransform || undefined }}
      aria-label={ariaLabel}
      title={title}
      data-autofocus={dataAutofocus}
      {...rest}
    >
      <span className="relative z-10">{children}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none rounded-full bg-white/30 animate-ripple"
          style={{
            width: RIPPLE_CONFIG.SIZE_PX,
            height: RIPPLE_CONFIG.SIZE_PX,
            left: ripple.x,
            top: ripple.y,
            marginLeft: RIPPLE_CONFIG.MARGIN_OFFSET_PX,
            marginTop: RIPPLE_CONFIG.MARGIN_OFFSET_PX,
          }}
        />
      ))}
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
      // Keyboard-triggered clicks (Enter/Space) set clientX/Y to 0,
      // which places the ripple at the element's top-left corner or
      // even outside it. Detect this and center the ripple instead.
      const isKeyboardClick = event.clientX === 0 && event.clientY === 0;
      const x = isKeyboardClick ? rect.width / 2 : event.clientX - rect.left;
      const y = isKeyboardClick ? rect.height / 2 : event.clientY - rect.top;

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
    [shouldReduceMotion]
  );

  const RippleOverlay = useCallback(
    () => (
      <>
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none rounded-full bg-white/30 animate-ripple"
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
      </>
    ),
    [ripples]
  );

  return { createRipple, RippleOverlay, ripples };
}
