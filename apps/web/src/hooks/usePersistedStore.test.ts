/**
 * @fileoverview Tests for usePersistedStore module
 *
 * Tests cover the persistence utilities for Zustand stores:
 * - loadState from storage on initialization
 * - Saving state with createSaveTrigger
 * - Debounced saves
 * - Error handling for load/save failures
 * - Cancel and flush operations
 * - Reset (clear storage)
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createPersistedStore } from "./usePersistedStore";
import type { PersistedStoreConfig } from "./usePersistedStore";

// Mock the shared debounced saver but preserve other exports used by dependencies
vi.mock("@blueprint/shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@blueprint/shared")>();
  return {
    ...actual,
    createDebouncedSaver: vi.fn((fn: () => Promise<void>, _ms: number) => {
      // Return a simple debounced implementation for testing
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      return {
        debounced: vi.fn(() => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(fn, 0);
        }),
        cancel: vi.fn(() => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        }),
        flush: vi.fn(async () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
            await fn();
          }
        }),
      };
    }),
  };
});

describe("createPersistedStore", () => {
  interface TestData {
    name: string;
    count: number;
  }

  let mockStorage: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let config: PersistedStoreConfig<TestData>;
  let onLoadError: (error: unknown) => void;
  let onSaveError: (error: unknown) => void;

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    };
    onLoadError = vi.fn();
    onSaveError = vi.fn();
    config = {
      storage: mockStorage as unknown as PersistedStoreConfig<TestData>["storage"],
      debounceMs: 1000,
      onLoadError,
      onSaveError,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("loadState", () => {
    it("should load stored data and apply it to the store", async () => {
      const storedData: TestData = { name: "Stored Name", count: 42 };
      mockStorage.get.mockResolvedValue(storedData);

      const store = createPersistedStore<TestData>(config);
      const set = vi.fn();

      await store.loadState(set);

      expect(mockStorage.get).toHaveBeenCalledTimes(1);
      // loadState calls set with (updaterFn, replace=true)
      expect(set).toHaveBeenCalledWith(expect.any(Function), true);
    });

    it("should not update store when storage returns null", async () => {
      mockStorage.get.mockResolvedValue(null);

      const store = createPersistedStore<TestData>(config);
      const set = vi.fn();

      await store.loadState(set);

      expect(set).not.toHaveBeenCalled();
    });

    it("should handle storage errors gracefully", async () => {
      const error = new Error("Storage read failed");
      mockStorage.get.mockRejectedValue(error);

      const store = createPersistedStore<TestData>(config);
      const set = vi.fn();

      await store.loadState(set);

      // Should not throw, should call onLoadError
      expect(onLoadError).toHaveBeenCalledWith(error);
      expect(set).not.toHaveBeenCalled();
    });

    it("should handle errors without onLoadError callback", async () => {
      const configWithoutHandler: PersistedStoreConfig<TestData> = {
        storage: mockStorage as unknown as PersistedStoreConfig<TestData>["storage"],
        debounceMs: 1000,
      };
      mockStorage.get.mockRejectedValue(new Error("fail"));

      const store = createPersistedStore<TestData>(configWithoutHandler);
      const set = vi.fn();

      await expect(store.loadState(set)).resolves.toBeUndefined();
      expect(set).not.toHaveBeenCalled();
    });
  });

  describe("createSaveTrigger", () => {
    it("should create a debounced save trigger", () => {
      const store = createPersistedStore<TestData>(config);

      const get = () => ({ name: "Test", count: 1, extra: "ignored" });
      const getPersistedData = (state: { name: string; count: number }) => ({
        name: state.name,
        count: state.count,
      });

      const trigger = store.createSaveTrigger(get, getPersistedData);
      expect(typeof trigger).toBe("function");

      trigger();
      // Should have registered a debounced save
      expect(mockStorage.set).not.toHaveBeenCalled(); // Not yet (debounced)
    });

    it("should save persisted data when triggered and debounce elapses", async () => {
      mockStorage.set.mockResolvedValue(undefined);
      const store = createPersistedStore<TestData>(config);

      const state = { name: "Test", count: 42, extra: "ignored" };
      const get = () => state;
      const getPersistedData = (s: typeof state) => ({
        name: s.name,
        count: s.count,
      });

      const trigger = store.createSaveTrigger(get, getPersistedData);
      trigger();

      // Advance timers to trigger the debounced save
      await vi.advanceTimersByTimeAsync(0);

      expect(mockStorage.set).toHaveBeenCalledWith({ name: "Test", count: 42 });
    });

    it("should handle save errors gracefully", async () => {
      const error = new Error("Storage write failed");
      mockStorage.set.mockRejectedValue(error);

      const store = createPersistedStore<TestData>(config);

      const state = { name: "Test", count: 42, extra: "ignored" };
      const get = () => state;
      const getPersistedData = (s: typeof state) => ({
        name: s.name,
        count: s.count,
      });

      const trigger = store.createSaveTrigger(get, getPersistedData);
      trigger();

      await vi.advanceTimersByTimeAsync(0);

      expect(onSaveError).toHaveBeenCalledWith(error);
    });

    it("should handle save errors without onSaveError callback", async () => {
      const configWithoutHandler: PersistedStoreConfig<TestData> = {
        storage: mockStorage as unknown as PersistedStoreConfig<TestData>["storage"],
        debounceMs: 1000,
      };
      mockStorage.set.mockRejectedValue(new Error("fail"));

      const store = createPersistedStore<TestData>(configWithoutHandler);

      const state = { name: "Test", count: 42, extra: "ignored" };
      const get = () => state;
      const getPersistedData = (s: typeof state) => ({
        name: s.name,
        count: s.count,
      });

      const trigger = store.createSaveTrigger(get, getPersistedData);
      trigger();

      await vi.advanceTimersByTimeAsync(0);
      // Should not throw when save fails without callback
    });
  });

  describe("cancelSave", () => {
    it("should cancel pending save", async () => {
      const store = createPersistedStore<TestData>(config);

      const state = { name: "Test", count: 1, extra: "ignored" };
      const get = () => state;
      const getPersistedData = (s: typeof state) => ({
        name: s.name,
        count: s.count,
      });

      const trigger = store.createSaveTrigger(get, getPersistedData);
      trigger();

      store.cancelSave();

      // Advance timers - save should NOT have been called
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockStorage.set).not.toHaveBeenCalled();
    });

    it("should be safe to call when no save is pending", () => {
      const store = createPersistedStore<TestData>(config);
      expect(() => store.cancelSave()).not.toThrow();
    });
  });

  describe("flushSave", () => {
    it("should flush pending save immediately", async () => {
      mockStorage.set.mockResolvedValue(undefined);
      const store = createPersistedStore<TestData>(config);

      const state = { name: "Test", count: 1, extra: "ignored" };
      const get = () => state;
      const getPersistedData = (s: typeof state) => ({
        name: s.name,
        count: s.count,
      });

      const trigger = store.createSaveTrigger(get, getPersistedData);
      trigger();

      await store.flushSave();

      expect(mockStorage.set).toHaveBeenCalledWith({ name: "Test", count: 1 });
    });
  });

  describe("reset", () => {
    it("should clear storage and cancel pending saves", async () => {
      mockStorage.remove.mockResolvedValue(undefined);
      const store = createPersistedStore<TestData>(config);

      await store.reset();

      expect(mockStorage.remove).toHaveBeenCalledTimes(1);
    });

    it("should handle reset errors gracefully", async () => {
      const error = new Error("Remove failed");
      mockStorage.remove.mockRejectedValue(error);

      const store = createPersistedStore<TestData>(config);

      // Should not throw
      await expect(store.reset()).resolves.toBeUndefined();
    });

    it("should cancel pending saves on reset", async () => {
      mockStorage.remove.mockResolvedValue(undefined);
      const store = createPersistedStore<TestData>(config);

      const state = { name: "Test", count: 1, extra: "ignored" };
      const get = () => state;
      const getPersistedData = (s: typeof state) => ({
        name: s.name,
        count: s.count,
      });

      const trigger = store.createSaveTrigger(get, getPersistedData);
      trigger();

      // Reset should cancel the pending save
      await store.reset();

      await vi.advanceTimersByTimeAsync(1000);
      // Only remove should have been called, not set
      expect(mockStorage.remove).toHaveBeenCalledTimes(1);
      expect(mockStorage.set).not.toHaveBeenCalled();
    });
  });
});
