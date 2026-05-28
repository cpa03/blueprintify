/**
 * @fileoverview Last saved indicator component showing save status.
 *
 * This component displays:
 * - Saved status with checkmark icon
 * - Unsaved changes indicator with pulsing dot
 * - Animated transitions between states
 * - Accessibility support with aria-live
 *
 * @module components/LastSavedIndicator
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Props for the LastSavedIndicator component.
 */

interface LastSavedIndicatorProps {
  text: string;
  isVisible: boolean;
  hasChanges?: boolean;
}

/**
 * Indicator showing the last saved timestamp or unsaved changes status.
 * Displays a checkmark with the saved text or a pulsing dot for unsaved changes.
 *
 * @param props - Component props
 * @param props.text - Text to display when content is saved (e.g., "Last saved: 2:30 PM")
 * @param props.isVisible - Whether the indicator should be visible
 * @param props.hasChanges - Whether there are unsaved changes (default: false)
 * @returns The rendered save status indicator
 *
 * @example
 * // Saved state
 * <LastSavedIndicator text="Last saved: 2:30 PM" isVisible={true} hasChanges={false} />
 *
 * @example
 * // Unsaved changes state
 * <LastSavedIndicator text="Last saved: 2:30 PM" isVisible={true} hasChanges={true} />
 */

export const LastSavedIndicator = React.memo(function LastSavedIndicator({
  text,
  isVisible,
  hasChanges = false,
}: LastSavedIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={hasChanges ? "unsaved" : "saved"}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`flex items-center gap-2 text-xs ${
            hasChanges ? "text-amber-400" : "text-dark-400"
          }`}
          aria-live="polite"
          aria-atomic="true"
        >
          {hasChanges ? (
            <>
              <motion.span
                className="relative flex h-2 w-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <motion.span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </motion.span>
              <span className="font-medium">Unsaved changes</span>
            </>
          ) : (
            <>
              <motion.svg
                className="w-3.5 h-3.5 text-accent-emerald"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                  mass: 0.5,
                }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { type: "spring", stiffness: 400, damping: 25, delay: 0.05 },
                    opacity: { duration: 0.1, delay: 0.05 },
                  }}
                />
              </motion.svg>
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
              >
                {text}
              </motion.span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
