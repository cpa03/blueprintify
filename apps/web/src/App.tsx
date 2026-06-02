import { useState, lazy, Suspense, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { StepIndicator } from "./components/StepIndicator";
const ShowEditorButton = lazy(() =>
  import("./components/ShowEditorButton").then((m) => ({ default: m.ShowEditorButton }))
);
const ToastContainer = lazy(() =>
  import("./components/Toast").then((m) => ({ default: m.ToastContainer }))
);
const TemplateGrid = lazy(() =>
  import("./components/TemplateGrid").then((m) => ({ default: m.TemplateGrid }))
);
const KeyboardShortcutsModal = lazy(() => import("./components/KeyboardShortcutsModal"));
import { SkipLink } from "./components/SkipLink";
import { OfflineBanner } from "./components/OfflineBanner";
import { KeyboardShortcutTooltip } from "./components/SmartTooltip";
import { useWizardStore, useEditorStore, useToast } from "./store";
import { useOnlineStatus } from "./hooks";
import { UI_CONTENT, NETWORK_MESSAGES } from "./config/constants";
import { LAYOUT, BUTTON, ICON, SPINNER } from "./config/styles";
const GenerationCelebration = lazy(() =>
  import("./components/GenerationCelebration").then((m) => ({ default: m.GenerationCelebration }))
);

// Lazy load Wizard to defer framer-motion and step components from initial bundle
const Wizard = lazy(() => import("./components/Wizard").then((m) => ({ default: m.Wizard })));

// Lazy load Editor to reduce initial bundle size
const Editor = lazy(() =>
  import("./components/Editor").then((module) => ({ default: module.Editor }))
);

// Skeleton placeholder for lazy-loaded TemplateGrid - matches actual grid dimensions to prevent CLS
function TemplateGridSkeleton(): JSX.Element {
  return (
    <section className="mb-12">
      <div className="h-7 w-48 bg-dark-700 rounded-lg mb-2 animate-pulse" />
      <div className="h-5 w-80 bg-dark-700 rounded-lg mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 min-h-[140px]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-dark-700 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-32 bg-dark-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-dark-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-dark-700 rounded animate-pulse" />
                <div className="flex gap-2 mt-3">
                  <div className="h-5 w-16 bg-dark-700 rounded-full animate-pulse" />
                  <div className="h-5 w-20 bg-dark-700 rounded-full animate-pulse" />
                  <div className="h-5 w-14 bg-dark-700 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

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

  const { isOnline } = useOnlineStatus();
  const toast = useToast();
  const prevOnlineRef = useRef(isOnline);

  useEffect(() => {
    if (prevOnlineRef.current !== isOnline) {
      if (isOnline) {
        toast.success(NETWORK_MESSAGES.ONLINE, NETWORK_MESSAGES.ONLINE_DURATION);
      } else {
        toast.warning(NETWORK_MESSAGES.OFFLINE, NETWORK_MESSAGES.OFFLINE_DURATION);
      }
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline, toast]);

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

      {/* Offline banner - persistent connectivity status */}
      <OfflineBanner />

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
          {showTemplates && (
            <div className="animate-fade-in">
              <Suspense fallback={<TemplateGridSkeleton />}>
                <TemplateGrid />
              </Suspense>
              <div className={LAYOUT.TEMPLATES_DIVIDER}>{UI_CONTENT.TEMPLATES_DIVIDER}</div>
            </div>
          )}

          {/* Step Indicator */}
          <StepIndicator />

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
                  <div className="flex items-center justify-center py-16">
                    <div className={SPINNER.DEFAULT}></div>
                  </div>
                }
              >
                <Wizard />
              </Suspense>
            </div>

            {/* Editor Panel */}
            {showEditor && (
              <div className={`${LAYOUT.HALF_WIDTH} ${LAYOUT.GLASS_CARD} animate-slide-in-right`}>
                <KeyboardShortcutTooltip shortcut="e" description="Toggle editor" position="left">
                  <button
                    onClick={handleHideEditor}
                    className={`${BUTTON.HIDE_EDITOR_DESKTOP} transition-transform duration-150 active:scale-90 hover:scale-110`}
                    aria-label="Hide editor panel"
                    title="Hide editor"
                  >
                    <svg
                      className={`${ICON.LG} transition-transform duration-200 hover:rotate-90`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </KeyboardShortcutTooltip>

                <KeyboardShortcutTooltip shortcut="e" description="Toggle editor" position="left">
                  <button
                    onClick={handleHideEditor}
                    className={`${BUTTON.HIDE_EDITOR_MOBILE} transition-transform duration-150 active:scale-90 hover:scale-110`}
                    aria-label="Hide editor panel"
                    title="Hide editor"
                  >
                    <svg
                      className={`${ICON.LG} transition-transform duration-200 hover:rotate-90`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </KeyboardShortcutTooltip>

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
              </div>
            )}
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
        {/* Gradient accent divider for visual delight */}
        <div
          className="h-px bg-gradient-to-r from-transparent via-primary-500/50 via-accent-purple/40 to-transparent"
          aria-hidden="true"
        />
        <div className={`${LAYOUT.FOOTER_CONTAINER} animate-slide-up`}>
          <p className="text-dark-500 hover:text-dark-300 transition-colors duration-200 hover:scale-[1.02]">
            {UI_CONTENT.FOOTER.BUILT_WITH}
          </p>
          <p className="text-dark-500">{UI_CONTENT.FOOTER.COPYRIGHT}</p>
        </div>
      </footer>

      <Suspense fallback={null}>
        <ToastContainer />
      </Suspense>

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
