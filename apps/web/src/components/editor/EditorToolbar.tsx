import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import type { EditorTab } from "@blueprint/shared";

export type ViewMode = "edit" | "preview" | "split";

interface EditorToolbarProps {
  activeTab: EditorTab;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onCopy: () => void;
  onExport: () => void;
  onNew: () => void;
  hasContent: boolean;
  copied: string | null;
  isExporting?: boolean;
}

function AnimatedCheckmark() {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      <motion.path
        d="M3 8L6.5 11.5L13 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </motion.svg>
  );
}

export function EditorToolbar({
  activeTab,
  viewMode,
  setViewMode,
  onCopy,
  onExport,
  onNew,
  hasContent,
  copied,
  isExporting = false,
}: EditorToolbarProps) {
  const isCopied = copied === activeTab;

  return (
    <div className="flex items-center gap-2">
      {/* View mode toggle */}
      <div className="flex bg-dark-800 p-1 rounded-lg">
        {(["edit", "split", "preview"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={clsx(
              "px-4 py-2 rounded text-xs font-medium transition-all min-w-[44px] min-h-[44px] flex items-center justify-center",
              viewMode === mode
                ? "bg-dark-600 text-white"
                : "text-dark-400 hover:text-white",
            )}
            aria-label={`Switch to ${mode} mode`}
          >
            {mode === "edit" && "✏️"}
            {mode === "split" && "⚡"}
            {mode === "preview" && "👁️"}
          </button>
        ))}
      </div>

      <motion.button
        onClick={onCopy}
        disabled={!hasContent || !activeTab}
        className={clsx(
          "relative text-sm px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
          isCopied
            ? "bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/50"
            : "btn-ghost text-dark-300 hover:text-white hover:bg-dark-800/50",
        )}
        title="Copy to clipboard (Ctrl+C)"
        aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
        aria-live="polite"
        whileTap={hasContent && activeTab ? { scale: 0.95 } : undefined}
        animate={
          isCopied
            ? {
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                borderColor: "rgba(16, 185, 129, 0.5)",
              }
            : {
                backgroundColor: "transparent",
                borderColor: "transparent",
              }
        }
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isCopied ? (
            <motion.span
              key="copied"
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatedCheckmark />
              <span className="font-medium">Copied!</span>
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                initial={{ rotate: 0 }}
                whileHover={
                  hasContent && activeTab
                    ? { rotate: [-5, 5, -5, 0] }
                    : undefined
                }
                transition={{ duration: 0.5 }}
              >
                📋
              </motion.span>
              <span>Copy</span>
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCopied && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-accent-emerald"
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Export button */}
      <button
        onClick={onExport}
        disabled={!hasContent || isExporting}
        className="btn-secondary text-sm relative"
        aria-label="📦 Export .zip"
      >
        {isExporting ? (
          <>
            <span className="animate-spin mr-2">⚙️</span>
            Generating...
          </>
        ) : (
          <>📦 Export .zip</>
        )}
      </button>

      {/* New Project */}
      <button
        onClick={onNew}
        className="btn-ghost text-sm"
        title="Start new project"
        aria-label="Start new project"
      >
        🔄 New
      </button>
    </div>
  );
}
