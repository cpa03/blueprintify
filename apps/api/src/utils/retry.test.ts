import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRetry } from "./retry";

describe("Retry Utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("withRetry", () => {
    it("should resolve immediately on successful operation", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const result = await withRetry(operation);

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should use default retry options when not provided", async () => {
      const operation = vi.fn().mockResolvedValue("result");

      await withRetry(operation);

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should retry on retryable error (rate limit 429)", async () => {
      const rateLimitError = { status: 429 };
      const operation = vi
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, {
        retries: 1,
        initialDelay: 100,
      });

      // Advance timers to allow retry
      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should retry on server error (5xx)", async () => {
      const serverError = { status: 503 };
      const operation = vi
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, {
        retries: 1,
        initialDelay: 100,
      });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should retry on network error codes", async () => {
      const networkError = { code: "ECONNRESET" };
      const operation = vi
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, {
        retries: 1,
        initialDelay: 100,
      });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should not retry on non-retryable errors", async () => {
      const clientError = { status: 400 };
      const operation = vi.fn().mockRejectedValue(clientError);

      await expect(withRetry(operation, { retries: 3 })).rejects.toEqual(
        clientError,
      );
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should throw last error after max retries exceeded", async () => {
      const serverError = { status: 503 };
      const operation = vi.fn().mockRejectedValue(serverError);

      const resultPromise = withRetry(operation, {
        retries: 2,
        initialDelay: 10,
        backoffFactor: 1,
      });

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(10);
      await vi.advanceTimersByTimeAsync(10);

      await expect(resultPromise).rejects.toEqual(serverError);
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it("should apply exponential backoff between retries", async () => {
      const serverError = { status: 503 };
      const operation = vi.fn().mockRejectedValue(serverError);

      const resultPromise = withRetry(operation, {
        retries: 2,
        initialDelay: 100,
        backoffFactor: 2,
      });

      // First retry after 100ms
      await vi.advanceTimersByTimeAsync(100);
      expect(operation).toHaveBeenCalledTimes(2);

      // Second retry after 200ms (100 * 2)
      await vi.advanceTimersByTimeAsync(200);
      expect(operation).toHaveBeenCalledTimes(3);

      await expect(resultPromise).rejects.toEqual(serverError);
    });

    it("should call onRetry callback on each retry", async () => {
      const serverError = { status: 503 };
      const operation = vi
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce("success");

      const onRetry = vi.fn();
      const resultPromise = withRetry(operation, {
        retries: 2,
        initialDelay: 1,
        backoffFactor: 1,
        onRetry,
      });

      await vi.advanceTimersByTimeAsync(1);
      await vi.advanceTimersByTimeAsync(1);

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, serverError, 1);
      expect(onRetry).toHaveBeenNthCalledWith(2, serverError, 2);
    });

    it("should handle error with response.status property", async () => {
      const error = { response: { status: 502 } };
      const operation = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, {
        retries: 1,
        initialDelay: 100,
      });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should retry on null/undefined error", async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(null)
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, {
        retries: 1,
        initialDelay: 100,
      });

      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should handle zero retries option", async () => {
      const serverError = { status: 503 };
      const operation = vi.fn().mockRejectedValue(serverError);

      await expect(withRetry(operation, { retries: 0 })).rejects.toEqual(
        serverError,
      );
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should use custom initial delay", async () => {
      const serverError = { status: 503 };
      const operation = vi
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce("success");

      const resultPromise = withRetry(operation, {
        retries: 1,
        initialDelay: 500,
      });

      // Should not have retried yet at 100ms
      await vi.advanceTimersByTimeAsync(100);
      expect(operation).toHaveBeenCalledTimes(1);

      // Should retry at 500ms
      await vi.advanceTimersByTimeAsync(400);
      expect(operation).toHaveBeenCalledTimes(2);

      const result = await resultPromise;
      expect(result).toBe("success");
    });

    it("should use custom backoff factor", async () => {
      const serverError = { status: 503 };
      const operation = vi.fn().mockRejectedValue(serverError);

      const resultPromise = withRetry(operation, {
        retries: 2,
        initialDelay: 100,
        backoffFactor: 3,
      });

      // First retry after 100ms
      await vi.advanceTimersByTimeAsync(100);
      expect(operation).toHaveBeenCalledTimes(2);

      // Second retry after 300ms (100 * 3)
      await vi.advanceTimersByTimeAsync(300);
      expect(operation).toHaveBeenCalledTimes(3);

      await expect(resultPromise).rejects.toEqual(serverError);
    });

    it("should cap delay at maxDelay option", async () => {
      const serverError = { status: 503 };
      const operation = vi.fn().mockRejectedValue(serverError);

      const resultPromise = withRetry(operation, {
        retries: 5,
        initialDelay: 1000,
        backoffFactor: 2,
        maxDelay: 3000,
      });

      // First retry after 1000ms (initialDelay)
      await vi.advanceTimersByTimeAsync(1000);
      expect(operation).toHaveBeenCalledTimes(2);

      // Second retry after 2000ms (1000 * 2, capped at 3000)
      await vi.advanceTimersByTimeAsync(2000);
      expect(operation).toHaveBeenCalledTimes(3);

      // Third retry after 3000ms (would be 4000, but capped at 3000)
      await vi.advanceTimersByTimeAsync(3000);
      expect(operation).toHaveBeenCalledTimes(4);

      // Fourth retry after 3000ms (still capped)
      await vi.advanceTimersByTimeAsync(3000);
      expect(operation).toHaveBeenCalledTimes(5);

      // Fifth retry after 3000ms (still capped)
      await vi.advanceTimersByTimeAsync(3000);
      expect(operation).toHaveBeenCalledTimes(6);

      await expect(resultPromise).rejects.toEqual(serverError);
    });

    it("should use default maxDelay from config when not specified", async () => {
      const serverError = { status: 503 };
      const operation = vi.fn().mockRejectedValue(serverError);

      // With default maxDelay of 10000ms, delay should cap at 10000
      // Using high backoff factor to exceed default max quickly
      const resultPromise = withRetry(operation, {
        retries: 3,
        initialDelay: 5000,
        backoffFactor: 10, // 5000 -> 50000, but capped at 10000
      });

      await vi.advanceTimersByTimeAsync(5000); // 1st retry
      await vi.advanceTimersByTimeAsync(10000); // 2nd retry (capped)
      await vi.advanceTimersByTimeAsync(10000); // 3rd retry (capped)

      await expect(resultPromise).rejects.toEqual(serverError);
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it("should handle all retryable error codes", async () => {
      const retryableCodes = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ENOTFOUND",
        "EAI_AGAIN",
        "ECONNREFUSED",
      ];

      for (const code of retryableCodes) {
        const error = { code };
        const operation = vi
          .fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValueOnce("success");

        const resultPromise = withRetry(operation, {
          retries: 1,
          initialDelay: 10,
        });

        await vi.advanceTimersByTimeAsync(10);

        const result = await resultPromise;
        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(2);
      }
    });
  });
});
