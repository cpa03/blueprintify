import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StorageManager, StorageError } from "../lib/storage";
import { createTestBlueprint } from "./factories";
import { STORAGE_KEY_PREFIXES } from "@blueprint/shared";

describe("Integration: Cross-Browser Storage Operations", () => {
  let manager: StorageManager;
  const localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new StorageManager();

    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);

    const mockLocalStorage = {
      getItem: vi.fn((key: string) => localStorageStore[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageStore[key];
      }),
      clear: vi.fn(() => {
        Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);
      }),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);
  });

  describe("Data Persistence Across Operations", () => {
    it("should persist data through multiple write operations", async () => {
      const storage = manager.create({
        key: "persist-test",
        currentVersion: 1,
      });

      const testData = createTestBlueprint();

      await storage.set({ step: 1, data: testData });
      await storage.set({ step: 2, data: testData });
      await storage.set({ step: 3, data: testData });

      const result = await storage.get();
      expect(result).toHaveProperty("step", 3);
      expect(result).toHaveProperty("data");
    });

    it("should handle concurrent read and write operations", async () => {
      const storage = manager.create({
        key: "concurrent-test",
        currentVersion: 1,
      });

      const operations = [
        storage.set({ value: 1 }),
        storage.set({ value: 2 }),
        storage.get(),
        storage.set({ value: 3 }),
        storage.get(),
      ];

      const results = await Promise.allSettled(operations);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      expect(fulfilled.length).toBeGreaterThan(0);
    });

    it("should maintain data integrity during rapid updates", async () => {
      const storage = manager.create({
        key: "integrity-test",
        currentVersion: 1,
      });

      const updates = Array.from({ length: 10 }, (_, i) => ({
        iteration: i,
        timestamp: Date.now(),
        data: `update-${i}`,
      }));

      for (const update of updates) {
        await storage.set(update);
      }

      const final = await storage.get();
      expect(final).toHaveProperty("iteration", 9);
    });
  });

  describe("Quota Management", () => {
    it("should track storage usage accurately", () => {
      const storage = manager.create({
        key: "quota-test",
        currentVersion: 1,
      });

      const health = storage.checkHealth();
      expect(health.quota).toHaveProperty("used");
      expect(health.quota).toHaveProperty("total");
      expect(health.quota).toHaveProperty("percentage");
      expect(typeof health.quota.percentage).toBe("number");
    });

    it("should handle storage quota exceeded gracefully", async () => {
      const storage = manager.create({
        key: "full-storage-test",
        currentVersion: 1,
      });

      const mockSetItem = vi.fn().mockImplementation(() => {
        const error = new Error("QuotaExceededError");
        error.name = "QuotaExceededError";
        throw error;
      });

      Object.defineProperty(window, "localStorage", {
        value: {
          ...window.localStorage,
          setItem: mockSetItem,
        },
        writable: true,
      });

      await expect(storage.set({ data: "test" })).rejects.toBeInstanceOf(StorageError);
    });
  });

  describe("Migration Scenarios", () => {
    it("should migrate data from old version to new version", async () => {
      const key = `migration-test-${Date.now()}`;

      const v1Data = {
        data: { name: "Old Project", version: 1 },
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "",
        },
      };
      localStorageStore[key] = JSON.stringify(v1Data);

      const storage = manager.create({
        key,
        currentVersion: 3,
        migrations: [
          {
            fromVersion: 1,
            toVersion: 2,
            migrate: (data: unknown) => {
              const old = data as { name: string; version: number };
              return { ...old, version: 2, migrated: true };
            },
          },
          {
            fromVersion: 2,
            toVersion: 3,
            migrate: (data: unknown) => {
              const old = data as { name: string; version: number };
              return { ...old, version: 3, finalMigration: true };
            },
          },
        ],
      });

      const result = await storage.get();
      expect(result).toHaveProperty("version", 3);
      expect(result).toHaveProperty("migrated", true);
      expect(result).toHaveProperty("finalMigration", true);
    });

    it("should handle failed migrations", async () => {
      const key = `failed-migration-${Date.now()}`;

      const v1Data = {
        data: { name: "Test" },
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "",
        },
      };
      localStorageStore[key] = JSON.stringify(v1Data);

      const storage = manager.create({
        key,
        currentVersion: 2,
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

      await expect(storage.get()).rejects.toBeInstanceOf(StorageError);
    });
  });

  describe("Backup and Recovery", () => {
    it("should create and restore from backup", async () => {
      const key = `backup-test-${Date.now()}`;

      const storage = manager.create({
        key,
        currentVersion: 1,
        enableBackup: true,
      });

      const testData = { project: "Test Project", version: 1 };
      await storage.set(testData);

      localStorageStore[key] = "corrupted data";

      const recovered = await storage.get();
      expect(recovered).toEqual(testData);
    });

    it("should maintain multiple backups", async () => {
      const key = `multi-backup-${Date.now()}`;

      const storage = manager.create({
        key,
        currentVersion: 1,
        enableBackup: true,
      });

      await storage.set({ version: 1 });
      await storage.set({ version: 2 });
      await storage.set({ version: 3 });

      const backupKey = `${STORAGE_KEY_PREFIXES.BACKUP}${key}`;
      const backupRaw = localStorageStore[backupKey];
      expect(backupRaw).toBeDefined();

      const backups = JSON.parse(backupRaw!);
      expect(backups.length).toBeGreaterThan(0);
    });
  });

  describe("Error Recovery", () => {
    it("should recover from corrupted data with backup", async () => {
      const key = `recovery-test-${Date.now()}`;

      const storage = manager.create({
        key,
        currentVersion: 1,
        enableBackup: true,
      });

      const goodData = { important: "data" };
      await storage.set(goodData);

      localStorageStore[key] = "{invalid json";

      const recovered = await storage.get();
      expect(recovered).toEqual(goodData);
    });

    it("should return null when no backup exists", async () => {
      const key = `no-backup-${Date.now()}`;

      const storage = manager.create({
        key,
        currentVersion: 1,
        enableBackup: true,
      });

      localStorageStore[key] = "{invalid";

      const result = await storage.get().catch(() => null);
      expect(result).toBeNull();
    });
  });

  describe("Browser Compatibility", () => {
    it("should handle browsers without localStorage", async () => {
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      const storage = manager.create({
        key: "no-storage-test",
        currentVersion: 1,
      });

      await expect(storage.set({ data: "test" })).rejects.toBeInstanceOf(StorageError);
    });

    it("should handle private browsing mode", async () => {
      const mockSetItem = vi.fn().mockImplementation(() => {
        const error = new Error("Private browsing mode");
        error.name = "QuotaExceededError";
        throw error;
      });

      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn(),
          setItem: mockSetItem,
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      const storage = manager.create({
        key: "private-mode-test",
        currentVersion: 1,
      });

      await expect(storage.set({ data: "test" })).rejects.toBeInstanceOf(StorageError);
    });
  });

  describe("Multi-Tab Synchronization", () => {
    it("should detect changes from other tabs", async () => {
      const key = `sync-test-${Date.now()}`;
      const storage = manager.create({
        key,
        currentVersion: 1,
      });

      await storage.set({ value: "original" });

      const updatedData = {
        data: { value: "from-other-tab" },
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: "",
        },
      };
      localStorageStore[key] = JSON.stringify(updatedData);

      const result = await storage.get();
      expect(result).toEqual({ value: "from-other-tab" });
    });
  });
});
