import { create } from "zustand";
import type { EditorTab } from "@blueprint/shared";
import { GENERATION_MESSAGES, DEBOUNCE_CONFIG } from "../config/constants";
import { sanitizeForStorage, handleSecurityError } from "../lib/security";
import { editorStorage } from "../lib/storage";

// Debounce utility for performance optimization
function createDebouncedSaver<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): { debounced: T; flush: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: unknown[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T;

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      fn();
      timeoutId = null;
    }
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { debounced, flush, cancel };
}

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
  flushStorage: () => void; // Flush pending storage writes
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

  // Create debounced save function to prevent excessive localStorage writes
  const {
    debounced: debouncedSave,
    flush: flushSave,
    cancel: cancelSave,
  } = createDebouncedSaver(saveState, DEBOUNCE_CONFIG.EDITOR);

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
        debouncedSave();
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
        debouncedSave();
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
        debouncedSave();
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
        debouncedSave();
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
      cancelSave();
      set({
        blueprintContent: "",
        tasksContent: "",
        isDirty: false,
        isGenerating: false,
        generationProgress: "",
      });
      void editorStorage.remove();
    },

    flushStorage: () => {
      flushSave();
    },
  };
});
