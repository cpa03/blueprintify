import {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  useId,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Position = "top" | "bottom" | "left" | "right";

interface SmartTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: Position;
  delay?: number;
  hideDelay?: number;
  maxWidth?: number;
  dismissOnClickOutside?: boolean;
  dismissOnEscape?: boolean;
  id?: string;
  className?: string;
}

interface PositionStyles {
  container: string;
  arrow: string;
}

const positionClasses: Record<Position, PositionStyles> = {
  top: {
    container: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    arrow:
      "top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent",
  },
  bottom: {
    container: "top-full left-1/2 -translate-x-1/2 mt-2",
    arrow:
      "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent",
  },
  left: {
    container: "right-full top-1/2 -translate-y-1/2 mr-2",
    arrow:
      "left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent",
  },
  right: {
    container: "left-full top-1/2 -translate-y-1/2 ml-2",
    arrow:
      "right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent",
  },
};

/**
 * SmartTooltip - An enhanced tooltip component with:
 * - Auto-positioning (adjusts if tooltip goes off-screen)
 * - Better ARIA support for accessibility
 * - Smooth spring animations
 * - Keyboard support (Escape to dismiss)
 * - Click-outside dismissal
 * - Proper focus/blur handling
 */
export function SmartTooltip({
  children,
  content,
  position = "top",
  delay = 400,
  hideDelay = 100,
  maxWidth = 320,
  dismissOnClickOutside = true,
  dismissOnEscape = true,
  id,
  className = "",
}: SmartTooltipProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [computedPosition, setComputedPosition] = useState<Position>(position);
  const [isPositioned, setIsPositioned] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const tooltipId = id || `tooltip-${generatedId}`;

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const calculateOptimalPosition = useCallback((): Position => {
    if (!triggerRef.current) return position;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = Math.min(maxWidth, 320);
    const tooltipHeight = 60;
    const padding = 16;

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const fits = {
      top: triggerRect.top >= tooltipHeight + padding,
      bottom: viewport.height - triggerRect.bottom >= tooltipHeight + padding,
      left: triggerRect.left >= tooltipWidth + padding,
      right: viewport.width - triggerRect.right >= tooltipWidth + padding,
    };

    if (fits[position]) return position;

    const positions: Position[] = ["top", "bottom", "left", "right"];
    const fittingPosition = positions.find((pos) => fits[pos]);

    return fittingPosition || "top";
  }, [position, maxWidth]);

  const showTooltip = useCallback(() => {
    clearTimeouts();

    showTimeoutRef.current = setTimeout(() => {
      const optimalPosition = calculateOptimalPosition();
      setComputedPosition(optimalPosition);
      setIsPositioned(true);
      setIsVisible(true);
    }, delay);
  }, [clearTimeouts, calculateOptimalPosition, delay]);

  const hideTooltip = useCallback(() => {
    clearTimeouts();

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsPositioned(false);
    }, hideDelay);
  }, [clearTimeouts, hideDelay]);

  const handleMouseEnter = useCallback(() => {
    hideTooltip();
    showTooltip();
  }, [hideTooltip, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    clearTimeouts();
    hideTooltip();
  }, [clearTimeouts, hideTooltip]);

  const handleFocus = useCallback(() => {
    showTooltip();
  }, [showTooltip]);

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (!triggerRef.current?.contains(e.relatedTarget as Node)) {
        hideTooltip();
      }
    },
    [hideTooltip],
  );

  useEffect(() => {
    if (!dismissOnClickOutside || !isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dismissOnClickOutside, isVisible]);

  useEffect(() => {
    if (!dismissOnEscape || !isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVisible(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [dismissOnEscape, isVisible]);

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  const positionStyle = positionClasses[computedPosition];

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}

      <AnimatePresence>
        {isVisible && isPositioned && (
          <motion.div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            initial={{
              opacity: 0,
              scale: 0.85,
              y:
                computedPosition === "top"
                  ? 8
                  : computedPosition === "bottom"
                    ? -8
                    : 0,
              x:
                computedPosition === "left"
                  ? 8
                  : computedPosition === "right"
                    ? -8
                    : 0,
            }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y:
                computedPosition === "top"
                  ? 4
                  : computedPosition === "bottom"
                    ? -4
                    : 0,
              x:
                computedPosition === "left"
                  ? 4
                  : computedPosition === "right"
                    ? -4
                    : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
            className={`absolute ${positionStyle.container} z-50 pointer-events-none ${className}`}
            style={{ maxWidth }}
          >
            <div
              className="glass-card px-3 py-2 text-sm shadow-xl backdrop-blur-xl"
              style={{ maxWidth }}
            >
              {content}
            </div>
            <div
              className={`absolute w-2 h-2 border-4 border-dark-700/50 ${positionStyle.arrow}`}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface KeyboardShortcutTooltipProps {
  children: ReactNode;
  shortcut: string;
  description?: string;
  position?: Position;
  modifier?: "cmd" | "ctrl" | "none";
}

/**
 * KeyboardShortcutTooltip - Specialized tooltip for keyboard shortcuts
 * Automatically detects Mac/Windows and shows appropriate modifier key
 */
export function KeyboardShortcutTooltip({
  children,
  shortcut,
  description,
  position = "top",
  modifier = "cmd",
}: KeyboardShortcutTooltipProps): JSX.Element {
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  let fullShortcut: string;
  if (modifier === "none") {
    fullShortcut = shortcut;
  } else if (modifier === "cmd") {
    fullShortcut = `${isMac ? "⌘" : "Ctrl"} + ${shortcut.toUpperCase()}`;
  } else {
    fullShortcut = `Ctrl + ${shortcut.toUpperCase()}`;
  }

  const content = (
    <div className="flex items-center gap-2">
      {description && <span className="text-dark-300">{description}</span>}
      <kbd className="px-2 py-0.5 bg-dark-700 rounded text-xs font-mono text-white border border-dark-600 shadow-inner">
        {fullShortcut}
      </kbd>
    </div>
  );

  return (
    <SmartTooltip
      content={content}
      position={position}
      delay={300}
      dismissOnEscape={true}
    >
      {children}
    </SmartTooltip>
  );
}

interface InfoTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: Position;
  showInfoIcon?: boolean;
}

/**
 * InfoTooltip - Tooltip with an info icon indicator
 * Useful for help text and explanations
 */
export function InfoTooltip({
  children,
  content,
  position = "top",
  showInfoIcon = true,
}: InfoTooltipProps): JSX.Element {
  return (
    <SmartTooltip
      content={content}
      position={position}
      delay={200}
      maxWidth={280}
    >
      <span className="inline-flex items-center gap-1 cursor-help">
        {children}
        {showInfoIcon && (
          <svg
            className="w-4 h-4 text-dark-400 hover:text-primary-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </span>
    </SmartTooltip>
  );
}

export type { SmartTooltipProps, Position };
export { SmartTooltip as Tooltip };
export default SmartTooltip;
