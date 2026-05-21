import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  withTimeout,
  TimeoutError,
  createTimeoutWrapper,
  withTimeoutAndRetry,
} from "./timeout";

describe("Timeout Utilities", () => {
  describe("TimeoutError", () => {
    it("should create error with default message", () => {
      const error = new TimeoutError(5000);
      expect(error.message).toBe("Operation timed out after 5000ms");
      expect(error.name).toBe("TimeoutError");
      expect(error.timeoutMs).toBe(5000);
    });

    it("should create error with custom message", () => {
      const error = new TimeoutError(3000, "Custom timeout message");
      expect(error.message).toBe("Custom timeout message");
      expect(error.timeoutMs).toBe(3000);
    });
  });

  describe("withTimeout", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(async () => {
      vi.useRealTimers();
      // Add delay to allow async tasks to settle and prevent unhandled rejection warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("should resolve when operation completes before timeout", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const result = await withTimeout(operation, { timeoutMs: 5000 });
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalled();
    });

    it("should throw TimeoutError when operation exceeds timeout", async () => {
      const operation = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 10000);
          }),
      );

      const promise = withTimeout(operation, { timeoutMs: 50 });
      vi.advanceTimersByTime(100);
      await expect(promise).rejects.toThrow(TimeoutError);
    });

    it("should throw TimeoutError with custom message", async () => {
      const operation = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 10000);
          }),
      );

      const promise = withTimeout(operation, {
        timeoutMs: 50,
        errorMessage: "API call timed out",
      });
      vi.advanceTimersByTime(100);
      await expect(promise).rejects.toThrow("API call timed out");
    });

    it("should re-throw operation errors", async () => {
      const operationError = new Error("Operation failed");
      const operation = vi.fn().mockRejectedValue(operationError);

      await expect(withTimeout(operation, { timeoutMs: 5000 })).rejects.toThrow(
        "Operation failed",
      );
    });

    it("should clear timeout on successful completion", async () => {
      const operation = vi.fn().mockResolvedValue("done");
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      await withTimeout(operation, { timeoutMs: 5000 });

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it("should clear timeout on error", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("fail"));
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      await withTimeout(operation, { timeoutMs: 5000 }).catch(() => {});

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe("createTimeoutWrapper", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(async () => {
      vi.useRealTimers();
      // Add delay to allow async tasks to settle and prevent unhandled rejection warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("should create wrapper with pre-configured timeout", async () => {
      const wrapper = createTimeoutWrapper({ timeoutMs: 3000 });
      const operation = vi.fn().mockResolvedValue("result");

      const result = await wrapper(operation);
      expect(result).toBe("result");
    });

    it("should use default error message", async () => {
      const wrapper = createTimeoutWrapper({
        timeoutMs: 50,
        errorMessage: "Wrapper timeout",
      });
      const operation = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 5000);
          }),
      );

      const promise = wrapper(operation);
      vi.advanceTimersByTime(100);
      await expect(promise).rejects.toThrow("Wrapper timeout");
    });
  });

  describe("withTimeoutAndRetry", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(async () => {
      vi.useRealTimers();
      // Add delay to allow async tasks to settle and prevent unhandled rejection warnings
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("should succeed on first attempt", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const result = await withTimeoutAndRetry(operation, {
        timeoutMs: 5000,
        retries: 2,
      });
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockResolvedValueOnce("success");

      const promise = withTimeoutAndRetry(operation, {
        timeoutMs: 5000,
        retries: 1,
        retryDelayMs: 10,
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should throw after max retries exceeded", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("always fails"));

      const promise = withTimeoutAndRetry(operation, {
        timeoutMs: 5000,
        retries: 2,
        retryDelayMs: 10,
      });

      await vi.runAllTimersAsync();
      await expect(promise).rejects.toThrow("always fails");
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should throw TimeoutError when operation times out", async () => {
      const operation = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 10000);
          }),
      );

      const promise = withTimeoutAndRetry(operation, {
        timeoutMs: 50,
        retries: 0,
      });

      await vi.runAllTimersAsync();
      await expect(promise).rejects.toThrow(TimeoutError);
    });
  });
});
