/**
 * @fileoverview Modal dialog displaying available keyboard shortcuts.
 *
 * This component provides:
 * - Modal overlay with keyboard shortcut reference
 * - Platform-aware shortcut display (Mac vs Windows/Linux)
 * - Category-based organization (general, editor, navigation, generation)
 * - Focus trap for accessibility
 * - Escape key to close
 *
 * @module components/KeyboardShortcutsModal
 */

import { useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KEYBOARD_SHORTCUTS,
  SHORTCUT_CATEGORIES,
  SHORTCUT_CATEGORY_LABELS,
  SHORTCUT_CATEGORY_ICONS,
  WIZARD_STEPS,
  EDITOR_LABELS,
  SPRING_CONFIG,
  ANIMATION,
} from "../config/constants";
import { useFocusTrap } from "../hooks";
import { Icon, type IconName } from "./Icon";
import { getModifierLabel, getAltKeyLabel } from "../lib/platform";

/**
 * Props for the KeyboardShortcutsModal component.
 */

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: (typeof SHORTCUT_CATEGORIES)[keyof typeof SHORTCUT_CATEGORIES];
}

const getShortcutItems = (): ShortcutItem[] => {
  const modifier = getModifierLabel();
  const altKey = getAltKeyLabel();

  return [
    {
      keys: ["?"],
      description: "Show/hide keyboard shortcuts",
      category: SHORTCUT_CATEGORIES.GENERAL,
    },
    {
      keys: [modifier, "E"],
      description: KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.DESCRIPTION,
      category: SHORTCUT_CATEGORIES.EDITOR,
    },
    {
      keys: ["←", "→"],
      description: EDITOR_LABELS.TAB_NAVIGATION.SWITCH_TABS,
      category: SHORTCUT_CATEGORIES.EDITOR,
    },
    {
      keys: ["Home", "End"],
      description: "Jump to first/last editor tab",
      category: SHORTCUT_CATEGORIES.EDITOR,
    },
    {
      keys: [modifier, "1"],
      description: KEYBOARD_SHORTCUTS.VIEW_MODE_EDIT.DESCRIPTION,
      category: SHORTCUT_CATEGORIES.EDITOR,
    },
    {
      keys: [modifier, "2"],
      description: KEYBOARD_SHORTCUTS.VIEW_MODE_SPLIT.DESCRIPTION,
      category: SHORTCUT_CATEGORIES.EDITOR,
    },
    {
      keys: [modifier, "3"],
      description: KEYBOARD_SHORTCUTS.VIEW_MODE_PREVIEW.DESCRIPTION,
      category: SHORTCUT_CATEGORIES.EDITOR,
    },
    {
      keys: [modifier, "Enter"],
      description: KEYBOARD_SHORTCUTS.SUBMIT_WIZARD.DESCRIPTION,
      category: SHORTCUT_CATEGORIES.GENERAL,
    },
    {
      keys: ["Esc"],
      description: KEYBOARD_SHORTCUTS.CANCEL_GENERATION.DESCRIPTION,
      category: SHORTCUT_CATEGORIES.GENERATION,
    },
    {
      keys: [modifier, "N"],
      description: KEYBOARD_SHORTCUTS.NEW_PROJECT.DESCRIPTION,
      category: SHORTCUT_CATEGORIES.GENERAL,
    },
    {
      keys: ["Home"],
      description: KEYBOARD_SHORTCUTS.SCROLL_TO_TOP.DESCRIPTION,
      category: SHORTCUT_CATEGORIES.NAVIGATION,
    },
    {
      keys: [altKey, "←"],
      description: "Go to previous wizard step",
      category: SHORTCUT_CATEGORIES.NAVIGATION,
    },
    {
      keys: [altKey, "→"],
      description: "Go to next wizard step",
      category: SHORTCUT_CATEGORIES.NAVIGATION,
    },
    ...WIZARD_STEPS.map((step) => ({
      keys: [altKey, step.shortcut],
      description: `Go to ${step.label}`,
      category: SHORTCUT_CATEGORIES.NAVIGATION,
    })),
  ];
};

const categoryLabels: Record<string, string> = SHORTCUT_CATEGORY_LABELS;
const categoryIcons: Record<string, IconName> = SHORTCUT_CATEGORY_ICONS as Record<string, IconName>;

/**
 * Modal dialog displaying available keyboard shortcuts.
 * Shows all application keyboard shortcuts organized by category.
 *
 * @param props - Component props
 * @param props.isOpen - Whether the modal is visible
 * @param props.onClose - Callback fired when modal should close
 * @returns The rendered keyboard shortcuts modal
 *
 * @example
 * // Basic usage
 * <KeyboardShortcutsModal isOpen={showModal} onClose={() => setShowModal(false)} />
 */

function KeyboardShortcutsModalComponent({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    returnFocusTo: closeButtonRef,
    autoFocus: true,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const shortcuts = getShortcutItems();
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category]!.push(shortcut);
      return acc;
    },
    {} as Record<string, ShortcutItem[]>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: ANIMATION.MODAL_FADE }}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: "spring",
              ...SPRING_CONFIG.GENTLE,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-shortcuts-title"
            aria-describedby="keyboard-shortcuts-tip"
          >
            <div
              ref={containerRef as React.RefObject<HTMLDivElement>}
              className="glass-card w-full max-w-2xl max-h-[85vh] overflow-hidden pointer-events-auto shadow-2xl shadow-dark-950/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-purple/20 flex items-center justify-center">
                    <Icon name="keyboard" className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 id="keyboard-shortcuts-title" className="text-xl font-bold text-white">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm text-dark-400">
                      Press{" "}
                      <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-xs font-mono">?</kbd>{" "}
                      anytime to show this help
                    </p>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                  aria-label="Close keyboard shortcuts"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                {Object.entries(groupedShortcuts).map(
                  ([category, categoryShortcuts], categoryIndex) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: categoryIndex * ANIMATION.STAGGER,
                        duration: ANIMATION.SUBTLE_MOVE,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg flex items-center" aria-hidden="true">
                          <Icon name={categoryIcons[category]!} className="w-4 h-4 text-dark-300" />
                        </span>
                        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">
                          {categoryLabels[category]}
                        </h3>
                        <div className="flex-1 h-px bg-dark-700/50 ml-2" />
                      </div>
                      <div className="space-y-2">
                        {categoryShortcuts.map((shortcut, index) => (
                          <motion.div
                            key={`${category}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay:
                                categoryIndex * ANIMATION.STAGGER + (index * ANIMATION.STAGGER) / 2,
                              duration: ANIMATION.NORMAL,
                            }}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-dark-800/50 transition-colors duration-200 group"
                          >
                            <span className="text-dark-300 group-hover:text-white transition-colors duration-200">
                              {shortcut.description}
                            </span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIndex) => (
                                <span key={keyIndex} className="flex items-center">
                                  <kbd className="px-2 py-1 bg-dark-700 border border-dark-600 rounded-lg text-xs font-mono text-white shadow-sm min-w-[28px] text-center">
                                    {key}
                                  </kbd>
                                  {keyIndex < shortcut.keys.length - 1 && (
                                    <span className="mx-1.5 text-dark-500 text-xs">+</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )
                )}
              </div>

              <div className="px-6 py-4 border-t border-dark-700/50 bg-dark-800/30">
                <p id="keyboard-shortcuts-tip" className="text-xs text-dark-500 text-center">
                  Tip: Keyboard shortcuts work throughout the app. Press{" "}
                  <kbd className="px-1 py-0.5 bg-dark-700 rounded text-[10px] font-mono">Esc</kbd>{" "}
                  to close this dialog.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export const KeyboardShortcutsModal = memo(KeyboardShortcutsModalComponent);

export default KeyboardShortcutsModal;
