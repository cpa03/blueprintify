/**
 * Editor Toolbar Component
 *
 * Provides toolbar actions for the split-pane editor including:
 * view mode switching (edit/preview/split), copy to clipboard,
 * export as ZIP, and new project creation.
 *
 * @module components/editor/EditorToolbar
 * @see {@link EditorTab} - Tab types (blueprint/tasks)
 * @see {@link ViewMode} - View mode types
 *
 * @example
 * ```tsx
 * <EditorToolbar
 *   activeTab="blueprint"
 *   viewMode="split"
 *   setViewMode={(mode) => {}}
 *   onCopy={() => {}}
 *   onExport={() => {}}
 *   onNew={() => {}}
 *   hasContent={true}
 *   copied={null}
 * />
 * ```
 */

import React from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import type { EditorTab } from "@blueprint/shared";
import {
  VIEW_MODES as SHARED_VIEW_MODES,
  TOOLTIP_LABELS,
  SHORTCUT_LABELS,
  VIEW_MODE_INDICATOR_POSITION,
} from "@blueprint/shared";
import { SmartTooltip as Tooltip } from "../SmartTooltip";
import { Icon } from "../Icon";
import { AnimatedCopyButton } from "../AnimatedCopyButton";
import {
  SPRING_CONFIG,
  EDITOR_LABELS,
  ANIMATION,
  VIEW_MODE_SHORTCUT_KEYS,
  VIEW_MODE_MODIFIER,
} from "../../config/constants";
import { COLORS, EDITOR_ANIMATION, Z_INDEX } from "../../config/theme";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";
import { getAriaShortcutKey } from "../../lib/platform";

export type ViewMode = (typeof SHARED_VIEW_MODES)[keyof typeof SHARED_VIEW_MODES];

const VIEW_MODES: ViewMode[] = [
  SHARED_VIEW_MODES.EDIT,
  SHARED_VIEW_MODES.SPLIT,
  SHARED_VIEW_MODES.PREVIEW,
];

function computeNextViewIndex(
  e: React.KeyboardEvent,
  modes: readonly ViewMode[],
  currentMode: ViewMode
): number | null {
  const currentIndex = modes.indexOf(currentMode);
  switch (e.key) {
    case "ArrowRight":
      e.preventDefault();
      return (currentIndex + 1) % modes.length;
    case "ArrowLeft":
      e.preventDefault();
      return (currentIndex - 1 + modes.length) % modes.length;
    case "Home":
      e.preventDefault();
      return 0;
    case "End":
      e.preventDefault();
      return modes.length - 1;
    default:
      return null;
  }
}

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
  exportSuccess?: boolean;
}

function EditorToolbarComponent({
  activeTab,
  viewMode,
  setViewMode,
  onCopy,
  onExport,
  onNew,
  hasContent,
  copied,
  isExporting = false,
  exportSuccess = false,
}: EditorToolbarProps) {
  const isCopied = copied === activeTab;

  const viewModeShortcuts: Record<ViewMode, string> = {
    edit: EDITOR_LABELS.VIEW_MODE_SHORTCUTS.EDIT,
    split: EDITOR_LABELS.VIEW_MODE_SHORTCUTS.SPLIT,
    preview: EDITOR_LABELS.VIEW_MODE_SHORTCUTS.PREVIEW,
  };

  const viewModeLabels: Record<ViewMode, string> = {
    edit: EDITOR_LABELS.VIEW_MODES.EDIT,
    split: EDITOR_LABELS.VIEW_MODES.SPLIT,
    preview: EDITOR_LABELS.VIEW_MODES.PREVIEW,
  };

  const handleViewModeKeyDown = (e: React.KeyboardEvent): void => {
    const nextIndex = computeNextViewIndex(e, VIEW_MODES, viewMode);
    if (nextIndex === null) return;
    const nextMode = VIEW_MODES[nextIndex];
    if (nextMode) {
      setViewMode(nextMode);
      const nextButton = document.querySelector<HTMLButtonElement>(
        `[data-view-mode="${nextMode}"]`
      );
      nextButton?.focus();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex bg-dark-800 p-1 rounded-lg relative"
        role="radiogroup"
        aria-label={EDITOR_LABELS.VIEW_MODES_ARIA_LABEL}
        onKeyDown={handleViewModeKeyDown}
      >
        {VIEW_MODES.map((mode) => (
          <Tooltip
            key={mode}
            content={
              <div className="flex items-center gap-2">
                <span>{viewModeLabels[mode]} view</span>
                <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
                  {viewModeShortcuts[mode]}
                </kbd>
              </div>
            }
            position="bottom"
            delay={400}
          >
            <button
              onClick={() => setViewMode(mode)}
              data-view-mode={mode}
              role="radio"
              aria-checked={viewMode === mode}
              className={clsx(
                "px-4 py-2 rounded text-xs font-medium transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center relative z-10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950",
                viewMode === mode ? "text-white" : "text-dark-400 hover:text-white"
              )}
              aria-label={ACCESSIBILITY_LABELS.EDITOR.VIEW_MODE(
                viewModeLabels[mode],
                viewModeShortcuts[mode]
              )}
              aria-keyshortcuts={getAriaShortcutKey(
                VIEW_MODE_SHORTCUT_KEYS[mode as keyof typeof VIEW_MODE_SHORTCUT_KEYS],
                VIEW_MODE_MODIFIER
              )}
            >
              <span className="flex items-center gap-1.5">
                {mode === SHARED_VIEW_MODES.EDIT && (
                  <>
                    <Icon name="edit" className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </>
                )}
                {mode === SHARED_VIEW_MODES.SPLIT && (
                  <>
                    <Icon name="columns" className="w-4 h-4" />
                    <span className="hidden sm:inline">Split</span>
                  </>
                )}
                {mode === SHARED_VIEW_MODES.PREVIEW && (
                  <>
                    <Icon name="eye" className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </>
                )}
              </span>
            </button>
          </Tooltip>
        ))}
        <motion.div
          className="absolute top-1 bottom-1 bg-gradient-to-r from-primary-600 to-primary-500 rounded-md shadow-lg shadow-primary-500/20"
          layoutId="viewModeIndicator"
          initial={false}
          animate={{
            left:
              viewMode === SHARED_VIEW_MODES.EDIT
                ? VIEW_MODE_INDICATOR_POSITION.EDIT_LEFT
                : viewMode === SHARED_VIEW_MODES.SPLIT
                  ? VIEW_MODE_INDICATOR_POSITION.SPLIT_LEFT
                  : VIEW_MODE_INDICATOR_POSITION.PREVIEW_LEFT,
            width:
              viewMode === SHARED_VIEW_MODES.SPLIT
                ? VIEW_MODE_INDICATOR_POSITION.SPLIT_WIDTH
                : VIEW_MODE_INDICATOR_POSITION.SINGLE_WIDTH,
          }}
          transition={{
            type: "spring",
            ...EDITOR_ANIMATION.VIEW_MODE_INDICATOR,
          }}
          style={{
            zIndex: Z_INDEX.base,
          }}
        />
      </div>

      <Tooltip
        content={
          <div className="flex items-center gap-2">
            <span>
              {isCopied ? TOOLTIP_LABELS.EDITOR.COPIED : TOOLTIP_LABELS.EDITOR.COPY_TO_CLIPBOARD}
            </span>
            <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
              {SHORTCUT_LABELS.COPY}
            </kbd>
          </div>
        }
        position="bottom"
        delay={400}
      >
        <AnimatedCopyButton
          onCopy={onCopy}
          isCopied={isCopied}
          hasContent={hasContent && !!activeTab}
        />
      </Tooltip>

      {/* Export button */}
      <Tooltip
        content={
          <div className="flex items-center gap-2">
            <span>
              {exportSuccess ? TOOLTIP_LABELS.EDITOR.EXPORTED : TOOLTIP_LABELS.EDITOR.EXPORT_AS_ZIP}
            </span>
            <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
              {SHORTCUT_LABELS.EXPORT}
            </kbd>
          </div>
        }
        position="bottom"
        delay={400}
      >
        <button
          onClick={onExport}
          disabled={!hasContent || isExporting}
          className="btn-secondary text-sm relative overflow-hidden"
          aria-label={
            exportSuccess
              ? EDITOR_LABELS.BUTTONS.EXPORT_SUCCESS_ARIA
              : EDITOR_LABELS.BUTTONS.EXPORT_ARIA_LABEL
          }
        >
          <AnimatePresence mode="wait">
            {isExporting ? (
              <motion.span
                key="exporting"
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.svg
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: ANIMATION.GENTLE_PULSE,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="toolbar-export-spinner-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={COLORS.primary[500]} />
                      <stop offset="100%" stopColor={COLORS.accent.violet} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeOpacity={0.15}
                    fill="none"
                  />
                  <motion.circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="url(#toolbar-export-spinner-grad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 10}
                    strokeDashoffset={2 * Math.PI * 10 * 0.75}
                  />
                </motion.svg>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: ANIMATION.SPINNER_ROTATION + ANIMATION.NORMAL,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {EDITOR_LABELS.VIEW_MODES.GENERATING}
                </motion.span>
              </motion.span>
            ) : exportSuccess ? (
              <motion.span
                key="exported"
                className="flex items-center text-accent-emerald"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", ...SPRING_CONFIG.SNAPPY }}
              >
                <motion.svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", ...SPRING_CONFIG.CHECKMARK }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: ANIMATION.CHECKMARK_REVEAL, delay: 0.05 }}
                  />
                </motion.svg>
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {EDITOR_LABELS.VIEW_MODES.EXPORTED}
                </motion.span>
              </motion.span>
            ) : (
              <motion.span
                key="default"
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {EDITOR_LABELS.BUTTONS.EXPORT_ZIP}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </Tooltip>

      {/* New Project */}
      <Tooltip
        content={
          <div className="flex items-center gap-2">
            <span>{TOOLTIP_LABELS.EDITOR.START_NEW_PROJECT}</span>
            <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono text-dark-300">
              {SHORTCUT_LABELS.NEW_PROJECT}
            </kbd>
          </div>
        }
        position="bottom"
        delay={400}
      >
        <button
          onClick={onNew}
          className="btn-ghost text-sm flex items-center gap-1.5"
          aria-label={ACCESSIBILITY_LABELS.EDITOR.START_NEW_PROJECT}
        >
          <motion.svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            whileHover={{ rotate: 180 }}
            transition={{ type: "spring", ...SPRING_CONFIG.REFRESH }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </motion.svg>
          New
        </button>
      </Tooltip>
    </div>
  );
}

export const EditorToolbar = React.memo(EditorToolbarComponent);
