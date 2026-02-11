// Local Storage types for Blueprintify - Simplified version for implementation

export const CURRENT_SCHEMA_VERSION = "1.0.0";

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
  wizardState: {
    currentStep: string;
    projectName: string;
    description: string;
    techStack: any[];
    features: string[];
    targetAudience: string;
    constraints: string;
  };
  generatedBlueprint: string;
  generatedTasks: string;
  editorState?: {
    activeTab: "blueprint" | "tasks";
    blueprintContent: string;
    tasksContent: string;
    isDirty: boolean;
  };
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

export interface StorageOperations {
  saveSession: (session: Partial<StoredSession>) => Promise<void>;
  loadSession: (id: string) => Promise<StoredSession | null>;
  listSessions: (options?: {
    includeArchived?: boolean;
  }) => Promise<StoredSession[]>;
  deleteSession: (id: string) => Promise<void>;
  archiveSession: (id: string) => Promise<void>;
  getSettings: () => Promise<UserSettings>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  exportSessions: (sessionIds?: string[]) => Promise<string>;
  importSessions: (
    jsonData: string,
  ) => Promise<{ imported: number; skipped: number }>;
  getStorageInfo: () => Promise<StorageMetadata>;
  cleanup: () => Promise<void>;
  validateStorage: () => Promise<boolean>;
  repairStorage: () => Promise<void>;
}

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

export const validateStoredSession = (
  session: any,
): session is StoredSession => {
  return (
    session &&
    typeof session === "object" &&
    typeof session.id === "string" &&
    typeof session.title === "string" &&
    typeof session.wizardState === "object" &&
    typeof session.generatedBlueprint === "string" &&
    typeof session.generatedTasks === "string" &&
    typeof session.createdAt === "string" &&
    typeof session.updatedAt === "string"
  );
};

export const validateStorage = (
  storage: any,
): storage is BlueprintifyStorage => {
  return (
    storage &&
    typeof storage === "object" &&
    typeof storage.version === "string" &&
    Array.isArray(storage.sessions) &&
    typeof storage.settings === "object" &&
    typeof storage.metadata === "object"
  );
};

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
