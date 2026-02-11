import { useState } from "react";
import { motion } from "framer-motion";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { EditorHeader, type ViewMode } from "./editor/EditorHeader";
import {
  useEditorStore,
  useWizardStore,
  resetAllStores,
  useToast,
} from "../store";
import { exportAsZip, copyToClipboard, formatForIDE } from "../lib/export";
import { sanitizeMarkdown, handleSecurityError } from "../lib/security";
import { TIMEOUTS, DEFAULT_PROJECT_NAME } from "../config/constants";
import clsx from "clsx";

export function Editor() {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copied, setCopied] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  const activeTab = useEditorStore((s) => s.activeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const blueprintContent = useEditorStore((s) => s.blueprintContent);
  const tasksContent = useEditorStore((s) => s.tasksContent);
  const setBlueprintContent = useEditorStore((s) => s.setBlueprintContent);
  const setTasksContent = useEditorStore((s) => s.setTasksContent);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const projectName = useWizardStore((s) => s.projectName);

  const currentContent =
    activeTab === "blueprint" ? blueprintContent : tasksContent;
  const setCurrentContent = (content: string) => {
    try {
      const sanitizedContent = sanitizeMarkdown(content);
      if (activeTab === "blueprint") {
        setBlueprintContent(sanitizedContent);
      } else {
        setTasksContent(sanitizedContent);
      }
    } catch (error) {
      const securityError = handleSecurityError(error);
      toast.error(`Security validation failed: ${securityError.message}`);
      console.error("Security validation failed:", securityError);
    }
  };

  const handleCopy = async () => {
    const formatted = formatForIDE(currentContent);
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(activeTab);
      setTimeout(() => setCopied(null), TIMEOUTS.COPY_FEEDBACK);
      toast.success("Copied to clipboard");
    }
  };

  const handleExport = async () => {
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
  };

  const handleNewProject = () => {
    resetAllStores();
    toast.info("Started new project");
  };

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
      />

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {!hasContent && !isGenerating ? (
          <div className="h-full flex items-center justify-center text-dark-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <p>Your generated content will appear here</p>
              <p className="text-sm mt-2">Complete the wizard to get started</p>
            </div>
          </div>
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
                <CodeMirror
                  value={currentContent}
                  onChange={setCurrentContent}
                  extensions={[markdown()]}
                  theme={oneDark}
                  className="h-full"
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    highlightActiveLine: true,
                  }}
                />
              </div>
            )}

            {/* Preview */}
            {(viewMode === "preview" || viewMode === "split") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={clsx(
                  "h-full overflow-y-auto p-4 lg:p-6",
                  viewMode === "split" ? "w-full lg:w-1/2" : "w-full",
                )}
              >
                <MarkdownRenderer
                  content={currentContent || "*No content yet...*"}
                />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
