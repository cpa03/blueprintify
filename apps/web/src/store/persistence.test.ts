import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  createPersistedStore,
  type PersistedStorage,
  type CreatePersistedStoreOptions,
} from "./persistence";

// Test type definitions
interface TestPersistData {
  name: string;
  count: number;
}

interface TestStoreState {
  name: string;
  count: number;
  other: string;
}

// Mock storage adapter
function createMockStorage(): {
  storage: PersistedStorage<TestPersistData>;
  getFn: ReturnType<typeof vi.fn>;
  setFn: ReturnType<typeof vi.fn>;
} {
  const getFn = vi.fn();
  const setFn = vi.fn();

  const storage: PersistedStorage<TestPersistData> = {
    get: getFn,
    set: setFn,
  };

  return { storage, getFn, setFn };
}

// Create test options
function createTestOptions(storage: PersistedStorage<TestPersistData>) {
  const options: CreatePersistedStoreOptions<TestPersistData, TestStoreState> = {
    storage,
    debounceDelay: 100,
    getPersistData: (state: TestStoreState) => ({
      name: state.name,
      count: state.count,
    }),
  };
  return options;
}

describe("createPersistedStore", () => {
  describe("loadState", () => {
    it("loads state from storage and calls set with data", async () => {
      const { storage, getFn } = createMockStorage();
      const storedData: TestPersistData = { name: "Test", count: 42 };
      getFn.mockResolvedValue(storedData);

      const options = createTestOptions(storage);
      const { loadState } = createPersistedStore(options);

      const mockSet = vi.fn();
      await loadState(mockSet);

      expect(getFn).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(storedData as Partial<TestStoreState>, true);
    });

    it("does not call set when storage returns null", async () => {
      const { storage, getFn } = createMockStorage();
      getFn.mockResolvedValue(null);

      const options = createTestOptions(storage);
      const { loadState } = createPersistedStore(options);

      const mockSet = vi.fn();
      await loadState(mockSet);

      expect(getFn).toHaveBeenCalled();
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("handles storage errors gracefully", async () => {
      const { storage, getFn } = createMockStorage();
      getFn.mockRejectedValue(new Error("Storage error"));

      const options = createTestOptions(storage);
      const { loadState } = createPersistedStore(options);

      const mockSet = vi.fn();
      await loadState(mockSet);

      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  describe("saveState", () => {
    it("saves data to storage using getPersistData", async () => {
      const { storage, setFn } = createMockStorage();

      const options = createTestOptions(storage);
      const { saveState } = createPersistedStore(options);

      const mockGet = vi.fn<() => TestStoreState>(() => ({
        name: "Saved Name",
        count: 10,
        other: "should not be saved",
      }));

      await saveState(mockGet);

      expect(setFn).toHaveBeenCalledWith({ name: "Saved Name", count: 10 });
    });

    it("handles storage errors gracefully", async () => {
      const { storage, setFn } = createMockStorage();
      setFn.mockRejectedValue(new Error("Storage error"));

      const options = createTestOptions(storage);
      const { saveState } = createPersistedStore(options);

      const mockGet = vi.fn<() => TestStoreState>(() => ({
        name: "Test",
        count: 1,
        other: "",
      }));

      await saveState(mockGet);
    });
  });

  describe("debouncedSave", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("delays save by debounceDelay", async () => {
      const { storage, setFn } = createMockStorage();

      const options = createTestOptions(storage);
      const { debouncedSave } = createPersistedStore(options);

      const mockGet = vi.fn<() => TestStoreState>(() => ({
        name: "Debounced",
        count: 5,
        other: "",
      }));

      debouncedSave(mockGet);
      expect(setFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(setFn).toHaveBeenCalledWith({ name: "Debounced", count: 5 });
    });

    it("clears previous timeout when called again", async () => {
      const { storage, setFn } = createMockStorage();

      const options = createTestOptions(storage);
      const { debouncedSave } = createPersistedStore(options);

      const mockGet1 = vi.fn<() => TestStoreState>(() => ({
        name: "First",
        count: 1,
        other: "",
      }));

      debouncedSave(mockGet1);

      const mockGet2 = vi.fn<() => TestStoreState>(() => ({
        name: "Second",
        count: 2,
        other: "",
      }));
      debouncedSave(mockGet2);

      vi.advanceTimersByTime(200);

      expect(setFn).toHaveBeenCalledTimes(1);
      expect(setFn).toHaveBeenCalledWith({ name: "Second", count: 2 });
    });
  });

  describe("flushSave", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("clears pending debounced save", () => {
      const { storage, setFn } = createMockStorage();

      const options = createTestOptions(storage);
      const { debouncedSave, flushSave } = createPersistedStore(options);

      const mockGet = vi.fn<() => TestStoreState>(() => ({
        name: "Flush Test",
        count: 99,
        other: "",
      }));

      debouncedSave(mockGet);
      expect(setFn).not.toHaveBeenCalled();

      flushSave();

      vi.advanceTimersByTime(200);

      expect(setFn).not.toHaveBeenCalled();
    });
  });

  describe("cancelSave", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("clears pending debounced save", () => {
      const { storage, setFn } = createMockStorage();

      const options = createTestOptions(storage);
      const { debouncedSave, cancelSave } = createPersistedStore(options);

      const mockGet = vi.fn<() => TestStoreState>(() => ({
        name: "Cancel Test",
        count: 50,
        other: "",
      }));

      debouncedSave(mockGet);
      cancelSave();

      vi.advanceTimersByTime(200);

      expect(setFn).not.toHaveBeenCalled();
    });
  });

  describe("full integration", () => {
    it("works through complete load-save cycle", async () => {
      const { storage, getFn, setFn } = createMockStorage();

      getFn.mockResolvedValue({ name: "Initial", count: 0 });

      const options = createTestOptions(storage);
      const { loadState, saveState } = createPersistedStore(options);

      let currentState: Partial<TestStoreState> = {};
      const mockSet = vi.fn((partial: unknown) => {
        currentState = { ...currentState, ...(partial as Partial<TestStoreState>) };
      });

      await loadState(mockSet);
      expect(currentState.name).toBe("Initial");

      const mockGet = vi.fn<() => TestStoreState>(() => ({
        name: "Modified",
        count: 1,
        other: "extra",
      }));
      await saveState(mockGet);

      expect(setFn).toHaveBeenCalledWith({ name: "Modified", count: 1 });
    });
  });
});
