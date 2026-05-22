/**
 * @fileoverview Empty state display for markdown preview when the active tab has no content.
 *
 * This component displays a helpful empty state when:
 * - The user switches to a tab (blueprint/tasks) that has no content yet
 * - Content exists on the other tab but not the currently viewed one
 *
 * @module components/PreviewEmptyState
 */

import { motion } from "framer-motion";
import type { EditorTab } from "@blueprint/shared";
import { staggerContainer, fadeInUp, floatingAnimation } from "../utils/motion";

interface PreviewEmptyStateProps {
  /** The active editor tab that is empty */
  tab: EditorTab;
  /** Whether content is being generated */
  isGenerating?: boolean;
  /** Whether the other tab has content */
  siblingTabHasContent?: boolean;
}

const tabLabels: Record<EditorTab, string> = {
  blueprint: "blueprint.md",
  tasks: "task.md",
};

const tabEmojis: Record<EditorTab, string> = {
  blueprint: "📘",
  tasks: "📋",
};

const tabContent: Record<EditorTab, { title: string; hint: string }> = {
  blueprint: {
    title: "Blueprint not yet generated",
    hint: "Complete the wizard and generate your blueprint to see architectural documentation here.",
  },
  tasks: {
    title: "Tasks not yet generated",
    hint: "Tasks are generated automatically after the blueprint is complete. They'll appear here once ready.",
  },
};

export function PreviewEmptyState({
  tab,
  isGenerating = false,
  siblingTabHasContent = false,
}: PreviewEmptyStateProps): JSX.Element {
  const content = tabContent[tab];
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
          style={{ width: 160, height: 160, marginLeft: -80, marginTop: -40 }}
        />

        <div className="relative">
          <motion.div
            className="w-20 h-24 glass-card rounded-lg border border-dashed border-dark-500 flex flex-col items-center justify-center"
            animate={floatingAnimation}
          >
            <motion.span
              className="text-3xl mb-1"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            >
              {tabEmojis[tab]}
            </motion.span>
            <span className="text-[10px] text-dark-500 font-mono">{label}</span>
          </motion.div>

          {siblingTabHasContent && !isGenerating && (
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-emerald/20 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 20 }}
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
        {content.title}
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
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ⏳
            </motion.span>{" "}
            {tab === "tasks"
              ? "Blueprint generation in progress — tasks will follow once the blueprint is complete."
              : "Content is being generated and will appear here shortly."}
          </>
        ) : siblingTabHasContent ? (
          <>
            Switch to the{" "}
            <strong className="text-primary-400">
              {tab === "blueprint" ? "📘 blueprint" : "📋 tasks"}
            </strong>{" "}
            tab to view generated content.
          </>
        ) : (
          content.hint
        )}
      </motion.p>

      {!isGenerating && (
        <motion.div
          className="mt-6 flex items-center gap-3 text-xs text-dark-500"
          variants={fadeInUp}
        >
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700"
            whileHover={{ scale: 1.02 }}
          >
            <span>💡</span>
            <span>
              {tab === "blueprint" ? "Start" : "Complete"} the wizard to generate{" "}
              {tab === "blueprint" ? "blueprint" : "tasks"}
            </span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default PreviewEmptyState;
