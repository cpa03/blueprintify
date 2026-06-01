/**
 * @fileoverview Tooltip component with accessible hover and focus interactions.
 *
 * This component provides:
 * - Hover and keyboard-triggered tooltip display
 * - Configurable position (top, bottom, left, right)
 * - Configurable show delay
 * - Accessibility support with ARIA attributes
 * - Platform-aware keyboard shortcut tooltips
 *
 * @module components/Tooltip
 */

import { useState, useCallback, useRef, ReactNode, useId, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOOLTIP_CONFIG, ANIMATION } from "../config/constants";

/**
 * Props for the Tooltip component.
 */

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  id?: string;
}

// Move static objects outside component to prevent recreation on every render
const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
} as const;

const arrowClasses = {
  top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent",
} as const;

/**
 * Tooltip component that displays additional information on hover or focus.
 * Shows content in a positioned bubble with arrow pointer.
 *
 * @param props - Component props
 * @param props.children - Trigger element that shows tooltip on hover/focus
 * @param props.content - Content to display in the tooltip
 * @param props.position - Tooltip position relative to children (default: "top")
 * @param props.delay - Delay before showing tooltip in ms (default: from config)
 * @param props.id - Custom ID for the tooltip element
 * @returns The rendered tooltip with trigger element
 *
 * @example
 * // Basic usage
 * <Tooltip content="Helpful information">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * @example
 * // Positioned tooltip
 * <Tooltip content="Tooltip on the right" position="right">
 *   <IconButton icon={<Info />} />
 * </Tooltip>
 */

const TooltipComponent = ({
  children,
  content,
  position = "top",
  delay = TOOLTIP_CONFIG.DEFAULT_DELAY,
  id,
}: TooltipProps): JSX.Element => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generatedId = useId();
  const tooltipId = id || `tooltip-${generatedId}`;

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      } else if (e.key === "Escape" && isVisible) {
        setIsVisible(false);
      }
    },
    [isVisible]
  );

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onKeyDown={handleKeyDown}
      aria-describedby={isVisible ? tooltipId : undefined}
      tabIndex={0}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: ANIMATION.FAST, ease: "easeOut" }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}
          >
            <div className="glass-card px-3 py-2 text-sm whitespace-nowrap shadow-xl">
              {content}
            </div>
            <div
              className={`absolute w-2 h-2 border-4 border-dark-700/50 ${arrowClasses[position]}`}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Tooltip = memo(TooltipComponent);

/**
 * Props for the KeyboardShortcutTooltip component.
 */

interface KeyboardShortcutTooltipProps {
  children: ReactNode;
  shortcut: string;
  description?: string;
  position?: "top" | "bottom" | "left" | "right";
  modifier?: "cmd" | "ctrl" | "none";
}

/**
 * Tooltip component specifically for displaying keyboard shortcuts.
 * Automatically shows platform-appropriate modifier keys (Cmd on Mac, Ctrl on Windows/Linux).
 *
 * @param props - Component props
 * @param props.children - Trigger element
 * @param props.shortcut - Keyboard shortcut key (e.g., "E", "Enter")
 * @param props.description - Optional description text
 * @param props.position - Tooltip position (default: "top")
 * @param props.modifier - Modifier key type: "cmd" (auto-detect), "ctrl" (always show Ctrl), "none" (no modifier)
 * @returns The rendered keyboard shortcut tooltip
 *
 * @example
 * // Basic usage
 * <KeyboardShortcutTooltip shortcut="E">
 *   <Button>Toggle Editor</Button>
 * </KeyboardShortcutTooltip>
 *
 * @example
 * // With description
 * <KeyboardShortcutTooltip shortcut="S" description="Save document">
 *   <Button>Save</Button>
 * </KeyboardShortcutTooltip>
 */

function KeyboardShortcutTooltipComponent({
  children,
  shortcut,
  description,
  position = "top",
  modifier = "cmd",
}: KeyboardShortcutTooltipProps): JSX.Element {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

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
      <kbd className="px-2 py-0.5 bg-dark-700 rounded text-xs font-mono text-white border border-dark-600">
        {fullShortcut}
      </kbd>
    </div>
  );

  return (
    <Tooltip content={content} position={position} delay={TOOLTIP_CONFIG.KEYBOARD_SHORTCUT_DELAY}>
      {children}
    </Tooltip>
  );
}

export const KeyboardShortcutTooltip = memo(KeyboardShortcutTooltipComponent);
