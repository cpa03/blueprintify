import React from "react";
import clsx from "clsx";
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
