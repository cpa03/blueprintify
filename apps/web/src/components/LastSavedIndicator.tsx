import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LastSavedIndicatorProps {
  text: string;
  isVisible: boolean;
}

export const LastSavedIndicator = React.memo(function LastSavedIndicator({
  text,
  isVisible,
}: LastSavedIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && text && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center gap-2 text-xs text-dark-400"
          aria-live="polite"
          aria-atomic="true"
        >
          <svg
            className="w-3.5 h-3.5 text-accent-emerald"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
