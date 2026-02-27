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

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useWizardStore } from "../store";
import { useEditorStore } from "../store";
import { StepInfo } from "./wizard/StepInfo";
import { StepStack } from "./wizard/StepStack";
import { StepFeatures } from "./wizard/StepFeatures";
import { StepReview } from "./wizard/StepReview";
import { StepGenerating } from "./wizard/StepGenerating";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import {
  useFocusOnStepChange,
  useStepAnnouncer,
} from "../hooks/useFocusOnStepChange";
import { WIZARD_STEPS } from "../config/constants";

/**
 * Human-readable titles for each wizard step.
 * Used for document title and accessibility announcements.
 */
const STEP_TITLES: Record<string, string> = {
  info: "Project Info",
  stack: "Tech Stack",
  features: "Features",
  review: "Review",
  generating: "Generating...",
};

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
  const currentStepLabel =
    WIZARD_STEPS.find((s) => s.key === currentStep)?.label || currentStep;
  useStepAnnouncer(currentStep, currentStepLabel);

  const documentTitle =
    isGenerating && generationProgress
      ? `⏳ ${generationProgress}`
      : STEP_TITLES[currentStep] || "Project Wizard";
  useDocumentTitle(documentTitle);

  const renderStep = () => {
    switch (currentStep) {
      case "info":
        return <StepInfo key="info" />;
      case "stack":
        return <StepStack key="stack" />;
      case "features":
        return <StepFeatures key="features" />;
      case "review":
        return <StepReview key="review" />;
      case "generating":
        return <StepGenerating key="generating" />;
      default:
        return <StepInfo key="default" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6"
      role="region"
      aria-label={`Wizard step: ${currentStepLabel}`}
    >
      <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
    </div>
  );
}

/**
 * Memoized wizard component export.
 * Re-renders only when wizard step or generation state changes.
 */
export const Wizard = React.memo(WizardComponent);
