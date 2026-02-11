import { z } from "zod";
import type {
  WizardState,
  EditorState,
  TechStackItemType,
} from "@blueprint/shared";

// ===== Storage Schema Version =====
export const CURRENT_SCHEMA_VERSION = "1.0.0";

// ===== Core Storage Interfaces =====

export interface UserSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  maxSessions: number;
  defaultExportFormat: "json" | "zip";
  theme: "light" | "dark" | "auto";
  showArchived: boolean;
  sortBy: "createdAt" | "updatedAt" | "lastAccessedAt" | "title";
  sortOrder: "asc" | "desc";
}

export interface SessionMetadata {
  version: string;
  source: "generated" | "imported" | "manual";
  wordCount: {
    blueprint: number;
    tasks: number;
    total: number;
  };
  generationTime?: number;
  refinementCount: number;
  exportCount: number;
}

export interface StoredSession {
  id: string;
  title: string;
  description?: string;
  wizardState: WizardState;
  generatedBlueprint: string;
  generatedTasks: string;
  editorState?: EditorState;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  tags: string[];
  isArchived: boolean;
  metadata: SessionMetadata;
}

export interface Migration {
  version: string;
  appliedAt: string;
  sessionsMigrated: number;
}

export interface StorageMetadata {
  totalSessions: number;
  archivedSessions: number;
  storageUsed: number;
  lastCleanup: string;
  schemaVersion: string;
  migrationHistory: Migration[];
}

export interface BlueprintifyStorage {
  version: string;
  sessions: StoredSession[];
  settings: UserSettings;
  metadata: StorageMetadata;
}

// ===== Zod Schemas for Validation =====

const SessionMetadataSchema = z.object({
  version: z.string(),
  source: z.enum(["generated", "imported", "manual"]),
  wordCount: z.object({
    blueprint: z.number(),
    tasks: z.number(),
    total: z.number(),
  }),
  generationTime: z.number().optional(),
  refinementCount: z.number(),
  exportCount: z.number(),
});

const StoredSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  wizardState: z.object({
    currentStep: z.string(),
    projectName: z.string(),
    description: z.string(),
    techStack: z.array(z.any()), // TechStackItemType - more complex validation
    features: z.array(z.string()),
    targetAudience: z.string(),
    constraints: z.string(),
  }),
  generatedBlueprint: z.string(),
  generatedTasks: z.string(),
  editorState: z
    .object({
      activeTab: z.enum(["blueprint", "tasks"]),
      blueprintContent: z.string(),
      tasksContent: z.string(),
      isDirty: z.boolean(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastAccessedAt: z.string(),
  tags: z.array(z.string()),
  isArchived: z.boolean(),
  metadata: SessionMetadataSchema,
});

const UserSettingsSchema = z.object({
  autoSave: z.boolean(),
  autoSaveInterval: z.number(),
  maxSessions: z.number(),
  defaultExportFormat: z.enum(["json", "zip"]),
  theme: z.enum(["light", "dark", "auto"]),
  showArchived: z.boolean(),
  sortBy: z.enum(["createdAt", "updatedAt", "lastAccessedAt", "title"]),
  sortOrder: z.enum(["asc", "desc"]),
});

const MigrationSchema = z.object({
  version: z.string(),
  appliedAt: z.string(),
  sessionsMigrated: z.number(),
});

const StorageMetadataSchema = z.object({
  totalSessions: z.number(),
  archivedSessions: z.number(),
  storageUsed: z.number(),
  lastCleanup: z.string(),
  schemaVersion: z.string(),
  migrationHistory: z.array(MigrationSchema),
});

const BlueprintifyStorageSchema = z.object({
  version: z.string(),
  sessions: z.array(StoredSessionSchema),
  settings: UserSettingsSchema,
  metadata: StorageMetadataSchema,
});

// ===== Storage Operations Interface =====

export interface StorageOperations {
  // Core operations
  saveSession: (session: StoredSession) => Promise<void>;
  loadSession: (id: string) => Promise<StoredSession | null>;
  listSessions: (options?: {
    includeArchived?: boolean;
  }) => Promise<StoredSession[]>;
  deleteSession: (id: string) => Promise<void>;
  archiveSession: (id: string) => Promise<void>;

  // Settings operations
  getSettings: () => Promise<UserSettings>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // Export/Import operations
  exportSessions: (sessionIds?: string[]) => Promise<string>;
  importSessions: (
    jsonData: string,
  ) => Promise<{ imported: number; skipped: number }>;

  // Maintenance operations
  getStorageInfo: () => Promise<StorageMetadata>;
  cleanup: () => Promise<void>;

  // Validation operations
  validateStorage: () => Promise<boolean>;
  repairStorage: () => Promise<void>;
}

// ===== Default Values =====

export const DEFAULT_USER_SETTINGS: UserSettings = {
  autoSave: true,
  autoSaveInterval: 2,
  maxSessions: 50,
  defaultExportFormat: "zip",
  theme: "auto",
  showArchived: false,
  sortBy: "lastAccessedAt",
  sortOrder: "desc",
};

export const DEFAULT_STORAGE_METADATA: StorageMetadata = {
  totalSessions: 0,
  archivedSessions: 0,
  storageUsed: 0,
  lastCleanup: new Date().toISOString(),
  schemaVersion: CURRENT_SCHEMA_VERSION,
  migrationHistory: [],
};

// ===== Utility Functions =====

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateWordCount = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

export const calculateStorageSize = (obj: any): number => {
  return new Blob([JSON.stringify(obj)]).size;
};

export const sanitizeSessionData = (
  session: Partial<StoredSession>,
): StoredSession => {
  const now = new Date().toISOString();

  return {
    id: session.id || generateSessionId(),
    title:
      session.title || session.wizardState?.projectName || "Untitled Session",
    description: session.description || "",
    wizardState: session.wizardState || {
      currentStep: "info",
      projectName: "",
      description: "",
      techStack: [],
      features: [],
      targetAudience: "",
      constraints: "",
    },
    generatedBlueprint: session.generatedBlueprint || "",
    generatedTasks: session.generatedTasks || "",
    editorState: session.editorState,
    createdAt: session.createdAt || now,
    updatedAt: session.updatedAt || now,
    lastAccessedAt: session.lastAccessedAt || now,
    tags: session.tags || [],
    isArchived: session.isArchived || false,
    metadata: {
      version: CURRENT_SCHEMA_VERSION,
      source: session.metadata?.source || "generated",
      wordCount: {
        blueprint: calculateWordCount(session.generatedBlueprint || ""),
        tasks: calculateWordCount(session.generatedTasks || ""),
        total:
          calculateWordCount(session.generatedBlueprint || "") +
          calculateWordCount(session.generatedTasks || ""),
      },
      generationTime: session.metadata?.generationTime,
      refinementCount: session.metadata?.refinementCount || 0,
      exportCount: session.metadata?.exportCount || 0,
    },
  };
};

// ===== Validation Functions =====

export const validateStoredSession = (
  session: any,
): session is StoredSession => {
  try {
    StoredSessionSchema.parse(session);
    return true;
  } catch {
    return false;
  }
};

export const validateStorage = (
  storage: any,
): storage is BlueprintifyStorage => {
  try {
    BlueprintifyStorageSchema.parse(storage);
    return true;
  } catch {
    return false;
  }
};

// ===== Error Types =====

export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export class QuotaExceededError extends StorageError {
  constructor(message: string = "Storage quota exceeded") {
    super(message, "QUOTA_EXCEEDED");
  }
}

export class ValidationError extends StorageError {
  constructor(message: string = "Data validation failed") {
    super(message, "VALIDATION_ERROR");
  }
}

export class MigrationError extends StorageError {
  constructor(message: string = "Migration failed") {
    super(message, "MIGRATION_ERROR");
  }
}

// Storage schema exports
export {
  SessionMetadataSchema,
  StoredSessionSchema,
  UserSettingsSchema,
  MigrationSchema,
  StorageMetadataSchema,
  BlueprintifyStorageSchema,
};
