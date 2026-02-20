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
import type { BlueprintRequest } from "@blueprint/shared";
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
export function useBlueprintStream() {
  const wizard = useWizardStore();
  const editor = useEditorStore();

  const startGeneration = useCallback(async () => {
    // Reset editor state
    editor.reset();
    editor.setIsGenerating(true);
    editor.setGenerationProgress(GENERATION_MESSAGES.BLUEPRINT_START);
    wizard.setStep("generating");

    // Prepare request
    const request: BlueprintRequest = {
      projectName: wizard.projectName,
      description: wizard.description,
      techStack: wizard.techStack,
      features: wizard.features.length > 0 ? wizard.features : undefined,
      targetAudience: wizard.targetAudience || undefined,
      constraints: wizard.constraints || undefined,
    };

    // Generate blueprint
    await generateBlueprint(request, {
      onChunk: (chunk) => {
        editor.appendBlueprintContent(chunk);
      },
      onError: (error) => {
        editor.setGenerationProgress(GENERATION_MESSAGES.ERROR(error));
        editor.setIsGenerating(false);
      },
      onDone: async () => {
        editor.setGenerationProgress(GENERATION_MESSAGES.BLUEPRINT_COMPLETE);

        // Now generate tasks from the blueprint
        const blueprint = useEditorStore.getState().blueprintContent;

        await generateTasks(
          { blueprint, projectName: wizard.projectName },
          {
            onChunk: (chunk) => {
              editor.appendTasksContent(chunk);
            },
            onError: (error) => {
              editor.setGenerationProgress(
                GENERATION_MESSAGES.ERROR_TASKS(error),
              );
              editor.setIsGenerating(false);
            },
            onDone: () => {
              editor.setGenerationProgress(GENERATION_MESSAGES.COMPLETE);
              editor.setIsGenerating(false);
            },
            onRetry: (attempt, maxRetries) => {
              editor.setGenerationProgress(
                GENERATION_MESSAGES.RETRY(attempt, maxRetries),
              );
            },
          },
        );
      },
      onRetry: (attempt, maxRetries) => {
        editor.setGenerationProgress(
          GENERATION_MESSAGES.RETRY(attempt, maxRetries),
        );
      },
    });
  }, [wizard, editor]);

  const cancelGeneration = useCallback(() => {
    editor.cancelGeneration();
  }, [editor]);

  return {
    startGeneration,
    cancelGeneration,
    isGenerating: editor.isGenerating,
    progress: editor.generationProgress,
  };
}
