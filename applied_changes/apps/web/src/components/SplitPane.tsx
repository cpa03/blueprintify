import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface SplitPaneProps {
  left: ReactNode;
  right?: ReactNode;
  showRight: boolean;
  leftWidth?: string;
  rightWidth?: string;
  onToggleRight?: () => void;
  className?: string;
}

/**
 * SplitPane component - A reusable split-pane layout
 * Left panel is always visible, right panel can be toggled
 */
export function SplitPane({
  left,
  right,
  showRight,
  leftWidth = "w-1/2",
  rightWidth = "w-1/2",
  onToggleRight,
  className,
}: SplitPaneProps) {
  return (
    <div className={clsx("flex gap-6 min-h-[600px]", className)}>
      {/* Left Panel */}
      <motion.div
        layout
        className={clsx(
          "glass-card overflow-hidden transition-all duration-300",
          showRight ? leftWidth : "w-full",
        )}
      >
        {left}
      </motion.div>

      {/* Right Panel */}
      <AnimatePresence>
        {showRight && right && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={clsx("glass-card overflow-hidden relative", rightWidth)}
          >
            {/* Toggle button */}
            {onToggleRight && (
              <button
                onClick={onToggleRight}
                className="absolute top-4 right-4 z-10 btn-ghost"
                title="Hide panel"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {right}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
