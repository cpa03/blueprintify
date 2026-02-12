import React from "react";
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

const TabButton = React.memo(function TabButton({
  id,
  isActive,
  onClick,
  hasContent,
  children,
}: {
  id: string;
  isActive: boolean;
  onClick: () => void;
  hasContent: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={hasContent ? `${id}-panel` : undefined}
      id={`tab-${id}`}
      onClick={onClick}
      className={clsx(
        "px-4 py-2 rounded-md text-sm font-medium transition-all",
        isActive
          ? "bg-primary-600 text-white"
          : "text-dark-200 hover:text-white hover:bg-dark-700",
      )}
    >
      {children}
    </button>
  );
});

export type { ViewMode };

function EditorHeaderComponent({
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
        id="editor-tabs"
      >
        <TabButton
          id="blueprint"
          isActive={activeTab === "blueprint"}
          onClick={() => setActiveTab("blueprint")}
          hasContent={hasContent}
        >
          📘 blueprint.md
        </TabButton>
        <TabButton
          id="tasks"
          isActive={activeTab === "tasks"}
          onClick={() => setActiveTab("tasks")}
          hasContent={hasContent}
        >
          📋 task.md
        </TabButton>
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

export const EditorHeader = React.memo(EditorHeaderComponent);
