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
} from "../config/constants";
import { ANIMATION_TIMING } from "../config/theme";
import { isDev } from "../config/env";
import { useLastSaved } from "../hooks/useLastSaved";
import { useAutoScroll } from "../hooks/useAutoScroll";
import clsx from "clsx";
import "../styles/markdown.css";

/** Map of keyboard digits to view modes for Ctrl/Cmd+1/2/3 switching */
const VIEW_MODE_SHORTCUT_MAP: Record<string, ViewMode> = {
  "1": VIEW_MODES.EDIT,
  "2": VIEW_MODES.SPLIT,
  "3": VIEW_MODES.PREVIEW,
} as const;

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
    const cmView = codeMirrorRef.current?.view;
    if (cmView?.scrollDOM) {
      cmView.scrollDOM.scrollTop = 0;
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
                        className={clsx(
                          "h-full overflow-hidden",
                          viewMode === VIEW_MODES.SPLIT
                            ? "w-full lg:w-1/2 lg:border-r lg:border-dark-700 border-b border-dark-700 lg:border-b-0"
                            : "w-full"
                        )}
                      >
                        <LazyCodeMirror
                          ref={codeMirrorRef}
                          value={currentContent}
                          onChange={setCurrentContent}
                          className="h-full"
                        />
                      </div>
                    )}

                    {/* Preview */}
                    {(viewMode === VIEW_MODES.PREVIEW || viewMode === VIEW_MODES.SPLIT) && (
                      <div
                        ref={previewRef}
                        className={clsx(
                          "h-full overflow-y-auto p-4 lg:p-6 relative",
                          viewMode === VIEW_MODES.SPLIT ? "w-full lg:w-1/2" : "w-full"
                        )}
                      >
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
