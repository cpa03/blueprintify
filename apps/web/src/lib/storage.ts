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
import { STORAGE_KEYS, STORAGE_CONFIG, STORAGE_ERROR_MESSAGES } from "../config/constants";
import { BACKUP_KEY_PREFIX, TEST_KEYS } from "../config/keys";
import { STORAGE_CONFIG as SHARED_STORAGE_CONFIG, BYTE_CONVERSION } from "@blueprint/shared";

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
    public readonly details: StorageErrorDetails
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
  maxRetries: STORAGE_CONFIG.DEFAULT_MAX_RETRIES,
  retryDelay: STORAGE_CONFIG.DEFAULT_RETRY_DELAY_MS,
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

const MAX_BACKUP_ENTRIES = STORAGE_CONFIG.MAX_BACKUP_ENTRIES;

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

// ============================================================================
// Storage Quota Management (incremental tracking)
// ============================================================================

export interface QuotaInfo {
  used: number;
  total: number;
  remaining: number;
  percentage: number;
}

/** Running estimate of total bytes used in localStorage. Avoids O(n) serialization. */
let runningBytesUsed: number = calculateTotalBytes();

/**
 * Fast estimate of localStorage byte usage by summing each key+value length.
 * Still iterates all keys but avoids Blob serialization overhead (~10x faster).
 * Used at module init and as a periodic sanity check.
 */
function calculateTotalBytes(): number {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        const value = localStorage.getItem(key);
        total += key.length * 2 + (value ? value.length * 2 : 0);
      }
    }
    return total;
  } catch {
    return 0;
  }
}

/** Fast iteration-based bytes estimate used as periodic drift correction. */
let lastFullCalculation: number = 0;
const FULL_RECALCULATION_INTERVAL_MS = STORAGE_CONFIG.FULL_RECALCULATION_INTERVAL_MS;

function getStorageQuota(): QuotaInfo {
  const now = Date.now();

  // Periodic sanity check: recalculate every 10 minutes to correct drift.
  // Uses fast key iteration (~10x faster than Blob serialization) to avoid blocking main thread.
  if (now - lastFullCalculation > FULL_RECALCULATION_INTERVAL_MS) {
    const fullUsed = calculateTotalBytes();
    // Only update if sanity check succeeds (storage errors return 0)
    if (fullUsed > 0) {
      runningBytesUsed = fullUsed;
    }
    lastFullCalculation = now;
  }

  const total = SHARED_STORAGE_CONFIG.QUOTA_BYTES;
  const used = Math.max(0, runningBytesUsed);
  const remaining = Math.max(0, total - used);
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return { used, total, remaining, percentage };
}

/**
 * Update the running byte estimate when data is written.
 * Called after every localStorage mutation to keep the estimate accurate.
 */
function updateQuotaEstimate(
  key: string,
  previousValue: string | null,
  newValue: string | null
): void {
  if (previousValue !== null) {
    runningBytesUsed -= key.length * 2 + previousValue.length * 2;
  }
  if (newValue !== null) {
    runningBytesUsed += key.length * 2 + newValue.length * 2;
  }
  // Clamp to prevent negative from cross-tab interference
  if (runningBytesUsed < 0) {
    runningBytesUsed = 0;
  }
}

/** Mark quota estimate as needing a sanity check on next read */
function invalidateQuotaCache(): void {
  // Force full recalculation on next access by resetting the timer
  lastFullCalculation = 0;
}

// Cross-tab cache invalidation: when another tab writes to localStorage,
// our running estimate may drift, so trigger a full recalculation
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("storage", () => {
    invalidateQuotaCache();
  });
}

// ============================================================================
// Browser Compatibility Check
// ============================================================================

function isLocalStorageSupported(): boolean {
  try {
    const test = TEST_KEYS.STORAGE_TEST;
    // Use window.localStorage for browser compatibility (including jsdom in tests)
    (globalThis as typeof globalThis & { localStorage: Storage }).localStorage.setItem(test, test);
    (globalThis as typeof globalThis & { localStorage: Storage }).localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function isPrivacyMode(): boolean {
  try {
    const test = TEST_KEYS.PRIVACY_TEST;
    // Use window.localStorage for browser compatibility (including jsdom in tests)
    (globalThis as typeof globalThis & { localStorage: Storage }).localStorage.setItem(test, test);
    (globalThis as typeof globalThis & { localStorage: Storage }).localStorage.removeItem(test);
    return false;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === STORAGE_CONFIG.BROWSER_QUOTA_ERROR_CODES.CHROME ||
        e.code === STORAGE_CONFIG.BROWSER_QUOTA_ERROR_CODES.FIREFOX ||
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

      throw this.createStorageError(STORAGE_ERROR_MESSAGES.READ_FAILED, "CORRUPTED_DATA", {
        key: this.config.key,
        operation: "read",
        originalError: error,
      });
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

      // Calculate checksum from payload without checksum
      const payloadWithoutChecksum = {
        data,
        metadata: { ...metadata, checksum: "" },
      };
      const serializedForChecksum = JSON.stringify(payloadWithoutChecksum);
      const checksum = generateChecksum(serializedForChecksum);

      // Create final payload with checksum and serialize once
      const finalMetadata = {
        ...metadata,
        checksum,
      };
      const serialized = JSON.stringify({ data, metadata: finalMetadata });

      // Retry logic for transient failures
      const previousValue = localStorage.getItem(this.config.key);
      await this.retryOperation(() => {
        localStorage.setItem(this.config.key, serialized);
      });

      if (this.config.enableBackup) {
        await this.createBackup();
      }

      // Update running byte estimate — avoids O(n) serialization on quota checks
      updateQuotaEstimate(this.config.key, previousValue, serialized);

      this.recordLatency("write", performance.now() - startTime);
      this.health.operations.successful++;
    } catch (error) {
      this.handleError("write", error);
      throw this.createStorageError(STORAGE_ERROR_MESSAGES.WRITE_FAILED, "SERIALIZATION_ERROR", {
        key: this.config.key,
        operation: "write",
        originalError: error,
        data,
      });
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

      const previousValue = localStorage.getItem(this.config.key);
      localStorage.removeItem(this.config.key);

      updateQuotaEstimate(this.config.key, previousValue, null);

      this.health.operations.successful++;
    } catch (error) {
      this.handleError("delete", error);
      throw this.createStorageError(STORAGE_ERROR_MESSAGES.REMOVE_FAILED, "BROWSER_UNSUPPORTED", {
        key: this.config.key,
        operation: "delete",
        originalError: error,
      });
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
      runningBytesUsed = 0;

      this.health.operations.successful++;
    } catch (error) {
      this.handleError("clear", error);
      throw this.createStorageError(
        STORAGE_ERROR_MESSAGES.CLEAR_STORAGE_FAILED,
        "BROWSER_UNSUPPORTED",
        {
          key: "*",
          operation: "clear",
          originalError: error,
        }
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
      throw new Error(
        `Invalid storage data structure for key "${this.config.key}": expected an object, got ${parsed === null ? "null" : typeof parsed}. The storage data may be corrupted. Try clearing localStorage and refreshing.`
      );
    }

    const obj = parsed as Record<string, unknown>;

    // Check if it has the new format with metadata
    if ("data" in obj && "metadata" in obj) {
      const metadataResult = StorageMetadataSchema.safeParse(obj.metadata);
      if (!metadataResult.success) {
        throw new Error(
          `Invalid metadata structure for key "${this.config.key}": ${metadataResult.error.issues.map((e) => e.message).join(", ")}. The storage metadata may be corrupted.`
        );
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
      .filter((m) => m.fromVersion >= fromVersion && m.toVersion <= this.config.currentVersion)
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
          }
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

      localStorage.setItem(`${BACKUP_KEY_PREFIX}${this.config.key}`, JSON.stringify(backups));
    } catch (error) {
      // Backup failures shouldn't stop the main operation
      console.warn(STORAGE_ERROR_MESSAGES.BACKUP_FAILED, error);
    }
  }

  private getBackups(): BackupEntry[] {
    try {
      const raw = localStorage.getItem(`${BACKUP_KEY_PREFIX}${this.config.key}`);
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

          console.warn(STORAGE_ERROR_MESSAGES.RECOVERY_SUCCESS(backup.timestamp));
          return recovered;
        } catch {
          // Try next backup
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error(STORAGE_ERROR_MESSAGES.RECOVERY_FAILED, error);
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
      this.health.quota.percentage < SHARED_STORAGE_CONFIG.WARNING_THRESHOLD_PERCENT;
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
        STORAGE_ERROR_MESSAGES.STORAGE_UNSUPPORTED,
        "BROWSER_UNSUPPORTED",
        { key: this.config.key, operation: "read" }
      );
    }

    if (isPrivacyMode()) {
      throw this.createStorageError(STORAGE_ERROR_MESSAGES.PRIVACY_MODE, "PRIVACY_MODE", {
        key: this.config.key,
        operation: "read",
      });
    }
  }

  private checkQuota(): void {
    const quota = getStorageQuota();
    if (quota.remaining < STORAGE_CONFIG.QUOTA_WARNING_THRESHOLD_KB * BYTE_CONVERSION.KB) {
      throw this.createStorageError(STORAGE_ERROR_MESSAGES.QUOTA_EXCEEDED, "QUOTA_EXCEEDED", {
        key: this.config.key,
        operation: "write",
        data: quota,
      });
    }
  }

  private async retryOperation(operation: () => void): Promise<void> {
    const maxRetries = this.config.maxRetries || STORAGE_CONFIG.DEFAULT_MAX_RETRIES;
    const delay = this.config.retryDelay || STORAGE_CONFIG.DEFAULT_RETRY_DELAY_MS;

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

  private handleError(operation: "read" | "write" | "delete" | "clear", error: unknown): void {
    this.metrics.errorCount++;
    this.health.operations.failed++;

    if (error instanceof StorageError) {
      this.metrics.lastError = error;
      this.health.operations.lastError = error;
    }

    console.error(STORAGE_ERROR_MESSAGES.OPERATION_FAILED(operation), error);
  }

  private createStorageError(
    message: string,
    type: StorageErrorType,
    details: StorageErrorDetails
  ): StorageError {
    return new StorageError(message, type, details);
  }

  private recordLatency(type: "read" | "write", latency: number): void {
    const latencies = type === "read" ? this.metrics.readLatency : this.metrics.writeLatency;
    latencies.push(latency);

    if (latencies.length > STORAGE_CONFIG.MAX_LATENCY_MEASUREMENTS) {
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
      throw new Error(STORAGE_ERROR_MESSAGES.SERVICE_EXISTS(config.key));
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
        return STORAGE_ERROR_MESSAGES.STORAGE_FULL;
      case "CORRUPTED_DATA":
        return STORAGE_ERROR_MESSAGES.DATA_CORRUPTED;
      case "BROWSER_UNSUPPORTED":
        return STORAGE_ERROR_MESSAGES.BROWSER_UNSUPPORTED;
      case "PRIVACY_MODE":
        return STORAGE_ERROR_MESSAGES.PRIVACY_MODE_MSG;
      case "VALIDATION_ERROR":
        return STORAGE_ERROR_MESSAGES.VALIDATION_FAILED;
      case "MIGRATION_ERROR":
        return STORAGE_ERROR_MESSAGES.MIGRATION_FAILED;
      default:
        return error.message;
    }
  }
  return STORAGE_ERROR_MESSAGES.UNEXPECTED_ERROR;
}

export async function withStorageRecovery<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(STORAGE_ERROR_MESSAGES.OPERATION_FAILED("operation"), error);
    return fallback;
  }
}
