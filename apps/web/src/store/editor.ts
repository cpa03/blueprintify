import { create } from "zustand";
import type { EditorTab } from "@blueprint/shared";
import { GENERATION_MESSAGES } from "../config/constants";
import { sanitizeForStorage, handleSecurityError } from "../lib/security";
import { editorStorage } from "../lib/storage";

export interface EditorStore {
  activeTab: EditorTab;
  blueprintContent: string;
  tasksContent: string;
  isDirty: boolean;
  isGenerating: boolean;
  generationProgress: string;

  setActiveTab: (tab: EditorTab) => void;
  setBlueprintContent: (content: string) => void;
  appendBlueprintContent: (chunk: string) => void;
  setTasksContent: (content: string) => void;
  appendTasksContent: (chunk: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: string) => void;
  markClean: () => void;
  cancelGeneration: () => void;
  reset: () => void;
}

export const useEditorStore = create<EditorStore>()((set, get) => {
  const loadState = async (): Promise<void> => {
    try {
      const stored = await editorStorage.get();
      if (stored !== null) {
        const persistedState = stored as Partial<EditorStore>;
        set((state) => ({ ...state, ...persistedState }), true);
      }
    } catch {
      console.warn("Failed to load editor state from storage");
    }
  };

  const saveState = async (): Promise<void> => {
    try {
      const current = get();
      const dataToSave = {
        blueprintContent: current.blueprintContent,
        tasksContent: current.tasksContent,
      };
      await editorStorage.set(dataToSave);
    } catch {
      console.warn("Failed to save editor state to storage");
    }
  };

  void loadState();

  return {
    activeTab: "blueprint",
    blueprintContent: "",
    tasksContent: "",
    isDirty: false,
    isGenerating: false,
    generationProgress: "",

    setActiveTab: (activeTab) => set({ activeTab }),

    setBlueprintContent: (blueprintContent) => {
      try {
        const security = sanitizeForStorage({
          blueprintContent,
          tasksContent: get().tasksContent,
        });
        if (!security.isValid) {
          console.error("Content validation failed:", security.error);
          throw new Error(security.error);
        }
        set({
          blueprintContent:
            (security.sanitized as { blueprintContent?: string })
              ?.blueprintContent || blueprintContent,
          isDirty: true,
        });
        void saveState();
      } catch (error) {
        const securityError = handleSecurityError(error);
        console.error("Security validation failed:", securityError.message);
        throw securityError;
      }
    },

    appendBlueprintContent: (chunk) => {
      try {
        const newContent = get().blueprintContent + chunk;
        const security = sanitizeForStorage({
          blueprintContent: newContent,
          tasksContent: get().tasksContent,
        });
        if (!security.isValid) {
          console.error("Content validation failed:", security.error);
          throw new Error(security.error);
        }
        set(() => ({
          blueprintContent:
            (security.sanitized as { blueprintContent?: string })
              ?.blueprintContent || newContent,
          isDirty: true,
        }));
        void saveState();
      } catch (error) {
        const securityError = handleSecurityError(error);
        console.error("Security validation failed:", securityError.message);
        throw securityError;
      }
    },

    setTasksContent: (tasksContent) => {
      try {
        const security = sanitizeForStorage({
          blueprintContent: get().blueprintContent,
          tasksContent,
        });
        if (!security.isValid) {
          console.error("Content validation failed:", security.error);
          throw new Error(security.error);
        }
        set({
          tasksContent:
            (security.sanitized as { tasksContent?: string })?.tasksContent ||
            tasksContent,
          isDirty: true,
        });
        void saveState();
      } catch (error) {
        const securityError = handleSecurityError(error);
        console.error("Security validation failed:", securityError.message);
        throw securityError;
      }
    },

    appendTasksContent: (chunk) => {
      try {
        const newContent = get().tasksContent + chunk;
        const security = sanitizeForStorage({
          blueprintContent: get().blueprintContent,
          tasksContent: newContent,
        });
        if (!security.isValid) {
          console.error("Content validation failed:", security.error);
          throw new Error(security.error);
        }
        set(() => ({
          tasksContent:
            (security.sanitized as { tasksContent?: string })?.tasksContent ||
            newContent,
          isDirty: true,
        }));
        void saveState();
      } catch (error) {
        const securityError = handleSecurityError(error);
        console.error("Security validation failed:", securityError.message);
        throw securityError;
      }
    },

    setIsGenerating: (isGenerating) => set({ isGenerating }),

    setGenerationProgress: (generationProgress) => set({ generationProgress }),

    markClean: () => set({ isDirty: false }),

    cancelGeneration: () =>
      set({
        isGenerating: false,
        generationProgress: GENERATION_MESSAGES.CANCELLED,
      }),

    reset: () => {
      set({
        blueprintContent: "",
        tasksContent: "",
        isDirty: false,
        isGenerating: false,
        generationProgress: "",
      });
      void editorStorage.remove();
    },
  };
});
