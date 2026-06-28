/**
 * @fileoverview Main Editor component for the Blueprintify application.
 *
 * This component provides a split-pane editor interface with:
 * - CodeMirror-based markdown editing
 * - Real-time markdown preview
 * - Tab switching between blueprint and tasks content
 * - Export functionality (ZIP download)
 * - Copy to clipboard functionality
 * - Auto-save state tracking
 *
 * The editor supports three view modes:
 * - "edit": Full-width code editor
 * - "preview": Full-width markdown preview
 * - "split": Side-by-side editor and preview
 *
 * @module components/Editor
 * @see {@link useEditorStore} for content state management
 * @see {@link useExportContext} for project metadata
 * @see {@link useLastSaved} for save state tracking
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { LazyMarkdownRenderer } from "./LazyMarkdownRenderer";
import { LazyCodeMirror } from "./LazyCodeMirror";
import { EditorHeader, type ViewMode } from "./editor/EditorHeader";
import { EditorEmptyState } from "./EditorEmptyState";
import { PreviewEmptyState } from "./PreviewEmptyState";
import { ScrollToTop, ScrollToBottom } from "./ScrollToTop";
import { ScrollProgress } from "./ScrollProgress";
import { ConfirmDialog } from "./ConfirmDialog";
import { useEditorStore, resetAllStores, useToast } from "../store";
import { useExportContext } from "../context/ExportContext";
import { exportAsZip, copyToClipboard, formatForIDE } from "../lib/export";
import { sanitizeMarkdown, handleSecurityError } from "../lib/security";
import { EDITOR_FILENAMES, VIEW_MODES, UI_TIMING } from "@blueprint/shared";
import {
  TIMEOUTS,
  UI,
  CONFIRM_DIALOG,
  TOAST_MESSAGES,
  ANIMATION,
  EDITOR_ANNOUNCER,
  EDITOR_TABS,
  DEBUG_MESSAGES,
  VIEW_MODE_SHORTCUT_KEYS,
} from "../config/constants";
import { ANIMATION_TIMING, LAYOUT } from "../config/theme";
import { isDev } from "../config/env";
import { useLastSaved } from "../hooks/useLastSaved";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useReducedMotion } from "../hooks/useReducedMotion";
import clsx from "clsx";
import "../styles/markdown.css";

/** Map of keyboard digits to view modes for Ctrl/Cmd+1/2/3 switching */
const VIEW_MODE_SHORTCUT_MAP: Record<string, ViewMode> = {
  [VIEW_MODE_SHORTCUT_KEYS.edit]: VIEW_MODES.EDIT,
  [VIEW_MODE_SHORTCUT_KEYS.split]: VIEW_MODES.SPLIT,
  [VIEW_MODE_SHORTCUT_KEYS.preview]: VIEW_MODES.PREVIEW,
} as const;

/**
 * EditorSkeleton - Loading skeleton that mimics CodeMirror layout during initial generation.
 *
 * Shows a gutter with line numbers on the left and shimmer code lines on the right,
 * giving users a visual placeholder that looks like the editor is "loading" rather
 * than appearing as a blank white page while the generation stream starts.
 *
 * Uses the editor-skeleton CSS classes defined in index.css with skeleton-block
 * shimmer animation for the code lines.
 */
const LINE_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1);
const CODE_LINE_WIDTHS = [65, 80, 45, 70, 55, 85, 40, 60, 75, 50, 68, 58, 72, 48, 62];

function EditorSkeleton({ isVisible }: { isVisible: boolean }): JSX.Element | null {
  if (!isVisible) return null;
  return (
    <div className="editor-skeleton" role="status" aria-label="Content is being generated">
      <div className="editor-skeleton-gutter">
        {LINE_NUMBERS.map((num) => (
          <div key={num} className="editor-skeleton-line-number">
            {num}
          </div>
        ))}
      </div>
      <div className="editor-skeleton-code">
        {CODE_LINE_WIDTHS.map((width, i) => (
          <div key={i} className="editor-skeleton-code-line">
            <div className="skeleton-block" style={{ width: `${width}%`, height: "14px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main editor component providing split-pane editing with live preview.
 *
 * @returns The rendered editor interface
 *
 * @example
 * ```tsx
 * <Editor />
 * ```
 */
function EditorComponent(): JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.SPLIT);
  const [copied, setCopied] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState(false);
  const toast = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);

  const [previewScrollState, setPreviewScrollState] = useState({ isTop: true, isBottom: false });
  const [editorScrollState, setEditorScrollState] = useState({ isTop: true, isBottom: false });
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const handlePreviewScroll = useCallback(() => {
    const el = previewRef.current;
    if (!el || shouldReduceMotion) return;
    const isTop = el.scrollTop <= 4;
    const isBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) <= 4;
    setPreviewScrollState((prev) => {
      if (prev.isTop === isTop && prev.isBottom === isBottom) return prev;
      return { isTop, isBottom };
    });
  }, [shouldReduceMotion]);

  const activeTab = useEditorStore((s) => s.activeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const blueprintContent = useEditorStore((s) => s.blueprintContent);
  const tasksContent = useEditorStore((s) => s.tasksContent);
  const setBlueprintContent = useEditorStore((s) => s.setBlueprintContent);
  const setTasksContent = useEditorStore((s) => s.setTasksContent);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const { getExportMetadata } = useExportContext();

  const { lastSavedText, markSaved, hasChanges, markAsChanged } = useLastSaved();

  const currentContent = activeTab === EDITOR_TABS.BLUEPRINT ? blueprintContent : tasksContent;
  const hasContent = blueprintContent.length > 0 || tasksContent.length > 0;

  // Freeze announcement text at mount via useState initializer so screen readers
  // only announce once when the editor panel appears, not on every re-render
  const [mountAnnouncement] = useState(() =>
    hasContent
      ? EDITOR_ANNOUNCER.OPENED_WITH_CONTENT(
          activeTab === EDITOR_TABS.BLUEPRINT
            ? EDITOR_FILENAMES.BLUEPRINT_ANNOUNCE
            : EDITOR_FILENAMES.TASKS_ANNOUNCE
        )
      : EDITOR_ANNOUNCER.OPENED
  );

  /**
   * Updates the current content (blueprint or tasks) with sanitization.
   * Handles security validation and error reporting.
   *
   * @param content - The new markdown content to set
   */
  const setCurrentContent = useCallback(
    (content: string) => {
      try {
        const sanitizedContent = sanitizeMarkdown(content);
        if (activeTab === EDITOR_TABS.BLUEPRINT) {
          setBlueprintContent(sanitizedContent);
        } else {
          setTasksContent(sanitizedContent);
        }
        markSaved();
      } catch (error) {
        const securityError = handleSecurityError(error);
        toast.error(`${TOAST_MESSAGES.SECURITY_VALIDATION_FAILED}: ${securityError.message}`);
        if (isDev()) {
          console.error(DEBUG_MESSAGES.SECURITY_VALIDATION_FAILED, securityError);
        }
      }
    },
    [activeTab, setBlueprintContent, setTasksContent, markSaved, toast]
  );

  const previousContentRef = useRef(currentContent);
  useEffect(() => {
    if (currentContent !== previousContentRef.current) {
      markAsChanged();
      previousContentRef.current = currentContent;
    }
  }, [currentContent, markAsChanged]);

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && (blueprintContent || tasksContent)) {
      hasInitialized.current = true;
      markSaved();
    }
  }, [blueprintContent, tasksContent, markSaved]);

  // Auto-scroll preview during generation, pausing when user scrolls up to read
  useAutoScroll({
    scrollContainerRef: previewRef,
    enabled: isGenerating,
    trigger: currentContent,
  });

  // Attach scroll shadow listener to CodeMirror's .cm-scroller element.
  // Uses MutationObserver because CodeMirror is lazy-loaded — the .cm-scroller
  // DOM node doesn't exist until the async import completes. Once found, we
  // attach a passive scroll listener and clean up on unmount or view mode change.
  const scrollListenerCleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const isEditorVisible = viewMode === VIEW_MODES.EDIT || viewMode === VIEW_MODES.SPLIT;
    if (!isEditorVisible) {
      scrollListenerCleanupRef.current?.();
      scrollListenerCleanupRef.current = null;
      return;
    }

    const attach = () => {
      const scrollDom = codeMirrorRef.current?.view?.scrollDOM;
      if (!scrollDom) return false;

      const onScroll = () => {
        if (!scrollDom || shouldReduceMotion) return;
        const isTop = scrollDom.scrollTop <= 4;
        const isBottom =
          Math.abs(scrollDom.scrollHeight - scrollDom.scrollTop - scrollDom.clientHeight) <= 4;
        setEditorScrollState((prev) => {
          if (prev.isTop === isTop && prev.isBottom === isBottom) return prev;
          return { isTop, isBottom };
        });
      };

      scrollDom.addEventListener("scroll", onScroll, { passive: true });

      // Set initial state
      const isTop = scrollDom.scrollTop <= 4;
      const isBottom =
        Math.abs(scrollDom.scrollHeight - scrollDom.scrollTop - scrollDom.clientHeight) <= 4;
      setEditorScrollState({ isTop, isBottom });

      scrollListenerCleanupRef.current = () => {
        scrollDom.removeEventListener("scroll", onScroll);
      };
      return true;
    };

    // Try immediately (CodeMirror may already be mounted)
    if (!attach()) {
      // If CodeMirror hasn't mounted yet, watch the wrapper for DOM changes
      const wrapper = editorWrapperRef.current;
      if (!wrapper) return;

      const observer = new MutationObserver(() => {
        if (attach()) {
          observer.disconnect();
        }
      });
      observer.observe(wrapper, { childList: true, subtree: true });

      // Safety timeout: stop observing after 10s to avoid memory leaks
      const safetyTimer = setTimeout(() => observer.disconnect(), 10000);

      return () => {
        observer.disconnect();
        clearTimeout(safetyTimer);
        scrollListenerCleanupRef.current?.();
        scrollListenerCleanupRef.current = null;
      };
    }

    return () => {
      scrollListenerCleanupRef.current?.();
      scrollListenerCleanupRef.current = null;
    };
  }, [viewMode, shouldReduceMotion]);

  // Auto-focus the editor's active tab when it mounts, so keyboard users
  // land immediately in the panel rather than losing focus to the previous element
  const initialTabRef = useRef(activeTab);
  useEffect(() => {
    const tabId = initialTabRef.current;
    const focusTimer = setTimeout(() => {
      document.getElementById(`tab-${tabId}`)?.focus({ preventScroll: true });
    }, UI_TIMING.EDITOR_FOCUS_DELAY_MS);
    return () => clearTimeout(focusTimer);
  }, []);

  /**
   * Copies the current content to clipboard in IDE-friendly format.
   * Shows success toast and temporary "copied" state feedback.
   */
  const handleCopy = useCallback(async () => {
    const formatted = formatForIDE(currentContent);
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(activeTab);
      setTimeout(() => setCopied(null), TIMEOUTS.COPY_FEEDBACK);
      toast.success(TOAST_MESSAGES.COPY_SUCCESS);
    }
  }, [currentContent, activeTab, toast]);

  /**
   * Exports the current project as a ZIP file containing blueprint.md and tasks.md.
   * Includes project metadata from the export context.
   */
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const exportData = getExportMetadata();
      await exportAsZip({
        blueprint: blueprintContent,
        tasks: tasksContent,
        projectName: exportData.projectName,
        techStack: exportData.techStack,
        description: exportData.description,
        features: exportData.features,
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), TIMEOUTS.COPY_FEEDBACK);
      toast.success(TOAST_MESSAGES.EXPORT_SUCCESS);
    } catch (error) {
      toast.error(TOAST_MESSAGES.EXPORT_FAILURE);
      if (isDev()) {
        console.error(DEBUG_MESSAGES.EXPORT_ERROR, error);
      }
    } finally {
      setIsExporting(false);
    }
  }, [blueprintContent, tasksContent, getExportMetadata, toast]);

  /**
   * Resets all stores to start a new project.
   * Clears blueprint, tasks, and wizard state.
   */
  const handleNewProject = useCallback(() => {
    if (hasContent) {
      setShowNewProjectConfirm(true);
    } else {
      resetAllStores();
      toast.info(TOAST_MESSAGES.NEW_PROJECT);
    }
  }, [hasContent, toast]);

  const handleConfirmNewProject = useCallback(() => {
    resetAllStores();
    toast.info(TOAST_MESSAGES.NEW_PROJECT);
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleNewProject();
      }

      // Ctrl/Cmd+1/2/3 to switch editor view mode
      // Tooltips already display these shortcuts, making them functional
      // gives power users the keyboard-driven workflow they expect.
      if ((e.metaKey || e.ctrlKey) && e.key in VIEW_MODE_SHORTCUT_MAP) {
        // Skip when user is typing in an input or textarea to avoid
        // accidentally switching views while trying to type numbers.
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        const mode = VIEW_MODE_SHORTCUT_MAP[e.key];
        if (mode) {
          setViewMode(mode);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewProject, setViewMode]);

  // Smooth-scroll both preview pane and CodeMirror editor to top when switching tabs
  // Prevents disorientation when content changes but scroll stays mid-content
  useEffect(() => {
    // Scroll markdown preview pane
    const previewEl = previewRef.current;
    if (previewEl && typeof previewEl.scrollTo === "function") {
      previewEl.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Scroll CodeMirror editor to top for visual consistency with preview pane
    const scroller = editorWrapperRef.current?.querySelector<HTMLElement>(".cm-scroller");
    if (scroller) {
      scroller.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Editor Header */}
        <EditorHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCopy={handleCopy}
          onExport={handleExport}
          onNew={handleNewProject}
          hasContent={hasContent}
          blueprintHasContent={blueprintContent.length > 0}
          tasksHasContent={tasksContent.length > 0}
          copied={copied}
          isExporting={isExporting}
          isGenerating={isGenerating}
          lastSavedText={lastSavedText}
          hasChanges={hasChanges}
          content={currentContent}
          exportSuccess={exportSuccess}
        />

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {!hasContent && !isGenerating ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: ANIMATION.NORMAL, ease: ANIMATION_TIMING.easing.easeOut }}
                className="h-full"
              >
                <EditorEmptyState />
              </motion.div>
            ) : (
              <motion.div
                key="content-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: ANIMATION.NORMAL, ease: ANIMATION_TIMING.easing.easeOut }}
                className="h-full"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: ANIMATION.NORMAL,
                      ease: ANIMATION_TIMING.easing.easeOut,
                    }}
                    id={activeTab === EDITOR_TABS.BLUEPRINT ? "blueprint-panel" : "tasks-panel"}
                    role="tabpanel"
                    aria-labelledby={`tab-${activeTab}`}
                    className="h-full flex flex-col lg:flex-row"
                  >
                    {/* Code Editor */}
                    {(viewMode === VIEW_MODES.EDIT || viewMode === VIEW_MODES.SPLIT) && (
                      <div
                        ref={editorWrapperRef}
                        className={clsx(
                          "h-full overflow-hidden relative",
                          viewMode === VIEW_MODES.SPLIT
                            ? "w-full lg:w-1/2 lg:border-r lg:border-dark-700 border-b border-dark-700 lg:border-b-0"
                            : "w-full"
                        )}
                      >
                        <AnimatePresence mode="wait">
                          {isGenerating && !currentContent ? (
                            <motion.div
                              key="editor-skeleton"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: ANIMATION.NORMAL,
                                ease: ANIMATION_TIMING.easing.easeOut,
                              }}
                              className="h-full"
                            >
                              <EditorSkeleton isVisible={true} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="editor-codemirror"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: ANIMATION.NORMAL,
                                ease: ANIMATION_TIMING.easing.easeOut,
                              }}
                              className="h-full"
                            >
                              <LazyCodeMirror
                                ref={codeMirrorRef}
                                value={currentContent}
                                onChange={setCurrentContent}
                                className="h-full"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {/* Top scroll shadow — only visible when CodeMirror
                            is rendered and scrolled; hidden during skeleton. */}
                        <div
                          className="absolute top-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200"
                          style={{
                            opacity:
                              shouldReduceMotion || (isGenerating && !currentContent)
                                ? 0
                                : editorScrollState.isTop
                                  ? 0
                                  : 1,
                            height: `${LAYOUT.SCROLL_SHADOW_HEIGHT_PX}px`,
                            background: LAYOUT.SCROLL_SHADOW_TOP_GRADIENT,
                          }}
                          aria-hidden="true"
                        />
                        {/* Bottom scroll shadow */}
                        <div
                          className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200"
                          style={{
                            opacity:
                              shouldReduceMotion || (isGenerating && !currentContent)
                                ? 0
                                : editorScrollState.isBottom
                                  ? 0
                                  : 1,
                            height: `${LAYOUT.SCROLL_SHADOW_HEIGHT_PX}px`,
                            background: LAYOUT.SCROLL_SHADOW_BOTTOM_GRADIENT,
                          }}
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    {/* Preview */}
                    {(viewMode === VIEW_MODES.PREVIEW || viewMode === VIEW_MODES.SPLIT) && (
                      <div
                        ref={previewRef}
                        onScroll={handlePreviewScroll}
                        className={clsx(
                          "h-full overflow-y-auto p-4 lg:p-6 relative",
                          viewMode === VIEW_MODES.SPLIT ? "w-full lg:w-1/2" : "w-full"
                        )}
                      >
                        <div
                          className="absolute top-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200"
                          style={{
                            opacity: shouldReduceMotion ? 0 : previewScrollState.isTop ? 0 : 1,
                            height: `${LAYOUT.SCROLL_SHADOW_HEIGHT_PX}px`,
                            background: LAYOUT.SCROLL_SHADOW_TOP_GRADIENT,
                          }}
                          aria-hidden="true"
                        />
                        <div
                          className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200"
                          style={{
                            opacity: shouldReduceMotion ? 0 : previewScrollState.isBottom ? 0 : 1,
                            height: `${LAYOUT.SCROLL_SHADOW_HEIGHT_PX}px`,
                            background: LAYOUT.SCROLL_SHADOW_BOTTOM_GRADIENT,
                          }}
                          aria-hidden="true"
                        />
                        <ScrollProgress scrollContainerRef={previewRef} />
                        <AnimatePresence mode="wait">
                          {currentContent ? (
                            <motion.div
                              key={`${activeTab}-content`}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{
                                duration: ANIMATION.NORMAL,
                                ease: ANIMATION_TIMING.easing.easeOut,
                              }}
                              className="min-h-full"
                            >
                              <LazyMarkdownRenderer content={currentContent} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key={`${activeTab}-empty`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                duration: ANIMATION.NORMAL,
                                ease: ANIMATION_TIMING.easing.easeOut,
                              }}
                              className="min-h-full"
                            >
                              <PreviewEmptyState
                                tab={activeTab}
                                isGenerating={isGenerating}
                                siblingTabHasContent={
                                  activeTab === EDITOR_TABS.BLUEPRINT
                                    ? tasksContent.length > 0
                                    : blueprintContent.length > 0
                                }
                                onSwitchTab={() =>
                                  setActiveTab(
                                    activeTab === EDITOR_TABS.BLUEPRINT
                                      ? EDITOR_TABS.TASKS
                                      : EDITOR_TABS.BLUEPRINT
                                  )
                                }
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <ScrollToTop
                          scrollContainerRef={previewRef}
                          showAfter={UI.SCROLL_TO_TOP_THRESHOLD}
                        />
                        <ScrollToBottom
                          scrollContainerRef={previewRef}
                          showAfter={UI.SCROLL_TO_TOP_THRESHOLD}
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Project Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showNewProjectConfirm}
        onClose={() => setShowNewProjectConfirm(false)}
        onConfirm={handleConfirmNewProject}
        title={CONFIRM_DIALOG.NEW_PROJECT.TITLE}
        description={CONFIRM_DIALOG.NEW_PROJECT.DESCRIPTION}
        confirmLabel={CONFIRM_DIALOG.NEW_PROJECT.CONFIRM_LABEL}
        cancelLabel={CONFIRM_DIALOG.NEW_PROJECT.CANCEL_LABEL}
        icon={CONFIRM_DIALOG.NEW_PROJECT.ICON}
      />

      {/* Screen reader announcement when editor mounts — text frozen at mount
          via useRef to prevent re-announcement on re-renders */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {mountAnnouncement}
      </div>
    </>
  );
}

/**
 * Memoized Editor component for optimal re-render performance.
 * Exported as the default Editor component.
 */
export const Editor = React.memo(EditorComponent);
