/**
 * Editor Header Component
 *
 * Header component for the split-pane editor that contains:
 * tab switching (blueprint/tasks), toolbar actions, and save status.
 *
 * @module components/editor/EditorHeader
 * @see {@link EditorTab} - Tab types
 * @see {@link ViewMode} - View mode types
 * @see {@link EditorToolbar} - Toolbar component
 *
 * @example
 * ```tsx
 * <EditorHeader
 *   activeTab="blueprint"
 *   setActiveTab={(tab) => {}}
 *   viewMode="split"
 *   setViewMode={(mode) => {}}
 *   onCopy={() => {}}
 *   onExport={() => {}}
 *   onNew={() => {}}
 *   hasContent={true}
 *   copied={null}
 *   lastSavedText="Saved 2 min ago"
 * />
 * ```
 */

import React from "react";
import { motion } from "framer-motion";
import type { EditorTab } from "@blueprint/shared";
import { EditorToolbar, type ViewMode } from "./EditorToolbar";
import { LastSavedIndicator } from "../LastSavedIndicator";
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
  lastSavedText?: string;
  hasChanges?: boolean;
  content?: string;
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
        "relative px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950",
        isActive ? "text-white" : "text-dark-200 hover:text-white"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute inset-0 bg-primary-600 rounded-md"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          style={{ zIndex: -1 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
});

export type { ViewMode };

const ContentStats = React.memo(function ContentStats({ content }: { content: string }) {
  if (!content) return null;
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  return (
    <div className="hidden md:flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-dark-400 bg-dark-800/50 px-2 py-1 rounded-md border border-dark-700/50">
      <div className="flex items-center gap-1">
        <span className="text-dark-500">Chars</span>
        <span className="text-primary-400">{charCount.toLocaleString()}</span>
      </div>
      <div className="w-px h-2 bg-dark-700" />
      <div className="flex items-center gap-1">
        <span className="text-dark-500">Words</span>
        <span className="text-secondary-400">{wordCount.toLocaleString()}</span>
      </div>
    </div>
  );
});

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
  lastSavedText = "",
  hasChanges = false,
  content = "",
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-dark-700">
      <div className="flex items-center gap-6">
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
        <div className="flex items-center gap-3">
          <LastSavedIndicator
            text={lastSavedText}
            isVisible={hasContent && (!!lastSavedText || hasChanges)}
            hasChanges={hasChanges}
          />
          {hasContent && <ContentStats content={content} />}
        </div>
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
