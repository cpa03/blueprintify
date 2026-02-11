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
  });

  describe("set", () => {
    it("should store data successfully", async () => {
      const data = { test: "stored-value" };
      await expect(storage.set(data)).resolves.not.toThrow();
    });

    it("should throw StorageError on circular data", async () => {
      const circularData: Record<string, unknown> = { test: "value" };
      circularData.self = circularData;

      await expect(
        storage.set(circularData as { test: string }),
      ).rejects.toBeInstanceOf(StorageError);
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
