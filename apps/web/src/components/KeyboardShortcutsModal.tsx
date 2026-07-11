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

import { useEffect, useCallback, useRef, useState, useMemo, memo } from "react";
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
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
import { KEYBOARD_EVENT_KEYS, FRAMER_TYPE } from "@blueprint/shared/config";
import { useFocusTrap, useScrollLock } from "../hooks";
import { Icon, type IconName } from "./Icon";
import { getModifierLabel, getAltKeyLabel } from "../lib/platform";
import { ACCESSIBILITY_LABELS } from "../config/constants/content";

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
      keys: ["End"],
      description: KEYBOARD_SHORTCUTS.SCROLL_TO_BOTTOM.DESCRIPTION,
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

const modifierKey = getModifierLabel();

/** Lowercases and joins shortcut keys into a single searchable string */
function shortcutKeysText(keys: string[]): string {
  return keys.join(" ").toLowerCase();
}

function matchesQuery(shortcut: ShortcutItem, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return (
    shortcut.description.toLowerCase().includes(q) ||
    shortcutKeysText(shortcut.keys).includes(q) ||
    shortcut.category.toLowerCase().includes(q)
  );
}

function KeyboardShortcutsModalComponent({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    returnFocusTo: closeButtonRef,
    autoFocus: false,
  });

  // Focus the search input on open so users can start typing immediately —
  // the primary action when opening this modal (VS Code / DevTools pattern).
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_EVENT_KEYS.ESCAPE || e.key === KEYBOARD_EVENT_KEYS.QUESTION_MARK) {
        if (e.key === KEYBOARD_EVENT_KEYS.ESCAPE && searchQuery) {
          // Clear search first, then close on second Escape
          setSearchQuery("");
          searchInputRef.current?.focus();
          e.preventDefault();
          return;
        }
        onClose();
        return;
      }

      // Ctrl/Cmd+F to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === KEYBOARD_EVENT_KEYS.F) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    },
    [onClose, searchQuery]
  );

  useScrollLock({ isLocked: isOpen });

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const shortcuts = useMemo(() => getShortcutItems(), []);

  const filteredShortcuts = useMemo(
    () => shortcuts.filter((s) => matchesQuery(s, searchQuery)),
    [shortcuts, searchQuery]
  );

  const groupedShortcuts = useMemo(
    () =>
      filteredShortcuts.reduce(
        (acc, shortcut) => {
          if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
          }
          acc[shortcut.category]!.push(shortcut);
          return acc;
        },
        {} as Record<string, ShortcutItem[]>
      ),
    [filteredShortcuts]
  );

  const hasResults = filteredShortcuts.length > 0;
  const entries = Object.entries(groupedShortcuts);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

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
              type: FRAMER_TYPE.SPRING,
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
              className="glass-card w-full max-w-2xl max-h-85vh overflow-hidden pointer-events-auto shadow-2xl shadow-dark-950/50"
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
                  aria-label={ACCESSIBILITY_LABELS.KEYBOARD_SHORTCUTS.CLOSE}
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

              <div className="px-6 pt-4 pb-2">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    dir="auto"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={ACCESSIBILITY_LABELS.KEYBOARD_SHORTCUTS.SEARCH_PLACEHOLDER}
                    className="w-full pl-10 pr-10 py-2.5 bg-dark-800/80 border border-dark-700/50 rounded-lg
                               text-sm text-white placeholder-dark-400
                               focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                               transition-all duration-200"
                    aria-label={ACCESSIBILITY_LABELS.KEYBOARD_SHORTCUTS.SEARCH}
                    role="searchbox"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {/* Clear button */}
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: ANIMATION.FAST }}
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white
                                   hover:bg-dark-700/50 rounded-md p-1 transition-colors duration-150"
                        aria-label={ACCESSIBILITY_LABELS.KEYBOARD_SHORTCUTS.CLEAR_SEARCH}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-6 overflow-y-auto overscroll-contain max-h-50vh space-y-6">
                {hasResults ? (
                  entries.map(([category, categoryShortcuts], categoryIndex) => (
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
                        {searchQuery && (
                          <span className="text-2xs text-dark-500 tabular-nums">
                            {categoryShortcuts.length}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <AnimatePresence mode="popLayout">
                          {categoryShortcuts.map((shortcut, index) => (
                            <motion.div
                              key={shortcut.description}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10, scale: 0.95 }}
                              transition={{
                                delay:
                                  categoryIndex * ANIMATION.STAGGER +
                                  (index * ANIMATION.STAGGER) / 2,
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
                                    <kbd className="px-2 py-1 bg-dark-700 border border-dark-600 rounded-lg text-xs font-mono text-white shadow-sm min-w-7 text-center">
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
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-dark-400"
                  >
                    <svg
                      className="w-12 h-12 mb-4 text-dark-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-dark-300">
                      {ACCESSIBILITY_LABELS.KEYBOARD_SHORTCUTS.NO_RESULTS(searchQuery)}
                    </p>
                    <p className="text-xs text-dark-500 mt-1">
                      Try a different search term, or{" "}
                      <button
                        onClick={handleClearSearch}
                        className="text-primary-400 hover:text-primary-300 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 rounded"
                      >
                        clear the search
                      </button>
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-dark-700/50 bg-dark-800/30">
                <p
                  id="keyboard-shortcuts-tip"
                  className="text-xs text-dark-500 text-center"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {searchQuery ? (
                    <>
                      <motion.span
                        key={filteredShortcuts.length}
                        className="tabular-nums inline-block"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: FRAMER_TYPE.SPRING,
                          ...SPRING_CONFIG.COUNTER_FLIP,
                        }}
                      >
                        {filteredShortcuts.length}
                      </motion.span>{" "}
                      shortcut{filteredShortcuts.length !== 1 ? "s" : ""} found
                    </>
                  ) : (
                    `Tip: Press ${modifierKey}+F to search shortcuts. Press ? or Esc to close this dialog.`
                  )}
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
