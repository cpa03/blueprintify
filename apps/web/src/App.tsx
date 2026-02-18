import {
  useState,
  Suspense,
  lazy,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { TemplateGrid } from "./components/TemplateGrid";
import { StepIndicator } from "./components/StepIndicator";
import { Wizard } from "./components/Wizard";
import { ToastContainer } from "./components/Toast";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { useWizardStore, useEditorStore } from "./store";
import { UI_CONTENT } from "./config/constants";
import { KeyboardShortcutTooltip } from "./components/SmartTooltip";
import { RippleButton } from "./components/RippleButton";
import { GenerationCelebration } from "./components/GenerationCelebration";

// Lazy load Editor to reduce initial bundle size
const Editor = lazy(() =>
  import(
    /* webpackChunkName: "editor" */
    /* webpackPrefetch: false */
    "./components/Editor"
  ).then((module) => ({ default: module.Editor })),
);

function App() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const hasContent = useEditorStore(
    (s) => s.blueprintContent.length > 0 || s.tasksContent.length > 0,
  );
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const cancelGeneration = useEditorStore((s) => s.cancelGeneration);

  const [showEditor, setShowEditor] = useState(hasContent || isGenerating);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const previousHasContentRef = useRef(hasContent);
  const previousIsGeneratingRef = useRef(isGenerating);

  // Show templates only on first step with no content
  const showTemplates = currentStep === "info" && !hasContent;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        showShortcutsModal
      ) {
        return;
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcutsModal(true);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        setShowEditor((prev) => !prev);
      }

      if (e.key === "Escape" && isGenerating) {
        e.preventDefault();
        cancelGeneration();
      }
    },
    [isGenerating, cancelGeneration, showShortcutsModal],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const hasContentChanged = hasContent !== previousHasContentRef.current;
    const isGeneratingChanged =
      isGenerating !== previousIsGeneratingRef.current;
    const wasGenerating = previousIsGeneratingRef.current;

    if (
      (hasContentChanged || isGeneratingChanged) &&
      (hasContent || isGenerating) &&
      !showEditor
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowEditor(true);
    }

    if (wasGenerating && !isGenerating && hasContent) {
      setShowCelebration(true);
    }

    previousHasContentRef.current = hasContent;
    previousIsGeneratingRef.current = isGenerating;
  }, [hasContent, isGenerating, showEditor]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onShowShortcuts={() => setShowShortcutsModal(true)} />

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Hero section (only on first view) - Critical LCP element, no opacity animation */}
          {showTemplates && (
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {UI_CONTENT.HERO.TITLE_1}
                <span className="text-gradient">
                  {UI_CONTENT.HERO.TITLE_HIGHLIGHT_1}
                </span>
                {UI_CONTENT.HERO.TITLE_2}
                <span className="text-gradient">
                  {UI_CONTENT.HERO.TITLE_HIGHLIGHT_2}
                </span>
                {UI_CONTENT.HERO.TITLE_3}
              </h1>
              <p className="text-lg text-dark-400 max-w-2xl mx-auto">
                {UI_CONTENT.HERO.SUBTITLE}
              </p>
            </div>
          )}

          {/* Templates */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0.95 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TemplateGrid />
                <div className="text-center text-dark-500 my-8">
                  {UI_CONTENT.TEMPLATES_DIVIDER}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Split Pane Layout */}
          <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
            {/* Wizard Panel */}
            <div
              className={`glass-card overflow-hidden transition-all duration-300 ${
                showEditor ? "w-full lg:w-1/2" : "w-full"
              }`}
            >
              <Wizard />
            </div>

            {/* Editor Panel */}
            <AnimatePresence>
              {showEditor && (
                <motion.div
                  initial={{ opacity: 0.95, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full lg:w-1/2 glass-card overflow-hidden relative"
                >
                  <button
                    onClick={() => setShowEditor(false)}
                    className="hidden lg:flex absolute top-4 right-4 z-10 btn-ghost"
                    title="Hide editor"
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

                  <button
                    onClick={() => setShowEditor(false)}
                    className="lg:hidden absolute top-4 right-4 z-10 btn-ghost bg-dark-800/90 backdrop-blur-sm"
                    title="Hide editor"
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

                  <Suspense
                    fallback={
                      <div className="h-full min-h-[400px] flex items-center justify-center text-dark-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                          <span>{UI_CONTENT.EDITOR.LOADING}</span>
                        </div>
                      </div>
                    }
                  >
                    <Editor />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Show editor button when hidden */}
          {!showEditor && (
            <KeyboardShortcutTooltip
              shortcut="e"
              description="Toggle editor"
              position="left"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <RippleButton
                  onClick={() => setShowEditor(true)}
                  className="fixed bottom-6 right-6 btn-primary shadow-2xl"
                  ariaLabel={`${UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON} (Cmd/Ctrl + E)`}
                >
                  <span className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON}
                  </span>
                </RippleButton>
              </motion.div>
            </KeyboardShortcutTooltip>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-dark-500">
          <p>{UI_CONTENT.FOOTER.BUILT_WITH}</p>
          <p>{UI_CONTENT.FOOTER.COPYRIGHT}</p>
        </div>
      </footer>

      <ToastContainer />

      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      <GenerationCelebration
        isComplete={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}

export default App;
