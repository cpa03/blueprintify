import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useToastStore, useToast, type Toast, type ToastType } from "./toast";

// Mock constants
vi.mock("../config/constants", () => ({
  TOAST_CONFIG: {
    DEFAULT_DURATION: 5000,
  },
}));

// Mock ID generation config
vi.mock("@blueprint/shared", () => ({
  ID_GENERATION_CONFIG: {
    RANDOM_STRING_START_INDEX: 2,
    RANDOM_STRING_LENGTH: 9,
    ALPHANUMERIC_RADIX: 36,
  },
}));

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
    vi.spyOn(global, "setTimeout").mockImplementation((callback: TimerHandler, delay?: number) => {
      const timer = originalSetTimeout(callback, delay);
      timers.push(timer);
      return timer;
    });

    vi.spyOn(global, "clearTimeout").mockImplementation((timer: TimerHandler) => {
      originalClearTimeout(timer as NodeJS.Timeout);
    });
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

      addToast("Operation successful", "success");

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe("Operation successful");
      expect(state.toasts[0].type).toBe("success");
    });

    it("should add an error toast", () => {
      const { addToast } = useToastStore.getState();

      addToast("Something went wrong", "error");

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].type).toBe("error");
    });

    it("should add a warning toast", () => {
      const { addToast } = useToastStore.getState();

      addToast("Warning message", "warning");

      const state = useToastStore.getState();
      expect(state.toasts[0].type).toBe("warning");
    });

    it("should add an info toast", () => {
      const { addToast } = useToastStore.getState();

      addToast("Info message", "info");

      const state = useToastStore.getState();
      expect(state.toasts[0].type).toBe("info");
    });

    it("should accept custom duration", () => {
      const { addToast } = useToastStore.getState();

      addToast("Custom duration", "success", 10000);

      const state = useToastStore.getState();
      expect(state.toasts[0].duration).toBe(10000);
    });

    it("should use default duration when not provided", () => {
      const { addToast } = useToastStore.getState();

      addToast("Default duration", "success");

      const state = useToastStore.getState();
      expect(state.toasts[0].duration).toBe(5000); // TOAST_CONFIG.DEFAULT_DURATION
    });

    it("should generate unique IDs for each toast", () => {
      const { addToast } = useToastStore.getState();

      addToast("First toast", "success");
      addToast("Second toast", "error");

      const state = useToastStore.getState();
      expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
    });

    it("should add multiple toasts", () => {
      const { addToast } = useToastStore.getState();

      addToast("First", "success");
      addToast("Second", "error");
      addToast("Third", "info");

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(3);
    });
  });

  describe("removeToast", () => {
    it("should remove a specific toast by ID", () => {
      const { addToast, removeToast } = useToastStore.getState();

      addToast("Toast to remove", "success");
      const toastId = useToastStore.getState().toasts[0].id;
      removeToast(toastId);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(0);
    });

    it("should not affect other toasts when removing one", () => {
      const { addToast, removeToast } = useToastStore.getState();

      addToast("First", "success");
      addToast("Second", "error");
      const firstId = useToastStore.getState().toasts[0].id;
      removeToast(firstId);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe("Second");
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

      addToast("First", "success");
      addToast("Second", "error");
      addToast("Third", "info");

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

    vi.spyOn(global, "setTimeout").mockImplementation((callback: TimerHandler, delay?: number) => {
      const timer = originalSetTimeout(callback, delay);
      timers.push(timer);
      return timer;
    });

    vi.spyOn(global, "clearTimeout").mockImplementation((timer: TimerHandler) => {
      originalClearTimeout(timer as NodeJS.Timeout);
    });
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
    addToast("Success message", "success");

    const state = useToastStore.getState();
    expect(state.toasts[0].type).toBe("success");
    expect(state.toasts[0].message).toBe("Success message");
  });

  it("store addToast should work for error type (used by hook)", () => {
    const { addToast } = useToastStore.getState();
    addToast("Error message", "error");

    const state = useToastStore.getState();
    expect(state.toasts[0].type).toBe("error");
  });

  it("store addToast should work for warning type (used by hook)", () => {
    const { addToast } = useToastStore.getState();
    addToast("Warning message", "warning");

    const state = useToastStore.getState();
    expect(state.toasts[0].type).toBe("warning");
  });

  it("store addToast should work for info type (used by hook)", () => {
    const { addToast } = useToastStore.getState();
    addToast("Info message", "info");

    const state = useToastStore.getState();
    expect(state.toasts[0].type).toBe("info");
  });

  it("store addToast should support custom duration (used by hook)", () => {
    const { addToast } = useToastStore.getState();
    addToast("Custom duration", "success", 2000);

    const state = useToastStore.getState();
    expect(state.toasts[0].duration).toBe(2000);
  });
});
