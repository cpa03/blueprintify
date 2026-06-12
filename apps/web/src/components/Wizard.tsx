/**
 * @fileoverview Wizard component for the project configuration workflow.
 *
 * This component manages the 5-step wizard flow for creating new project blueprints:
 * 1. Info - Basic project information (name, description)
 * 2. Stack - Technology stack selection
 * 3. Features - Feature selection for the project
 * 4. Review - Review and confirm all selections
 * 5. Generating - AI generation with progress display
 *
 * The wizard integrates with Zustand stores for state persistence and uses
 * Framer Motion for step transitions. Accessibility features include:
 * - Focus management on step changes
 * - Screen reader announcements for navigation
 * - Dynamic document titles showing progress
 *
 * @module components/Wizard
 * @see {@link useWizardStore} - Wizard state management
 * @see {@link useEditorStore} - Generation state tracking
 */

import React, { Suspense, lazy, useState, useEffect, useRef, useCallback } from "react";
import { StepTransition } from "./StepTransition";
import { useWizardStore } from "../store";
import { useEditorStore } from "../store";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useFocusOnStepChange, useStepAnnouncer } from "../hooks/useFocusOnStepChange";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { WIZARD_STEPS, STEP_TITLES } from "../config/constants";
import { SPINNER } from "../config/styles";
import { WIZARD_STEP_KEYS } from "@blueprint/shared";
import { LAYOUT } from "../config/theme";
import type { AnimationDirection } from "../utils/motion";

// Lazy load step components — only one renders at a time, so eager imports waste bandwidth
const StepInfo = lazy(() => import("./wizard/StepInfo").then((m) => ({ default: m.StepInfo })));
const StepStack = lazy(() => import("./wizard/StepStack").then((m) => ({ default: m.StepStack })));
const StepFeatures = lazy(() =>
  import("./wizard/StepFeatures").then((m) => ({ default: m.StepFeatures }))
);
const StepReview = lazy(() =>
  import("./wizard/StepReview").then((m) => ({ default: m.StepReview }))
);
const StepGenerating = lazy(() =>
  import("./wizard/StepGenerating").then((m) => ({ default: m.StepGenerating }))
);

/**
 * Main wizard component that renders the current step content.
 *
 * This component handles:
 * - Step rendering based on current wizard state
 * - Focus management for accessibility when steps change
 * - Screen reader announcements for navigation
 * - Dynamic document title updates (shows progress during generation)
 *
 * @returns The rendered wizard step component wrapped in AnimatePresence
 * @example
 * // In App.tsx or layout
 * <Wizard />
 */
function WizardComponent(): JSX.Element {
  const currentStep = useWizardStore((s) => s.currentStep);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const generationProgress = useEditorStore((s) => s.generationProgress);
  const containerRef = useFocusOnStepChange(currentStep);
  const currentStepLabel = WIZARD_STEPS.find((s) => s.key === currentStep)?.label || currentStep;
  useStepAnnouncer(currentStep, currentStepLabel);

  // Scroll shadow state — subtle gradient overlays that gently fade in at the
  // top/bottom edges when content is scrolled off-screen, providing spatial
  // awareness within the scrollable wizard panel. Disabled when reduced motion
  // is preferred, since the whole point is a visual transition cue.
  const [scrollState, setScrollState] = useState({ isTop: true, isBottom: false });
  const shouldReduceMotion = useReducedMotion();
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || shouldReduceMotion) return;
    const isTop = el.scrollTop <= 4;
    const isBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) <= 4;
    setScrollState((prev) => {
      if (prev.isTop === isTop && prev.isBottom === isBottom) return prev;
      return { isTop, isBottom };
    });
  }, [containerRef, shouldReduceMotion]);

  // Derive animation direction from step index changes
  const [direction, setDirection] = useState<AnimationDirection>("forward");
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    const prevIdx = WIZARD_STEPS.findIndex((s) => s.key === prevStepRef.current);
    const currIdx = WIZARD_STEPS.findIndex((s) => s.key === currentStep);

    if (currIdx !== prevIdx) {
      setDirection(currIdx > prevIdx ? "forward" : "backward");
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  const handleCmdEnter = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (currentStep === WIZARD_STEP_KEYS.GENERATING) return;
        if (document.activeElement?.tagName === "TEXTAREA") return;

        const primaryBtn = document.querySelector<HTMLButtonElement>(".btn-primary:not(:disabled)");
        if (primaryBtn) {
          e.preventDefault();
          primaryBtn.click();
        }
      }
    },
    [currentStep]
  );

  const handleAltArrowLeft = useCallback(
    (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowLeft") {
        // Skip during generation — prevents navigating away mid-stream
        if (currentStep === WIZARD_STEP_KEYS.GENERATING) return;
        if (currentStep === WIZARD_STEP_KEYS.INFO) return; // Already at the first step

        const prevBtn = document.querySelector<HTMLButtonElement>(".btn-secondary:not(:disabled)");
        if (prevBtn) {
          e.preventDefault();
          prevBtn.click();
        }
      }
    },
    [currentStep]
  );

  const handleAltArrowRight = useCallback(
    (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowRight") {
        // Skip during generation — prevents navigating away mid-stream
        if (currentStep === WIZARD_STEP_KEYS.GENERATING) return;
        if (currentStep === WIZARD_STEP_KEYS.REVIEW) return; // Review is the last step before generation

        const nextBtn = document.querySelector<HTMLButtonElement>(".btn-primary:not(:disabled)");
        if (nextBtn) {
          e.preventDefault();
          nextBtn.click();
        }
      }
    },
    [currentStep]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleCmdEnter);
    window.addEventListener("keydown", handleAltArrowLeft);
    window.addEventListener("keydown", handleAltArrowRight);
    return () => {
      window.removeEventListener("keydown", handleCmdEnter);
      window.removeEventListener("keydown", handleAltArrowLeft);
      window.removeEventListener("keydown", handleAltArrowRight);
    };
  }, [handleCmdEnter, handleAltArrowLeft, handleAltArrowRight]);

  const documentTitle =
    isGenerating && generationProgress
      ? `⏳ ${generationProgress}`
      : STEP_TITLES[currentStep] || "Project Wizard";
  useDocumentTitle(documentTitle);

  const renderStep = (): JSX.Element => {
    const stepElement = (() => {
      switch (currentStep) {
        case WIZARD_STEP_KEYS.INFO:
          return <StepInfo key={WIZARD_STEP_KEYS.INFO} direction={direction} />;
        case WIZARD_STEP_KEYS.STACK:
          return <StepStack key={WIZARD_STEP_KEYS.STACK} direction={direction} />;
        case WIZARD_STEP_KEYS.FEATURES:
          return <StepFeatures key={WIZARD_STEP_KEYS.FEATURES} direction={direction} />;
        case WIZARD_STEP_KEYS.REVIEW:
          return <StepReview key={WIZARD_STEP_KEYS.REVIEW} direction={direction} />;
        case WIZARD_STEP_KEYS.GENERATING:
          return <StepGenerating key={WIZARD_STEP_KEYS.GENERATING} direction={direction} />;
        default:
          return <StepInfo key="default" direction={direction} />;
      }
    })();

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className={SPINNER.DEFAULT}></div>
          </div>
        }
      >
        {stepElement}
      </Suspense>
    );
  };

  const scrollShadowVisible = !shouldReduceMotion;
  const shadowOpacity = scrollShadowVisible ? undefined : 0;

  return (
    <div className="relative flex h-full">
      {/* Top scroll shadow — fades in when wizard content is scrolled down,
          providing a subtle spatial cue that content is hidden above. */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200"
        style={{
          opacity: shadowOpacity ?? (scrollState.isTop ? 0 : 1),
          height: `${LAYOUT.SCROLL_SHADOW_HEIGHT_PX}px`,
          background: LAYOUT.SCROLL_SHADOW_TOP_GRADIENT,
        }}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6"
        role="region"
        aria-label={`Wizard step: ${currentStepLabel}`}
      >
        <StepTransition mode="wait">{renderStep()}</StepTransition>
      </div>

      {/* Bottom scroll shadow — fades in when there's more wizard content
          below the visible area, hinting the user to keep scrolling. */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none transition-opacity duration-200"
        style={{
          opacity: shadowOpacity ?? (scrollState.isBottom ? 0 : 1),
          height: `${LAYOUT.SCROLL_SHADOW_HEIGHT_PX}px`,
          background: LAYOUT.SCROLL_SHADOW_BOTTOM_GRADIENT,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Memoized wizard component export.
 * Re-renders only when wizard step or generation state changes.
 */
export const Wizard = React.memo(WizardComponent);
