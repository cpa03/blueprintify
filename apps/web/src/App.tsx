import { useState, lazy, Suspense, useEffect, useCallback, useRef } from "react";
import {
  WIZARD_STEP_KEYS,
  SHORTCUT_DESCRIPTIONS,
  SCROLL_THRESHOLD_DEFAULTS,
  SCROLL_PROGRESS_DEFAULTS,
  UI_TIMEOUTS,
} from "@blueprint/shared";
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
const PageScrollProgressBar = lazy(() => import("./components/PageScrollProgressBar"));
const ScrollToTop = lazy(() =>
  import("./components/ScrollToTop").then((m) => ({ default: m.ScrollToTop }))
);
const ScrollToBottomLazy = lazy(() =>
  import("./components/ScrollToTop").then((m) => ({ default: m.ScrollToBottom }))
);
import { KeyboardShortcutTooltip } from "./components/SmartTooltip";
import { useWizardStore, useEditorStore, useToast, useToastStore } from "./store";
import { useOnlineStatus } from "./hooks";
import {
  UI_CONTENT,
  EXTERNAL_URLS,
  NETWORK_MESSAGES,
  ENTRANCE_STAGGER,
  ACCESSIBILITY_LABELS,
} from "./config/constants";
import { LAYOUT, BUTTON, ICON, SPINNER } from "./config/styles";
import { getAriaShortcutKey } from "./lib/platform";
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
          <div key={i} className="glass-card p-5 min-h-35">
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
  const [editorExiting, setEditorExiting] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [templatesExiting, setTemplatesExiting] = useState(false);
  // Defer framer-motion (45 KB) from initial load: only mount the Wizard
  // after user interaction or a 3s fallback timeout. The flag is derived
  // from store conditions + user interaction, avoiding setState-in-effect.
  const [userInteracted, setUserInteracted] = useState(false);
  // Defer non-critical lazy components (PageScrollProgressBar, ScrollToTop,
  // ScrollToBottom) from initial mount to prevent triggering their dynamic
  // imports — and framer-motion — during the critical rendering path.
  const [deferMount, setDeferMount] = useState(false);

  // Derive mount condition from existing store state + interaction flag
  const wizardActivated =
    userInteracted || currentStep !== WIZARD_STEP_KEYS.INFO || hasContent || isGenerating;

  // Activate wizard on first user interaction (template select, step change)
  const activateWizard = useCallback(() => {
    setUserInteracted(true);
  }, []);

  // Defer mount state — activates after a brief timeout so non-critical lazy
  // components (PageScrollProgressBar, ScrollToTop, ScrollToBottom) don't
  // trigger their dynamic imports — and framer-motion — during first paint.
  useEffect(() => {
    const timer = setTimeout(() => setDeferMount(true), UI_TIMEOUTS.DEFER_MOUNT);
    return () => clearTimeout(timer);
  }, []);

  // Note: no fallback timeout — the wizard activates only on user interaction
  // (template select, step change) or when content is already present.
  // This keeps framer-motion (~136 KB) out of the initial load for first-time
  // visitors, improving unused-JavaScript metrics and Time to Interactive.
  const previousHasContentRef = useRef(hasContent);
  const previousIsGeneratingRef = useRef(isGenerating);
  const prevShowTemplatesRef = useRef(currentStep === WIZARD_STEP_KEYS.INFO && !hasContent);

  const { isOnline } = useOnlineStatus();
  const toast = useToast();
  const prevOnlineRef = useRef(isOnline);
  const toastCount = useToastStore((s) => s.toasts.length);

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

  // Templates exit animation — when the hero/templates should disappear, we
  // animate them out with a CSS animation before removing them from the DOM.
  // This prevents the abrupt unmount that previously occurred when navigating
  // away from the first step or after content generation completes.
  const showTemplates = currentStep === WIZARD_STEP_KEYS.INFO && !hasContent && !templatesExiting;

  useEffect(() => {
    const wasVisible = prevShowTemplatesRef.current;
    const isNowVisible = currentStep === WIZARD_STEP_KEYS.INFO && !hasContent;

    // Detect transition from visible → hidden and trigger exit animation
    if (wasVisible && !isNowVisible && !templatesExiting) {
      setTemplatesExiting(true);
    }

    prevShowTemplatesRef.current = isNowVisible;
  }, [currentStep, hasContent, templatesExiting]);

  // Backup cleanup timeout — ensures templatesExiting gets reset even if
  // onAnimationEnd doesn't fire (prefers-reduced-motion, browser quirks)
  useEffect(() => {
    if (templatesExiting) {
      const timer = setTimeout(() => {
        setTemplatesExiting(false);
      }, UI_TIMEOUTS.TEMPLATES_EXIT);
      return () => clearTimeout(timer);
    }
  }, [templatesExiting]);

  const handleTemplatesExitEnd = useCallback(() => {
    setTemplatesExiting(false);
  }, []);

  // Memoized handlers for stable references to child components
  const handleHideEditor = useCallback(() => {
    setEditorExiting(true);
  }, []);
  const handleHideEditorComplete = useCallback(() => {
    setShowEditor(false);
    setEditorExiting(false);
    // After the editor panel unmounts and ShowEditorButton mounts,
    // focus the toggle button so keyboard/screen-reader users don't
    // lose their place in the document (WCAG 2.4.3 Focus Order).
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>("[data-editor-toggle]")?.focus();
    });
  }, []);
  const handleShowEditor = useCallback(() => setShowEditor(true), []);
  const handleShowShortcuts = useCallback(() => setShowShortcutsModal(true), []);
  const handleHideShortcuts = useCallback(() => setShowShortcutsModal(false), []);
  const handleCelebrationComplete = useCallback(() => setShowCelebration(false), []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        if (showEditor || editorExiting) {
          setEditorExiting(true);
        } else {
          setShowEditor(true);
        }
      }

      if (e.key === "Escape" && isGenerating) {
        e.preventDefault();
        cancelGeneration();
      }
    },
    [isGenerating, cancelGeneration, showEditor, editorExiting]
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
      {/* Ambient background glow — slow drifting gradient behind all content */}
      <div className="fixed inset-0 pointer-events-none z-0 ambient-glow" aria-hidden="true" />

      <SkipLink />
      <Header onShowShortcuts={handleShowShortcuts} />

      {/* Offline banner - persistent connectivity status */}
      <OfflineBanner />

      {/* Page scroll progress — deferred via deferMount to keep framer-motion
          out of the critical rendering path. Only mounts after 2s timeout. */}
      {deferMount && (
        <Suspense fallback={null}>
          <PageScrollProgressBar
            showAfter={SCROLL_PROGRESS_DEFAULTS.PAGE_PROGRESS_SHOW_AFTER_PX}
            height={SCROLL_PROGRESS_DEFAULTS.PAGE_PROGRESS_BAR_HEIGHT_PX}
          />
        </Suspense>
      )}

      {/* Main Content */}
      <main id="main-content" className={LAYOUT.MAIN_CONTENT} tabIndex={-1}>
        <div className={LAYOUT.CONTENT_CONTAINER}>
          {/* Hero section (only on first view) - Critical LCP element, no opacity animation on title.
              Subtitle gets a subtle delayed entrance for a polished cascade feel.
              On exit, fades/slides upward for a smooth transition when navigating away. */}
          {(showTemplates || templatesExiting) && (
            <div className={templatesExiting ? "animate-slide-out-up" : LAYOUT.HERO_SECTION}>
              <h1 className={LAYOUT.HERO_TITLE}>
                {UI_CONTENT.HERO.TITLE_1}
                <span className="text-gradient">{UI_CONTENT.HERO.TITLE_HIGHLIGHT_1}</span>
                {UI_CONTENT.HERO.TITLE_2}
                <span className="text-gradient">{UI_CONTENT.HERO.TITLE_HIGHLIGHT_2}</span>
                {UI_CONTENT.HERO.TITLE_3}
              </h1>
              <p
                className={`${LAYOUT.HERO_SUBTITLE} animate-slide-up`}
                style={{
                  animationDelay: `${ENTRANCE_STAGGER.BASE_DELAY_S}s`,
                  animationFillMode: ENTRANCE_STAGGER.FILL_MODE,
                }}
              >
                {UI_CONTENT.HERO.SUBTITLE}
              </p>
            </div>
          )}

          {/* Templates - with exit animation */}
          {(showTemplates || templatesExiting) && (
            <div
              className={templatesExiting ? "animate-slide-out-up" : "animate-fade-in"}
              onAnimationEnd={templatesExiting ? handleTemplatesExitEnd : undefined}
            >
              <Suspense fallback={<TemplateGridSkeleton />}>
                <TemplateGrid onSelect={activateWizard} />
              </Suspense>
              <div className={LAYOUT.TEMPLATES_DIVIDER}>{UI_CONTENT.TEMPLATES_DIVIDER}</div>
            </div>
          )}

          {/* Step Indicator — slides up on page load with hero-adjacent timing */}
          <div
            className="animate-slide-up"
            style={{
              animationDelay: `${ENTRANCE_STAGGER.SHORT_DELAY_S}s`,
              animationFillMode: ENTRANCE_STAGGER.FILL_MODE,
            }}
          >
            <StepIndicator />
          </div>

          {/* Split Pane Layout — slides up slightly after the step indicator for a staggered cascade */}
          <div
            className={`${LAYOUT.SPLIT_PANE} animate-slide-up`}
            style={{
              animationDelay: `${ENTRANCE_STAGGER.MEDIUM_DELAY_S}s`,
              animationFillMode: ENTRANCE_STAGGER.FILL_MODE,
            }}
          >
            {/* Wizard Panel — deferred until first interaction to keep
                framer-motion (45 KB) out of the initial page load */}
            <div
              className={`${LAYOUT.GLASS_CARD_FLEX} ${
                showEditor ? LAYOUT.HALF_WIDTH : LAYOUT.FULL_WIDTH
              }`}
            >
              {wizardActivated ? (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-16">
                      <div className={SPINNER.DEFAULT}></div>
                    </div>
                  }
                >
                  <Wizard />
                </Suspense>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="h-5 w-36 bg-dark-700 rounded animate-pulse" />
                  <div className="h-10 w-full bg-dark-700 rounded animate-pulse" />
                  <div className="h-5 w-48 bg-dark-700 rounded animate-pulse" />
                  <div className="h-24 w-full bg-dark-700 rounded animate-pulse" />
                  <div className="h-5 w-32 bg-dark-700 rounded animate-pulse" />
                  <div className="h-10 w-full bg-dark-700 rounded animate-pulse" />
                </div>
              )}
            </div>

            {/* Editor Panel */}
            {(showEditor || editorExiting) && (
              <div
                id="editor-panel"
                className={`${LAYOUT.HALF_WIDTH} ${LAYOUT.GLASS_CARD} ${
                  editorExiting ? "animate-slide-out-right" : "animate-slide-in-right"
                }`}
                onAnimationEnd={editorExiting ? handleHideEditorComplete : undefined}
              >
                <KeyboardShortcutTooltip
                  shortcut="e"
                  description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR}
                  position="left"
                >
                  <button
                    onClick={handleHideEditor}
                    className={`${BUTTON.HIDE_EDITOR_DESKTOP} transition-transform duration-150 active:scale-90 hover:scale-110`}
                    aria-label={ACCESSIBILITY_LABELS.EDITOR.HIDE_EDITOR}
                    title={ACCESSIBILITY_LABELS.EDITOR.HIDE_EDITOR_TITLE}
                    aria-keyshortcuts={getAriaShortcutKey("e", "cmd")}
                    aria-controls="editor-panel"
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

                <KeyboardShortcutTooltip
                  shortcut="e"
                  description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR}
                  position="left"
                >
                  <button
                    onClick={handleHideEditor}
                    className={`${BUTTON.HIDE_EDITOR_MOBILE} transition-transform duration-150 active:scale-90 hover:scale-110`}
                    aria-label={ACCESSIBILITY_LABELS.EDITOR.HIDE_EDITOR}
                    title={ACCESSIBILITY_LABELS.EDITOR.HIDE_EDITOR_TITLE}
                    aria-keyshortcuts={getAriaShortcutKey("e", "cmd")}
                    aria-controls="editor-panel"
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
                    <div className="h-full min-h-100 flex items-center justify-center text-dark-500">
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

          {/* Show editor button when hidden — glows when content is ready */}
          {!showEditor && (
            <Suspense fallback={null}>
              <ShowEditorButton
                onClick={handleShowEditor}
                hasContent={hasContent}
                isGenerating={isGenerating}
              />
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
          <p className="text-dark-500 hover:text-dark-300 transition-colors duration-200">
            Built with ⚡{" "}
            <a
              href={EXTERNAL_URLS.CLOUDFLARE_WORKERS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 group underline decoration-primary-500/30 hover:decoration-primary-500 underline-offset-2 transition-all duration-200 hover:scale-102"
              aria-label={ACCESSIBILITY_LABELS.EXTERNAL_LINKS.CLOUDFLARE_WORKERS}
            >
              Cloudflare Workers
              <svg
                className="w-3 h-3 opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-10 4L21 3"
                />
              </svg>
            </a>{" "}
            +{" "}
            <a
              href={EXTERNAL_URLS.REACT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 group underline decoration-primary-500/30 hover:decoration-primary-500 underline-offset-2 transition-all duration-200 hover:scale-102"
              aria-label={ACCESSIBILITY_LABELS.EXTERNAL_LINKS.REACT}
            >
              React
              <svg
                className="w-3 h-3 opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-10 4L21 3"
                />
              </svg>
            </a>
          </p>
          <p className="text-dark-500">{UI_CONTENT.FOOTER.COPYRIGHT}</p>
        </div>
      </footer>

      {/* ToastContainer is conditionally rendered to defer the framer-motion
          animation chunk until a toast actually appears. On initial page load
          there are no toasts, so this saves ~46 KB gzip from being loaded. */}
      {toastCount > 0 && (
        <Suspense fallback={null}>
          <ToastContainer />
        </Suspense>
      )}

      {showShortcutsModal && (
        <Suspense fallback={null}>
          <KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={handleHideShortcuts} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <GenerationCelebration
          isComplete={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      </Suspense>

      {/* Floating scroll buttons — deferred via deferMount to keep framer-motion
          out of the critical path. Only mount after 2s timeout. */}
      {deferMount && (
        <>
          <div className="fixed bottom-6 right-6 z-30">
            <Suspense fallback={null}>
              <ScrollToTop showAfter={SCROLL_THRESHOLD_DEFAULTS.SCROLL_TO_TOP_PX} />
            </Suspense>
          </div>
          <div className="fixed bottom-6 left-6 z-30">
            <Suspense fallback={null}>
              <ScrollToBottomLazy showAfter={SCROLL_THRESHOLD_DEFAULTS.SCROLL_TO_TOP_PX} />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
