import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ERROR_CLASS_NAMES } from "@blueprint/shared";
import { withTimeout, TimeoutError } from "./timeout";

describe("Timeout Utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("TimeoutError", () => {
    it("should create error with default message", () => {
      const error = new TimeoutError(5000);
      expect(error.message).toBe("Operation timed out after 5000ms");
      expect(error.name).toBe(ERROR_CLASS_NAMES.TIMEOUT_ERROR);
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
      const operation = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 10000)));

      const promise = withTimeout(operation, { timeoutMs: 50 });

      vi.advanceTimersByTime(51);

      await expect(promise).rejects.toThrow(TimeoutError);
    });

    it("should throw TimeoutError with custom message", async () => {
      const operation = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 10000);
          })
      );

      const promise = withTimeout(operation, {
        timeoutMs: 50,
        errorMessage: "API call timed out",
      });
      vi.advanceTimersByTime(51);

      await expect(promise).rejects.toThrow("API call timed out");
    });

    it("should re-throw operation errors", async () => {
      const operationError = new Error("Operation failed");
      const operation = vi.fn().mockRejectedValue(operationError);

      await expect(withTimeout(operation, { timeoutMs: 5000 })).rejects.toThrow("Operation failed");
    });

    it("should clear timeout on successful completion", async () => {
      const operation = vi.fn().mockResolvedValue("done");
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

      await withTimeout(operation, { timeoutMs: 5000 });

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it("should clear timeout on error", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("fail"));
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

      await withTimeout(operation, { timeoutMs: 5000 }).catch(() => {});

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
