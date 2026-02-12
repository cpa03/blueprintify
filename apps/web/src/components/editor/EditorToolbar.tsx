import React, { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import type { EditorTab } from "@blueprint/shared";
import { Tooltip } from "../Tooltip";

export type ViewMode = "edit" | "preview" | "split";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  emoji: string;
  distance: number;
}

function CopyParticles({ isActive }: { isActive: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [key, setKey] = useState(0);

  React.useEffect(() => {
    if (isActive) {
      const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: 0,
        y: 0,
        angle: (i / 8) * 360 + (Math.random() * 30 - 15),
        scale: 0.5 + Math.random() * 0.5,
        emoji: Math.random() > 0.5 ? "✨" : "✓",
        distance: 40 + Math.random() * 20,
      }));
      setParticles(newParticles);
      setKey((prev) => prev + 1);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {particles.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180;
        const endX = Math.cos(radians) * particle.distance;
        const endY = Math.sin(radians) * particle.distance;

        return (
          <motion.span
            key={`${key}-${particle.id}`}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: endX,
              y: endY,
              scale: particle.scale,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              opacity: { duration: 0.6, times: [0, 0.7, 1] },
            }}
            className="absolute pointer-events-none text-xs"
            style={{
              left: "50%",
              top: "50%",
              marginLeft: "-6px",
              marginTop: "-6px",
              color: particle.emoji === "✓" ? "#10b981" : "#fbbf24",
            }}
          >
            {particle.emoji}
          </motion.span>
        );
      })}
    </AnimatePresence>
  );
}

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

  const viewModeShortcuts: Record<ViewMode, string> = {
    edit: "Ctrl+1",
    split: "Ctrl+2",
    preview: "Ctrl+3",
  };

  const viewModeLabels: Record<ViewMode, string> = {
    edit: "Edit",
    split: "Split",
    preview: "Preview",
  };

  return (
    <div className="flex items-center gap-2">
      {/* View mode toggle */}
      <div className="flex bg-dark-800 p-1 rounded-lg">
        {(["edit", "split", "preview"] as const).map((mode) => (
          <Tooltip
            key={mode}
            content={
              <div className="flex items-center gap-2">
                <span>{viewModeLabels[mode]} view</span>
                <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
                  {viewModeShortcuts[mode]}
                </kbd>
              </div>
            }
            position="bottom"
            delay={400}
          >
            <button
              onClick={() => setViewMode(mode)}
              className={clsx(
                "px-4 py-2 rounded text-xs font-medium transition-all min-w-[44px] min-h-[44px] flex items-center justify-center",
                viewMode === mode
                  ? "bg-dark-600 text-white"
                  : "text-dark-400 hover:text-white",
              )}
              aria-label={`Switch to ${mode} mode (${viewModeShortcuts[mode]})`}
            >
              {mode === "edit" && "✏️"}
              {mode === "split" && "⚡"}
              {mode === "preview" && "👁️"}
            </button>
          </Tooltip>
        ))}
      </div>

      <Tooltip
        content={
          <div className="flex items-center gap-2">
            <span>Copy to clipboard</span>
            <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
              Ctrl+C
            </kbd>
          </div>
        }
        position="bottom"
        delay={400}
      >
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
          aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
          aria-live="polite"
          whileTap={hasContent && activeTab ? { scale: 0.92 } : undefined}
          animate={isCopied ? { scale: [1, 1.08, 1] } : {}}
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

          <CopyParticles isActive={isCopied} />
        </motion.button>
      </Tooltip>

      {/* Export button */}
      <Tooltip
        content={
          <div className="flex items-center gap-2">
            <span>Export as ZIP</span>
            <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
              Ctrl+E
            </kbd>
          </div>
        }
        position="bottom"
        delay={400}
      >
        <button
          onClick={onExport}
          disabled={!hasContent || isExporting}
          className="btn-secondary text-sm relative"
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
      </Tooltip>

      {/* New Project */}
      <Tooltip
        content={
          <div className="flex items-center gap-2">
            <span>Start new project</span>
            <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
              Ctrl+N
            </kbd>
          </div>
        }
        position="bottom"
        delay={400}
      >
        <button
          onClick={onNew}
          className="btn-ghost text-sm"
          aria-label="Start new project"
        >
          🔄 New
        </button>
      </Tooltip>
    </div>
  );
}
