import clsx from "clsx";
import type { EditorTab } from "@blueprint/shared";
import { type ZipGenerationProgress } from "../../lib/export";

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
  exportProgress?: ZipGenerationProgress | null;
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
  exportProgress = null,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* View mode toggle */}
      <div className="flex bg-dark-800 p-1 rounded-lg">
        {(["edit", "split", "preview"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={clsx(
              "px-3 py-1.5 rounded text-xs font-medium transition-all",
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

      {/* Copy button */}
      <button
        onClick={onCopy}
        disabled={!hasContent || !activeTab}
        className="btn-ghost text-sm"
        title="Copy to clipboard"
        aria-label="Copy to clipboard"
      >
        {copied === activeTab ? (
          <span className="text-accent-emerald">✓ Copied!</span>
        ) : (
          <span>📋 Copy</span>
        )}
      </button>

      {/* Export button */}
      <button
        onClick={onExport}
        disabled={!hasContent || isExporting}
        className={clsx(
          "btn-secondary text-sm relative",
          isExporting && "opacity-75 cursor-not-allowed",
        )}
        aria-label="Export as zip file"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            <span className="text-xs">
              {exportProgress ? `${exportProgress.progress}%` : "Exporting..."}
            </span>
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

      {isExporting && exportProgress && (
        <div className="flex items-center gap-2 text-xs text-dark-400">
          <span>{exportProgress.stage}</span>
          <div className="w-16 h-1 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${exportProgress.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
