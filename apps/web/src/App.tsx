import { useState, lazy, Suspense, useEffect, useCallback, useRef } from "react";
import {
  WIZARD_STEP_KEYS,
  SHORTCUT_DESCRIPTIONS,
  SCROLL_THRESHOLD_DEFAULTS,
  SCROLL_PROGRESS_DEFAULTS,
  UI_TIMEOUTS,
  KEYBOARD_EVENT_KEYS,
  MODIFIER_KEYS,
  ANIMATION_ENTRANCE_DELAYS,
} from "@blueprint/shared/config";
import { Header } from "./components/Header";
import { StepIndicator } from "./components/StepIndicator";
import { TemplateGrid } from "./components/TemplateGrid";
const ShowEditorButton = lazy(() =>
  import("./components/ShowEditorButton").then((m) => ({ default: m.ShowEditorButton }))
);
const ToastContainer = lazy(() =>
  import("./components/Toast").then((m) => ({ default: m.ToastContainer }))
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
import { useWizardStore, useEditorStore, useToast, useToastStore, resetAllStores } from "./store";
import { useOnlineStatus } from "./hooks";
import {
  UI_CONTENT,
  EXTERNAL_URLS,
  NETWORK_MESSAGES,
  ENTRANCE_STAGGER,
  ACCESSIBILITY_LABELS,
  TOAST_MESSAGES,
  CONFIRM_DIALOG,
} from "./config/constants";
import { LAYOUT, BUTTON, ICON, SPINNER } from "./config/styles";
import { KEYBOARD_SHORTCUTS } from "./config/constants/keyboard";
import { getAriaShortcutKey } from "./lib/platform";
import { Icon } from "./components/Icon";
const GenerationCelebration = lazy(() =>
  import("./components/GenerationCelebration").then((m) => ({ default: m.GenerationCelebration }))
);
const ConfirmDialog = lazy(() =>
  import("./components/ConfirmDialog").then((m) => ({ default: m.ConfirmDialog }))
);

// Lazy load Wizard to defer framer-motion and step components from initial bundle
const Wizard = lazy(() => import("./components/Wizard").then((m) => ({ default: m.Wizard })));

// Lazy load Editor to reduce initial bundle size
const Editor = lazy(() =>
  import("./components/Editor").then((module) => ({ default: module.Editor }))
);

function App(): JSX.Element {
  const currentStep = useWizardStore((s) => s.currentStep);
  const setStep = useWizardStore((s) => s.setStep);
  const hasContent = useEditorStore(
    (s) => s.blueprintContent.length > 0 || s.tasksContent.length > 0
  );
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const cancelGeneration = useEditorStore((s) => s.cancelGeneration);

  const [showEditor, setShowEditor] = useState(hasContent || isGenerating);
  const [editorExiting, setEditorExiting] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [shortcutsDiscovered, setShortcutsDiscovered] = useState(false);
  const showShortcutsModalRef = useRef(showShortcutsModal);
  // Keep ref in sync so the global keydown handler reads the latest state
  // without needing showShortcutsModal in its dependency array
  useEffect(() => {
    showShortcutsModalRef.current = showShortcutsModal;
  }, [showShortcutsModal]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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
  const handleShowShortcuts = useCallback(() => {
    setShortcutsDiscovered(true);
    setShowShortcutsModal(true);
  }, []);
  const handleHideShortcuts = useCallback(() => setShowShortcutsModal(false), []);
  const handleCelebrationComplete = useCallback(() => setShowCelebration(false), []);

  const handleConfirmNewProject = useCallback(() => {
    resetAllStores();
    setShowEditor(false);
    toast.info(TOAST_MESSAGES.NEW_PROJECT);
  }, [toast]);

  const handleNewProject = useCallback(() => {
    const hasExistingContent =
      useEditorStore.getState().blueprintContent.length > 0 ||
      useEditorStore.getState().tasksContent.length > 0 ||
      useWizardStore.getState().currentStep !== WIZARD_STEP_KEYS.INFO;

    if (hasExistingContent) {
      setShowConfirmDialog(true);
    } else {
      resetAllStores();
      toast.info(TOAST_MESSAGES.NEW_PROJECT);
    }
  }, [toast]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === KEYBOARD_EVENT_KEYS.QUESTION_MARK && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        // Only open from global handler — let the modal's own document-level
        // listener handle closing (it also listens for '?'). This avoids a
        // double-toggle race where the modal closes itself but the global
        // handler immediately reopens it via the functional updater.
        if (!showShortcutsModalRef.current) {
          setShowShortcutsModal(true);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === KEYBOARD_EVENT_KEYS.E) {
        e.preventDefault();
        if (showEditor || editorExiting) {
          setEditorExiting(true);
        } else {
          setShowEditor(true);
        }
      }

      // Editor has its own Cmd/Ctrl+N handler when mounted — only handle
      // globally when the editor panel is not visible to avoid double-fire.
      if ((e.metaKey || e.ctrlKey) && e.key === KEYBOARD_EVENT_KEYS.N && !showEditor) {
        e.preventDefault();
        handleNewProject();
      }

      if (e.key === KEYBOARD_EVENT_KEYS.ESCAPE && isGenerating) {
        e.preventDefault();
        cancelGeneration();
        setStep(WIZARD_STEP_KEYS.REVIEW);
        toast.info(TOAST_MESSAGES.GENERATION_CANCELLED);
      }
    },
    [isGenerating, cancelGeneration, showEditor, editorExiting, toast, setStep, handleNewProject]
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

    // Auto-hide editor when stores are reset (e.g., New Project action clears both
    // editor content and wizard state). Detecting this by watching for content
    // cleared simultaneously with wizard back at the first step — the only
    // scenario where both conditions hold simultaneously is a store reset.
    // Guards against accidental close when user manually deletes editor content
    // while staying on an active wizard step.
    if (
      hasContentChanged &&
      !hasContent &&
      useWizardStore.getState().currentStep === WIZARD_STEP_KEYS.INFO &&
      showEditor &&
      !editorExiting
    ) {
      queueMicrotask(() => {
        setEditorExiting(true);
      });
    }

    if (wasGenerating && !isGenerating && hasContent) {
      queueMicrotask(() => {
        setShowCelebration(true);
      });
    }

    previousHasContentRef.current = hasContent;
    previousIsGeneratingRef.current = isGenerating;
  }, [hasContent, isGenerating, showEditor, editorExiting]);

  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Ambient background glow — slow drifting gradient behind all content */}
      <div className="fixed inset-0 pointer-events-none z-0 ambient-glow" aria-hidden="true" />

      <SkipLink />
      <Header onShowShortcuts={handleShowShortcuts} shortcutsDiscovered={shortcutsDiscovered} />

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
              <TemplateGrid onSelect={activateWizard} />
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
                  <div className="skeleton-block h-5 w-36" />
                  <div className="skeleton-block h-10 w-full" />
                  <div className="skeleton-block h-5 w-48" />
                  <div className="skeleton-block h-24 w-full" />
                  <div className="skeleton-block h-5 w-32" />
                  <div className="skeleton-block h-10 w-full" />
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
                  shortcut={KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY}
                  description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR}
                  position="left"
                >
                  <button
                    onClick={handleHideEditor}
                    className={`${BUTTON.HIDE_EDITOR_DESKTOP} transition-transform duration-150 active:scale-90 hover:scale-110`}
                    aria-label={ACCESSIBILITY_LABELS.EDITOR.HIDE_EDITOR}
                    title={ACCESSIBILITY_LABELS.EDITOR.HIDE_EDITOR_TITLE}
                    aria-keyshortcuts={getAriaShortcutKey(
                      KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY,
                      MODIFIER_KEYS.CMD
                    )}
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
                  shortcut={KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY}
                  description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR}
                  position="left"
                >
                  <button
                    onClick={handleHideEditor}
                    className={`${BUTTON.HIDE_EDITOR_MOBILE} transition-transform duration-150 active:scale-90 hover:scale-110`}
                    aria-label={ACCESSIBILITY_LABELS.EDITOR.HIDE_EDITOR}
                    title={ACCESSIBILITY_LABELS.EDITOR.HIDE_EDITOR_TITLE}
                    aria-keyshortcuts={getAriaShortcutKey(
                      KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY,
                      MODIFIER_KEYS.CMD
                    )}
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

                {/* Editor content with staggered entrance — fades in slightly
                    after the panel finishes its slide-in, giving the close
                    buttons a moment to appear first. A subtle @ 100ms delay
                    creates a premium staggered feel without sacrificing
                    accessibility (content is visible within 300ms of panel
                    trigger). Respects prefers-reduced-motion: when active,
                    the animation is skipped entirely via the animate-fade-in
                    CSS media query. */}
                <div
                  className="animate-fade-in h-full flex flex-col"
                  style={{
                    animationDelay: `${ENTRANCE_STAGGER.SHORT_DELAY_S}s`,
                    animationFillMode: ENTRANCE_STAGGER.FILL_MODE,
                  }}
                >
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

          {/* New Project — fixed below ShowEditorButton when editor hidden + content exists */}
          {!showEditor && hasContent && !isGenerating && (
            <KeyboardShortcutTooltip
              shortcut={KEYBOARD_SHORTCUTS.NEW_PROJECT.KEY}
              description={KEYBOARD_SHORTCUTS.NEW_PROJECT.DESCRIPTION}
              position="left"
            >
              <button
                onClick={handleNewProject}
                className="fixed bottom-14 right-6 z-20 flex items-center gap-1.5 text-xs text-dark-500 hover:text-accent-pink transition-colors px-3 py-1.5 rounded-lg bg-dark-800/60 backdrop-blur-sm border border-dark-700/50 hover:border-accent-pink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/50 animate-slide-up"
                style={{
                  animationDelay: `${ANIMATION_ENTRANCE_DELAYS.SLOWER}s`,
                  animationFillMode: ENTRANCE_STAGGER.FILL_MODE,
                }}
                aria-label={ACCESSIBILITY_LABELS.EDITOR.START_NEW_PROJECT}
                aria-keyshortcuts={getAriaShortcutKey(
                  KEYBOARD_SHORTCUTS.NEW_PROJECT.KEY,
                  MODIFIER_KEYS.CMD
                )}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {UI_CONTENT.BUTTONS.NEW_PROJECT}
              </button>
            </KeyboardShortcutTooltip>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={LAYOUT.FOOTER}>
        {/* Gradient accent divider — fades in with a slight stagger after
            the footer content starts its slide-up entrance, creating a polished
            layered reveal. The divider draws in first, then the content finishes
            its rise, guiding the eye from the accent line down to the text. */}
        <div
          className="h-px bg-gradient-to-r from-transparent via-primary-500/50 via-accent-purple/40 to-transparent animate-fade-in"
          style={{
            animationDelay: `${ANIMATION_ENTRANCE_DELAYS.FAST}s`,
            animationFillMode: ENTRANCE_STAGGER.FILL_MODE,
          }}
          aria-hidden="true"
        />
        <div className={`${LAYOUT.FOOTER_CONTAINER} animate-slide-up`}>
          <p className="text-dark-500 hover:text-dark-300 transition-colors duration-200">
            <Icon
              name="lightning"
              className="w-4 h-4 inline-block mr-0.5 text-primary-400"
              ariaLabel="Lightning bolt"
            />{" "}
            <a
              href={EXTERNAL_URLS.CLOUDFLARE_WORKERS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 group underline decoration-primary-500/30 hover:decoration-primary-500 underline-offset-2 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-102"
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
              className="inline-flex items-center gap-0.5 group underline decoration-primary-500/30 hover:decoration-primary-500 underline-offset-2 motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-102"
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

      <Suspense fallback={null}>
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmNewProject}
          title={CONFIRM_DIALOG.NEW_PROJECT.TITLE}
          description={CONFIRM_DIALOG.NEW_PROJECT.DESCRIPTION}
          confirmLabel={CONFIRM_DIALOG.NEW_PROJECT.CONFIRM_LABEL}
          cancelLabel={CONFIRM_DIALOG.NEW_PROJECT.CANCEL_LABEL}
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
