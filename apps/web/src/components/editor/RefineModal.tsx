import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EditorTab } from "@blueprint/shared";

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefine: (instruction: string, context?: string) => void;
  isRefining: boolean;
  activeTab: EditorTab;
  currentContent: string;
}

export function RefineModal({
  isOpen,
  onClose,
  onRefine,
  isRefining,
  activeTab,
  currentContent,
}: RefineModalProps) {
  const [instruction, setInstruction] = useState("");
  const [context, setContext] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (instruction.trim()) {
      onRefine(instruction, context.trim() || undefined);
      setInstruction("");
      setContext("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="glass-card w-full max-w-2xl shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="refine-modal-title"
            >
              <div className="p-6 border-b border-dark-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      id="refine-modal-title"
                      className="text-xl font-semibold text-white"
                    >
                      Refine {activeTab === "blueprint" ? "Blueprint" : "Tasks"}
                    </h2>
                    <p className="text-sm text-dark-400 mt-1">
                      Provide instructions to improve the content
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={isRefining}
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-5 h-5"
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
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Current Content Preview */}
                <div>
                  <label className="label">Current Content Preview</label>
                  <div className="p-4 bg-dark-900/50 border border-dark-700 rounded-lg max-h-40 overflow-y-auto">
                    <p className="text-sm text-dark-400 whitespace-pre-wrap">
                      {currentContent.substring(0, 500)}
                      {currentContent.length > 500 && "..."}
                    </p>
                  </div>
                </div>

                {/* Instruction */}
                <div>
                  <label htmlFor="refine-instruction" className="label">
                    Refinement Instruction{" "}
                    <span className="text-accent-pink" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <textarea
                    id="refine-instruction"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="e.g., Add more details about the database schema, improve the API documentation, add deployment instructions..."
                    className="textarea-field h-24"
                    disabled={isRefining}
                    required
                    aria-required="true"
                  />
                </div>

                {/* Context (Optional) */}
                <div>
                  <label htmlFor="refine-context" className="label">
                    Additional Context{" "}
                    <span className="text-dark-500">(optional)</span>
                  </label>
                  <textarea
                    id="refine-context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Provide any additional context or constraints that should be considered..."
                    className="textarea-field h-20"
                    disabled={isRefining}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isRefining}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!instruction.trim() || isRefining}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isRefining ? (
                      <>
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
                        Refining...
                      </>
                    ) : (
                      <>
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
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        Refine Content
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
