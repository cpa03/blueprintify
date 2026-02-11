import type { EditorTab } from "@blueprint/shared";
import { EditorToolbar, type ViewMode } from "./EditorToolbar";
import clsx from "clsx";

interface EditorHeaderProps {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onCopy: () => void;
  onExport: () => void;
  onNew: () => void;
  hasContent: boolean;
  copied: string | null;
  isExporting?: boolean;
}

export type { ViewMode };

export function EditorHeader({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  onCopy,
  onExport,
  onNew,
  hasContent,
  copied,
  isExporting = false,
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-dark-700">
      <div
        className="flex gap-1 bg-dark-800 p-1 rounded-lg"
        role="tablist"
        aria-label="Document tabs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "blueprint"}
          id="tab-blueprint"
          onClick={() => setActiveTab("blueprint")}
          className={clsx(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "blueprint"
              ? "bg-primary-600 text-white"
              : "text-dark-200 hover:text-white hover:bg-dark-700",
          )}
        >
          📘 blueprint.md
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tasks"}
          id="tab-tasks"
          onClick={() => setActiveTab("tasks")}
          className={clsx(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            activeTab === "tasks"
              ? "bg-primary-600 text-white"
              : "text-dark-200 hover:text-white hover:bg-dark-700",
          )}
        >
          📋 task.md
        </button>
      </div>

      <EditorToolbar
        activeTab={activeTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onCopy={onCopy}
        onExport={onExport}
        onNew={onNew}
        hasContent={hasContent}
        copied={copied}
        isExporting={isExporting}
      />
    </div>
  );
}
