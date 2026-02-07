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
  isDirty?: boolean;
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
  isDirty = false,
}: EditorToolbarProps) {
  const handleNew = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to start a new project?",
      );
      if (confirmed) {
        onNew();
      }
    } else {
      onNew();
    }
  };
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
        disabled={!hasContent}
        className="btn-secondary text-sm"
        aria-label="Export as zip file"
      >
        📦 Export .zip
      </button>

      {/* New Project */}
      <button
        onClick={handleNew}
        className="btn-ghost text-sm"
        title={
          isDirty ? "Start new project (unsaved changes)" : "Start new project"
        }
        aria-label={
          isDirty
            ? "Start new project - you have unsaved changes"
            : "Start new project"
        }
      >
        🔄 New
      </button>
    </div>
  );
}
