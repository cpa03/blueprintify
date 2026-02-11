import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  StorageService,
  StorageManager,
  StorageError,
  storageManager as _storageManager,
  isStorageError,
  getStorageErrorMessage,
  withStorageRecovery,
  type StorageConfig,
} from "./storage";

// Get the mocked localStorage from test setup
const localStorageMock = window.localStorage as unknown as {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
};

describe("StorageService", () => {
  let storage: StorageService<{ test: string }>;
  const config: StorageConfig = {
    key: "test-storage",
    currentVersion: 2,
    enableBackup: true,
    maxRetries: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    storage = new StorageService<{ test: string }>(config);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("get", () => {
    it("should return null when no data exists", async () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = await storage.get();
      expect(result).toBeNull();
    });

    it("should return parsed data when valid", async () => {
      const data = {
        data: { test: "value" },
        metadata: {
          version: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "any",
        },
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));

      const result = await storage.get();
      expect(result).toEqual({ test: "value" });
    });

    it("should handle JSON parse errors gracefully", async () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      await expect(storage.get()).rejects.toThrow();
    });
  });

  describe("set", () => {
    it("should store data with metadata", async () => {
      const data = { test: "value" };
      await storage.set(data);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        config.key,
        expect.stringContaining("test"),
      );
    });

    it("should create backup before writing when data exists", async () => {
      const existingData = JSON.stringify({
        data: { test: "old" },
        metadata: {
          version: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "abc123",
        },
      });
      localStorageMock.getItem.mockReturnValue(existingData);

      await storage.set({ test: "new" });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "__backup__test-storage",
        expect.any(String),
      );
    });

    it("should throw StorageError on quota exceeded", async () => {
      const quotaError = new Error("QuotaExceededError");
      quotaError.name = "QuotaExceededError";
      localStorageMock.setItem.mockImplementation(() => {
        throw quotaError;
      });

      let error: unknown;
      try {
        await storage.set({ test: "value" });
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(StorageError);
    });
  });

  describe("remove", () => {
    it("should remove item from storage", async () => {
      await storage.remove();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(config.key);
    });
  });

  describe("clear", () => {
    it("should clear all storage", async () => {
      await storage.clear();
      expect(localStorageMock.clear).toHaveBeenCalled();
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

    it("should track metrics", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await storage.get();
      const metrics = storage.getMetrics();

      expect(metrics.operationCount.read).toBe(1);
    });
  });

  describe("schema migration", () => {
    it("should handle legacy data without metadata", async () => {
      const legacyData = { data: { test: "legacy" }, metadata: null };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(legacyData));

      const result = await storage.get();
      expect(result).toEqual({ test: "legacy" });
    });

    it("should apply configured migrations", async () => {
      const migrationConfig: StorageConfig = {
        key: "migration-test",
        currentVersion: 2,
        migrations: [
          {
            fromVersion: 1,
            toVersion: 2,
            migrate: (data: unknown) => {
              const d = data as { oldField: string };
              return { newField: d.oldField };
            },
          },
        ],
      };

      const storageWithMigration = new StorageService<{
        newField: string;
      }>(migrationConfig);

      const v1Data = {
        data: { oldField: "value" },
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "abc",
        },
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(v1Data));

      const result = await storageWithMigration.get();
      expect(result).toEqual({ newField: "value" });
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
    const storage = manager.create({ key: "test", currentVersion: 1 });
    expect(storage).toBeInstanceOf(StorageService);
  });

  it("should prevent duplicate keys", () => {
    manager.create({ key: "test", currentVersion: 1 });
    expect(() => {
      manager.create({ key: "test", currentVersion: 1 });
    }).toThrow('Storage service for key "test" already exists');
  });

  it("should retrieve existing services", () => {
    const created = manager.create({ key: "test", currentVersion: 1 });
    const retrieved = manager.get("test");
    expect(retrieved).toBe(created);
  });

  it("should report health for all services", () => {
    manager.create({ key: "service1", currentVersion: 1 });
    manager.create({ key: "service2", currentVersion: 1 });

    const health = manager.getAllHealth();
    expect(health).toHaveProperty("service1");
    expect(health).toHaveProperty("service2");
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
      const result = await withStorageRecovery(
        async () => "success",
        "fallback",
      );
      expect(result).toBe("success");
    });

    it("should return fallback on failure", async () => {
      const result = await withStorageRecovery(async () => {
        throw new Error("fail");
      }, "fallback");
      expect(result).toBe("fallback");
    });
  });
});
