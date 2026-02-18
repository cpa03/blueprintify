import { useState, useCallback, ReactNode, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({
  children,
  content,
  position = "top",
  delay = 500,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipId = useId();

  const handleMouseEnter = useCallback(() => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  }, [delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  }, [timeoutId]);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}
            role="tooltip"
            id={tooltipId}
          >
            <div className="glass-card px-3 py-2 text-sm whitespace-nowrap shadow-xl border-dark-600">
              {content}
            </div>
            <div
              className={`absolute w-2 h-2 border-4 border-dark-800 ${arrowClasses[position]}`}
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
  position?: "top" | "bottom" | "left" | "right";
  modifier?: "cmd" | "ctrl" | "none";
}

export function KeyboardShortcutTooltip({
  children,
  shortcut,
  description,
  position = "top",
  modifier = "cmd",
}: KeyboardShortcutTooltipProps) {
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
    <Tooltip content={content} position={position} delay={300}>
      {children}
    </Tooltip>
  );
}
