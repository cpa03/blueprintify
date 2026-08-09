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
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import type { EditorTab } from "@blueprint/shared/types";
import {
  ARIA_KEYSHORTCUTS,
  EDITOR_FILENAMES,
  FRAMER_TYPE,
  KEYBOARD_EVENT_KEYS,
  MODIFIER_KEYS,
} from "@blueprint/shared/config";
import { EditorToolbar, type ViewMode } from "./EditorToolbar";
import { Icon } from "../Icon";
import { LastSavedIndicator } from "../LastSavedIndicator";
import { KeyboardShortcutTooltip } from "../SmartTooltip";
import {
  SPRING_CONFIG,
  EDITOR_LABELS,
  ANIMATION,
  ANIMATION_REPEAT,
  EASING,
  EDITOR_TABS,
  OPACITY_PULSE,
  SCALE_PULSE,
  OPACITY,
  ENTRANCE_OFFSETS,
} from "../../config/constants";
import { COLORS, EDITOR_ANIMATION, HEADER_ANIMATION, Z_INDEX } from "../../config/theme";
import { ACCESSIBILITY_LABELS } from "../../config/constants/content";
import clsx from "clsx";

const STAT_COLORS = {
  CHAR_BASE: COLORS.primary[400],
  WORD_BASE: COLORS.dark[400],
  LINE_BASE: COLORS.accent.emerald,
  READING_BASE: COLORS.accent.cyan,
  FLASH_GREEN: COLORS.celebration.emeraldLight,
} as const;

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
          animate={
            isGenerating
              ? { boxShadow: [...HEADER_ANIMATION.TAB_GLOW.BOX_SHADOWS] }
              : { boxShadow: "none" }
          }
          transition={
            isGenerating
              ? {
                  type: FRAMER_TYPE.SPRING,
                  ...EDITOR_ANIMATION.TAB_INDICATOR,
                  boxShadow: {
                    duration: ANIMATION.SLOW_PULSE,
                    repeat: Infinity,
                    ease: EASING.easeInOut,
                  },
                }
              : {
                  type: FRAMER_TYPE.SPRING,
                  ...EDITOR_ANIMATION.TAB_INDICATOR,
                }
          }
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
            {/* Core dot with spring entrance. role="status" makes the
                sibling-tab content-availability cue audible: the green dot is
                decorative to sighted users, but without a live region the
                aria-label on a plain span is never announced by screen
                readers, so keyboard-only users had no way to discover content
                in the inactive tab. Mirrors the polite live-region pattern
                used by the wizard step-loading announcement (#3185). */}
            <motion.span
              className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-emerald"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: FRAMER_TYPE.SPRING,
                ...EDITOR_ANIMATION.CONTENT_DOT,
              }}
              role="status"
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
              opacity: OPACITY_PULSE.BREATHING,
              scale: SCALE_PULSE.CONTENT_DOT,
            }}
            transition={{
              duration: ANIMATION.LIVE_INDICATOR,
              repeat: Infinity,
              ease: EASING.easeInOut,
            }}
            role="status"
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
  const rawReadingTime = wordCount / EDITOR_LABELS.CONTENT_STATS.READING_SPEED_WPM;
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
                    ease: EASING.easeInOut,
                  },
                  boxShadow: {
                    duration: ANIMATION.BREATH,
                    repeat: Infinity,
                    ease: EASING.easeInOut,
                  },
                  opacity: { type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY },
                  y: { type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY },
                  scale: { type: FRAMER_TYPE.SPRING, ...SPRING_CONFIG.SNAPPY },
                }
              : {
                  type: FRAMER_TYPE.SPRING,
                  ...SPRING_CONFIG.SNAPPY,
                }
          }
          className="hidden md:flex items-center gap-3 text-2xs uppercase tracking-wider font-bold text-dark-400 bg-dark-800/50 px-2 py-1 rounded-md border"
        >
          {/* Char count — staggers in first */}
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: ANIMATION.QUICK_FADE,
              ease: EASING.easeOut,
              delay: ANIMATION.STAGGER * 0,
            }}
            className="flex items-center gap-3"
          >
            <span className="flex items-center gap-1">
              <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.CHARS}</span>
              <motion.span
                key={charCount}
                className="tabular-nums"
                initial={{
                  opacity: OPACITY[60],
                  y: ENTRANCE_OFFSETS.STAT_ENTRY_Y_PX,
                  color: isGenerating ? STAT_COLORS.FLASH_GREEN : STAT_COLORS.CHAR_BASE,
                }}
                animate={{ opacity: 1, y: 0, color: STAT_COLORS.CHAR_BASE }}
                transition={{ duration: ANIMATION.QUICK_FADE, ease: EASING.easeOut }}
              >
                {charCount.toLocaleString()}
              </motion.span>
            </span>
            <span className="w-px h-2 bg-dark-700" aria-hidden="true" />
          </motion.span>

          {/* Word count — staggers in second */}
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: ANIMATION.QUICK_FADE,
              ease: EASING.easeOut,
              delay: ANIMATION.STAGGER,
            }}
            className="flex items-center gap-3"
          >
            <span className="flex items-center gap-1">
              <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.WORDS}</span>
              <motion.span
                key={wordCount}
                className="tabular-nums"
                initial={{
                  opacity: OPACITY[60],
                  y: ENTRANCE_OFFSETS.STAT_ENTRY_Y_PX,
                  color: isGenerating ? STAT_COLORS.FLASH_GREEN : STAT_COLORS.WORD_BASE,
                }}
                animate={{ opacity: 1, y: 0, color: STAT_COLORS.WORD_BASE }}
                transition={{ duration: ANIMATION.QUICK_FADE, ease: EASING.easeOut }}
              >
                {wordCount.toLocaleString()}
              </motion.span>
            </span>
            <span className="w-px h-2 bg-dark-700" aria-hidden="true" />
          </motion.span>

          {/* Line count — staggers in third */}
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: ANIMATION.QUICK_FADE,
              ease: EASING.easeOut,
              delay: ANIMATION.STAGGER * 2,
            }}
            className="flex items-center gap-3"
          >
            <span className="flex items-center gap-1">
              <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.LINES}</span>
              <motion.span
                key={lineCount}
                className="tabular-nums"
                initial={{
                  opacity: OPACITY[60],
                  y: ENTRANCE_OFFSETS.STAT_ENTRY_Y_PX,
                  color: isGenerating ? STAT_COLORS.FLASH_GREEN : STAT_COLORS.LINE_BASE,
                }}
                animate={{ opacity: 1, y: 0, color: STAT_COLORS.LINE_BASE }}
                transition={{ duration: ANIMATION.QUICK_FADE, ease: EASING.easeOut }}
              >
                {lineCount.toLocaleString()}
              </motion.span>
            </span>
            <span className="w-px h-2 bg-dark-700" aria-hidden="true" />
          </motion.span>

          {/* Reading time — staggers in fourth */}
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: ANIMATION.QUICK_FADE,
              ease: EASING.easeOut,
              delay: ANIMATION.STAGGER * 3,
            }}
            className="flex items-center gap-3"
          >
            <span className="flex items-center gap-1">
              <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.READING_TIME}</span>
              <motion.span
                key={readingTimeDisplay}
                className="tabular-nums text-accent-cyan"
                initial={{ opacity: OPACITY[60], y: ENTRANCE_OFFSETS.STAT_ENTRY_Y_PX }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: ANIMATION.QUICK_FADE, ease: EASING.easeOut }}
              >
                {readingTimeDisplay}
              </motion.span>
            </span>
            <span className="w-px h-2 bg-dark-700" aria-hidden="true" />
          </motion.span>

          {/* Tab navigation keyboard hint — staggers in fifth */}
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: ANIMATION.QUICK_FADE,
              ease: EASING.easeOut,
              delay: ANIMATION.STAGGER * 4,
            }}
            className="flex items-center gap-3"
          >
            <motion.div
              key="tab-nav-hint"
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: ANIMATION.QUICK_FADE, ease: EASING.easeOut }}
            >
              <kbd
                className="px-1 py-0.5 bg-dark-700 rounded text-3xs font-mono text-dark-300 border border-dark-600/50 leading-none cursor-default"
                aria-hidden="true"
              >
                ←
              </kbd>
              <span className="text-dark-500 text-3xs">/</span>
              <kbd
                className="px-1 py-0.5 bg-dark-700 rounded text-3xs font-mono text-dark-300 border border-dark-600/50 leading-none cursor-default"
                aria-hidden="true"
              >
                →
              </kbd>
              <span className="text-dark-500">{EDITOR_LABELS.TAB_NAVIGATION.SWITCH_TABS}</span>
            </motion.div>
            <span className="w-px h-2 bg-dark-700" aria-hidden="true" />
          </motion.span>

          {/* Shortcut hint badge — staggers in sixth */}
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: ANIMATION.QUICK_FADE,
              ease: EASING.easeOut,
              delay: ANIMATION.STAGGER * 5,
            }}
            className="flex items-center gap-3"
          >
            <motion.div
              key="shortcut-hint"
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: ANIMATION.QUICK_FADE, ease: EASING.easeOut }}
            >
              {/* The inner motion.span adds a gentle limited-repeat attention pulse
                  on mount, subtly drawing the eye to the `?` shortcut badge for the
                  first ~3 seconds so users discover keyboard shortcuts. The pulse
                  is very subtle (3% scale, 10% opacity shift) and stops after 5
                  repeats so it never becomes distracting. */}
              <motion.span
                className="flex items-center gap-1"
                animate={{
                  scale: SCALE_PULSE.ATTENTION,
                  opacity: OPACITY_PULSE.ATTENTION,
                }}
                transition={{
                  duration: ANIMATION.ATTENTION_PULSE,
                  repeat: ANIMATION_REPEAT.ATTENTION_PULSE,
                  ease: EASING.easeInOut,
                }}
              >
                <kbd
                  className="px-1 py-0.5 bg-dark-700 rounded text-3xs font-mono text-dark-300 border border-dark-600/50 leading-none cursor-default"
                  aria-hidden="true"
                >
                  ?
                </kbd>
                <span className="text-dark-500">{EDITOR_LABELS.CONTENT_STATS.SHORTCUTS}</span>
              </motion.span>
            </motion.div>
          </motion.span>
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
        case KEYBOARD_EVENT_KEYS.ARROW_RIGHT:
          nextIndex = (currentIndex + 1) % TAB_IDS.length;
          break;
        case KEYBOARD_EVENT_KEYS.ARROW_LEFT:
          nextIndex = (currentIndex - 1 + TAB_IDS.length) % TAB_IDS.length;
          break;
        case KEYBOARD_EVENT_KEYS.HOME:
          nextIndex = 0;
          break;
        case KEYBOARD_EVENT_KEYS.END:
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
          aria-keyshortcuts={ARIA_KEYSHORTCUTS.EDITOR_TABS}
          id="editor-tabs"
          onKeyDown={handleTabKeyDown}
        >
          <KeyboardShortcutTooltip
            shortcut={KEYBOARD_EVENT_KEYS.ARROW_LEFT}
            description={EDITOR_LABELS.TAB_NAVIGATION.PREVIOUS}
            position="bottom"
            modifier={MODIFIER_KEYS.NONE}
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
          </KeyboardShortcutTooltip>
          <KeyboardShortcutTooltip
            shortcut={KEYBOARD_EVENT_KEYS.ARROW_RIGHT}
            description={EDITOR_LABELS.TAB_NAVIGATION.NEXT}
            position="bottom"
            modifier={MODIFIER_KEYS.NONE}
          >
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
          </KeyboardShortcutTooltip>
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
