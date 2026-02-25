import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDebouncedSaver } from "@blueprint/shared";

describe("createDebouncedSaver (shared package)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should debounce function calls", () => {
    const mockFn = vi.fn();
    const { debounced } = createDebouncedSaver(mockFn, 100);

    debounced();
    debounced();
    debounced();

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should delay execution until delay has passed", () => {
    const mockFn = vi.fn();
    const { debounced } = createDebouncedSaver(mockFn, 200);

    debounced();

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should pass arguments to the debounced function", () => {
    const mockFn = vi.fn();
    const { debounced } = createDebouncedSaver(mockFn, 100);

    debounced("arg1", "arg2");

    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should provide flush method to execute immediately", () => {
    const mockFn = vi.fn();
    const { debounced, flush } = createDebouncedSaver(mockFn, 100);

    debounced();
    expect(mockFn).not.toHaveBeenCalled();

    flush();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should provide cancel method to cancel pending execution", () => {
    const mockFn = vi.fn();
    const { debounced, cancel } = createDebouncedSaver(mockFn, 100);

    debounced();
    expect(mockFn).not.toHaveBeenCalled();

    cancel();

    vi.advanceTimersByTime(100);

    expect(mockFn).not.toHaveBeenCalled();
  });

  it("should reset timeout on subsequent calls", () => {
    const mockFn = vi.fn();
    const { debounced } = createDebouncedSaver(mockFn, 100);

    debounced();
    vi.advanceTimersByTime(50);

    debounced();
    vi.advanceTimersByTime(50);

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should handle flush when no timeout is pending", () => {
    const mockFn = vi.fn();
    const { flush } = createDebouncedSaver(mockFn, 100);

    expect(() => flush()).not.toThrow();
    expect(mockFn).not.toHaveBeenCalled();
  });

  it("should handle cancel when no timeout is pending", () => {
    const mockFn = vi.fn();
    const { cancel } = createDebouncedSaver(mockFn, 100);

    expect(() => cancel()).not.toThrow();
  });

  it("should execute flush when debounced was called", () => {
    const mockFn = vi.fn();
    const { debounced, flush } = createDebouncedSaver(mockFn, 100);

    debounced("test", 123);

    flush();

    // flush() executes immediately
    expect(mockFn).toHaveBeenCalled();
  });
});
