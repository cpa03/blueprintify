import type {
  StorageOperations,
  StoredSession,
  UserSettings,
  StorageMetadata,
  BlueprintifyStorage,
} from "../types/storage";
import {
  DEFAULT_USER_SETTINGS,
  DEFAULT_STORAGE_METADATA,
  generateSessionId,
  sanitizeSessionData,
  calculateStorageSize,
  validateStorage,
  validateStoredSession,
  StorageError,
  QuotaExceededError,
  ValidationError,
  CURRENT_SCHEMA_VERSION,
} from "../types/storage";

const STORAGE_KEY = "blueprintify_data";
const STORAGE_QUOTA_LIMIT = 2 * 1024 * 1024;

class LocalStorageService implements StorageOperations {
  private initialized = false;

  private async initializeStorage(): Promise<BlueprintifyStorage> {
    if (this.initialized) {
      return this.getStorageData();
    }

    try {
      const existing = localStorage.getItem(STORAGE_KEY);

      if (!existing) {
        const newStorage: BlueprintifyStorage = {
          version: CURRENT_SCHEMA_VERSION,
          sessions: [],
          settings: DEFAULT_USER_SETTINGS,
          metadata: DEFAULT_STORAGE_METADATA,
        };
        await this.saveStorageData(newStorage);
        this.initialized = true;
        return newStorage;
      }

      const parsed = JSON.parse(existing);

      if (!validateStorage(parsed)) {
        console.warn("Invalid storage data, resetting to defaults");
        return this.initializeStorage();
      }

      const migratedStorage = await this.runMigrations(parsed);
      await this.saveStorageData(migratedStorage);
      this.initialized = true;
      return migratedStorage;
    } catch (error: unknown) {
      console.error("Storage initialization failed:", error);
      throw new StorageError("Failed to initialize storage", "INIT_ERROR");
    }
  }

  private async getStorageData(): Promise<BlueprintifyStorage> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return this.initializeStorage();
      }

      const parsed = JSON.parse(data);
      return validateStorage(parsed) ? parsed : this.initializeStorage();
    } catch (error: unknown) {
      console.error("Failed to get storage data:", error);
      return this.initializeStorage();
    }
  }

  private async saveStorageData(data: BlueprintifyStorage): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      const size = new Blob([serialized]).size;

      if (size > STORAGE_QUOTA_LIMIT) {
        await this.performCleanup(data);
        const retrySize = new Blob([JSON.stringify(data)]).size;
        if (retrySize > STORAGE_QUOTA_LIMIT) {
          throw new QuotaExceededError(
            `Storage size ${retrySize} exceeds limit ${STORAGE_QUOTA_LIMIT}`,
          );
        }
      }

      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error: unknown) {
      if (error instanceof QuotaExceededError) {
        throw error;
      }

      if (error instanceof Error && error.name === "QuotaExceededError") {
        throw new QuotaExceededError("Browser storage quota exceeded");
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to save storage data: ${errorMessage}`,
        "SAVE_ERROR",
      );
    }
  }

  private async runMigrations(
    storage: BlueprintifyStorage,
  ): Promise<BlueprintifyStorage> {
    if (storage.version !== CURRENT_SCHEMA_VERSION) {
      const migration = {
        version: CURRENT_SCHEMA_VERSION,
        appliedAt: new Date().toISOString(),
        sessionsMigrated: storage.sessions.length,
      };

      storage.version = CURRENT_SCHEMA_VERSION;
      storage.metadata.schemaVersion = CURRENT_SCHEMA_VERSION;
      storage.metadata.migrationHistory.push(migration);
    }

    return storage;
  }

  private async performCleanup(data: BlueprintifyStorage): Promise<void> {
    const { settings } = data;
    let sessions = data.sessions.filter((session) => !session.isArchived);

    if (sessions.length > settings.maxSessions) {
      sessions.sort((a: StoredSession, b: StoredSession) => {
        const aTime = new Date(a.lastAccessedAt).getTime();
        const bTime = new Date(b.lastAccessedAt).getTime();
        return aTime - bTime;
      });
      sessions = sessions.slice(-settings.maxSessions);
    }

    data.sessions = sessions;
    data.metadata.lastCleanup = new Date().toISOString();
    data.metadata.totalSessions = sessions.length;
    data.metadata.archivedSessions = data.sessions.length - sessions.length;
    data.metadata.storageUsed = calculateStorageSize(data);
  }

  private async updateSessionAccess(id: string): Promise<void> {
    const storage = await this.getStorageData();
    const session = storage.sessions.find((s) => s.id === id);

    if (session) {
      session.lastAccessedAt = new Date().toISOString();
      await this.saveStorageData(storage);
    }
  }

  async saveSession(session: Partial<StoredSession>): Promise<void> {
    try {
      const storage = await this.getStorageData();

      const sanitizedSession = sanitizeSessionData(session);

      if (!validateStoredSession(sanitizedSession)) {
        throw new ValidationError("Invalid session data");
      }

      storage.sessions = storage.sessions.filter(
        (s) => s.id !== sanitizedSession.id,
      );
      storage.sessions.push(sanitizedSession);

      storage.metadata.totalSessions = storage.sessions.length;
      storage.metadata.archivedSessions = storage.sessions.filter(
        (s) => s.isArchived,
      ).length;
      storage.metadata.storageUsed = calculateStorageSize(storage);

      await this.saveStorageData(storage);
    } catch (error: unknown) {
      if (error instanceof StorageError) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to save session: ${errorMessage}`,
        "SAVE_SESSION_ERROR",
      );
    }
  }

  async loadSession(id: string): Promise<StoredSession | null> {
    try {
      const storage = await this.getStorageData();
      const session = storage.sessions.find((s) => s.id === id);

      if (session) {
        await this.updateSessionAccess(id);
        return session;
      }

      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to load session: ${errorMessage}`,
        "LOAD_SESSION_ERROR",
      );
    }
  }

  async listSessions(
    options: { includeArchived?: boolean } = {},
  ): Promise<StoredSession[]> {
    try {
      const storage = await this.getStorageData();
      let sessions = storage.sessions;

      if (!options.includeArchived) {
        sessions = sessions.filter((s) => !s.isArchived);
      }

      const { settings } = storage;
      sessions.sort((a: StoredSession, b: StoredSession) => {
        const aValue = a[settings.sortBy] as string;
        const bValue = b[settings.sortBy] as string;

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return settings.sortOrder === "desc" ? -comparison : comparison;
      });

      return sessions;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to list sessions: ${errorMessage}`,
        "LIST_SESSIONS_ERROR",
      );
    }
  }

  async deleteSession(id: string): Promise<void> {
    try {
      const storage = await this.getStorageData();
      storage.sessions = storage.sessions.filter((s) => s.id !== id);

      storage.metadata.totalSessions = storage.sessions.length;
      storage.metadata.archivedSessions = storage.sessions.filter(
        (s) => s.isArchived,
      ).length;
      storage.metadata.storageUsed = calculateStorageSize(storage);

      await this.saveStorageData(storage);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to delete session: ${errorMessage}`,
        "DELETE_SESSION_ERROR",
      );
    }
  }

  async archiveSession(id: string): Promise<void> {
    try {
      const storage = await this.getStorageData();
      const session = storage.sessions.find((s) => s.id === id);

      if (session) {
        session.isArchived = true;
        session.updatedAt = new Date().toISOString();

        storage.metadata.archivedSessions = storage.sessions.filter(
          (s) => s.isArchived,
        ).length;

        await this.saveStorageData(storage);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to archive session: ${errorMessage}`,
        "ARCHIVE_SESSION_ERROR",
      );
    }
  }

  async getSettings(): Promise<UserSettings> {
    try {
      const storage = await this.getStorageData();
      return storage.settings;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to get settings: ${errorMessage}`,
        "GET_SETTINGS_ERROR",
      );
    }
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<void> {
    try {
      const storage = await this.getStorageData();
      storage.settings = { ...storage.settings, ...updates };
      await this.saveStorageData(storage);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to update settings: ${errorMessage}`,
        "UPDATE_SETTINGS_ERROR",
      );
    }
  }

  async exportSessions(sessionIds?: string[]): Promise<string> {
    try {
      const storage = await this.getStorageData();
      let sessions = storage.sessions;

      if (sessionIds) {
        sessions = sessions.filter((s) => sessionIds.includes(s.id));
      }

      const exportData = {
        version: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        sessions,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to export sessions: ${errorMessage}`,
        "EXPORT_ERROR",
      );
    }
  }

  async importSessions(
    jsonData: string,
  ): Promise<{ imported: number; skipped: number }> {
    try {
      const importData = JSON.parse(jsonData);
      const storage = await this.getStorageData();

      let imported = 0;
      let skipped = 0;

      for (const sessionData of importData.sessions || []) {
        const sanitizedSession = sanitizeSessionData(sessionData);

        if (validateStoredSession(sanitizedSession)) {
          const existing = storage.sessions.find(
            (s) => s.id === sanitizedSession.id,
          );
          if (existing) {
            sanitizedSession.id = generateSessionId();
          }

          storage.sessions.push(sanitizedSession);
          imported++;
        } else {
          skipped++;
        }
      }

      storage.metadata.totalSessions = storage.sessions.length;
      storage.metadata.storageUsed = calculateStorageSize(storage);

      await this.saveStorageData(storage);
      return { imported, skipped };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to import sessions: ${errorMessage}`,
        "IMPORT_ERROR",
      );
    }
  }

  async getStorageInfo(): Promise<StorageMetadata> {
    try {
      const storage = await this.getStorageData();

      storage.metadata.totalSessions = storage.sessions.length;
      storage.metadata.archivedSessions = storage.sessions.filter(
        (s) => s.isArchived,
      ).length;
      storage.metadata.storageUsed = calculateStorageSize(storage);

      return storage.metadata;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to get storage info: ${errorMessage}`,
        "GET_STORAGE_INFO_ERROR",
      );
    }
  }

  async cleanup(): Promise<void> {
    try {
      const storage = await this.getStorageData();
      await this.performCleanup(storage);
      await this.saveStorageData(storage);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to cleanup storage: ${errorMessage}`,
        "CLEANUP_ERROR",
      );
    }
  }

  async validateStorage(): Promise<boolean> {
    try {
      const storage = await this.getStorageData();
      return (
        validateStorage(storage) &&
        storage.sessions.every(validateStoredSession)
      );
    } catch (error) {
      return false;
    }
  }

  async repairStorage(): Promise<void> {
    try {
      const storage = await this.getStorageData();

      storage.sessions = storage.sessions.filter(validateStoredSession);

      storage.metadata.totalSessions = storage.sessions.length;
      storage.metadata.archivedSessions = storage.sessions.filter(
        (s) => s.isArchived,
      ).length;
      storage.metadata.storageUsed = calculateStorageSize(storage);

      await this.saveStorageData(storage);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new StorageError(
        `Failed to repair storage: ${errorMessage}`,
        "REPAIR_ERROR",
      );
    }
  }
}

export const localStorageService = new LocalStorageService();
export default localStorageService;
