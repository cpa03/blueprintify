import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EditorTab } from "@blueprint/shared";

// ===== Editor Store =====
interface EditorStore {
  activeTab: EditorTab;
  blueprintContent: string;
  tasksContent: string;
  blueprintChunks: string[];
  tasksChunks: string[];
  isDirty: boolean;
  isGenerating: boolean;
  generationProgress: string;

  // Actions
  setActiveTab: (tab: EditorTab) => void;
  setBlueprintContent: (content: string) => void;
  appendBlueprintContent: (chunk: string) => void;
  setTasksContent: (content: string) => void;
  appendTasksContent: (chunk: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: string) => void;
  markClean: () => void;
  reset: () => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      activeTab: "blueprint",
      blueprintContent: "",
      tasksContent: "",
      blueprintChunks: [],
      tasksChunks: [],
      isDirty: false,
      isGenerating: false,
      generationProgress: "",

      setActiveTab: (activeTab) => set({ activeTab }),

      setBlueprintContent: (blueprintContent) =>
        set({ blueprintContent, isDirty: true }),

      appendBlueprintContent: (chunk) =>
        set((state) => {
          const newChunks = [...state.blueprintChunks, chunk];
          return {
            blueprintChunks: newChunks,
            blueprintContent: newChunks.join(""),
            isDirty: true,
          };
        }),

      setTasksContent: (tasksContent) => set({ tasksContent, isDirty: true }),

      appendTasksContent: (chunk) =>
        set((state) => {
          const newChunks = [...state.tasksChunks, chunk];
          return {
            tasksChunks: newChunks,
            tasksContent: newChunks.join(""),
            isDirty: true,
          };
        }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      setGenerationProgress: (generationProgress) =>
        set({ generationProgress }),

      markClean: () => set({ isDirty: false }),

      reset: () =>
        set({
          blueprintContent: "",
          tasksContent: "",
          blueprintChunks: [],
          tasksChunks: [],
          isDirty: false,
          isGenerating: false,
          generationProgress: "",
        }),
    }),
    {
      name: "blueprint-editor",
      partialize: (state) => ({
        blueprintContent: state.blueprintContent,
        tasksContent: state.tasksContent,
      }),
    },
  ),
);
