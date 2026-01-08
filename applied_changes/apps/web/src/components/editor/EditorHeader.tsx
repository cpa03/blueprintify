import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import type { EditorTab } from "@blueprint/shared";

export type ViewMode = "edit" | "preview" | "split";

interface EditorHeaderProps {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onCopy: () => void;
  onExport: () => void;
  onNew: () => void;
  onRefine?: () => void;
  hasContent: boolean;
  copied: string | null;
  isProcessing?: boolean;
}

export function EditorHeader({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  onCopy,
  onExport,
  onNew,
  onRefine,
  hasContent,
  copied,
  isProcessing,
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-dark-700">
      <Tabs.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as EditorTab)}
      >
        <Tabs.List className="flex gap-1 bg-dark-800 p-1 rounded-lg">
          <Tabs.Trigger
            value="blueprint"
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === "blueprint"
                ? "bg-primary-500 text-white"
                : "text-dark-400 hover:text-white hover:bg-dark-700",
            )}
          >
            📘 blueprint.md
          </Tabs.Trigger>
          <Tabs.Trigger
            value="tasks"
            className={clsx(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === "tasks"
                ? "bg-primary-500 text-white"
                : "text-dark-400 hover:text-white hover:bg-dark-700",
            )}
          >
            📋 task.md
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

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
        >
          📦 Export .zip
        </button>

        {/* Refine Button */}
        <button
          onClick={onRefine}
          disabled={!hasContent || isProcessing}
          className="btn-secondary text-sm"
          title="Refine current content"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Refine
            </span>
          )}
        </button>

        {/* New Project */}
        <button
          onClick={onNew}
          disabled={isProcessing}
          className="btn-ghost text-sm"
          title="Start new project"
        >
          🔄 New
        </button>
      </div>
    </div>
  );
}
