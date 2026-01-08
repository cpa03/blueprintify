import { useState, useCallback } from "react";
import { useEditorStore } from "../store";
import { refineContent } from "../lib/api";
import type { RefineRequest } from "@blueprint/shared";
import type { StreamCallbacks } from "@blueprint/shared";

interface UseRefineOptions {
  onChunk?: (chunk: string) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

export function useRefine(options?: UseRefineOptions) {
  const [isRefining, setIsRefining] = useState(false);
  const [refineProgress, setRefineProgress] = useState<string | null>(null);

  const setBlueprintContent = useEditorStore((s) => s.setBlueprintContent);
  const setTasksContent = useEditorStore((s) => s.setTasksContent);
  const activeTab = useEditorStore((s) => s.activeTab);

  const startRefine = useCallback(
    async (content: string, instruction: string, context?: string) => {
      setIsRefining(true);
      setRefineProgress("Refining content...");

      const request: RefineRequest = {
        content,
        instruction,
        context,
      };

      // Determine which content to update based on active tab
      const updateContent =
        activeTab === "blueprint" ? setBlueprintContent : setTasksContent;

      const callbacks: StreamCallbacks = {
        onChunk: (chunk: string) => {
          if (options?.onChunk) {
            options.onChunk(chunk);
          }
          // Update the content as it streams in (append mode)
          // Note: Since refine replaces the content, we should handle this differently
          // For now, we'll let the parent component handle the content updates
        },
        onError: (error: string) => {
          console.error("Refine error:", error);
          setRefineProgress(`Error: ${error}`);
          setIsRefining(false);
          if (options?.onError) {
            options.onError(error);
          }
        },
        onDone: () => {
          setRefineProgress("Refinement complete!");
          setIsRefining(false);
          if (options?.onDone) {
            options.onDone();
          }
        },
      };

      try {
        await refineContent(request, callbacks);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Refinement failed";
        console.error("Refine error:", message);
        setRefineProgress(`Error: ${message}`);
        setIsRefining(false);
        if (options?.onError) {
          options.onError(message);
        }
      }
    },
    [activeTab, setBlueprintContent, setTasksContent, options],
  );

  const cancelRefine = useCallback(() => {
    setIsRefining(false);
    setRefineProgress("Refinement cancelled");
  }, []);

  return {
    isRefining,
    refineProgress,
    startRefine,
    cancelRefine,
  };
}
