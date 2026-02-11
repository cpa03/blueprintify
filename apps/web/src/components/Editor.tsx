import { useState } from "react";
import { motion } from "framer-motion";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { EditorHeader, type ViewMode } from "./editor/EditorHeader";
import { SessionManager } from "./session/SessionManager";
import { RefinementPanel } from "./refinement/RefinementPanel";
import type { StoredSession } from "../types/storage";
import {
  useEditorStore,
  useWizardStore,
  useSessionStore,
  resetAllStores,
  useToast,
} from "../store";
import { exportAsZip, copyToClipboard, formatForIDE } from "../lib/export";
import { useAutoSave } from "../hooks/useAutoSave";
import { TIMEOUTS, DEFAULT_PROJECT_NAME } from "../config/constants";
import clsx from "clsx";

export function Editor() {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copied, setCopied] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);
  const [isRefinementOpen, setIsRefinementOpen] = useState(false);
  const toast = useToast();

  const { currentSession, loadSessions } = useSessionStore();
  const activeTab = useEditorStore((s) => s.activeTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const blueprintContent = useEditorStore((s) => s.blueprintContent);
  const tasksContent = useEditorStore((s) => s.tasksContent);
  const setBlueprintContent = useEditorStore((s) => s.setBlueprintContent);
  const setTasksContent = useEditorStore((s) => s.setTasksContent);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const projectName = useWizardStore((s) => s.projectName);

  useAutoSave({
    enabled: Boolean(
      currentSession || (projectName && (blueprintContent || tasksContent)),
    ),
    interval: 2000,
    debounceMs: 1000,
  });

  const currentContent =
    activeTab === "blueprint" ? blueprintContent : tasksContent;
  const setCurrentContent =
    activeTab === "blueprint" ? setBlueprintContent : setTasksContent;

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

  const handleSessionManagerOpen = () => {
    setIsSessionManagerOpen(true);
  };

  const handleSessionSelect = (session: StoredSession) => {
    loadSessions();
    setBlueprintContent(session.generatedBlueprint);
    setTasksContent(session.generatedTasks);
    setIsSessionManagerOpen(false);

    if (session.editorState) {
      setActiveTab(session.editorState.activeTab);
    }

    toast.success(`Loaded session: ${session.title}`);
  };

  const handleRefinementToggle = () => {
    setIsRefinementOpen(!isRefinementOpen);
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
        onSessionManager={handleSessionManagerOpen}
        onRefinement={handleRefinementToggle}
        hasContent={hasContent}
        copied={copied}
        isExporting={isExporting}
        currentSessionId={currentSession?.id}
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
          <div className="h-full flex flex-col lg:flex-row">
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

      {/* Session Manager Modal */}
      <SessionManager
        isOpen={isSessionManagerOpen}
        onClose={() => setIsSessionManagerOpen(false)}
        onSessionSelect={handleSessionSelect}
        currentSessionId={currentSession?.id}
      />

      {/* Refinement Panel */}
      <RefinementPanel
        isOpen={isRefinementOpen}
        onClose={() => setIsRefinementOpen(false)}
      />
    </div>
  );
}
