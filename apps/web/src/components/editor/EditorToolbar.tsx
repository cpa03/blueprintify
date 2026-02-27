/**
 * Editor Toolbar Component
 *
 * Provides toolbar actions for the split-pane editor including:
 * view mode switching (edit/preview/split), copy to clipboard,
 * export as ZIP, and new project creation.
 *
 * @module components/editor/EditorToolbar
 * @see {@link EditorTab} - Tab types (blueprint/tasks)
 * @see {@link ViewMode} - View mode types
 *
 * @example
 * ```tsx
 * <EditorToolbar
 *   activeTab="blueprint"
 *   viewMode="split"
 *   setViewMode={(mode) => {}}
 *   onCopy={() => {}}
 *   onExport={() => {}}
 *   onNew={() => {}}
 *   hasContent={true}
 *   copied={null}
 * />
 * ```
 */

import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { EditorTab } from "@blueprint/shared";
import { SmartTooltip as Tooltip } from "../SmartTooltip";
import { AnimatedCopyButton } from "../AnimatedCopyButton";

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

function EditorToolbarComponent({
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
      <div className="flex bg-dark-800 p-1 rounded-lg relative">
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
                "px-4 py-2 rounded text-xs font-medium transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center relative z-10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950",
                viewMode === mode
                  ? "text-white"
                  : "text-dark-400 hover:text-white",
              )}
              aria-label={`Switch to ${mode} mode (${viewModeShortcuts[mode]})`}
              aria-pressed={viewMode === mode}
            >
              <span className="flex items-center gap-1.5">
                {mode === "edit" && (
                  <>
                    <span>✏️</span>
                    <span className="hidden sm:inline">Edit</span>
                  </>
                )}
                {mode === "split" && (
                  <>
                    <span>⚡</span>
                    <span className="hidden sm:inline">Split</span>
                  </>
                )}
                {mode === "preview" && (
                  <>
                    <span>👁️</span>
                    <span className="hidden sm:inline">Preview</span>
                  </>
                )}
              </span>
            </button>
          </Tooltip>
        ))}
        <motion.div
          className="absolute top-1 bottom-1 bg-gradient-to-r from-primary-600 to-primary-500 rounded-md shadow-lg shadow-primary-500/20"
          layoutId="viewModeIndicator"
          initial={false}
          animate={{
            left:
              viewMode === "edit"
                ? "4px"
                : viewMode === "split"
                  ? "calc(33.33% + 2px)"
                  : "calc(66.67% - 0px)",
            width:
              viewMode === "split"
                ? "calc(33.33% - 2px)"
                : "calc(33.33% - 4px)",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          style={{
            zIndex: 0,
          }}
        />
      </div>

      <Tooltip
        content={
          <div className="flex items-center gap-2">
            <span>{isCopied ? "Copied!" : "Copy to clipboard"}</span>
            <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
              Ctrl+C
            </kbd>
          </div>
        }
        position="bottom"
        delay={400}
      >
        <AnimatedCopyButton
          onCopy={onCopy}
          isCopied={isCopied}
          hasContent={hasContent && !!activeTab}
        />
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
          aria-label="Export as ZIP"
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

export const EditorToolbar = React.memo(EditorToolbarComponent);
