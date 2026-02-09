import { useState, useRef, useEffect } from "react";
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
import { TIMEOUTS, DEFAULT_PROJECT_NAME } from "../config/constants";
import clsx from "clsx";

export function Editor() {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copied, setCopied] = useState<string | null>(null);
  const toast = useToast();
  const editorRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);

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
    await exportAsZip({
      blueprint: blueprintContent,
      tasks: tasksContent,
      projectName: projectName || DEFAULT_PROJECT_NAME,
    });
    toast.success("Exported as ZIP");
  };

  const handleNewProject = () => {
    resetAllStores();
    toast.info("Started new project");
  };

  const hasContent = blueprintContent.length > 0 || tasksContent.length > 0;

  useEffect(() => {
    if (viewMode !== "split" || !editorRef.current || !previewRef.current)
      return;

    const editorView = editorRef.current.view;
    const previewElement = previewRef.current;

    const handleEditorScroll = () => {
      if (!editorView || !previewElement) return;

      const editorScrollTop = editorView.scrollDOM.scrollTop;
      const editorScrollHeight =
        editorView.scrollDOM.scrollHeight - editorView.scrollDOM.clientHeight;
      const scrollPercentage =
        editorScrollHeight > 0 ? editorScrollTop / editorScrollHeight : 0;

      const previewScrollHeight =
        previewElement.scrollHeight - previewElement.clientHeight;
      const previewScrollTop = scrollPercentage * previewScrollHeight;

      previewElement.scrollTop = previewScrollTop;
    };

    const handlePreviewScroll = () => {
      if (!editorView || !previewElement) return;

      const previewScrollTop = previewElement.scrollTop;
      const previewScrollHeight =
        previewElement.scrollHeight - previewElement.clientHeight;
      const scrollPercentage =
        previewScrollHeight > 0 ? previewScrollTop / previewScrollHeight : 0;

      const editorScrollHeight =
        editorView.scrollDOM.scrollHeight - editorView.scrollDOM.clientHeight;
      const editorScrollTop = scrollPercentage * editorScrollHeight;

      editorView.scrollDOM.scrollTop = editorScrollTop;
    };

    const editorScrollDOM = editorView.scrollDOM;
    editorScrollDOM.addEventListener("scroll", handleEditorScroll, {
      passive: true,
    });
    previewElement.addEventListener("scroll", handlePreviewScroll, {
      passive: true,
    });

    return () => {
      editorScrollDOM.removeEventListener("scroll", handleEditorScroll);
      previewElement.removeEventListener("scroll", handlePreviewScroll);
    };
  }, [viewMode, currentContent]);

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
                  ref={editorRef}
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
                  height="100%"
                />
              </div>
            )}

            {/* Preview */}
            {(viewMode === "preview" || viewMode === "split") && (
              <motion.div
                ref={previewRef}
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
