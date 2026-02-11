import { create } from "zustand";
import type { StoredSession, UserSettings } from "../types/storage";
import { localStorageService } from "../lib/storage";

interface SessionStore {
  sessions: StoredSession[];
  currentSession: StoredSession | null;
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;

  loadSessions: () => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  saveSession: (session: Partial<StoredSession>) => Promise<void>;
  createSession: (
    session: Omit<
      StoredSession,
      "id" | "createdAt" | "updatedAt" | "lastAccessedAt"
    >,
  ) => Promise<string>;
  deleteSession: (id: string) => Promise<void>;
  archiveSession: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  exportSessions: (sessionIds?: string[]) => Promise<string>;
  importSessions: (
    jsonData: string,
  ) => Promise<{ imported: number; skipped: number }>;
  setCurrentSession: (session: StoredSession | null) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  currentSession: null,
  settings: {
    autoSave: true,
    autoSaveInterval: 2,
    maxSessions: 50,
    defaultExportFormat: "zip",
    theme: "auto",
    showArchived: false,
    sortBy: "lastAccessedAt",
    sortOrder: "desc",
  },
  isLoading: false,
  error: null,
  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await localStorageService.listSessions();
      const settings = await localStorageService.getSettings();
      set({ sessions, settings, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load sessions";
      set({ error: errorMessage, isLoading: false });
    }
  },

  loadSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await localStorageService.loadSession(id);
      if (session) {
        set({ currentSession: session, isLoading: false });
      } else {
        set({ error: "Session not found", isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load session";
      set({ error: errorMessage, isLoading: false });
    }
  },

  saveSession: async (sessionData) => {
    set({ isLoading: true, error: null });
    try {
      await localStorageService.saveSession(sessionData);

      const sessions = await localStorageService.listSessions();

      const { currentSession } = get();
      if (currentSession && sessionData.id === currentSession.id) {
        const updatedSession = await localStorageService.loadSession(
          sessionData.id,
        );
        set({ currentSession: updatedSession, sessions, isLoading: false });
      } else {
        set({ sessions, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save session";
      set({ error: errorMessage, isLoading: false });
    }
  },

  createSession: async (sessionData) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      const sessionToSave = {
        ...sessionData,
        createdAt: now,
        updatedAt: now,
        lastAccessedAt: now,
      };

      await localStorageService.saveSession(sessionToSave);

      const sessions = await localStorageService.listSessions();

      const newSession = sessions.find(
        (s) => s.title === sessionData.title && s.createdAt === now,
      );

      if (newSession) {
        set({ currentSession: newSession, sessions, isLoading: false });
        return newSession.id;
      } else {
        set({ sessions, isLoading: false });
        throw new Error("Failed to retrieve created session");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create session";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await localStorageService.deleteSession(id);

      const sessions = await localStorageService.listSessions();

      const { currentSession } = get();
      if (currentSession && currentSession.id === id) {
        set({ currentSession: null, sessions, isLoading: false });
      } else {
        set({ sessions, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete session";
      set({ error: errorMessage, isLoading: false });
    }
  },

  archiveSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await localStorageService.archiveSession(id);

      const sessions = await localStorageService.listSessions();

      const { currentSession } = get();
      if (currentSession && currentSession.id === id) {
        set({ currentSession: null, sessions, isLoading: false });
      } else {
        set({ sessions, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to archive session";
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      await localStorageService.updateSettings(updates);
      const settings = await localStorageService.getSettings();
      set({ settings, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update settings";
      set({ error: errorMessage, isLoading: false });
    }
  },

  exportSessions: async (sessionIds) => {
    set({ isLoading: true, error: null });
    try {
      const exportData = await localStorageService.exportSessions(sessionIds);
      set({ isLoading: false });
      return exportData;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to export sessions";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  importSessions: async (jsonData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await localStorageService.importSessions(jsonData);

      const sessions = await localStorageService.listSessions();
      set({ sessions, isLoading: false });

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to import sessions";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  clearError: () => {
    set({ error: null });
  },
}));
