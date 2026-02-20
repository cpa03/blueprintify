import { useCallback } from "react";
import { useWizardStore, useEditorStore } from "../store";
import { generateBlueprint, generateTasks } from "../lib/api";
import type { BlueprintRequest } from "@blueprint/shared";
import { GENERATION_MESSAGES } from "../config/constants";

export function useBlueprintStream() {
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
  const appendBlueprintContent = useEditorStore(
    (s) => s.appendBlueprintContent,
  );
  const appendTasksContent = useEditorStore((s) => s.appendTasksContent);
  const cancelGeneration = useEditorStore((s) => s.cancelGeneration);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const generationProgress = useEditorStore((s) => s.generationProgress);

  const startGeneration = useCallback(async () => {
    // Reset editor state
    reset();
    setIsGenerating(true);
    setGenerationProgress(GENERATION_MESSAGES.BLUEPRINT_START);
    setStep("generating");

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
              setGenerationProgress(
                GENERATION_MESSAGES.RETRY(attempt, maxRetries),
              );
            },
          },
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
