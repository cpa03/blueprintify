/**
 * Retry Utilities Unit Tests
 * Tests exponential backoff retry logic for resilient API operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRetry } from "./retry";

describe("withRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("successful operations", () => {
    it("should return result on first successful attempt", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const result = await withRetry(operation);

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should not call onRetry callback on success", async () => {
      const operation = vi.fn().mockResolvedValue("success");
      const onRetry = vi.fn();

      await withRetry(operation, { onRetry });

      expect(onRetry).not.toHaveBeenCalled();
    });
  });

  describe("retry behavior", () => {
    it("should retry on retryable error", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce({ status: 429 })
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, { initialDelay: 100 });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should retry on server error (5xx)", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, { initialDelay: 100 });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should retry on network error codes", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce({ code: "ECONNRESET" })
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, { initialDelay: 100 });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should not retry on non-retryable error", async () => {
      const operation = vi.fn().mockRejectedValue({ status: 400 });

      await expect(withRetry(operation)).rejects.toEqual({ status: 400 });
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should throw last error after max retries", async () => {
      const operation = vi.fn().mockRejectedValue({ status: 500 });

      const resultPromise = withRetry(operation, {
        retries: 2,
        initialDelay: 100,
      });

      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toEqual({ status: 500 });
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe("exponential backoff", () => {
    it("should use exponential backoff between retries", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, {
        retries: 3,
        initialDelay: 100,
        backoffFactor: 2,
      });

      await vi.advanceTimersByTimeAsync(100);
      expect(operation).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(200);
      expect(operation).toHaveBeenCalledTimes(3);

      const result = await resultPromise;
      expect(result).toBe("success");
    });

    it("should use custom backoff factor", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, {
        initialDelay: 100,
        backoffFactor: 3,
      });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
    });
  });

  describe("onRetry callback", () => {
    it("should call onRetry with error and attempt number", async () => {
      const error = { status: 500 };
      const operation = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce("success");

      const onRetry = vi.fn();
      const resultPromise = withRetry(operation, {
        onRetry,
        initialDelay: 100,
      });

      await vi.advanceTimersByTimeAsync(100);

      await resultPromise;

      expect(onRetry).toHaveBeenCalledWith(error, 1);
    });

    it("should call onRetry for each retry attempt", async () => {
      const error = { status: 500 };
      const operation = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce("success");

      const onRetry = vi.fn();
      const resultPromise = withRetry(operation, {
        onRetry,
        retries: 3,
        initialDelay: 100,
      });

      await vi.runAllTimersAsync();

      await resultPromise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, error, 1);
      expect(onRetry).toHaveBeenNthCalledWith(2, error, 2);
    });
  });

  describe("error handling", () => {
    it("should handle errors with response.status", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce({ response: { status: 502 } })
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, { initialDelay: 100 });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
    });

    it("should handle null/undefined errors as retryable", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(null)
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, { initialDelay: 100 });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
    });

    it("should not retry on generic errors without status or code", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("network error"));

      await expect(withRetry(operation, { initialDelay: 100 })).rejects.toThrow(
        "network error",
      );

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe("configuration options", () => {
    it("should use default retries when not specified", async () => {
      const operation = vi.fn().mockRejectedValue({ status: 500 });

      const resultPromise = withRetry(operation, { initialDelay: 10 });

      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toEqual({ status: 500 });
    });

    it("should use zero retries when specified", async () => {
      const operation = vi.fn().mockRejectedValue({ status: 500 });

      await expect(
        withRetry(operation, { retries: 0, initialDelay: 10 }),
      ).rejects.toEqual({ status: 500 });

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
});
