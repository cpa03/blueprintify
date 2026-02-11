/**
 * Robust Storage Layer with Error Handling and Recovery
 *
 * Provides:
 * - Error boundary for localStorage operations
 * - Data validation with schema migration
 * - Automatic backup and recovery mechanisms
 * - Health monitoring and metrics
 */

import { z } from "zod";
import { STORAGE_KEYS } from "../config/constants";

// ============================================================================
// Storage Error Types
// ============================================================================

export type StorageErrorType =
  | "QUOTA_EXCEEDED"
  | "CORRUPTED_DATA"
  | "SERIALIZATION_ERROR"
  | "BROWSER_UNSUPPORTED"
  | "PRIVACY_MODE"
  | "VALIDATION_ERROR"
  | "MIGRATION_ERROR"
  | "BACKUP_ERROR"
  | "RECOVERY_ERROR";

export interface StorageErrorDetails {
  key: string;
  operation: "read" | "write" | "delete" | "clear" | "migrate" | "backup";
  originalError?: unknown;
  data?: unknown;
}

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly type: StorageErrorType,
    public readonly details: StorageErrorDetails,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

// ============================================================================
// Storage Health Metrics
// ============================================================================

export interface StorageHealth {
  isHealthy: boolean;
  quota: {
    used: number;
    total: number;
    remaining: number;
    percentage: number;
  };
  operations: {
    total: number;
    successful: number;
    failed: number;
    lastError?: StorageError;
  };
  lastCheck: Date;
}

export interface StorageMetrics {
  readLatency: number[];
  writeLatency: number[];
  errorCount: number;
  lastError?: StorageError;
  operationCount: {
    read: number;
    write: number;
    delete: number;
    clear: number;
  };
}

// ============================================================================
// Schema Versioning and Migration
// ============================================================================

export const StorageMetadataSchema = z.object({
  version: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  checksum: z.string(),
});

export type StorageMetadata = z.infer<typeof StorageMetadataSchema>;

export interface SchemaMigration<T = unknown> {
  fromVersion: number;
  toVersion: number;
  migrate: (data: unknown) => T;
}

// ============================================================================
// Storage Configuration
// ============================================================================

export interface StorageConfig {
  key: string;
  currentVersion: number;
  migrations?: SchemaMigration[];
  maxRetries?: number;
  retryDelay?: number;
  enableBackup?: boolean;
  compressionEnabled?: boolean;
}

const DEFAULT_CONFIG: Partial<StorageConfig> = {
  maxRetries: 3,
  retryDelay: 100,
  enableBackup: true,
  compressionEnabled: false,
};

// ============================================================================
// Backup System
// ============================================================================

interface BackupEntry {
  timestamp: number;
  data: string;
  metadata: StorageMetadata;
}

const BACKUP_KEY_PREFIX = "__backup__";
const MAX_BACKUP_ENTRIES = 5;

// ============================================================================
// Checksum Utilities
// ============================================================================

function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function _verifyChecksum(data: string, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}

// ============================================================================
// Storage Quota Management
// ============================================================================

export interface QuotaInfo {
  used: number;
  total: number;
  remaining: number;
  percentage: number;
}

function getStorageQuota(): QuotaInfo {
  try {
    const used = new Blob([JSON.stringify(localStorage)]).size;
    // Estimate 5MB quota (typical browser limit)
    const total = 5 * 1024 * 1024;
    const remaining = Math.max(0, total - used);
    const percentage = (used / total) * 100;

    return { used, total, remaining, percentage };
  } catch {
    return { used: 0, total: 0, remaining: 0, percentage: 0 };
  }
}

// ============================================================================
// Browser Compatibility Check
// ============================================================================

function isLocalStorageSupported(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function isPrivacyMode(): boolean {
  try {
    const test = "__privacy_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return false;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === 22 || // Chrome
        e.code === 1014 || // Firefox
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED")
    );
  }
}

// ============================================================================
// Main Storage Service
// ============================================================================

export class StorageService<T = unknown> {
  private config: StorageConfig;
  private metrics: StorageMetrics = {
    readLatency: [],
    writeLatency: [],
    errorCount: 0,
    operationCount: { read: 0, write: 0, delete: 0, clear: 0 },
  };
  private health: StorageHealth = {
    isHealthy: true,
    quota: { used: 0, total: 0, remaining: 0, percentage: 0 },
    operations: { total: 0, successful: 0, failed: 0 },
    lastCheck: new Date(),
  };

  constructor(config: StorageConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.checkHealth();
  }

  // ========================================================================
  // Core Storage Operations
  // ========================================================================

  async get(): Promise<T | null> {
    const startTime = performance.now();
    this.metrics.operationCount.read++;

    try {
      this.checkBrowserSupport();

      const raw = localStorage.getItem(this.config.key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      const validated = await this.validateAndMigrate(parsed);

      this.recordLatency("read", performance.now() - startTime);
      this.health.operations.successful++;

      return validated;
    } catch (error) {
      this.handleError("read", error);

      // Try recovery from backup
      const recovered = await this.recoverFromBackup();
      if (recovered !== null) {
        return recovered;
      }

      throw this.createStorageError(
        "Failed to read from storage",
        "CORRUPTED_DATA",
        { key: this.config.key, operation: "read", originalError: error },
      );
    } finally {
      this.health.operations.total++;
    }
  }

  async set(data: T): Promise<void> {
    const startTime = performance.now();
    this.metrics.operationCount.write++;

    try {
      this.checkBrowserSupport();
      this.checkQuota();

      // Create backup before write
      if (this.config.enableBackup) {
        await this.createBackup();
      }

      const metadata: StorageMetadata = {
        version: this.config.currentVersion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checksum: "",
      };

      // Calculate checksum from payload without checksum first
      const payloadForChecksum = {
        data,
        metadata: { ...metadata, checksum: "" },
      };
      const serializedForChecksum = JSON.stringify(payloadForChecksum);
      metadata.checksum = generateChecksum(serializedForChecksum);

      // Create final payload with checksum
      const payload = {
        data,
        metadata,
      };
      const serialized = JSON.stringify(payload);

      // Retry logic for transient failures
      await this.retryOperation(() => {
        localStorage.setItem(this.config.key, serialized);
      });

      this.recordLatency("write", performance.now() - startTime);
      this.health.operations.successful++;
    } catch (error) {
      this.handleError("write", error);
      throw this.createStorageError(
        "Failed to write to storage",
        "SERIALIZATION_ERROR",
        {
          key: this.config.key,
          operation: "write",
          originalError: error,
          data,
        },
      );
    } finally {
      this.health.operations.total++;
    }
  }

  async remove(): Promise<void> {
    this.metrics.operationCount.delete++;

    try {
      this.checkBrowserSupport();

      // Create backup before deletion
      if (this.config.enableBackup) {
        await this.createBackup();
      }

      localStorage.removeItem(this.config.key);
      this.health.operations.successful++;
    } catch (error) {
      this.handleError("delete", error);
      throw this.createStorageError(
        "Failed to remove from storage",
        "BROWSER_UNSUPPORTED",
        { key: this.config.key, operation: "delete", originalError: error },
      );
    } finally {
      this.health.operations.total++;
    }
  }

  async clear(): Promise<void> {
    this.metrics.operationCount.clear++;

    try {
      this.checkBrowserSupport();

      // Backup all known keys before clearing
      if (this.config.enableBackup) {
        await this.createBackup();
      }

      localStorage.clear();
      this.health.operations.successful++;
    } catch (error) {
      this.handleError("clear", error);
      throw this.createStorageError(
        "Failed to clear storage",
        "BROWSER_UNSUPPORTED",
        { key: "*", operation: "clear", originalError: error },
      );
    } finally {
      this.health.operations.total++;
    }
  }

  // ========================================================================
  // Validation and Migration
  // ========================================================================

  private async validateAndMigrate(parsed: unknown): Promise<T> {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid storage data structure");
    }

    const obj = parsed as Record<string, unknown>;

    // Check if it has the new format with metadata
    if ("data" in obj && "metadata" in obj) {
      const metadataResult = StorageMetadataSchema.safeParse(obj.metadata);
      if (!metadataResult.success) {
        throw new Error("Invalid metadata structure");
      }

      const metadata = metadataResult.data;

      // Check if migration is needed
      if (metadata.version < this.config.currentVersion) {
        return this.migrateData(obj.data as T, metadata.version);
      }

      return obj.data as T;
    }

    // Legacy format - assume version 1
    return this.migrateData(parsed as T, 1);
  }

  private migrateData(data: T, fromVersion: number): T {
    if (!this.config.migrations) return data;

    const applicableMigrations = this.config.migrations
      .filter(
        (m) =>
          m.fromVersion >= fromVersion &&
          m.toVersion <= this.config.currentVersion,
      )
      .sort((a, b) => a.fromVersion - b.fromVersion);

    let migratedData: unknown = data;

    for (const migration of applicableMigrations) {
      try {
        migratedData = migration.migrate(migratedData);
      } catch (error) {
        throw this.createStorageError(
          `Migration failed from v${migration.fromVersion} to v${migration.toVersion}`,
          "MIGRATION_ERROR",
          {
            key: this.config.key,
            operation: "migrate",
            originalError: error,
            data: migratedData,
          },
        );
      }
    }

    return migratedData as T;
  }

  // ========================================================================
  // Backup and Recovery
  // ========================================================================

  private async createBackup(): Promise<void> {
    try {
      const existing = localStorage.getItem(this.config.key);
      if (!existing) return;

      const backups = this.getBackups();
      const timestamp = Date.now();

      // Parse existing to extract metadata
      let metadata: StorageMetadata;
      try {
        const parsed = JSON.parse(existing);
        metadata = parsed.metadata || {
          version: this.config.currentVersion,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: generateChecksum(existing),
        };
      } catch {
        metadata = {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: generateChecksum(existing),
        };
      }

      backups.push({
        timestamp,
        data: existing,
        metadata,
      });

      // Keep only the most recent backups
      while (backups.length > MAX_BACKUP_ENTRIES) {
        backups.shift();
      }

      localStorage.setItem(
        `${BACKUP_KEY_PREFIX}${this.config.key}`,
        JSON.stringify(backups),
      );
    } catch (error) {
      // Backup failures shouldn't stop the main operation
      console.warn("Failed to create backup:", error);
    }
  }

  private getBackups(): BackupEntry[] {
    try {
      const raw = localStorage.getItem(
        `${BACKUP_KEY_PREFIX}${this.config.key}`,
      );
      if (!raw) return [];
      return JSON.parse(raw) as BackupEntry[];
    } catch {
      return [];
    }
  }

  private async recoverFromBackup(): Promise<T | null> {
    try {
      const backups = this.getBackups();

      // Try backups in reverse chronological order
      for (let i = backups.length - 1; i >= 0; i--) {
        const backup = backups[i];
        if (!backup) continue;

        try {
          const parsed = JSON.parse(backup.data);
          const recovered = await this.validateAndMigrate(parsed);

          // Restore the recovered data
          localStorage.setItem(this.config.key, backup.data);

          console.info(
            `Successfully recovered from backup created at ${new Date(backup.timestamp)}`,
          );
          return recovered;
        } catch {
          // Try next backup
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error("Recovery failed:", error);
      return null;
    }
  }

  // ========================================================================
  // Health Monitoring
  // ========================================================================

  checkHealth(): StorageHealth {
    this.health.quota = getStorageQuota();
    this.health.isHealthy =
      isLocalStorageSupported() &&
      !isPrivacyMode() &&
      this.health.quota.percentage < 90;
    this.health.lastCheck = new Date();

    return this.health;
  }

  getMetrics(): StorageMetrics {
    return { ...this.metrics };
  }

  getHealth(): StorageHealth {
    return { ...this.health };
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  private checkBrowserSupport(): void {
    if (!isLocalStorageSupported()) {
      throw this.createStorageError(
        "localStorage is not supported in this browser",
        "BROWSER_UNSUPPORTED",
        { key: this.config.key, operation: "read" },
      );
    }

    if (isPrivacyMode()) {
      throw this.createStorageError(
        "Storage is unavailable in private browsing mode",
        "PRIVACY_MODE",
        { key: this.config.key, operation: "read" },
      );
    }
  }

  private checkQuota(): void {
    const quota = getStorageQuota();
    if (quota.remaining < 1024) {
      // Less than 1KB remaining
      throw this.createStorageError(
        "Storage quota exceeded",
        "QUOTA_EXCEEDED",
        { key: this.config.key, operation: "write", data: quota },
      );
    }
  }

  private async retryOperation(operation: () => void): Promise<void> {
    const maxRetries = this.config.maxRetries || 3;
    const delay = this.config.retryDelay || 100;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        operation();
        return;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  private handleError(
    operation: "read" | "write" | "delete" | "clear",
    error: unknown,
  ): void {
    this.metrics.errorCount++;
    this.health.operations.failed++;

    if (error instanceof StorageError) {
      this.metrics.lastError = error;
      this.health.operations.lastError = error;
    }

    console.error(`Storage ${operation} failed:`, error);
  }

  private createStorageError(
    message: string,
    type: StorageErrorType,
    details: StorageErrorDetails,
  ): StorageError {
    return new StorageError(message, type, details);
  }

  private recordLatency(type: "read" | "write", latency: number): void {
    const latencies =
      type === "read" ? this.metrics.readLatency : this.metrics.writeLatency;
    latencies.push(latency);

    // Keep only recent measurements (last 100)
    if (latencies.length > 100) {
      latencies.shift();
    }
  }
}

// ============================================================================
// Storage Manager - Handles Multiple Storage Instances
// ============================================================================

export class StorageManager {
  private services = new Map<string, StorageService<unknown>>();

  create<T>(config: StorageConfig): StorageService<T> {
    if (this.services.has(config.key)) {
      throw new Error(`Storage service for key "${config.key}" already exists`);
    }

    const service = new StorageService<T>(config);
    this.services.set(config.key, service as StorageService<unknown>);
    return service;
  }

  get<T>(key: string): StorageService<T> | undefined {
    return this.services.get(key) as StorageService<T> | undefined;
  }

  remove(key: string): boolean {
    return this.services.delete(key);
  }

  getAllHealth(): Record<string, StorageHealth> {
    const health: Record<string, StorageHealth> = {};
    this.services.forEach((service, key) => {
      health[key] = service.getHealth();
    });
    return health;
  }

  async clearAll(): Promise<void> {
    for (const [_, service] of this.services) {
      await service.clear();
    }
  }
}

// ============================================================================
// Pre-configured Storage Services
// ============================================================================

export const storageManager = new StorageManager();

// Wizard storage with reliability features
export const wizardStorage = storageManager.create({
  key: STORAGE_KEYS.WIZARD,
  currentVersion: 1,
  enableBackup: true,
  maxRetries: 3,
});

// Editor storage with reliability features
export const editorStorage = storageManager.create({
  key: STORAGE_KEYS.EDITOR,
  currentVersion: 1,
  enableBackup: true,
  maxRetries: 3,
});

// ============================================================================
// Error Handler Utilities
// ============================================================================

export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError;
}

export function getStorageErrorMessage(error: unknown): string {
  if (isStorageError(error)) {
    switch (error.type) {
      case "QUOTA_EXCEEDED":
        return "Storage is full. Please clear some data and try again.";
      case "CORRUPTED_DATA":
        return "Stored data appears to be corrupted. Attempting recovery...";
      case "BROWSER_UNSUPPORTED":
        return "Your browser does not support local storage.";
      case "PRIVACY_MODE":
        return "Storage is unavailable in private browsing mode.";
      case "VALIDATION_ERROR":
        return "Data validation failed.";
      case "MIGRATION_ERROR":
        return "Data migration failed. Please clear storage and try again.";
      default:
        return error.message;
    }
  }
  return "An unexpected storage error occurred.";
}

export async function withStorageRecovery<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error("Storage operation failed:", error);
    return fallback;
  }
}
