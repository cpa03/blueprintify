/**
 * @fileoverview Empty state display for markdown preview when the active tab has no content.
 *
 * This component displays a helpful empty state when:
 * - The user switches to a tab (blueprint/tasks) that has no content yet
 * - Content exists on the other tab but not the currently viewed one
 *
 * @module components/PreviewEmptyState
 */

import { memo } from "react";
import { motion } from "framer-motion";
import type { EditorTab } from "@blueprint/shared";
import { EDITOR_FILENAMES, ANIMATION_ENTRANCE_DELAYS } from "@blueprint/shared";
import { staggerContainer, fadeInUp, floatingAnimation } from "../utils/motion";
import {
  EMPTY_STATE_CONFIG,
  SPRING_CONFIG,
  UI_CONTENT,
  EDITOR_TABS,
  EDITOR_LABELS,
  ANIMATION,
  PREVIEW_EMPTY_LABELS,
} from "../config/constants";

interface PreviewEmptyStateProps {
  /** The active editor tab that is empty */
  tab: EditorTab;
  /** Whether content is being generated */
  isGenerating?: boolean;
  /** Whether the other tab has content */
  siblingTabHasContent?: boolean;
  /** Callback to switch to the sibling tab (when sibling tab has content) */
  onSwitchTab?: () => void;
}

const tabLabels: Record<EditorTab, string> = {
  [EDITOR_TABS.BLUEPRINT]: EDITOR_FILENAMES.BLUEPRINT,
  [EDITOR_TABS.TASKS]: EDITOR_FILENAMES.TASKS,
};

const tabEmojis: Record<EditorTab, string> = {
  [EDITOR_TABS.BLUEPRINT]: "📘",
  [EDITOR_TABS.TASKS]: "📋",
};

export const PreviewEmptyState = memo(function PreviewEmptyState({
  tab,
  isGenerating = false,
  siblingTabHasContent = false,
  onSwitchTab,
}: PreviewEmptyStateProps): JSX.Element {
  const content =
    tab === EDITOR_TABS.BLUEPRINT
      ? UI_CONTENT.PREVIEW_EMPTY.BLUEPRINT
      : UI_CONTENT.PREVIEW_EMPTY.TASKS;
  const label = tabLabels[tab];

  return (
    <motion.div
      className="h-full flex flex-col items-center justify-center text-dark-500 p-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="relative mb-6" variants={fadeInUp}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-purple/10 to-accent-pink/10 blur-2xl"
          style={{
            width: EMPTY_STATE_CONFIG.PREVIEW_GLOW.WIDTH_PX,
            height: EMPTY_STATE_CONFIG.PREVIEW_GLOW.HEIGHT_PX,
            marginLeft: EMPTY_STATE_CONFIG.PREVIEW_GLOW.MARGIN_LEFT_PX,
            marginTop: EMPTY_STATE_CONFIG.PREVIEW_GLOW.MARGIN_TOP_PX,
          }}
        />

        <div className="relative">
          <motion.div
            className="w-20 h-24 glass-card rounded-lg border border-dashed border-dark-500 flex flex-col items-center justify-center"
            animate={floatingAnimation}
          >
            <motion.span
              className="text-3xl mb-1"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: ANIMATION.SLOW_PULSE, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              {tabEmojis[tab]}
            </motion.span>
            <span className="text-2xs text-dark-500 font-mono">{label}</span>
          </motion.div>

          {siblingTabHasContent && !isGenerating && (
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: ANIMATION_ENTRANCE_DELAYS.SLOWEST,
                type: "spring",
                ...SPRING_CONFIG.SMOOTH,
              }}
              aria-hidden="true"
            >
              <svg
                className="w-3.5 h-3.5 text-accent-emerald"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.h3 className="text-lg font-semibold text-white mb-2 text-center" variants={fadeInUp}>
        {content.TITLE}
      </motion.h3>

      <motion.p
        className="text-dark-400 text-sm text-center max-w-xs leading-relaxed"
        variants={fadeInUp}
      >
        {isGenerating ? (
          <>
            <motion.span
              className="inline-block"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: ANIMATION.FLOAT, repeat: Infinity, ease: "easeInOut" }}
            >
              ⏳
            </motion.span>{" "}
            {tab === EDITOR_TABS.TASKS
              ? UI_CONTENT.PREVIEW_EMPTY.GENERATING_TASKS
              : UI_CONTENT.PREVIEW_EMPTY.GENERATING_BLUEPRINT}
          </>
        ) : siblingTabHasContent ? (
          <>
            <motion.button
              onClick={onSwitchTab}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                ...SPRING_CONFIG.SNAPPY,
                delay: ANIMATION_ENTRANCE_DELAYS.MODERATE,
              }}
              className="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 rounded px-1 -mx-1"
              aria-label={`Switch to ${tab === EDITOR_TABS.BLUEPRINT ? EDITOR_TABS.TASKS : EDITOR_TABS.BLUEPRINT} tab`}
            >
              <span aria-hidden="true">←</span>
              Switch to{" "}
              <strong>
                {tab === EDITOR_TABS.BLUEPRINT ? (
                  <>
                    <span aria-hidden="true">{tabEmojis[EDITOR_TABS.TASKS]}</span>{" "}
                    {tabLabels[EDITOR_TABS.TASKS]}
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">{tabEmojis[EDITOR_TABS.BLUEPRINT]}</span>{" "}
                    {tabLabels[EDITOR_TABS.BLUEPRINT]}
                  </>
                )}
              </strong>{" "}
              tab
            </motion.button>
          </>
        ) : (
          content.HINT
        )}
      </motion.p>

      {!isGenerating && (
        <motion.div
          className="mt-6 flex items-center gap-3 text-xs text-dark-500"
          variants={fadeInUp}
        >
          {siblingTabHasContent ? (
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: ANIMATION_ENTRANCE_DELAYS.HALF_SECOND,
                type: "spring",
                ...SPRING_CONFIG.SNAPPY,
              }}
            >
              <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-2xs font-mono text-dark-300 border border-dark-600/50 leading-none">
                ←
              </kbd>
              <span className="text-dark-500">/</span>
              <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-2xs font-mono text-dark-300 border border-dark-600/50 leading-none">
                →
              </kbd>
              <span>{EDITOR_LABELS.TAB_NAVIGATION.SWITCH_TABS}</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700"
              whileHover={{ scale: 1.02 }}
            >
              <span>💡</span>
              <span>
                {tab === EDITOR_TABS.BLUEPRINT
                  ? PREVIEW_EMPTY_LABELS.START
                  : PREVIEW_EMPTY_LABELS.COMPLETE}{" "}
                the wizard to generate{" "}
                {tab === EDITOR_TABS.BLUEPRINT ? EDITOR_TABS.BLUEPRINT : EDITOR_TABS.TASKS}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
});
