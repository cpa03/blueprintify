import clsx from "clsx";
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
