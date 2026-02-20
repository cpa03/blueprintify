import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createTypedStorage,
  checkStorageHealth,
  getStorageMetrics,
  clearAllStorage,
} from "./storageAdapter";
import type { StorageService, StorageHealth, StorageMetrics } from "./storage";

vi.mock("./storage", () => ({
  StorageService: vi.fn(),
  wizardStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    checkHealth: vi.fn(),
    getHealth: vi.fn(),
    getMetrics: vi.fn(),
  },
  editorStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    checkHealth: vi.fn(),
    getHealth: vi.fn(),
    getMetrics: vi.fn(),
  },
  getStorageErrorMessage: vi.fn((error) => String(error)),
  withStorageRecovery: vi.fn(async (fn) => fn()),
}));

import {
  wizardStorage,
  editorStorage,
  getStorageErrorMessage,
  withStorageRecovery,
} from "./storage";

describe("storageAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createTypedStorage", () => {
    it("should create a storage adapter with getItem, setItem, and removeItem", () => {
      const mockStorageService = {
        get: vi.fn().mockResolvedValue({ data: "test" }),
        set: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockResolvedValue(undefined),
      } as unknown as StorageService<unknown>;

      const adapter = createTypedStorage(mockStorageService);

      expect(adapter).toHaveProperty("getItem");
      expect(adapter).toHaveProperty("setItem");
      expect(adapter).toHaveProperty("removeItem");
    });

    describe("getItem", () => {
      it("should return data from storage service", async () => {
        const testData = { name: "test", value: 123 };
        const mockStorageService = {
          get: vi.fn().mockResolvedValue(testData),
        } as unknown as StorageService<typeof testData>;

        const adapter = createTypedStorage(mockStorageService);
        const result = await adapter.getItem("test-key");

        expect(mockStorageService.get).toHaveBeenCalled();
        expect(result).toEqual(testData);
      });

      it("should return null when storage throws an error", async () => {
        const mockStorageService = {
          get: vi.fn().mockRejectedValue(new Error("Storage error")),
        } as unknown as StorageService<unknown>;

        const adapter = createTypedStorage(mockStorageService);
        const result = await adapter.getItem("test-key");

        expect(result).toBeNull();
      });

      it("should log error when storage fails", async () => {
        const consoleErrorSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const mockStorageService = {
          get: vi.fn().mockRejectedValue(new Error("Storage error")),
        } as unknown as StorageService<unknown>;

        const adapter = createTypedStorage(mockStorageService);
        await adapter.getItem("test-key");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Storage getItem failed:",
          "Error: Storage error",
        );
        consoleErrorSpy.mockRestore();
      });
    });

    describe("setItem", () => {
      it("should call storage service set with value", async () => {
        const testData = { name: "test", value: 123 };
        const mockStorageService = {
          set: vi.fn().mockResolvedValue(undefined),
        } as unknown as StorageService<typeof testData>;

        const adapter = createTypedStorage(mockStorageService);
        await adapter.setItem("test-key", testData);

        expect(mockStorageService.set).toHaveBeenCalledWith(testData);
      });

      it("should throw error when storage set fails", async () => {
        const testData = { name: "test" };
        const error = new Error("Quota exceeded");
        const mockStorageService = {
          set: vi.fn().mockRejectedValue(error),
        } as unknown as StorageService<typeof testData>;

        const adapter = createTypedStorage(mockStorageService);

        await expect(adapter.setItem("test-key", testData)).rejects.toThrow(
          "Quota exceeded",
        );
      });
    });

    describe("removeItem", () => {
      it("should call storage service remove", async () => {
        const mockStorageService = {
          remove: vi.fn().mockResolvedValue(undefined),
        } as unknown as StorageService<unknown>;

        const adapter = createTypedStorage(mockStorageService);
        await adapter.removeItem("test-key");

        expect(mockStorageService.remove).toHaveBeenCalled();
      });

      it("should throw error when storage remove fails", async () => {
        const error = new Error("Remove failed");
        const mockStorageService = {
          remove: vi.fn().mockRejectedValue(error),
        } as unknown as StorageService<unknown>;

        const adapter = createTypedStorage(mockStorageService);

        await expect(adapter.removeItem("test-key")).rejects.toThrow(
          "Remove failed",
        );
      });
    });
  });

  describe("checkStorageHealth", () => {
    it("should return healthy status when both storages are healthy", async () => {
      const healthyStatus: StorageHealth = {
        isHealthy: true,
        quota: { used: 100, total: 1000, remaining: 900, percentage: 10 },
        operations: { total: 10, successful: 10, failed: 0 },
        lastCheck: new Date(),
      };

      vi.mocked(wizardStorage.checkHealth).mockReturnValue(healthyStatus);
      vi.mocked(editorStorage.checkHealth).mockReturnValue(healthyStatus);

      const result = await checkStorageHealth();

      expect(result.isHealthy).toBe(true);
      expect(result.wizard.isHealthy).toBe(true);
      expect(result.editor.isHealthy).toBe(true);
    });

    it("should return unhealthy when wizard storage is unhealthy", async () => {
      const unhealthyStatus: StorageHealth = {
        isHealthy: false,
        quota: { used: 100, total: 1000, remaining: 900, percentage: 10 },
        operations: { total: 10, successful: 8, failed: 2 },
        lastCheck: new Date(),
      };
      const healthyStatus: StorageHealth = {
        isHealthy: true,
        quota: { used: 100, total: 1000, remaining: 900, percentage: 10 },
        operations: { total: 10, successful: 10, failed: 0 },
        lastCheck: new Date(),
      };

      vi.mocked(wizardStorage.checkHealth).mockReturnValue(unhealthyStatus);
      vi.mocked(editorStorage.checkHealth).mockReturnValue(healthyStatus);

      const result = await checkStorageHealth();

      expect(result.isHealthy).toBe(false);
    });

    it("should return unhealthy when editor storage is unhealthy", async () => {
      const healthyStatus: StorageHealth = {
        isHealthy: true,
        quota: { used: 100, total: 1000, remaining: 900, percentage: 10 },
        operations: { total: 10, successful: 10, failed: 0 },
        lastCheck: new Date(),
      };
      const unhealthyStatus: StorageHealth = {
        isHealthy: false,
        quota: { used: 100, total: 1000, remaining: 900, percentage: 10 },
        operations: { total: 10, successful: 8, failed: 2 },
        lastCheck: new Date(),
      };

      vi.mocked(wizardStorage.checkHealth).mockReturnValue(healthyStatus);
      vi.mocked(editorStorage.checkHealth).mockReturnValue(unhealthyStatus);

      const result = await checkStorageHealth();

      expect(result.isHealthy).toBe(false);
    });
  });

  describe("getStorageMetrics", () => {
    it("should return metrics for both storages", () => {
      const mockMetrics: StorageMetrics = {
        readLatency: [10, 20, 15],
        writeLatency: [30, 25],
        errorCount: 0,
        operationCount: { read: 3, write: 2, delete: 1, clear: 0 },
      };

      vi.mocked(wizardStorage.getMetrics).mockReturnValue(mockMetrics);
      vi.mocked(editorStorage.getMetrics).mockReturnValue(mockMetrics);

      const result = getStorageMetrics();

      expect(result.wizard).toEqual(mockMetrics);
      expect(result.editor).toEqual(mockMetrics);
      expect(wizardStorage.getMetrics).toHaveBeenCalled();
      expect(editorStorage.getMetrics).toHaveBeenCalled();
    });

    it("should return different metrics for each storage", () => {
      const wizardMetrics: StorageMetrics = {
        readLatency: [10],
        writeLatency: [20],
        errorCount: 0,
        operationCount: { read: 1, write: 1, delete: 0, clear: 0 },
      };
      const editorMetrics: StorageMetrics = {
        readLatency: [5, 8],
        writeLatency: [15, 18],
        errorCount: 1,
        operationCount: { read: 2, write: 2, delete: 1, clear: 0 },
      };

      vi.mocked(wizardStorage.getMetrics).mockReturnValue(wizardMetrics);
      vi.mocked(editorStorage.getMetrics).mockReturnValue(editorMetrics);

      const result = getStorageMetrics();

      expect(result.wizard).toEqual(wizardMetrics);
      expect(result.editor).toEqual(editorMetrics);
    });
  });

  describe("clearAllStorage", () => {
    it("should clear both storages successfully", async () => {
      vi.mocked(wizardStorage.remove).mockResolvedValue(undefined);
      vi.mocked(editorStorage.remove).mockResolvedValue(undefined);

      const result = await clearAllStorage();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(wizardStorage.remove).toHaveBeenCalled();
      expect(editorStorage.remove).toHaveBeenCalled();
    });

    it("should return error when wizard storage clear fails", async () => {
      vi.mocked(wizardStorage.remove).mockRejectedValue(
        new Error("Wizard clear failed"),
      );
      vi.mocked(editorStorage.remove).mockResolvedValue(undefined);
      vi.mocked(getStorageErrorMessage).mockReturnValue("Wizard clear failed");

      const result = await clearAllStorage();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wizard clear failed");
    });

    it("should return error when editor storage clear fails", async () => {
      vi.mocked(wizardStorage.remove).mockResolvedValue(undefined);
      vi.mocked(editorStorage.remove).mockRejectedValue(
        new Error("Editor clear failed"),
      );
      vi.mocked(getStorageErrorMessage).mockReturnValue("Editor clear failed");

      const result = await clearAllStorage();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Editor clear failed");
    });

    it("should use withStorageRecovery for removal", async () => {
      vi.mocked(wizardStorage.remove).mockResolvedValue(undefined);
      vi.mocked(editorStorage.remove).mockResolvedValue(undefined);

      await clearAllStorage();

      expect(withStorageRecovery).toHaveBeenCalledTimes(2);
    });
  });
});
