import * as Tabs from "@radix-ui/react-tabs";
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

      <EditorToolbar
        activeTab={activeTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onCopy={onCopy}
        onExport={onExport}
        onNew={onNew}
        hasContent={hasContent}
        copied={copied}
      />
    </div>
  );
}
