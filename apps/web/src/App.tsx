import { useState, Suspense, lazy, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
const StepIndicator = lazy(() =>
  import("./components/StepIndicator").then((m) => ({ default: m.StepIndicator }))
);
const Wizard = lazy(() => import("./components/Wizard").then((m) => ({ default: m.Wizard })));
const ShowEditorButton = lazy(() =>
  import("./components/ShowEditorButton").then((m) => ({ default: m.ShowEditorButton }))
);
import { ToastContainer } from "./components/Toast";
const KeyboardShortcutsModal = lazy(() => import("./components/KeyboardShortcutsModal"));
const TemplateGrid = lazy(() =>
  import("./components/TemplateGrid").then((m) => ({ default: m.TemplateGrid }))
);
import { SkipLink } from "./components/SkipLink";
import { useWizardStore, useEditorStore } from "./store";
import { UI_CONTENT } from "./config/constants";
import { LAYOUT, FOCUS_VISIBLE_RING, BUTTON, ICON, SPINNER } from "./config/styles";
const GenerationCelebration = lazy(() =>
  import("./components/GenerationCelebration").then((m) => ({ default: m.GenerationCelebration }))
);

// Lazy load Editor to reduce initial bundle size
const Editor = lazy(() =>
  import("./components/Editor").then((module) => ({ default: module.Editor }))
);

function App(): JSX.Element {
  const currentStep = useWizardStore((s) => s.currentStep);
  const hasContent = useEditorStore(
    (s) => s.blueprintContent.length > 0 || s.tasksContent.length > 0
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

  // Memoized handlers for stable references to child components
  const handleHideEditor = useCallback(() => setShowEditor(false), []);
  const handleShowEditor = useCallback(() => setShowEditor(true), []);
  const handleShowShortcuts = useCallback(() => setShowShortcutsModal(true), []);
  const handleHideShortcuts = useCallback(() => setShowShortcutsModal(false), []);
  const handleCelebrationComplete = useCallback(() => setShowCelebration(false), []);

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
    [isGenerating, cancelGeneration, showShortcutsModal]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const hasContentChanged = hasContent !== previousHasContentRef.current;
    const isGeneratingChanged = isGenerating !== previousIsGeneratingRef.current;
    const wasGenerating = previousIsGeneratingRef.current;

    if ((hasContentChanged || isGeneratingChanged) && (hasContent || isGenerating) && !showEditor) {
      // Defer state update to avoid cascading renders per React docs
      queueMicrotask(() => {
        setShowEditor(true);
      });
    }

    if (wasGenerating && !isGenerating && hasContent) {
      queueMicrotask(() => {
        setShowCelebration(true);
      });
    }

    previousHasContentRef.current = hasContent;
    previousIsGeneratingRef.current = isGenerating;
  }, [hasContent, isGenerating, showEditor]);

  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      <SkipLink />
      <Header onShowShortcuts={handleShowShortcuts} />

      {/* Main Content */}
      <main id="main-content" className={LAYOUT.MAIN_CONTENT} tabIndex={-1}>
        <div className={LAYOUT.CONTENT_CONTAINER}>
          {/* Hero section (only on first view) - Critical LCP element, no opacity animation */}
          {showTemplates && (
            <div className={LAYOUT.HERO_SECTION}>
              <h1 className={LAYOUT.HERO_TITLE}>
                {UI_CONTENT.HERO.TITLE_1}
                <span className="text-gradient">{UI_CONTENT.HERO.TITLE_HIGHLIGHT_1}</span>
                {UI_CONTENT.HERO.TITLE_2}
                <span className="text-gradient">{UI_CONTENT.HERO.TITLE_HIGHLIGHT_2}</span>
                {UI_CONTENT.HERO.TITLE_3}
              </h1>
              <p className={LAYOUT.HERO_SUBTITLE}>{UI_CONTENT.HERO.SUBTITLE}</p>
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
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center min-h-[300px] py-12">
                      <div className={SPINNER.DEFAULT}></div>
                    </div>
                  }
                >
                  <TemplateGrid />
                </Suspense>
                <div className={LAYOUT.TEMPLATES_DIVIDER}>{UI_CONTENT.TEMPLATES_DIVIDER}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Indicator */}
          <Suspense fallback={<div className="h-12" />}>
            <StepIndicator />
          </Suspense>

          {/* Split Pane Layout */}
          <div className={LAYOUT.SPLIT_PANE}>
            {/* Wizard Panel */}
            <div
              className={`${LAYOUT.GLASS_CARD_FLEX} ${
                showEditor ? LAYOUT.HALF_WIDTH : LAYOUT.FULL_WIDTH
              }`}
            >
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[400px] py-12">
                    <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                  </div>
                }
              >
                <Wizard />
              </Suspense>
            </div>

            {/* Editor Panel */}
            <AnimatePresence>
              {showEditor && (
                <motion.div
                  initial={{ opacity: 0.95, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className={`${LAYOUT.HALF_WIDTH} ${LAYOUT.GLASS_CARD}`}
                >
                  <button
                    onClick={handleHideEditor}
                    className={BUTTON.HIDE_EDITOR_DESKTOP}
                    aria-label="Hide editor panel"
                    title="Hide editor"
                  >
                    <svg className={ICON.LG} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={handleHideEditor}
                    className={BUTTON.HIDE_EDITOR_MOBILE}
                    aria-label="Hide editor panel"
                    title="Hide editor"
                  >
                    <svg className={ICON.LG} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <div className={SPINNER.DEFAULT}></div>
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
            <Suspense fallback={null}>
              <ShowEditorButton onClick={handleShowEditor} />
            </Suspense>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={LAYOUT.FOOTER}>
        <div className={LAYOUT.FOOTER_CONTAINER}>
          <p className={FOCUS_VISIBLE_RING}>{UI_CONTENT.FOOTER.BUILT_WITH}</p>
          <p className={FOCUS_VISIBLE_RING}>{UI_CONTENT.FOOTER.COPYRIGHT}</p>
        </div>
      </footer>

      <ToastContainer />

      <Suspense fallback={null}>
        <KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={handleHideShortcuts} />
      </Suspense>

      <Suspense fallback={null}>
        <GenerationCelebration
          isComplete={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      </Suspense>
    </div>
  );
}

export default App;
