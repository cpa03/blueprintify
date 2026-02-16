import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StorageManager } from "../lib/storage";
import { createTestBlueprint, createLargeBlueprint } from "./factories";

async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

describe("Performance Benchmarks: Storage Operations", () => {
  let manager: StorageManager;
  const localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new StorageManager();

    Object.keys(localStorageStore).forEach(
      (key) => delete localStorageStore[key],
    );

    const mockLocalStorage = {
      getItem: vi.fn((key: string) => localStorageStore[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageStore[key];
      }),
      clear: vi.fn(() => {
        Object.keys(localStorageStore).forEach(
          (key) => delete localStorageStore[key],
        );
      }),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.keys(localStorageStore).forEach(
      (key) => delete localStorageStore[key],
    );
  });

  describe("Read Operations", () => {
    it("should read small data under 10ms", async () => {
      const storage = manager.create({
        key: "perf-read-small",
        currentVersion: 1,
      });

      const testData = { value: "test" };
      await storage.set(testData);

      const { duration } = await measureAsync("read", () => storage.get());

      expect(duration).toBeLessThan(10);
    });

    it("should read blueprint data under 20ms", async () => {
      const storage = manager.create({
        key: "perf-read-blueprint",
        currentVersion: 1,
      });

      const testData = createTestBlueprint();
      await storage.set(testData);

      const { duration } = await measureAsync("read", () => storage.get());

      expect(duration).toBeLessThan(20);
    });

    it("should read large data under 50ms", async () => {
      const storage = manager.create({
        key: "perf-read-large",
        currentVersion: 1,
      });

      const largeData = createLargeBlueprint(100);
      await storage.set(largeData);

      const { duration } = await measureAsync("read", () => storage.get());

      expect(duration).toBeLessThan(50);
    });
  });

  describe("Write Operations", () => {
    it("should write small data under 10ms", async () => {
      const storage = manager.create({
        key: "perf-write-small",
        currentVersion: 1,
      });

      const { duration } = await measureAsync("write", () =>
        storage.set({ value: "test" }),
      );

      expect(duration).toBeLessThan(10);
    });

    it("should write blueprint data under 30ms", async () => {
      const storage = manager.create({
        key: "perf-write-blueprint",
        currentVersion: 1,
      });

      const testData = createTestBlueprint();
      const { duration } = await measureAsync("write", () =>
        storage.set(testData),
      );

      expect(duration).toBeLessThan(30);
    });

    it("should write large data under 100ms", async () => {
      const storage = manager.create({
        key: "perf-write-large",
        currentVersion: 1,
      });

      const largeData = createLargeBlueprint(100);
      const { duration } = await measureAsync("write", () =>
        storage.set(largeData),
      );

      expect(duration).toBeLessThan(100);
    });
  });

  describe("Update Operations", () => {
    it("should update existing data under 20ms", async () => {
      const storage = manager.create({
        key: "perf-update",
        currentVersion: 1,
      });

      const initialData = createTestBlueprint();
      await storage.set(initialData);

      const { duration } = await measureAsync("update", () =>
        storage.set({ ...initialData, projectName: "Updated" }),
      );

      expect(duration).toBeLessThan(20);
    });

    it("should handle rapid sequential writes efficiently", async () => {
      const storage = manager.create({
        key: "perf-rapid-writes",
        currentVersion: 1,
      });

      const iterations = 10;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        await storage.set({ iteration: i, timestamp: Date.now() });
      }

      const totalDuration = performance.now() - startTime;
      const averageDuration = totalDuration / iterations;

      expect(averageDuration).toBeLessThan(15);
    });
  });

  describe("Quota Check Performance", () => {
    it("should check quota under 5ms", async () => {
      const storage = manager.create({
        key: "perf-quota",
        currentVersion: 1,
      });

      await storage.set(createTestBlueprint());

      const { duration } = await measureAsync("quota", () =>
        Promise.resolve(storage.checkHealth()),
      );

      expect(duration).toBeLessThan(5);
    });

    it("should calculate storage size under 10ms for large data", async () => {
      const storage = manager.create({
        key: "perf-quota-large",
        currentVersion: 1,
      });

      await storage.set(createLargeBlueprint(500));

      const { duration } = await measureAsync("quota", () =>
        Promise.resolve(storage.checkHealth()),
      );

      expect(duration).toBeLessThan(10);
    });
  });

  describe("Migration Performance", () => {
    it("should migrate small data under 30ms", async () => {
      const key = "perf-migrate-small";
      const v1Data = {
        data: { name: "Test", version: 1 },
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
            migrate: (data: unknown) => {
              const old = data as { name: string; version: number };
              return { ...old, version: 2, migrated: true };
            },
          },
        ],
      });

      const { duration } = await measureAsync("migrate", () => storage.get());

      expect(duration).toBeLessThan(30);
    });

    it("should migrate blueprint data under 50ms", async () => {
      const key = "perf-migrate-blueprint";
      const testData = createTestBlueprint();
      const v1Data = {
        data: testData,
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
            migrate: (data: unknown) => {
              return { ...(data as object), version: 2 };
            },
          },
        ],
      });

      const { duration } = await measureAsync("migrate", () => storage.get());

      expect(duration).toBeLessThan(50);
    });
  });

  describe("Backup Operations", () => {
    it("should create backup under 30ms", async () => {
      const storage = manager.create({
        key: "perf-backup",
        currentVersion: 1,
        enableBackup: true,
      });

      const testData = createTestBlueprint();
      const { duration } = await measureAsync("backup", () =>
        storage.set(testData),
      );

      expect(duration).toBeLessThan(30);
    });

    it("should recover from backup under 40ms", async () => {
      const key = "perf-recovery";
      const storage = manager.create({
        key,
        currentVersion: 1,
        enableBackup: true,
      });

      const testData = createTestBlueprint();
      await storage.set(testData);

      localStorageStore[key] = "{corrupted";

      const { duration } = await measureAsync("recovery", () =>
        storage.get().catch(() => null),
      );

      expect(duration).toBeLessThan(40);
    });
  });

  describe("End-to-End Session Performance", () => {
    it("should complete full session lifecycle under 200ms", async () => {
      const storage = manager.create({
        key: "perf-session-lifecycle",
        currentVersion: 1,
      });

      const testData = createTestBlueprint();
      const startTime = performance.now();

      await storage.set({ step: 1, data: testData });
      await storage.set({ step: 2, data: testData });
      await storage.get();
      await storage.set({ step: 3, data: testData });

      const totalDuration = performance.now() - startTime;
      expect(totalDuration).toBeLessThan(200);
    });

    it("should handle 100 operations under 1000ms", async () => {
      const storage = manager.create({
        key: "perf-stress-test",
        currentVersion: 1,
      });

      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        await storage.set({ iteration: i, data: "test" });
      }

      const totalDuration = performance.now() - startTime;
      const averageDuration = totalDuration / 100;

      expect(totalDuration).toBeLessThan(1000);
      expect(averageDuration).toBeLessThan(10);
    });
  });
});
