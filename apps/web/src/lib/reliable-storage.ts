/**
 * Reliable Storage Service
 *
 * A robust storage abstraction layer that provides:
 * - Error boundaries and graceful degradation
 * - Data validation and integrity checks
 * - Backup strategies and recovery mechanisms
 * - Health monitoring and performance tracking
 * - Automatic quota management and cleanup
 */

import type { z } from "zod";

export type StorageType = "localStorage" | "sessionStorage" | "memory";

export interface StorageResult<T> {
  data: T | null;
  success: boolean;
  error?: StorageError;
  metadata?: StorageMetadata;
}

export interface StorageError {
  type:
    | "QUOTA_EXCEEDED"
    | "STORAGE_DISABLED"
    | "DATA_CORRUPTION"
    | "VALIDATION_ERROR"
    | "UNKNOWN_ERROR";
  message: string;
  originalError?: Error;
  retryable: boolean;
}

export interface StorageMetadata {
  checksum: string;
  version: string;
  timestamp: string;
  size: number;
  compressed?: boolean;
  backupCount: number;
}

export interface StorageHealth {
  available: boolean;
  quotaUsed: number;
  quotaTotal: number;
  errorRate: number;
  lastOperationTime: string;
  operationCount: number;
  errorCount: number;
}

export interface StorageOptions {
  enableBackups?: boolean;
  enableCompression?: boolean;
  enableValidation?: boolean;
  maxBackups?: number;
  schema?: z.ZodSchema;
  fallbackStorage?: StorageType[];
}

export class ReliableStorage {
  private static instance: ReliableStorage;
  private healthMetrics: Map<StorageType, StorageHealth> = new Map();
  private operationCounts: Map<StorageType, number> = new Map();
  private errorCounts: Map<StorageType, number> = new Map();
  private lastOperationTimes: Map<StorageType, number> = new Map();

  private constructor() {
    this.initializeHealthMetrics();
  }

  public static getInstance(): ReliableStorage {
    if (!ReliableStorage.instance) {
      ReliableStorage.instance = new ReliableStorage();
    }
    return ReliableStorage.instance;
  }

  async store<T>(
    key: string,
    data: T,
    storageType: StorageType = "localStorage",
    options: StorageOptions = {},
  ): Promise<StorageResult<T>> {
    const startTime = Date.now();
    this.recordOperation(storageType);

    try {
      if (options.enableValidation && options.schema) {
        const validationResult = options.schema.safeParse(data);
        if (!validationResult.success) {
          const error: StorageError = {
            type: "VALIDATION_ERROR",
            message: `Schema validation failed: ${validationResult.error.message}`,
            retryable: false,
          };
          this.recordError(storageType);
          return { data: null, success: false, error };
        }
      }

      const dataWithMetadata = {
        data,
        metadata: {
          checksum: this.calculateChecksum(JSON.stringify(data)),
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          size: this.estimateSize(data),
          backupCount: options.enableBackups ? this.getBackupCount(key) : 0,
        },
      };

      if (options.enableBackups) {
        await this.createBackup(key, data, storageType, options);
      }

      const serializedData = JSON.stringify(dataWithMetadata);
      const storage = this.getStorage(storageType);

      if (!storage) {
        throw new Error(`${storageType} is not available`);
      }

      storage.setItem(key, serializedData);

      this.updateHealthMetrics(storageType, true, Date.now() - startTime);

      return {
        data,
        success: true,
        metadata: dataWithMetadata.metadata,
      };
    } catch (error) {
      const storageError = this.handleStorageError(error as Error, storageType);
      this.recordError(storageType);
      this.updateHealthMetrics(storageType, false, Date.now() - startTime);

      if (storageError.retryable && options.fallbackStorage) {
        return this.attemptFallbackStore(key, data, storageType, options);
      }

      return { data: null, success: false, error: storageError };
    }
  }

  async retrieve<T>(
    key: string,
    storageType: StorageType = "localStorage",
    options: StorageOptions = {},
  ): Promise<StorageResult<T>> {
    const startTime = Date.now();
    this.recordOperation(storageType);

    try {
      const storage = this.getStorage(storageType);
      if (!storage) {
        throw new Error(`${storageType} is not available`);
      }

      const serializedData = storage.getItem(key);
      if (!serializedData) {
        return { data: null, success: true };
      }

      let parsedData: any;
      try {
        parsedData = JSON.parse(serializedData);
      } catch (parseError) {
        const errorMessage =
          parseError instanceof Error
            ? parseError.message
            : "Unknown parse error";
        throw new Error(`Data corruption detected: ${errorMessage}`);
      }

      if (!parsedData.metadata) {
        if (options.enableValidation && options.schema) {
          const validationResult = options.schema.safeParse(parsedData);
          if (!validationResult.success) {
            const error: StorageError = {
              type: "DATA_CORRUPTION",
              message: `Legacy data failed validation: ${validationResult.error.message}`,
              retryable: false,
            };
            return { data: null, success: false, error };
          }
        }
        this.updateHealthMetrics(storageType, true, Date.now() - startTime);
        return { data: parsedData, success: true };
      }

      if (options.enableValidation) {
        const currentChecksum = this.calculateChecksum(
          JSON.stringify(parsedData.data),
        );
        if (currentChecksum !== parsedData.metadata.checksum) {
          throw new Error(`Data corruption detected - checksum mismatch`);
        }

        if (options.schema) {
          const validationResult = options.schema.safeParse(parsedData.data);
          if (!validationResult.success) {
            const error: StorageError = {
              type: "VALIDATION_ERROR",
              message: `Data validation failed: ${validationResult.error.message}`,
              retryable: false,
            };
            return { data: null, success: false, error };
          }
        }
      }

      this.updateHealthMetrics(storageType, true, Date.now() - startTime);
      return {
        data: parsedData.data,
        success: true,
        metadata: parsedData.metadata,
      };
    } catch (error) {
      const storageError = this.handleStorageError(error as Error, storageType);
      this.recordError(storageType);
      this.updateHealthMetrics(storageType, false, Date.now() - startTime);

      if (options.enableBackups) {
        const backupResult = await this.recoverFromBackup<T>(
          key,
          storageType,
          options,
        );
        if (backupResult.success) {
          return backupResult;
        }
      }

      return { data: null, success: false, error: storageError };
    }
  }

  async remove(
    key: string,
    storageType: StorageType = "localStorage",
  ): Promise<StorageResult<void>> {
    this.recordOperation(storageType);

    try {
      const storage = this.getStorage(storageType);
      if (!storage) {
        throw new Error(`${storageType} is not available`);
      }

      storage.removeItem(key);

      await this.removeBackups(key, storageType);

      this.updateHealthMetrics(storageType, true, 0);
      return { data: null, success: true };
    } catch (error) {
      const storageError = this.handleStorageError(error as Error, storageType);
      this.recordError(storageType);
      this.updateHealthMetrics(storageType, false, 0);
      return { data: null, success: false, error: storageError };
    }
  }

  getHealth(storageType: StorageType = "localStorage"): StorageHealth {
    const storage = this.getStorage(storageType);
    if (!storage) {
      return {
        available: false,
        quotaUsed: 0,
        quotaTotal: 0,
        errorRate: 0,
        lastOperationTime: new Date().toISOString(),
        operationCount: 0,
        errorCount: 0,
      };
    }

    const health =
      this.healthMetrics.get(storageType) || this.createDefaultHealth();
    const quotaInfo = this.getQuotaInfo(storage);

    return {
      ...health,
      available: true,
      quotaUsed: quotaInfo.used,
      quotaTotal: quotaInfo.total,
    };
  }

  async cleanup(
    storageType: StorageType = "localStorage",
    maxAgeMs: number = 7 * 24 * 60 * 60 * 1000,
  ): Promise<void> {
    const storage = this.getStorage(storageType);
    if (!storage) return;

    const keys = Object.keys(storage);
    const cutoffTime = Date.now() - maxAgeMs;

    for (const key of keys) {
      if (key.endsWith("_backup")) continue;

      try {
        const data = storage.getItem(key);
        if (!data) continue;

        const parsed = JSON.parse(data);
        const timestamp = parsed.metadata?.timestamp;
        if (timestamp && new Date(timestamp).getTime() < cutoffTime) {
          await this.remove(key, storageType);
        }
      } catch {
        await this.remove(key, storageType);
      }
    }
  }

  private initializeHealthMetrics(): void {
    const storageTypes: StorageType[] = [
      "localStorage",
      "sessionStorage",
      "memory",
    ];
    storageTypes.forEach((type) => {
      this.healthMetrics.set(type, this.createDefaultHealth());
      this.operationCounts.set(type, 0);
      this.errorCounts.set(type, 0);
      this.lastOperationTimes.set(type, Date.now());
    });
  }

  private createDefaultHealth(): StorageHealth {
    return {
      available: false,
      quotaUsed: 0,
      quotaTotal: 0,
      errorRate: 0,
      lastOperationTime: new Date().toISOString(),
      operationCount: 0,
      errorCount: 0,
    };
  }

  private getStorage(storageType: StorageType): Storage | null {
    if (typeof window === "undefined") return null;

    switch (storageType) {
      case "localStorage":
        try {
          return window.localStorage;
        } catch {
          return null;
        }
      case "sessionStorage":
        try {
          return window.sessionStorage;
        } catch {
          return null;
        }
      case "memory":
        return this.getMemoryStorage();
      default:
        return null;
    }
  }

  private handleStorageError(
    error: Error,
    storageType: StorageType,
  ): StorageError {
    if (
      error.name === "QuotaExceededError" ||
      error.message.includes("quota")
    ) {
      return {
        type: "QUOTA_EXCEEDED",
        message: "Storage quota exceeded. Please free up space.",
        originalError: error,
        retryable: false,
      };
    }

    if (error.name === "SecurityError" || error.message.includes("disabled")) {
      return {
        type: "STORAGE_DISABLED",
        message: `${storageType} is disabled or not available.`,
        originalError: error,
        retryable: false,
      };
    }

    if (
      error.message.includes("corruption") ||
      error.message.includes("parse")
    ) {
      return {
        type: "DATA_CORRUPTION",
        message: "Data corruption detected. Attempting recovery.",
        originalError: error,
        retryable: true,
      };
    }

    return {
      type: "UNKNOWN_ERROR",
      message: `Unexpected storage error: ${error.message}`,
      originalError: error,
      retryable: true,
    };
  }

  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private estimateSize(data: unknown): number {
    return JSON.stringify(data).length * 2;
  }

  private recordOperation(storageType: StorageType): void {
    const count = this.operationCounts.get(storageType) || 0;
    this.operationCounts.set(storageType, count + 1);
    this.lastOperationTimes.set(storageType, Date.now());
  }

  private recordError(storageType: StorageType): void {
    const count = this.errorCounts.get(storageType) || 0;
    this.errorCounts.set(storageType, count + 1);
  }

  private updateHealthMetrics(
    storageType: StorageType,
    success: boolean,
    durationMs: number,
  ): void {
    const health =
      this.healthMetrics.get(storageType) || this.createDefaultHealth();
    const operationCount = this.operationCounts.get(storageType) || 0;
    const errorCount = this.errorCounts.get(storageType) || 0;

    health.lastOperationTime = new Date().toISOString();
    health.operationCount = operationCount;
    health.errorCount = errorCount;
    health.errorRate = operationCount > 0 ? errorCount / operationCount : 0;

    this.healthMetrics.set(storageType, health);
  }

  private getQuotaInfo(storage: Storage): { used: number; total: number } {
    try {
      let used = 0;
      for (const key in storage) {
        if (storage.hasOwnProperty(key)) {
          used += storage[key].length * 2;
        }
      }

      const estimated = 5 * 1024 * 1024;

      return { used, total: estimated };
    } catch {
      return { used: 0, total: 5242880 };
    }
  }

  private getBackupCount(key: string): number {
    const storage = this.getStorage("localStorage");
    if (!storage) return 0;

    let count = 0;
    for (let i = 1; i <= 10; i++) {
      if (storage.getItem(`${key}_backup_${i}`)) {
        count++;
      }
    }
    return count;
  }

  private async createBackup<T>(
    key: string,
    data: T,
    storageType: StorageType,
    options: StorageOptions,
  ): Promise<void> {
    const maxBackups = options.maxBackups || 3;
    const storage = this.getStorage(storageType);
    if (!storage) return;

    for (let i = maxBackups - 1; i > 0; i--) {
      const existingBackup = storage.getItem(`${key}_backup_${i}`);
      if (existingBackup) {
        storage.setItem(`${key}_backup_${i + 1}`, existingBackup);
      }
    }

    const backupData = {
      data,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
    storage.setItem(`${key}_backup_1`, JSON.stringify(backupData));
  }

  private async recoverFromBackup<T>(
    key: string,
    storageType: StorageType,
    options: StorageOptions,
  ): Promise<StorageResult<T>> {
    const storage = this.getStorage(storageType);
    if (!storage) {
      return { data: null, success: false };
    }

    for (let i = 1; i <= (options.maxBackups || 3); i++) {
      try {
        const backupData = storage.getItem(`${key}_backup_${i}`);
        if (!backupData) continue;

        const parsedBackup = JSON.parse(backupData);

        if (options.enableValidation && options.schema) {
          const validationResult = options.schema.safeParse(parsedBackup.data);
          if (!validationResult.success) continue;
        }

        const restoreResult = await this.store(
          key,
          parsedBackup.data,
          storageType,
          options,
        );

        if (restoreResult.success) {
          return restoreResult;
        }
      } catch {
        continue;
      }
    }

    return { data: null, success: false };
  }

  private async removeBackups(
    key: string,
    storageType: StorageType,
  ): Promise<void> {
    const storage = this.getStorage(storageType);
    if (!storage) return;

    for (let i = 1; i <= 10; i++) {
      storage.removeItem(`${key}_backup_${i}`);
    }
  }

  private async attemptFallbackStore<T>(
    key: string,
    data: T,
    failedStorageType: StorageType,
    options: StorageOptions,
  ): Promise<StorageResult<T>> {
    if (!options.fallbackStorage) {
      return { data: null, success: false };
    }

    for (const fallbackType of options.fallbackStorage) {
      if (fallbackType === failedStorageType) continue;

      const result = await this.store(key, data, fallbackType, options);
      if (result.success) {
        return result;
      }
    }

    return { data: null, success: false };
  }

  private memoryStorage = new Map<string, string>();

  private getMemoryStorage(): Storage {
    return {
      getItem: (key: string) => this.memoryStorage.get(key) || null,
      setItem: (key: string, value: string) =>
        this.memoryStorage.set(key, value),
      removeItem: (key: string) => this.memoryStorage.delete(key),
      clear: () => this.memoryStorage.clear(),
      get length() {
        return this.memoryStorage.size;
      },
      key: (index: number) => {
        const keys = Array.from(this.memoryStorage.keys());
        return keys[index] || null;
      },
    };
  }
}

export const reliableStorage = ReliableStorage.getInstance();
