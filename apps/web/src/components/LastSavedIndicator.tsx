import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LastSavedIndicatorProps {
  text: string;
  isVisible: boolean;
  hasChanges?: boolean;
}

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
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
