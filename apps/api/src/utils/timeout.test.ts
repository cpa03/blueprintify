import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  withTimeout,
  TimeoutError,
  createTimeoutWrapper,
  withTimeoutAndRetry,
} from "./timeout";

describe("Timeout Utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
    it("should resolve when operation completes before timeout", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const promise = withTimeout(operation, { timeoutMs: 5000 });
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalled();
    });

    it("should throw TimeoutError when operation exceeds timeout", async () => {
      const operation = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 10000)),
        );

      const promise = withTimeout(operation, { timeoutMs: 5000 });
      await vi.advanceTimersByTimeAsync(5000);

      await expect(promise).rejects.toThrow(TimeoutError);
      await expect(promise).rejects.toHaveProperty("timeoutMs", 5000);
    });

    it("should throw TimeoutError with custom message", async () => {
      const operation = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 10000)),
        );

      const promise = withTimeout(operation, {
        timeoutMs: 5000,
        errorMessage: "API call timed out",
      });
      await vi.advanceTimersByTimeAsync(5000);

      await expect(promise).rejects.toThrow("API call timed out");
    });

    it("should re-throw operation errors", async () => {
      const operationError = new Error("Operation failed");
      const operation = vi.fn().mockRejectedValue(operationError);

      const promise = withTimeout(operation, { timeoutMs: 5000 });

      await expect(promise).rejects.toThrow("Operation failed");
    });

    it("should clear timeout on successful completion", async () => {
      const operation = vi.fn().mockResolvedValue("done");
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const promise = withTimeout(operation, { timeoutMs: 5000 });
      await promise;

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it("should clear timeout on error", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("fail"));
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const promise = withTimeout(operation, { timeoutMs: 5000 });
      await promise.catch(() => {});

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe("createTimeoutWrapper", () => {
    it("should create wrapper with pre-configured timeout", async () => {
      const wrapper = createTimeoutWrapper({ timeoutMs: 3000 });
      const operation = vi.fn().mockResolvedValue("result");

      const promise = wrapper(operation);
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;
      expect(result).toBe("result");
    });

    it("should use default error message", async () => {
      const wrapper = createTimeoutWrapper({
        timeoutMs: 2000,
        errorMessage: "Wrapper timeout",
      });
      const operation = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 5000)),
        );

      const promise = wrapper(operation);
      await vi.advanceTimersByTimeAsync(2000);

      await expect(promise).rejects.toThrow("Wrapper timeout");
    });
  });

  describe("withTimeoutAndRetry", () => {
    it("should succeed on first attempt", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const promise = withTimeoutAndRetry(operation, {
        timeoutMs: 5000,
        retries: 2,
      });
      await vi.advanceTimersByTimeAsync(0);

      const result = await promise;
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
        retryDelayMs: 100,
      });

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should throw after max retries exceeded", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("always fails"));

      const promise = withTimeoutAndRetry(operation, {
        timeoutMs: 5000,
        retries: 2,
        retryDelayMs: 100,
      });

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).rejects.toThrow("always fails");
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should throw TimeoutError when operation times out", async () => {
      const operation = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 10000)),
        );

      const promise = withTimeoutAndRetry(operation, {
        timeoutMs: 1000,
        retries: 0,
      });

      await vi.advanceTimersByTimeAsync(1000);

      await expect(promise).rejects.toThrow(TimeoutError);
    });
  });
});
