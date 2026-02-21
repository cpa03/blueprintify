/**
 * @fileoverview Editor state management store
 *
 * Manages the split-pane editor state for blueprint and task content.
 * Provides persistent state via localStorage with debounced auto-save
 * and security validation for stored content.
 *
 * Features:
 * - Tab switching between blueprint and tasks
 * - Real-time content streaming during AI generation
 * - Dirty state tracking for unsaved changes
 * - Generation progress tracking
 * - Content sanitization for XSS prevention
 *
 * @module store/editor
 * @see {@link useBlueprintStream} for generation workflow
 * @see {@link editorStorage} for persistence layer
 */

import { create } from "zustand";
import type { EditorTab } from "@blueprint/shared";
import { createDebouncedSaver } from "@blueprint/shared";
import { GENERATION_MESSAGES, DEBOUNCE_CONFIG } from "../config/constants";
import { sanitizeForStorage, handleSecurityError } from "../lib/security";
import { editorStorage } from "../lib/storage";

/**
 * Validates and sanitizes editor content for storage.
 * Extracts common validation logic to reduce duplication.
 *
 * @param blueprintContent - The blueprint content to validate
 * @param tasksContent - The tasks content to validate
 * @returns Sanitized content object with blueprint and tasks content
 * @throws SecurityError if validation fails
 */
function validateEditorContent(
  blueprintContent: string,
  tasksContent: string,
): { blueprintContent: string; tasksContent: string } {
  const security = sanitizeForStorage({ blueprintContent, tasksContent });
  if (!security.isValid) {
    console.error("Content validation failed:", security.error);
    throw new Error(security.error);
  }
  return security.sanitized as {
    blueprintContent: string;
    tasksContent: string;
  };
}

/**
 * Editor store interface for managing split-pane editor state
 *
 * @property activeTab - Currently active tab ("blueprint" | "tasks")
 * @property blueprintContent - Generated blueprint markdown content
 * @property tasksContent - Generated tasks markdown content
 * @property isDirty - Whether there are unsaved changes
 * @property isGenerating - Whether AI generation is in progress
 * @property generationProgress - Human-readable progress message
 *
 * @property setActiveTab - Switch between blueprint and tasks tabs
 * @property setBlueprintContent - Replace entire blueprint content
 * @property appendBlueprintContent - Append chunk during streaming
 * @property setTasksContent - Replace entire tasks content
 * @property appendTasksContent - Append chunk during streaming
 * @property setIsGenerating - Control generation state
 * @property setGenerationProgress - Update progress message
 * @property markClean - Clear dirty flag after save
 * @property cancelGeneration - Abort ongoing generation
 * @property reset - Clear all content and state
 * @property flushStorage - Force pending storage writes
 */
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
        const sanitized = validateEditorContent(
          blueprintContent,
          get().tasksContent,
        );
        set({ blueprintContent: sanitized.blueprintContent, isDirty: true });
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
        const sanitized = validateEditorContent(newContent, get().tasksContent);
        set(() => ({
          blueprintContent: sanitized.blueprintContent,
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
        const sanitized = validateEditorContent(
          get().blueprintContent,
          tasksContent,
        );
        set({ tasksContent: sanitized.tasksContent, isDirty: true });
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
        const sanitized = validateEditorContent(
          get().blueprintContent,
          newContent,
        );
        set(() => ({ tasksContent: sanitized.tasksContent, isDirty: true }));
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
