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

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EditorTab } from "@blueprint/shared";
import { EDITOR_FILENAMES } from "@blueprint/shared";
import { EditorToolbar, type ViewMode } from "./EditorToolbar";
import { Icon } from "../Icon";
import { LastSavedIndicator } from "../LastSavedIndicator";
import { SPRING_CONFIG, EDITOR_LABELS, ANIMATION, EDITOR_TABS } from "../../config/constants";
import { EDITOR_ANIMATION, HEADER_ANIMATION, Z_INDEX } from "../../config/theme";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";
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
  /** Whether the blueprint tab has content (triggers indicator dot on the tab button) */
  blueprintHasContent?: boolean;
  /** Whether the tasks tab has content (triggers indicator dot on the tab button) */
  tasksHasContent?: boolean;
  copied: string | null;
  isExporting?: boolean;
  isGenerating?: boolean;
  exportSuccess?: boolean;
  lastSavedText?: string;
  hasChanges?: boolean;
  content?: string;
}

const TAB_IDS: EditorTab[] = [EDITOR_TABS.BLUEPRINT, EDITOR_TABS.TASKS];

const TabButton = React.memo(function TabButton({
  id,
  isActive,
  isGenerating,
  onClick,
  hasContent,
  contentAvailable = false,
  children,
}: {
  id: string;
  isActive: boolean;
  isGenerating?: boolean;
  onClick: () => void;
  hasContent: boolean;
  contentAvailable?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={hasContent ? `${id}-panel` : undefined}
      id={`tab-${id}`}
      onClick={onClick}
      tabIndex={isActive ? 0 : -1}
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
            ...EDITOR_ANIMATION.TAB_INDICATOR,
          }}
          style={{ zIndex: Z_INDEX.hide }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {children}
        {/* Content available dot — subtle green indicator on inactive tabs
            to help users discover content in the sibling tab. The breathing
            ring provides a gentle discovery cue without being distracting. */}
        {!isActive && contentAvailable && (
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            {/* Breathing ring — CSS-only pulse that starts after the spring
                entrance of the core dot settles (~0.6s delay in keyframes). */}
            <span
              className="absolute inset-0 rounded-full bg-accent-emerald content-dot-breathe"
              aria-hidden="true"
            />
            {/* Core dot with spring entrance */}
            <motion.span
              className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-emerald"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                ...EDITOR_ANIMATION.CONTENT_DOT,
              }}
              aria-label={ACCESSIBILITY_LABELS.EDITOR.CONTENT_AVAILABLE(
                id === EDITOR_TABS.BLUEPRINT
                  ? EDITOR_FILENAMES.BLUEPRINT_DISPLAY
                  : EDITOR_FILENAMES.TASKS_DISPLAY
              )}
            />
          </span>
        )}
        {isActive && isGenerating && (
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-accent-emerald flex-shrink-0"
            animate={{
              opacity: [1, 0.35, 1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: ANIMATION.LIVE_INDICATOR,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-label={ACCESSIBILITY_LABELS.EDITOR.STREAMING_CONTENT}
          />
        )}
      </span>
    </button>
  );
});

export type { ViewMode };

const ContentStats = React.memo(function ContentStats({
  content,
  isGenerating = false,
}: {
  content: string;
  isGenerating?: boolean;
}) {
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split("\n").length : 0;
  const rawReadingTime = wordCount / 200;
  const readingTimeDisplay =
    rawReadingTime < 1
      ? EDITOR_LABELS.CONTENT_STATS.LESS_THAN_ONE_MIN
      : `${Math.round(rawReadingTime)} ${EDITOR_LABELS.CONTENT_STATS.READING_TIME}`;
  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key="content-stats"
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            borderColor: isGenerating
              ? [...HEADER_ANIMATION.CONTENT_STATS.BORDER_COLORS]
              : HEADER_ANIMATION.CONTENT_STATS.BORDER_STATIC,
            boxShadow: isGenerating
              ? [...HEADER_ANIMATION.CONTENT_STATS.BOX_SHADOWS]
              : HEADER_ANIMATION.CONTENT_STATS.SHADOW_STATIC,
          }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={
            isGenerating
              ? {
                  borderColor: {
                    duration: ANIMATION.SLOW_PULSE,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  boxShadow: {
                    duration: ANIMATION.BREATH,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  opacity: { type: "spring", ...SPRING_CONFIG.SNAPPY },
                  y: { type: "spring", ...SPRING_CONFIG.SNAPPY },
                  scale: { type: "spring", ...SPRING_CONFIG.SNAPPY },
                }
              : {
                  type: "spring",
                  ...SPRING_CONFIG.SNAPPY,
                }
          }
          className="hidden md:flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-dark-400 bg-dark-800/50 px-2 py-1 rounded-md border"
        >
          <div className="flex items-center gap-1">
            <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.CHARS}</span>
            <motion.span
              key={charCount}
              className="tabular-nums text-primary-400"
              initial={{ opacity: 0.6, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION.QUICK_FADE, ease: "easeOut" }}
            >
              {charCount.toLocaleString()}
            </motion.span>
          </div>
          <div className="w-px h-2 bg-dark-700" />
          <div className="flex items-center gap-1">
            <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.WORDS}</span>
            <motion.span
              key={wordCount}
              className="tabular-nums text-secondary-400"
              initial={{ opacity: 0.6, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION.QUICK_FADE, ease: "easeOut" }}
            >
              {wordCount.toLocaleString()}
            </motion.span>
          </div>
          <div className="w-px h-2 bg-dark-700" />
          <div className="flex items-center gap-1">
            <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.LINES}</span>
            <motion.span
              key={lineCount}
              className="tabular-nums text-accent-emerald"
              initial={{ opacity: 0.6, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION.QUICK_FADE, ease: "easeOut" }}
            >
              {lineCount.toLocaleString()}
            </motion.span>
          </div>
          <div className="w-px h-2 bg-dark-700" />
          <div className="flex items-center gap-1">
            <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.READING_TIME}</span>
            <motion.span
              key={readingTimeDisplay}
              className="tabular-nums text-accent-cyan"
              initial={{ opacity: 0.6, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION.QUICK_FADE, ease: "easeOut" }}
            >
              {readingTimeDisplay}
            </motion.span>
          </div>
          {/* Keyboard shortcut discovery badge — a persistent yet subtle hint that
              `?` opens the shortcuts modal, ensuring users can always discover
              power-user workflows even after the initial hint glow fades from
              the header button. Shown alongside content stats since both are
              status/utility information about the current editor state. */}
          <div className="w-px h-2 bg-dark-700" />
          <motion.div
            key="shortcut-hint"
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: ANIMATION.QUICK_FADE, ease: "easeOut" }}
          >
            <kbd
              className="px-1 py-0.5 bg-dark-700 rounded text-[9px] font-mono text-dark-300 border border-dark-600/50 leading-none cursor-default"
              aria-hidden="true"
            >
              ?
            </kbd>
            <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.SHORTCUTS}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  blueprintHasContent = false,
  tasksHasContent = false,
  copied,
  isExporting = false,
  isGenerating = false,
  exportSuccess = false,
  lastSavedText = "",
  hasChanges = false,
  content = "",
}: EditorHeaderProps) {
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = TAB_IDS.indexOf(activeTab);
      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          nextIndex = (currentIndex + 1) % TAB_IDS.length;
          break;
        case "ArrowLeft":
          nextIndex = (currentIndex - 1 + TAB_IDS.length) % TAB_IDS.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = TAB_IDS.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const nextTab = TAB_IDS[nextIndex];
      if (nextTab) {
        setActiveTab(nextTab);
        const nextTabEl = document.getElementById(`tab-${nextTab}`);
        nextTabEl?.focus();
      }
    },
    [activeTab, setActiveTab]
  );

  return (
    <div className="flex items-center justify-between p-4 border-b border-dark-700">
      <div className="flex items-center gap-6">
        <div
          className="flex gap-1 bg-dark-800 p-1 rounded-lg"
          role="tablist"
          aria-label={ACCESSIBILITY_LABELS.EDITOR.DOCUMENT_TABS}
          id="editor-tabs"
          onKeyDown={handleTabKeyDown}
        >
          <TabButton
            id={EDITOR_TABS.BLUEPRINT}
            isActive={activeTab === EDITOR_TABS.BLUEPRINT}
            isGenerating={isGenerating}
            onClick={() => setActiveTab(EDITOR_TABS.BLUEPRINT)}
            hasContent={hasContent}
            contentAvailable={blueprintHasContent}
          >
            <Icon name="document" className="w-4 h-4 mr-1.5" />
            {EDITOR_FILENAMES.BLUEPRINT}
          </TabButton>
          <TabButton
            id={EDITOR_TABS.TASKS}
            isActive={activeTab === EDITOR_TABS.TASKS}
            isGenerating={isGenerating}
            onClick={() => setActiveTab(EDITOR_TABS.TASKS)}
            hasContent={hasContent}
            contentAvailable={tasksHasContent}
          >
            <Icon name="clipboard" className="w-4 h-4 mr-1.5" />
            {EDITOR_FILENAMES.TASKS}
          </TabButton>
        </div>
        <div className="flex items-center gap-3">
          <LastSavedIndicator
            text={lastSavedText}
            isVisible={hasContent && (!!lastSavedText || hasChanges)}
            hasChanges={hasChanges}
          />
          {hasContent && <ContentStats content={content} isGenerating={isGenerating} />}
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
        exportSuccess={exportSuccess}
      />
    </div>
  );
}

export const EditorHeader = React.memo(EditorHeaderComponent);
