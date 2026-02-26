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
import { motion } from "framer-motion";
import { LazyMarkdownRenderer } from "./LazyMarkdownRenderer";
import { LazyCodeMirror } from "./LazyCodeMirror";
import { EditorHeader, type ViewMode } from "./editor/EditorHeader";
import { EditorEmptyState } from "./EditorEmptyState";
import { ScrollToTop } from "./ScrollToTop";
import { ScrollProgress } from "./ScrollProgress";
import { useEditorStore, resetAllStores, useToast } from "../store";
import { useExportContext } from "../context/ExportContext";
import { exportAsZip, copyToClipboard, formatForIDE } from "../lib/export";
import { sanitizeMarkdown, handleSecurityError } from "../lib/security";
import { TIMEOUTS, UI } from "../config/constants";
import { useLastSaved } from "../hooks/useLastSaved";
import clsx from "clsx";

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
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copied, setCopied] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  const activeTab = useEditorStore((s) => s.activeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const blueprintContent = useEditorStore((s) => s.blueprintContent);
  const tasksContent = useEditorStore((s) => s.tasksContent);
  const setBlueprintContent = useEditorStore((s) => s.setBlueprintContent);
  const setTasksContent = useEditorStore((s) => s.setTasksContent);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const { getExportMetadata } = useExportContext();

  const { lastSavedText, markSaved, hasChanges, markAsChanged } = useLastSaved();

  const currentContent = activeTab === "blueprint" ? blueprintContent : tasksContent;
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
        if (activeTab === "blueprint") {
          setBlueprintContent(sanitizedContent);
        } else {
          setTasksContent(sanitizedContent);
        }
        markSaved();
      } catch (error) {
        const securityError = handleSecurityError(error);
        toast.error(`Security validation failed: ${securityError.message}`);
        if (import.meta.env.DEV) {
          console.error("Security validation failed:", securityError);
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
      toast.success("Copied to clipboard");
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
      toast.success("Project exported successfully!");
    } catch (error) {
      toast.error("Failed to export project");
      if (import.meta.env.DEV) {
        console.error("Export error:", error);
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
    resetAllStores();
    toast.info("Started new project");
  }, [toast]);

  const hasContent = blueprintContent.length > 0 || tasksContent.length > 0;

  return (
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
        copied={copied}
        isExporting={isExporting}
        lastSavedText={lastSavedText}
        hasChanges={hasChanges}
        content={currentContent}
      />

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {!hasContent && !isGenerating ? (
          <EditorEmptyState />
        ) : (
          <div
            id={activeTab === "blueprint" ? "blueprint-panel" : "tasks-panel"}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="h-full flex flex-col lg:flex-row"
          >
            {/* Code Editor */}
            {(viewMode === "edit" || viewMode === "split") && (
              <div
                className={clsx(
                  "h-full overflow-hidden",
                  viewMode === "split"
                    ? "w-full lg:w-1/2 lg:border-r lg:border-dark-700 border-b border-dark-700 lg:border-b-0"
                    : "w-full"
                )}
              >
                <LazyCodeMirror
                  value={currentContent}
                  onChange={setCurrentContent}
                  className="h-full"
                />
              </div>
            )}

            {/* Preview */}
            {(viewMode === "preview" || viewMode === "split") && (
              <div
                ref={previewRef}
                className={clsx(
                  "h-full overflow-y-auto p-4 lg:p-6 relative",
                  viewMode === "split" ? "w-full lg:w-1/2" : "w-full"
                )}
              >
                <ScrollProgress scrollContainerRef={previewRef} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="min-h-full"
                >
                  <LazyMarkdownRenderer content={currentContent || "*No content yet...*"} />
                </motion.div>
                <ScrollToTop
                  scrollContainerRef={previewRef}
                  showAfter={UI.SCROLL_TO_TOP_THRESHOLD}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Memoized Editor component for optimal re-render performance.
 * Exported as the default Editor component.
 */
export const Editor = React.memo(EditorComponent);
