import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRefinementStore } from "../../store/refinement";
import { useSessionStore } from "../../store/session";
import { useEditorStore } from "../../store/editor";
import { useToast } from "../../store/toast";
import clsx from "clsx";

interface RefinementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RefinementPanel({ isOpen, onClose }: RefinementPanelProps) {
  const [localInstruction, setLocalInstruction] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    isRefining,
    selectedSection,
    refinementHistory,
    startRefinement,
    setInstruction: setStoreInstruction,
    setSelectedContent,
  } = useRefinementStore();

  const { currentSession, saveSession } = useSessionStore();
  const { blueprintContent, tasksContent, activeTab } = useEditorStore();
  const toast = useToast();

  const currentContent =
    activeTab === "blueprint" ? blueprintContent : tasksContent;
  const hasContent = currentContent.length > 0;

  const handleSectionSelect = (section: "blueprint" | "tasks" | "section") => {
    let content = "";
    switch (section) {
      case "blueprint":
        content = blueprintContent;
        break;
      case "tasks":
        content = tasksContent;
        break;
      case "section":
        content = currentContent;
        break;
    }

    setSelectedContent(content, section);
  };

  const handleRefine = async () => {
    if (!localInstruction.trim() || !hasContent) {
      toast.error("Please provide an instruction and select content to refine");
      return;
    }

    const content =
      selectedSection === "section"
        ? currentContent
        : selectedSection === "blueprint"
          ? blueprintContent
          : tasksContent;

    try {
      await startRefinement({
        content,
        instruction: localInstruction.trim(),
        context: `Current project: ${currentSession?.title || "Untitled"}\nActive tab: ${activeTab}`,
      });

      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          generatedBlueprint:
            selectedSection === "blueprint" ? content : blueprintContent,
          generatedTasks: selectedSection === "tasks" ? content : tasksContent,
        };

        saveSession(updatedSession);
      }

      toast.success("Content refined successfully!");
      setStoreInstruction("");
    } catch (error) {
      toast.error("Refinement failed. Please try again.");
    }
  };

  const handleHistoryItem = (item: any) => {
    setStoreInstruction(item.instruction);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={clsx(
          "fixed right-0 top-0 h-full bg-dark-800 shadow-2xl z-40 flex flex-col",
          isMinimized ? "w-80" : "w-96",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h3 className="font-semibold">Refine Content</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-dark-400 hover:text-dark-200 transition-colors"
            >
              {isMinimized ? "⬇" : "⬆"}
            </button>
            <button
              onClick={onClose}
              className="text-dark-400 hover:text-dark-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Content Selection */}
            <div className="p-4 border-b border-dark-700">
              <label className="block text-sm font-medium mb-2">
                Content to Refine:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSectionSelect("blueprint")}
                  className={clsx(
                    "px-3 py-2 text-sm rounded transition-colors",
                    selectedSection === "blueprint"
                      ? "bg-primary-600 text-white"
                      : "bg-dark-700 text-dark-300 hover:bg-dark-600",
                  )}
                  disabled={!blueprintContent}
                >
                  📘 Blueprint
                </button>
                <button
                  onClick={() => handleSectionSelect("tasks")}
                  className={clsx(
                    "px-3 py-2 text-sm rounded transition-colors",
                    selectedSection === "tasks"
                      ? "bg-primary-600 text-white"
                      : "bg-dark-700 text-dark-300 hover:bg-dark-600",
                  )}
                  disabled={!tasksContent}
                >
                  📋 Tasks
                </button>
              </div>
            </div>

            {/* Instruction Input */}
            <div className="p-4 border-b border-dark-700">
              <label className="block text-sm font-medium mb-2">
                Refinement Instruction:
              </label>
              <textarea
                value={localInstruction}
                onChange={(e) => setLocalInstruction(e.target.value)}
                placeholder="e.g., Make this more detailed, add security considerations, improve code examples..."
                className="w-full h-24 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg resize-none focus:outline-none focus:border-primary-500 text-sm"
                disabled={isRefining}
              />
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-b border-dark-700">
              <button
                onClick={handleRefine}
                disabled={isRefining || !localInstruction.trim() || !hasContent}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:text-dark-400 text-white rounded-lg transition-colors font-medium"
              >
                {isRefining ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Refining...
                  </div>
                ) : (
                  "Refine Content"
                )}
              </button>
            </div>

            {/* History */}
            {refinementHistory.length > 0 && (
              <div className="flex-1 overflow-y-auto p-4">
                <h4 className="text-sm font-medium mb-3 text-dark-300">
                  Recent Refinements:
                </h4>
                <div className="space-y-2">
                  {refinementHistory.slice(0, 5).map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors"
                      onClick={() => handleHistoryItem(item)}
                    >
                      <div className="text-xs text-dark-400 mb-1">
                        {formatDate(item.timestamp)}
                      </div>
                      <div className="text-sm line-clamp-2">
                        {item.instruction}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
