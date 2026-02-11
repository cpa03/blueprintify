import { useEffect, useRef, useCallback } from "react";
import { useSessionStore } from "../store/session";
import { useWizardStore } from "../store/wizard";
import { useEditorStore } from "../store/editor";
import type { StoredSession } from "../types/storage";

interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number;
  debounceMs?: number;
}

export const useAutoSave = (options: AutoSaveOptions = {}) => {
  const { enabled = true, interval = 2000, debounceMs = 1000 } = options;

  const { currentSession, saveSession, createSession } = useSessionStore();
  const wizardState = useWizardStore();
  const editorState = useEditorStore();

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveTimeRef = useRef<number>(0);
  const isDirtyRef = useRef<boolean>(false);

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  const saveCurrentSession = useCallback(async () => {
    if (!enabled || !isDirtyRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastSaveTimeRef.current < debounceMs) {
      return;
    }

    try {
      if (!wizardState.projectName) {
        return;
      }

      const sessionData: Partial<StoredSession> = {
        title: wizardState.projectName,
        description: wizardState.description,
        wizardState,
        generatedBlueprint: editorState.blueprintContent,
        generatedTasks: editorState.tasksContent,
        editorState: {
          activeTab: editorState.activeTab,
          blueprintContent: editorState.blueprintContent,
          tasksContent: editorState.tasksContent,
          isDirty: editorState.isDirty,
        },
      };

      if (currentSession) {
        await saveSession({ ...sessionData, id: currentSession.id });
      } else if (
        wizardState.projectName &&
        (editorState.blueprintContent || editorState.tasksContent)
      ) {
        const sessionId = await createSession(
          sessionData as Omit<
            StoredSession,
            "id" | "createdAt" | "updatedAt" | "lastAccessedAt"
          >,
        );
        console.log("Created new session:", sessionId);
      }

      isDirtyRef.current = false;
      lastSaveTimeRef.current = now;
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [
    enabled,
    wizardState,
    editorState,
    currentSession,
    saveSession,
    createSession,
    debounceMs,
  ]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(saveCurrentSession, debounceMs);
  }, [saveCurrentSession, debounceMs]);

  useEffect(() => {
    markDirty();
    debouncedSave();
  }, [
    wizardState,
    editorState.blueprintContent,
    editorState.tasksContent,
    editorState.activeTab,
    markDirty,
    debouncedSave,
  ]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = setInterval(() => {
      saveCurrentSession();
    }, interval);

    return () => {
      clearInterval(intervalId);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enabled, interval, saveCurrentSession]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current && enabled) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled]);

  return {
    isDirty: isDirtyRef.current,
    saveNow: saveCurrentSession,
    markDirty,
  };
};
