/**
 * @fileoverview Editor State Management Store
 *
 * This store manages the editor state for the blueprint and tasks content.
 * It provides a complete interface for content manipulation, generation tracking,
 * and persistence through localStorage.
 *
 * Features:
 * - Tab management (blueprint/tasks switching)
 * - Content management with streaming support for AI generation
 * - Dirty state tracking for unsaved changes
 * - Generation progress tracking with cancellation support
 * - Automatic persistence with debounced saves
 * - Security validation for all content changes
 *
 * @module store/editor
 * @see {@link module:store/wizard} for wizard state management
 * @see {@link module:lib/security} for content sanitization
 * @see {@link module:lib/storage} for persistence layer
 */

import { create } from "zustand";
import type { EditorTab } from "@blueprint/shared";
import { GENERATION_MESSAGES, DEBOUNCE_CONFIG } from "../config/constants";
import { sanitizeForStorage, handleSecurityError } from "../lib/security";
import { editorStorage } from "../lib/storage";
import { createPersistedStore, type PersistedStorage } from "./persistence";

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
    throw new Error(security.error);
  }
  return security.sanitized as {
    blueprintContent: string;
    tasksContent: string;
  };
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
/** Data shape persisted to storage */
type PersistedEditorData = Pick<EditorStore, "blueprintContent" | "tasksContent">;

export const useEditorStore = create<EditorStore>()((set, get) => {
  // Use shared persistence utility
  const {
    loadState,
    debouncedSave,
    flushSave,
    cancelSave,
  } = createPersistedStore<PersistedEditorData, EditorStore>({
    storage: editorStorage as PersistedStorage<PersistedEditorData>,
    debounceDelay: DEBOUNCE_CONFIG.EDITOR,
    getPersistData: (state) => ({
      blueprintContent: state.blueprintContent,
      tasksContent: state.tasksContent,
    }),
  });

  void loadState(set);

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
        debouncedSave(get);
      } catch (error) {
        throw handleSecurityError(error);
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
        debouncedSave(get);
      } catch (error) {
        throw handleSecurityError(error);
      }
    },

    setTasksContent: (tasksContent) => {
      try {
        const sanitized = validateEditorContent(
          get().blueprintContent,
          tasksContent,
        );
        set({ tasksContent: sanitized.tasksContent, isDirty: true });
        debouncedSave(get);
      } catch (error) {
        throw handleSecurityError(error);
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
        debouncedSave(get);
      } catch (error) {
        throw handleSecurityError(error);
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
