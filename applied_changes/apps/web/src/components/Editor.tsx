import { useState } from "react";
import { motion } from "framer-motion";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import ReactMarkdown from "react-markdown";
import { EditorHeader, type ViewMode } from "./editor/EditorHeader";
import { RefineModal } from "./editor/RefineModal";
import { useEditorStore, useWizardStore } from "../store";
import { exportAsZip, copyToClipboard, formatForIDE } from "../lib/export";
import { useRefine } from "../hooks/useRefine";
import clsx from "clsx";

export function Editor() {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copied, setCopied] = useState<string | null>(null);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [refinedContent, setRefinedContent] = useState("");

  const activeTab = useEditorStore((s) => s.activeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const blueprintContent = useEditorStore((s) => s.blueprintContent);
  const tasksContent = useEditorStore((s) => s.tasksContent);
  const setBlueprintContent = useEditorStore((s) => s.setBlueprintContent);
  const setTasksContent = useEditorStore((s) => s.setTasksContent);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const projectName = useWizardStore((s) => s.projectName);
  const resetWizard = useWizardStore((s) => s.reset);
  const resetEditor = useEditorStore((s) => s.reset);

  const currentContent =
    activeTab === "blueprint" ? blueprintContent : tasksContent;
  const setCurrentContent =
    activeTab === "blueprint" ? setBlueprintContent : setTasksContent;

  const { isRefining, refineProgress, startRefine, cancelRefine } = useRefine({
    onChunk: (chunk) => {
      setRefinedContent((prev) => prev + chunk);
    },
    onDone: () => {
      // Update the store with the refined content
      setCurrentContent(refinedContent);
      setRefinedContent("");
    },
    onError: (error) => {
      console.error("Refine error:", error);
    },
  });

  const handleCopy = async () => {
    const formatted = formatForIDE(currentContent);
    const success = await copyToClipboard(formatted);
    if (success) {
      setCopied(activeTab);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleExport = async () => {
    await exportAsZip({
      blueprint: blueprintContent,
      tasks: tasksContent,
      projectName: projectName || "my-project",
    });
  };

  const handleNewProject = () => {
    resetWizard();
    resetEditor();
  };

  const handleRefine = (instruction: string, context?: string) => {
    setRefinedContent("");
    startRefine(currentContent, instruction, context);
  };

  const hasContent = blueprintContent.length > 0 || tasksContent.length > 0;
  const isProcessing = isGenerating || isRefining;

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
        onRefine={() => setIsRefineModalOpen(true)}
        hasContent={hasContent}
        copied={copied}
        isProcessing={isProcessing}
      />

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {!hasContent && !isProcessing ? (
          <div className="h-full flex items-center justify-center text-dark-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <p>Your generated content will appear here</p>
              <p className="text-sm mt-2">Complete the wizard to get started</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex">
            {/* Code Editor */}
            {(viewMode === "edit" || viewMode === "split") && (
              <div
                className={clsx(
                  "h-full overflow-hidden",
                  viewMode === "split"
                    ? "w-1/2 border-r border-dark-700"
                    : "w-full",
                )}
              >
                <CodeMirror
                  value={
                    refineProgress ? `${refinedContent}...` : currentContent
                  }
                  onChange={setCurrentContent}
                  extensions={[markdown()]}
                  theme={oneDark}
                  className="h-full"
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    highlightActiveLine: true,
                  }}
                  readOnly={isProcessing}
                />
              </div>
            )}

            {/* Preview */}
            {(viewMode === "preview" || viewMode === "split") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={clsx(
                  "h-full overflow-y-auto p-6",
                  viewMode === "split" ? "w-1/2" : "w-full",
                )}
              >
                <div className="markdown-content">
                  <ReactMarkdown>
                    {(refineProgress ? refinedContent : currentContent) ||
                      "*No content yet..."}
                  </ReactMarkdown>
                  {refineProgress && (
                    <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                      <p className="text-sm text-primary-300 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {refineProgress}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Refine Modal */}
      <RefineModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        onRefine={handleRefine}
        isRefining={isRefining}
        activeTab={activeTab}
        currentContent={currentContent}
      />
    </div>
  );
}
