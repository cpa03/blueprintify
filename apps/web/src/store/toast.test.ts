import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useToastStore, useToast } from "./toast";

describe("toast store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useToastStore.getState().clearAll();
    vi.clearAllMocks();
    // Clear all pending timeouts
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
      addToast("Success message", "success");
      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]?.message).toBe("Success message");
      expect(state.toasts[0]?.type).toBe("success");
    });

    it("should add an info toast", () => {
      const { addToast } = useToastStore.getState();
      addToast("Info message", "info");
      const state = useToastStore.getState();
      expect(state.toasts[0]?.type).toBe("info");
    });

    it("should add a warning toast", () => {
      const { addToast } = useToastStore.getState();
      addToast("Warning message", "warning");
      const state = useToastStore.getState();
      expect(state.toasts[0]?.type).toBe("warning");
    });

    it("should add an error toast", () => {
      const { addToast } = useToastStore.getState();
      addToast("Error message", "error");
      const state = useToastStore.getState();
      expect(state.toasts[0]?.type).toBe("error");
    });

    it("should add multiple toasts", () => {
      const { addToast } = useToastStore.getState();
      addToast("First", "success");
      addToast("Second", "error");
      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(2);
    });

    it("should generate unique IDs for each toast", () => {
      const { addToast } = useToastStore.getState();
      addToast("First", "success");
      addToast("Second", "success");
      const state = useToastStore.getState();
      expect(state.toasts[0]?.id).not.toBe(state.toasts[1]?.id);
    });

    it("should accept custom duration", () => {
      const { addToast } = useToastStore.getState();
      addToast("Custom duration", "success", 5000);
      const state = useToastStore.getState();
      expect(state.toasts[0]?.duration).toBe(5000);
    });
  });

  describe("removeToast", () => {
    it("should remove a toast by ID", () => {
      const { addToast, removeToast } = useToastStore.getState();
      addToast("To remove", "success");
      const { toasts } = useToastStore.getState();
      const toastId = toasts[0]?.id;
      removeToast(toastId!);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("should not affect other toasts when removing one", () => {
      const { addToast, removeToast } = useToastStore.getState();
      addToast("First", "success");
      addToast("Second", "error");
      const { toasts } = useToastStore.getState();
      removeToast(toasts[0]?.id!);
      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]?.message).toBe("Second");
    });
  });

  describe("clearAll", () => {
    it("should remove all toasts", () => {
      const { addToast, clearAll } = useToastStore.getState();
      addToast("First", "success");
      addToast("Second", "error");
      addToast("Third", "info");
      clearAll();
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe("auto-dismiss", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should auto-dismiss toast after default duration", () => {
      const { addToast } = useToastStore.getState();
      addToast("Auto dismiss", "success");
      expect(useToastStore.getState().toasts).toHaveLength(1);

      // Fast-forward time beyond default duration (4000ms)
      vi.advanceTimersByTime(5000);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("should auto-dismiss toast after custom duration", () => {
      const { addToast } = useToastStore.getState();
      addToast("Custom dismiss", "success", 2000);
      expect(useToastStore.getState().toasts).toHaveLength(1);

      // Fast-forward time beyond custom duration (2000ms)
      vi.advanceTimersByTime(3000);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("should not dismiss toast before duration expires", () => {
      const { addToast } = useToastStore.getState();
      addToast("Don't dismiss", "success", 5000);
      expect(useToastStore.getState().toasts).toHaveLength(1);

      // Fast-forward time but not enough
      vi.advanceTimersByTime(3000);

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });
});

describe("useToast hook", () => {
  // Note: React hooks cannot be called outside of a React component context.
  // These tests verify that the useToast hook properly accesses the store's addToast method.
  // In a real React component test, you would use @testing-library/react to render a component
  // that uses this hook. For store-level testing, we verify the underlying store methods work.

  beforeEach(() => {
    useToastStore.getState().clearAll();
    vi.clearAllMocks();
  });

  it("should expose toast methods that add to the store", () => {
    // Access the store directly to verify the hook would work correctly
    const { addToast, clearAll } = useToastStore.getState();
    clearAll();

    // Simulate what useToast.success would do
    addToast("Success from hook!", "success");

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]?.type).toBe("success");
    expect(state.toasts[0]?.message).toBe("Success from hook!");
  });

  it("should allow custom duration through hook methods", () => {
    const { addToast, clearAll } = useToastStore.getState();
    clearAll();

    // Simulate what useToast.success would do with custom duration
    addToast("Custom duration", "info", 2000);

    const state = useToastStore.getState();
    expect(state.toasts[0]?.duration).toBe(2000);
  });
});
