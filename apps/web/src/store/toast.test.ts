import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TOAST_TYPES } from "@blueprint/shared";
import { useToastStore, useToast } from "./toast";

// Mock constants
vi.mock("../config/constants", () => ({
  TOAST_CONFIG: {
    DEFAULT_DURATION: 5000,
  },
}));

// Mock shared config — derive TOAST_TYPES from actual to eliminate hardcoded duplicates
vi.mock("@blueprint/shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@blueprint/shared")>();
  return {
    ...actual,
    ID_GENERATION_CONFIG: {
      RANDOM_STRING_START_INDEX: 2,
      RANDOM_STRING_LENGTH: 9,
      ALPHANUMERIC_RADIX: 36,
    },
  };
});

// Mock setTimeout and clearTimeout globally
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;

describe("toast store", () => {
  let timers: ReturnType<typeof setTimeout>[] = [];

  beforeEach(() => {
    // Clear all toasts before each test
    useToastStore.getState().clearAll();
    timers = [];

    // Mock setTimeout to track timers without actually executing them
    vi.spyOn(global, "setTimeout").mockImplementation(((callback: TimerHandler, delay?: number) => {
      const timer = originalSetTimeout(callback as never, delay);
      timers.push(timer);
      return timer;
    }) as unknown as typeof setTimeout);
    vi.spyOn(global, "clearTimeout").mockImplementation(((timer: TimerHandler) => {
      originalClearTimeout(timer as unknown as ReturnType<typeof setTimeout>);
    }) as unknown as typeof clearTimeout);
  });

  afterEach(() => {
    // Clear all timers after each test
    timers.forEach((timer) => clearTimeout(timer));
    timers = [];
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("should have empty toasts array", () => {
      const state = useToastStore.getState();
      expect(state.toasts).toEqual([]);
    });
  });

  describe("addToast", () => {
    it("should add a success toast", () => {
      const { addToast } = useToastStore.getState();

      addToast("Operation successful", TOAST_TYPES.SUCCESS);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]?.message).toBe("Operation successful");
      expect(state.toasts[0]?.type).toBe(TOAST_TYPES.SUCCESS);
    });

    it("should add an error toast", () => {
      const { addToast } = useToastStore.getState();

      addToast("Something went wrong", TOAST_TYPES.ERROR);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]?.type).toBe(TOAST_TYPES.ERROR);
    });

    it("should add a warning toast", () => {
      const { addToast } = useToastStore.getState();

      addToast("Warning message", TOAST_TYPES.WARNING);

      const state = useToastStore.getState();
      expect(state.toasts[0]?.type).toBe(TOAST_TYPES.WARNING);
    });

    it("should add an info toast", () => {
      const { addToast } = useToastStore.getState();

      addToast("Info message", TOAST_TYPES.INFO);

      const state = useToastStore.getState();
      expect(state.toasts[0]?.type).toBe(TOAST_TYPES.INFO);
    });

    it("should accept custom duration", () => {
      const { addToast } = useToastStore.getState();

      addToast("Custom duration", TOAST_TYPES.SUCCESS, 10000);

      const state = useToastStore.getState();
      expect(state.toasts[0]?.duration).toBe(10000);
    });

    it("should use default duration when not provided", () => {
      const { addToast } = useToastStore.getState();

      addToast("Default duration", TOAST_TYPES.SUCCESS);

      const state = useToastStore.getState();
      expect(state.toasts[0]?.duration).toBe(5000); // TOAST_CONFIG.DEFAULT_DURATION
    });

    it("should generate unique IDs for each toast", () => {
      const { addToast } = useToastStore.getState();

      addToast("First toast", TOAST_TYPES.SUCCESS);
      addToast("Second toast", TOAST_TYPES.ERROR);

      const state = useToastStore.getState();
      expect(state.toasts[0]?.id).not.toBe(state.toasts[1]?.id);
    });

    it("should add multiple toasts", () => {
      const { addToast } = useToastStore.getState();

      addToast("First", TOAST_TYPES.SUCCESS);
      addToast("Second", TOAST_TYPES.ERROR);
      addToast("Third", TOAST_TYPES.INFO);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(3);
    });
  });

  describe("removeToast", () => {
    it("should remove a specific toast by ID", () => {
      const { addToast, removeToast } = useToastStore.getState();

      addToast("Toast to remove", TOAST_TYPES.SUCCESS);
      const toastId = useToastStore.getState().toasts[0]?.id;
      if (toastId) {
        removeToast(toastId);
      }

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(0);
    });

    it("should not affect other toasts when removing one", () => {
      const { addToast, removeToast } = useToastStore.getState();

      addToast("First", TOAST_TYPES.SUCCESS);
      addToast("Second", TOAST_TYPES.ERROR);
      const firstId = useToastStore.getState().toasts[0]?.id;
      if (firstId) {
        removeToast(firstId);
      }

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]?.message).toBe("Second");
    });

    it("should handle removing non-existent toast gracefully", () => {
      const { removeToast } = useToastStore.getState();

      // Should not throw
      expect(() => removeToast("non-existent-id")).not.toThrow();
    });
  });

  describe("clearAll", () => {
    it("should remove all toasts", () => {
      const { addToast, clearAll } = useToastStore.getState();

      addToast("First", TOAST_TYPES.SUCCESS);
      addToast("Second", TOAST_TYPES.ERROR);
      addToast("Third", TOAST_TYPES.INFO);

      clearAll();

      const state = useToastStore.getState();
      expect(state.toasts).toEqual([]);
    });

    it("should handle clearing when no toasts exist", () => {
      const { clearAll } = useToastStore.getState();

      expect(() => clearAll()).not.toThrow();
    });
  });
});

describe("useToast hook exports", () => {
  // Note: React hooks cannot be tested outside of React component context.
  // The useToast() hook internally uses Zustand which requires React context.
  // These tests verify the hook is properly exported and the underlying store works.

  let timers: ReturnType<typeof setTimeout>[] = [];

  beforeEach(() => {
    useToastStore.getState().clearAll();
    timers = [];
    vi.spyOn(global, "setTimeout").mockImplementation(((callback: TimerHandler, delay?: number) => {
      const timer = originalSetTimeout(callback as never, delay);
      timers.push(timer);
      return timer;
    }) as unknown as typeof setTimeout);
    vi.spyOn(global, "clearTimeout").mockImplementation(((timer: TimerHandler) => {
      originalClearTimeout(timer as unknown as ReturnType<typeof setTimeout>);
    }) as unknown as typeof clearTimeout);
  });

  afterEach(() => {
    timers.forEach((timer) => clearTimeout(timer));
    timers = [];
    vi.restoreAllMocks();
  });

  it("hook should exist and be exported as function", () => {
    expect(typeof useToast).toBe("function");
  });

  it("store addToast should work for success type (used by hook)", () => {
    const { addToast } = useToastStore.getState();
    addToast("Success message", TOAST_TYPES.SUCCESS);

    const state = useToastStore.getState();
    expect(state.toasts[0]?.type).toBe(TOAST_TYPES.SUCCESS);
    expect(state.toasts[0]?.message).toBe("Success message");
  });

  it("store addToast should work for error type (used by hook)", () => {
    const { addToast } = useToastStore.getState();
    addToast("Error message", TOAST_TYPES.ERROR);

    const state = useToastStore.getState();
    expect(state.toasts[0]?.type).toBe(TOAST_TYPES.ERROR);
  });

  it("store addToast should work for warning type (used by hook)", () => {
    const { addToast } = useToastStore.getState();
    addToast("Warning message", TOAST_TYPES.WARNING);

    const state = useToastStore.getState();
    expect(state.toasts[0]?.type).toBe(TOAST_TYPES.WARNING);
  });

  it("store addToast should work for info type (used by hook)", () => {
    const { addToast } = useToastStore.getState();
    addToast("Info message", TOAST_TYPES.INFO);

    const state = useToastStore.getState();
    expect(state.toasts[0]?.type).toBe(TOAST_TYPES.INFO);
  });

  it("store addToast should support custom duration (used by hook)", () => {
    const { addToast } = useToastStore.getState();
    addToast("Custom duration", TOAST_TYPES.SUCCESS, 2000);

    const state = useToastStore.getState();
    expect(state.toasts[0]?.duration).toBe(2000);
  });
});
