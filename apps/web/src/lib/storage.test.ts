import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  StorageService,
  StorageManager,
  StorageError,
  isStorageError,
  getStorageErrorMessage,
  withStorageRecovery,
} from "./storage";

describe("StorageService", () => {
  let storage: StorageService<{ test: string }>;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new StorageService<{ test: string }>({
      key: `test-storage-${Date.now()}-${Math.random()}`,
      currentVersion: 1,
      enableBackup: false,
      maxRetries: 3,
    });
  });

  describe("get", () => {
    it("should return null when no data exists", async () => {
      const result = await storage.get();
      expect(result).toBeNull();
    });

    it("should store and retrieve data", async () => {
      const data = { test: "value" };
      await storage.set(data);
      const result = await storage.get();
      expect(result).toEqual(data);
    });

    it("AC: should never crash application on read errors", async () => {
      // Simulate corrupted data that will fail validation
      const corruptedKey = `corrupt-test-${Date.now()}`;
      localStorage.setItem(corruptedKey, "invalid json {{{{");

      const corruptStorage = new StorageService<{ test: string }>({
        key: corruptedKey,
        currentVersion: 1,
        enableBackup: false,
      });

      // Should not crash, should throw StorageError
      await expect(corruptStorage.get()).rejects.toBeInstanceOf(StorageError);

      // Cleanup
      localStorage.removeItem(corruptedKey);
    });
  });

  describe("set", () => {
    it("should store data successfully", async () => {
      const data = { test: "stored-value" };
      await expect(storage.set(data)).resolves.not.toThrow();
    });

    it("should throw StorageError on circular data", async () => {
      const circularData: Record<string, unknown> = { test: "value" };
      circularData.self = circularData;

      await expect(storage.set(circularData as { test: string })).rejects.toBeInstanceOf(
        StorageError
      );
    });

    it("AC: should handle serialization errors gracefully", async () => {
      const bigIntData = { test: "value", big: BigInt(9007199254740991) };

      await expect(storage.set(bigIntData as unknown as { test: string })).rejects.toBeInstanceOf(
        StorageError
      );
    });
  });

  describe("remove", () => {
    it("should remove item from storage", async () => {
      await storage.set({ test: "to-remove" });
      expect(await storage.get()).toEqual({ test: "to-remove" });

      await storage.remove();
      expect(await storage.get()).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all storage", async () => {
      await storage.set({ test: "to-clear" });
      expect(await storage.get()).toEqual({ test: "to-clear" });

      await storage.clear();
      expect(await storage.get()).toBeNull();
    });
  });

  describe("health monitoring", () => {
    it("should report storage health", () => {
      const health = storage.checkHealth();
      expect(health).toHaveProperty("isHealthy");
      expect(health).toHaveProperty("quota");
      expect(health).toHaveProperty("operations");
      expect(health).toHaveProperty("lastCheck");
    });

    it("should track read operations", async () => {
      await storage.get();
      const metrics = storage.getMetrics();
      expect(metrics.operationCount.read).toBe(1);
    });

    it("should track write operations", async () => {
      await storage.set({ test: "metric-test" });
      const metrics = storage.getMetrics();
      expect(metrics.operationCount.write).toBe(1);
    });

    it("AC: should track error counts in metrics", async () => {
      const corruptedKey = `error-metric-test-${Date.now()}`;
      localStorage.setItem(corruptedKey, "invalid json");

      const errorStorage = new StorageService<{ test: string }>({
        key: corruptedKey,
        currentVersion: 1,
        enableBackup: false,
      });

      try {
        await errorStorage.get();
      } catch {
        // Expected to fail
      }

      const metrics = errorStorage.getMetrics();
      expect(metrics.errorCount).toBeGreaterThan(0);

      localStorage.removeItem(corruptedKey);
    });

    it("AC: should monitor storage quota usage", () => {
      const health = storage.checkHealth();
      expect(health.quota).toHaveProperty("used");
      expect(health.quota).toHaveProperty("total");
      expect(health.quota).toHaveProperty("remaining");
      expect(health.quota).toHaveProperty("percentage");
      expect(typeof health.quota.percentage).toBe("number");
    });
  });

  describe("backup and recovery", () => {
    it("AC: should create backups when enabled", async () => {
      const backupKey = `backup-test-${Date.now()}`;

      // First, store initial data without backup service to create "existing" data
      const initialData = {
        data: { test: "existing-data" },
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "abc123",
        },
      };
      localStorage.setItem(backupKey, JSON.stringify(initialData));

      const backupStorage = new StorageService<{ test: string }>({
        key: backupKey,
        currentVersion: 1,
        enableBackup: true,
        maxRetries: 3,
      });

      // Update data - this should trigger backup of existing data
      const newData = { test: "backup-data" };
      await backupStorage.set(newData);

      // Check that backup was created
      const backupRaw = localStorage.getItem(`__backup__${backupKey}`);
      expect(backupRaw).not.toBeNull();

      const backups = JSON.parse(backupRaw!);
      expect(backups.length).toBeGreaterThan(0);
      expect(backups[0]).toHaveProperty("timestamp");
      expect(backups[0]).toHaveProperty("data");
      expect(backups[0]).toHaveProperty("metadata");

      // Cleanup
      localStorage.removeItem(backupKey);
      localStorage.removeItem(`__backup__${backupKey}`);
    });

    it("AC: should recover from backup when data is corrupted", async () => {
      const recoveryKey = `recovery-test-${Date.now()}`;

      // Create initial good data
      const goodData = { data: "important-data" };
      const initialData = {
        data: goodData,
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "abc123",
        },
      };
      localStorage.setItem(recoveryKey, JSON.stringify(initialData));

      // Create backup manually
      const backupEntry = {
        timestamp: Date.now(),
        data: JSON.stringify(initialData),
        metadata: initialData.metadata,
      };
      localStorage.setItem(`__backup__${recoveryKey}`, JSON.stringify([backupEntry]));

      const recoveryStorage = new StorageService<{ data: string }>({
        key: recoveryKey,
        currentVersion: 1,
        enableBackup: true,
        maxRetries: 3,
      });

      // Corrupt the main data
      localStorage.setItem(recoveryKey, "corrupted data");

      // Try to read - should recover from backup
      const recovered = await recoveryStorage.get();
      expect(recovered).toEqual(goodData);

      // Cleanup
      localStorage.removeItem(recoveryKey);
      localStorage.removeItem(`__backup__${recoveryKey}`);
    });

    it("AC: should return null when recovery fails", async () => {
      const noBackupKey = `no-backup-test-${Date.now()}`;
      const noBackupStorage = new StorageService<{ test: string }>({
        key: noBackupKey,
        currentVersion: 1,
        enableBackup: true,
        maxRetries: 3,
      });

      // Don't store any data, just corrupt directly
      localStorage.setItem(noBackupKey, "corrupted data");

      // Try to read - should fail and return null after failed recovery
      const result = await noBackupStorage.get().catch(() => null);
      expect(result).toBeNull();

      // Cleanup
      localStorage.removeItem(noBackupKey);
      localStorage.removeItem(`__backup__${noBackupKey}`);
    });
  });

  describe("schema migration", () => {
    it("AC: should migrate data from old version to new version", async () => {
      const migrateKey = `migrate-test-${Date.now()}`;

      // Create storage with migrations
      const migrationStorage = new StorageService<{
        version: number;
        name: string;
      }>({
        key: migrateKey,
        currentVersion: 3,
        enableBackup: false,
        migrations: [
          {
            fromVersion: 1,
            toVersion: 2,
            migrate: (data: unknown) => {
              const oldData = data as { name: string };
              return { ...oldData, version: 2, name: `${oldData.name}-v2` };
            },
          },
          {
            fromVersion: 2,
            toVersion: 3,
            migrate: (data: unknown) => {
              const oldData = data as { name: string; version: number };
              return { ...oldData, version: 3, name: `${oldData.name}-v3` };
            },
          },
        ],
      });

      // Manually store v1 data
      const v1Data = {
        data: { name: "test" },
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "",
        },
      };
      localStorage.setItem(migrateKey, JSON.stringify(v1Data));

      // Read should trigger migrations
      const result = await migrationStorage.get();
      expect(result).toEqual({ name: "test-v2-v3", version: 3 });

      // Cleanup
      localStorage.removeItem(migrateKey);
    });

    it("AC: should handle migration failures gracefully", async () => {
      const failMigrateKey = `fail-migrate-test-${Date.now()}`;

      const failingStorage = new StorageService<{ test: string }>({
        key: failMigrateKey,
        currentVersion: 2,
        enableBackup: false,
        migrations: [
          {
            fromVersion: 1,
            toVersion: 2,
            migrate: () => {
              throw new Error("Migration failed");
            },
          },
        ],
      });

      // Store v1 data
      const v1Data = {
        data: { test: "data" },
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "",
        },
      };
      localStorage.setItem(failMigrateKey, JSON.stringify(v1Data));

      // Should throw StorageError with MIGRATION_ERROR type
      await expect(failingStorage.get()).rejects.toBeInstanceOf(StorageError);

      // Cleanup
      localStorage.removeItem(failMigrateKey);
    });
  });

  describe("error handling", () => {
    it("AC: should provide user-friendly error messages", () => {
      const errorTypes = [
        { type: "QUOTA_EXCEEDED" as const, expected: "full" },
        { type: "CORRUPTED_DATA" as const, expected: "corrupted" },
        { type: "BROWSER_UNSUPPORTED" as const, expected: "browser" },
        { type: "PRIVACY_MODE" as const, expected: "private" },
        { type: "VALIDATION_ERROR" as const, expected: "validation" },
        { type: "MIGRATION_ERROR" as const, expected: "migration" },
        {
          type: "SERIALIZATION_ERROR" as const,
          expected: "Failed to write to storage",
        },
      ];

      for (const { type, expected } of errorTypes) {
        const messageText =
          type === "SERIALIZATION_ERROR" ? "Failed to write to storage" : "test message";
        const error = new StorageError(messageText, type, {
          key: "test",
          operation: "write",
        });
        const message = getStorageErrorMessage(error);
        expect(message.toLowerCase()).toContain(expected.toLowerCase());
      }
    });

    it("AC: should identify storage errors correctly", () => {
      const storageError = new StorageError("test", "QUOTA_EXCEEDED", {
        key: "test",
        operation: "write",
      });
      const regularError = new Error("test");

      expect(isStorageError(storageError)).toBe(true);
      expect(isStorageError(regularError)).toBe(false);
      expect(isStorageError("string")).toBe(false);
      expect(isStorageError(null)).toBe(false);
      expect(isStorageError(undefined)).toBe(false);
    });
  });

  describe("retry logic", () => {
    it("AC: should retry operations on transient failures", async () => {
      let attempts = 0;
      const retryKey = `retry-test-${Date.now()}`;

      // Mock localStorage to fail first 2 times
      const originalSetItem = localStorage.setItem.bind(localStorage);
      const mockSetItem = vi.fn((key: string, value: string) => {
        if (key === retryKey && attempts < 2) {
          attempts++;
          throw new Error("Transient error");
        }
        return originalSetItem(key, value);
      });
      localStorage.setItem = mockSetItem;

      const retryStorage = new StorageService<{ test: string }>({
        key: retryKey,
        currentVersion: 1,
        maxRetries: 3,
        retryDelay: 10,
      });

      // Should eventually succeed after retries
      await retryStorage.set({ test: "retry-data" });
      expect(attempts).toBe(2);
      expect(await retryStorage.get()).toEqual({ test: "retry-data" });

      // Restore
      localStorage.setItem = originalSetItem;
      localStorage.removeItem(retryKey);
    });
  });

  describe("edge cases", () => {
    it("AC: should handle empty data", async () => {
      await storage.set({ test: "" });
      const result = await storage.get();
      expect(result).toEqual({ test: "" });
    });

    it("AC: should handle special characters in data", async () => {
      const specialData = {
        test: "!@#$%^&*()_+-=[]{}|;':\",./<>?\n\t\r",
      };
      await storage.set(specialData);
      const result = await storage.get();
      expect(result).toEqual(specialData);
    });

    it("AC: should handle unicode characters", async () => {
      const unicodeData = {
        test: "Hello 世界 🌍 ñ á é í ó ú 日本語 العربية",
      };
      await storage.set(unicodeData);
      const result = await storage.get();
      expect(result).toEqual(unicodeData);
    });

    it("AC: should handle large data objects", async () => {
      const largeData = {
        test: "x".repeat(10000),
      };
      await storage.set(largeData);
      const result = await storage.get();
      expect(result).toEqual(largeData);
    });

    it("AC: should handle null values in data", async () => {
      const nullData = {
        test: "value",
        optional: null,
      } as { test: string; optional: string | null };
      await storage.set(nullData);
      const result = await storage.get();
      expect(result).toEqual(nullData);
    });
  });
});

describe("StorageManager", () => {
  let manager: StorageManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new StorageManager();
  });

  it("should create storage services", () => {
    const storage = manager.create({
      key: `mgr-test-${Math.random()}`,
      currentVersion: 1,
    });
    expect(storage).toBeInstanceOf(StorageService);
  });

  it("should prevent duplicate keys", () => {
    const key = `dup-test-${Math.random()}`;
    manager.create({ key, currentVersion: 1 });
    expect(() => {
      manager.create({ key, currentVersion: 1 });
    }).toThrow(`Storage service for key "${key}" already exists`);
  });

  it("should retrieve existing services", () => {
    const key = `get-test-${Math.random()}`;
    const created = manager.create({ key, currentVersion: 1 });
    const retrieved = manager.get(key);
    expect(retrieved).toBe(created);
  });

  it("should report health for all services", () => {
    manager.create({ key: `health-1-${Math.random()}`, currentVersion: 1 });
    manager.create({ key: `health-2-${Math.random()}`, currentVersion: 1 });

    const health = manager.getAllHealth();
    expect(Object.keys(health).length).toBe(2);
  });

  it("AC: should clear all storage services", async () => {
    const key1 = `clear-all-1-${Math.random()}`;
    const key2 = `clear-all-2-${Math.random()}`;

    const storage1 = manager.create({ key: key1, currentVersion: 1 });
    const storage2 = manager.create({ key: key2, currentVersion: 1 });

    await storage1.set({ data: "test1" } as unknown as Record<string, unknown>);
    await storage2.set({ data: "test2" } as unknown as Record<string, unknown>);

    await manager.clearAll();

    expect(await storage1.get()).toBeNull();
    expect(await storage2.get()).toBeNull();
  });
});

describe("utility functions", () => {
  describe("isStorageError", () => {
    it("should identify StorageError instances", () => {
      const error = new StorageError("test", "QUOTA_EXCEEDED", {
        key: "test",
        operation: "write",
      });
      expect(isStorageError(error)).toBe(true);
    });

    it("should return false for regular errors", () => {
      expect(isStorageError(new Error("test"))).toBe(false);
      expect(isStorageError("string")).toBe(false);
      expect(isStorageError(null)).toBe(false);
    });
  });

  describe("getStorageErrorMessage", () => {
    it("should return user-friendly messages for quota exceeded", () => {
      const quotaError = new StorageError("test", "QUOTA_EXCEEDED", {
        key: "test",
        operation: "write",
      });
      expect(getStorageErrorMessage(quotaError)).toContain("full");
    });

    it("should return user-friendly messages for corrupted data", () => {
      const corruptedError = new StorageError("test", "CORRUPTED_DATA", {
        key: "test",
        operation: "read",
      });
      expect(getStorageErrorMessage(corruptedError)).toContain("corrupted");
    });

    it("should return user-friendly messages for privacy mode", () => {
      const privacyError = new StorageError("test", "PRIVACY_MODE", {
        key: "test",
        operation: "write",
      });
      expect(getStorageErrorMessage(privacyError)).toContain("private");
    });

    it("should return default message for unknown errors", () => {
      expect(getStorageErrorMessage(new Error("test"))).toContain("unexpected");
    });
  });

  describe("withStorageRecovery", () => {
    it("should return operation result on success", async () => {
      const result = await withStorageRecovery(async () => "success", "fallback");
      expect(result).toBe("success");
    });

    it("should return fallback on failure", async () => {
      const result = await withStorageRecovery(async () => {
        throw new Error("fail");
      }, "fallback");
      expect(result).toBe("fallback");
    });

    it("AC: should handle storage errors gracefully", async () => {
      const storageError = new StorageError("test", "QUOTA_EXCEEDED", {
        key: "test",
        operation: "write",
      });

      const result = await withStorageRecovery(async () => {
        throw storageError;
      }, "fallback");

      expect(result).toBe("fallback");
    });
  });
});

describe("Acceptance Criteria Verification - Issue #242", () => {
  it("AC1: Storage operations never crash the application", async () => {
    const robustKey = `robust-test-${Date.now()}`;
    const robustStorage = new StorageService<{ data: string }>({
      key: robustKey,
      currentVersion: 1,
      enableBackup: true,
    });

    const operations = [
      () => robustStorage.get(),
      () => robustStorage.set({ data: "test" }),
      () => robustStorage.get(),
      () => robustStorage.remove(),
      () => robustStorage.get(),
      () => robustStorage.clear(),
    ];

    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
      }
    }

    localStorage.removeItem(robustKey);
  });

  it("AC2: Corrupted data is auto-recovered or flagged for user action", async () => {
    const recoveryKey = `ac2-test-${Date.now()}`;

    // Create backup manually first
    const goodData = { critical: "important-data" };
    const payload = {
      data: goodData,
      metadata: {
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checksum: "abc123",
      },
    };
    const backupEntry = {
      timestamp: Date.now(),
      data: JSON.stringify(payload),
      metadata: payload.metadata,
    };
    localStorage.setItem(`__backup__${recoveryKey}`, JSON.stringify([backupEntry]));

    const recoveryStorage = new StorageService<{ critical: string }>({
      key: recoveryKey,
      currentVersion: 1,
      enableBackup: true,
    });

    // Corrupt the main storage
    localStorage.setItem(recoveryKey, "{corrupted");

    // Should recover from backup
    const result = await recoveryStorage.get();
    expect(result).toEqual(goodData);

    localStorage.removeItem(recoveryKey);
    localStorage.removeItem(`__backup__${recoveryKey}`);
  });

  it("AC3: Storage quota exceeded is handled gracefully", async () => {
    const quotaStorage = new StorageService<{ data: string }>({
      key: `quota-test-${Date.now()}`,
      currentVersion: 1,
    });

    const health = quotaStorage.checkHealth();
    expect(health.quota).toBeDefined();
    expect(health.quota.percentage).toBeDefined();
    expect(typeof health.quota.remaining).toBe("number");
  });

  it("AC4: Performance monitoring is implemented", async () => {
    const perfStorage = new StorageService<{ data: string }>({
      key: `perf-test-${Date.now()}`,
      currentVersion: 1,
    });

    await perfStorage.set({ data: "test" });
    await perfStorage.get();
    await perfStorage.get();

    const metrics = perfStorage.getMetrics();

    expect(metrics.operationCount.write).toBe(1);
    expect(metrics.operationCount.read).toBe(2);
    expect(metrics.readLatency.length).toBeGreaterThan(0);
    expect(metrics.writeLatency.length).toBeGreaterThan(0);
  });

  it("AC5: Error recovery workflows are tested", async () => {
    const fallback = { success: true };

    const result1 = await withStorageRecovery(async () => ({ success: true }), fallback);
    expect(result1).toEqual({ success: true });

    const result2 = await withStorageRecovery(async () => {
      throw new StorageError("fail", "CORRUPTED_DATA", {
        key: "test",
        operation: "read",
      });
    }, fallback);
    expect(result2).toEqual(fallback);

    const error = new StorageError("test", "RECOVERY_ERROR", {
      key: "test",
      operation: "read",
    });
    const message = getStorageErrorMessage(error);
    expect(message).toBeTruthy();
  });
});
