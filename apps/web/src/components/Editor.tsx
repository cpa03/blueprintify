import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { LazyMarkdownRenderer } from "./LazyMarkdownRenderer";
import { LazyCodeMirror } from "./LazyCodeMirror";
import { EditorHeader, type ViewMode } from "./editor/EditorHeader";
import { EditorEmptyState } from "./EditorEmptyState";
import { ScrollToTop } from "./ScrollToTop";
import {
  useEditorStore,
  useWizardStore,
  resetAllStores,
  useToast,
} from "../store";
import { exportAsZip, copyToClipboard, formatForIDE } from "../lib/export";
import { sanitizeMarkdown, handleSecurityError } from "../lib/security";
import { TIMEOUTS, DEFAULT_PROJECT_NAME } from "../config/constants";
import { useLastSaved } from "../hooks/useLastSaved";
import clsx from "clsx";

function EditorComponent() {
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
  const projectName = useWizardStore((s) => s.projectName);

  const { lastSavedText, markSaved } = useLastSaved();

  const currentContent =
    activeTab === "blueprint" ? blueprintContent : tasksContent;
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
        console.error("Security validation failed:", securityError);
      }
    },
    [activeTab, setBlueprintContent, setTasksContent, markSaved, toast],
  );

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && (blueprintContent || tasksContent)) {
      hasInitialized.current = true;
      markSaved();
    }
  }, [blueprintContent, tasksContent, markSaved]);

  const handleCopy = useCallback(async () => {
    const formatted = formatForIDE(currentContent);
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(activeTab);
      setTimeout(() => setCopied(null), TIMEOUTS.COPY_FEEDBACK);
      toast.success("Copied to clipboard");
    }
  }, [currentContent, activeTab, toast]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const wizardData = useWizardStore.getState();
      await exportAsZip({
        blueprint: blueprintContent,
        tasks: tasksContent,
        projectName: projectName || DEFAULT_PROJECT_NAME,
        techStack: wizardData.techStack,
        description: wizardData.description,
        features: wizardData.features,
      });
      toast.success("Project exported successfully!");
    } catch (error) {
      toast.error("Failed to export project");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  }, [blueprintContent, tasksContent, projectName, toast]);

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
                    : "w-full",
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
                  viewMode === "split" ? "w-full lg:w-1/2" : "w-full",
                )}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="min-h-full"
                >
                  <LazyMarkdownRenderer
                    content={currentContent || "*No content yet...*"}
                  />
                </motion.div>
                <ScrollToTop scrollContainerRef={previewRef} showAfter={600} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const Editor = React.memo(EditorComponent);
