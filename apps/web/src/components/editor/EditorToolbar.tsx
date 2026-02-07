import clsx from "clsx";
import type { EditorTab } from "@blueprint/shared";
import { useRef } from "react";

export type ViewMode = "edit" | "preview" | "split";

interface EditorToolbarProps {
  activeTab: EditorTab;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onCopy: () => void;
  onExport: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onNew: () => void;
  hasContent: boolean;
  copied: string | null;
}

export function EditorToolbar({
  activeTab,
  viewMode,
  setViewMode,
  onCopy,
  onExport,
  onExportJSON,
  onImportJSON,
  onNew,
  hasContent,
  copied,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportJSON(file);
    }
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

      {/* JSON Export button */}
      <button
        onClick={onExportJSON}
        className="btn-ghost text-sm"
        title="Export blueprint as JSON"
        aria-label="Export blueprint as JSON"
      >
        📄 Export .json
      </button>

      {/* JSON Import button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn-ghost text-sm"
        title="Import blueprint from JSON"
        aria-label="Import blueprint from JSON"
      >
        📂 Import .json
      </button>

      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Import blueprint file"
      />

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
