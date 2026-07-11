/**
 * @fileoverview Blueprint streaming hook for AI-powered content generation
 *
 * This hook manages the streaming generation workflow for blueprints and tasks.
 * It coordinates between the wizard state and editor state to provide a seamless
 * generation experience with real-time progress updates.
 *
 * @module hooks/useBlueprintStream
 * @see {@link module:store/wizard} for wizard state management
 * @see {@link module:store/editor} for editor state management
 */

import { useCallback } from "react";
import { useWizardStore, useEditorStore } from "../store";
import { generateBlueprint, generateTasks } from "../lib/api";
import type { BlueprintRequest } from "@blueprint/shared/types";
import { WIZARD_STEP_KEYS } from "@blueprint/shared/config";
import { GENERATION_MESSAGES } from "../config/constants";

/**
 * Hook for managing the blueprint and task streaming generation workflow
 *
 * This hook provides a complete interface for:
 * - Starting AI-powered blueprint generation from wizard input
 * - Streaming blueprint content in real-time to the editor
 * - Automatically generating tasks once the blueprint is complete
 * - Canceling ongoing generation
 * - Tracking generation progress
 *
 * The generation flow:
 * 1. User completes wizard steps with project details
 * 2. `startGeneration()` is called
 * 3. Blueprint is generated and streamed to editor
 * 4. Tasks are automatically generated from the blueprint
 * 5. Generation completes with progress notification
 *
 * @returns {Object} Generation control interface
 * @returns {Function} returns.startGeneration - Begin the blueprint generation process
 * @returns {Function} returns.cancelGeneration - Cancel the current generation
 * @returns {boolean} returns.isGenerating - Whether generation is in progress
 * @returns {string} returns.progress - Current progress message
 *
 * @example
 * ```tsx
 * function GenerateButton() {
 *   const { startGeneration, cancelGeneration, isGenerating, progress } = useBlueprintStream();
 *
 *   return (
 *     <div>
 *       {isGenerating ? (
 *         <>
 *           <p>{progress}</p>
 *           <button onClick={cancelGeneration}>Cancel</button>
 *         </>
 *       ) : (
 *         <button onClick={startGeneration}>Generate Blueprint</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBlueprintStream(): {
  startGeneration: () => Promise<void>;
  cancelGeneration: () => void;
  isGenerating: boolean;
  progress: string;
} {
  // Use specific selectors to avoid re-rendering on unrelated state changes
  const projectName = useWizardStore((s) => s.projectName);
  const description = useWizardStore((s) => s.description);
  const techStack = useWizardStore((s) => s.techStack);
  const features = useWizardStore((s) => s.features);
  const targetAudience = useWizardStore((s) => s.targetAudience);
  const constraints = useWizardStore((s) => s.constraints);
  const setStep = useWizardStore((s) => s.setStep);

  const reset = useEditorStore((s) => s.reset);
  const setIsGenerating = useEditorStore((s) => s.setIsGenerating);
  const setGenerationProgress = useEditorStore((s) => s.setGenerationProgress);
  const appendBlueprintContent = useEditorStore((s) => s.appendBlueprintContent);
  const appendTasksContent = useEditorStore((s) => s.appendTasksContent);
  const cancelGeneration = useEditorStore((s) => s.cancelGeneration);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const generationProgress = useEditorStore((s) => s.generationProgress);

  const startGeneration = useCallback(async () => {
    // Reset editor state
    reset();
    setIsGenerating(true);
    setGenerationProgress(GENERATION_MESSAGES.BLUEPRINT_START);
    setStep(WIZARD_STEP_KEYS.GENERATING);

    // Prepare request
    const request: BlueprintRequest = {
      projectName,
      description,
      techStack,
      features: features.length > 0 ? features : undefined,
      targetAudience: targetAudience || undefined,
      constraints: constraints || undefined,
    };

    // Generate blueprint
    await generateBlueprint(request, {
      onChunk: (chunk) => {
        appendBlueprintContent(chunk);
      },
      onError: (error) => {
        setGenerationProgress(GENERATION_MESSAGES.ERROR(error));
        setIsGenerating(false);
      },
      onDone: async () => {
        setGenerationProgress(GENERATION_MESSAGES.BLUEPRINT_COMPLETE);

        // Now generate tasks from the blueprint
        const blueprint = useEditorStore.getState().blueprintContent;

        await generateTasks(
          { blueprint, projectName },
          {
            onChunk: (chunk) => {
              appendTasksContent(chunk);
            },
            onError: (error) => {
              setGenerationProgress(GENERATION_MESSAGES.ERROR_TASKS(error));
              setIsGenerating(false);
            },
            onDone: () => {
              setGenerationProgress(GENERATION_MESSAGES.COMPLETE);
              setIsGenerating(false);
            },
            onRetry: (attempt, maxRetries) => {
              setGenerationProgress(GENERATION_MESSAGES.RETRY(attempt, maxRetries));
            },
          }
        );
      },
      onRetry: (attempt, maxRetries) => {
        setGenerationProgress(GENERATION_MESSAGES.RETRY(attempt, maxRetries));
      },
    });
  }, [
    projectName,
    description,
    techStack,
    features,
    targetAudience,
    constraints,
    setStep,
    reset,
    setIsGenerating,
    setGenerationProgress,
    appendBlueprintContent,
    appendTasksContent,
  ]);

  const handleCancelGeneration = useCallback(() => {
    cancelGeneration();
  }, [cancelGeneration]);

  return {
    startGeneration,
    cancelGeneration: handleCancelGeneration,
    isGenerating,
    progress: generationProgress,
  };
}
