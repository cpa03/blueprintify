import { useCallback } from "react";
import { useWizardStore, useEditorStore } from "../store";
import { generateBlueprint, generateTasks } from "../lib/api";
import type { BlueprintRequest } from "@blueprint/shared";

export function useBlueprintStream() {
  const wizard = useWizardStore();
  const editor = useEditorStore();

  const startGeneration = useCallback(async () => {
    // Reset editor state
    editor.reset();
    editor.setIsGenerating(true);
    editor.setGenerationProgress("Generating blueprint...");
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
    await generateBlueprint(
      request,
      {
        onChunk: (chunk) => {
          editor.appendBlueprintContent(chunk);
        },
        onError: (error) => {
          console.error("Blueprint generation error:", error);
          editor.setGenerationProgress(`Error: ${error}`);
          editor.setIsGenerating(false);
        },
        onDone: async () => {
          editor.setGenerationProgress(
            "Blueprint complete. Generating tasks...",
          );

          // Now generate tasks from the blueprint
          const blueprint = useEditorStore.getState().blueprintContent;

          await generateTasks(
            { blueprint, projectName: wizard.projectName },
            {
              onChunk: (chunk) => {
                editor.appendTasksContent(chunk);
              },
              onError: (error) => {
                console.error("Task generation error:", error);
                editor.setGenerationProgress(
                  `Error generating tasks: ${error}`,
                );
                editor.setIsGenerating(false);
              },
              onDone: () => {
                editor.setGenerationProgress("Complete!");
                editor.setIsGenerating(false);
              },
              onRetry: (attempt, maxRetries) => {
                editor.setGenerationProgress(
                  `Connection issue, retrying (${attempt}/${maxRetries})...`,
                );
              },
            },
            { maxRetries: 3, initialDelay: 1000, backoffFactor: 2 },
          );
        },
        onRetry: (attempt, maxRetries) => {
          editor.setGenerationProgress(
            `Connection issue, retrying (${attempt}/${maxRetries})...`,
          );
        },
      },
      { maxRetries: 3, initialDelay: 1000, backoffFactor: 2 },
    );
  }, [wizard, editor]);

  const cancelGeneration = useCallback(() => {
    editor.setIsGenerating(false);
    editor.setGenerationProgress("Generation cancelled");
  }, [editor]);

  return {
    startGeneration,
    cancelGeneration,
    isGenerating: editor.isGenerating,
    progress: editor.generationProgress,
  };
}
