import { useCallback } from "react";
import { useWizardStore, useEditorStore } from "../store";
import { generateBlueprint, generateTasks } from "../lib/api";
import type { BlueprintRequest } from "@blueprint/shared";
import { GENERATION_MESSAGES } from "../config/constants";

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
