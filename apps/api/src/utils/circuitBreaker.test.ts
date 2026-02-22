import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createCircuitBreaker,
  CircuitBreakerOpenError,
  CircuitState,
  type CircuitBreaker,
} from "./circuitBreaker";

describe("Circuit Breaker", () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    vi.useFakeTimers();
    breaker = createCircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      halfOpenMaxCalls: 2,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createCircuitBreaker", () => {
    it("should create a circuit breaker with default config", () => {
      const defaultBreaker = createCircuitBreaker();
      const state = defaultBreaker.getState();

      expect(state.state).toBe(CircuitState.CLOSED);
      expect(state.failures).toBe(0);
      expect(state.successes).toBe(0);
    });

    it("should create a circuit breaker with custom config", () => {
      const customBreaker = createCircuitBreaker({
        failureThreshold: 5,
        resetTimeoutMs: 5000,
        halfOpenMaxCalls: 3,
      });

      const state = customBreaker.getState();
      expect(state.state).toBe(CircuitState.CLOSED);
    });
  });

  describe("CLOSED state", () => {
    it("should execute function successfully in CLOSED state", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      const result = await breaker.execute(operation);

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);

      const state = breaker.getState();
      expect(state.state).toBe(CircuitState.CLOSED);
      expect(state.failures).toBe(0);
    });

    it("should track failures in CLOSED state", async () => {
      const error = new Error("test error");
      const operation = vi.fn().mockRejectedValue(error);

      await expect(breaker.execute(operation)).rejects.toThrow("test error");

      const state = breaker.getState();
      expect(state.state).toBe(CircuitState.CLOSED);
      expect(state.failures).toBe(1);
    });

    it("should reset failure count on success after failures", async () => {
      const error = new Error("test error");
      const operation = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce("success");

      await expect(breaker.execute(operation)).rejects.toThrow();
      await breaker.execute(operation);

      const state = breaker.getState();
      expect(state.failures).toBe(0);
    });

    it("should transition to OPEN when failure threshold reached", async () => {
      const error = new Error("test error");
      const operation = vi.fn().mockRejectedValue(error);

      // Trigger failures up to threshold
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(operation)).rejects.toThrow();
      }

      const state = breaker.getState();
      expect(state.state).toBe(CircuitState.OPEN);
      expect(state.failures).toBe(3);
    });
  });

  describe("OPEN state", () => {
    beforeEach(async () => {
      const error = new Error("test error");
      const operation = vi.fn().mockRejectedValue(error);

      // Trigger failures to open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(operation)).rejects.toThrow();
      }
    });

    it("should reject requests immediately when OPEN", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      await expect(breaker.execute(operation)).rejects.toThrow(
        CircuitBreakerOpenError,
      );
      expect(operation).not.toHaveBeenCalled();
    });

    it("should transition to HALF_OPEN after reset timeout", async () => {
      // Advance time past reset timeout
      await vi.advanceTimersByTimeAsync(1001);

      const operation = vi.fn().mockResolvedValue("success");
      await breaker.execute(operation);

      const state = breaker.getState();
      expect(state.state).toBe(CircuitState.HALF_OPEN);
    });

    it("should provide nextAttempt timestamp in OPEN state", () => {
      const state = breaker.getState();

      expect(state.nextAttempt).toBeGreaterThan(Date.now());
      expect(state.lastFailureTime).not.toBeNull();
    });
  });

  describe("HALF_OPEN state", () => {
    beforeEach(async () => {
      const error = new Error("test error");
      const operation = vi.fn().mockRejectedValue(error);

      // Trigger failures to open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(operation)).rejects.toThrow();
      }

      // Advance time past reset timeout to enter HALF_OPEN
      await vi.advanceTimersByTimeAsync(1001);
    });

    it("should allow limited calls in HALF_OPEN state", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      // Should allow first call
      await breaker.execute(operation);
      expect(operation).toHaveBeenCalledTimes(1);

      // Should allow second call (halfOpenMaxCalls = 2)
      await breaker.execute(operation);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should reject calls exceeding halfOpenMaxCalls", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      // First two calls should succeed
      await breaker.execute(operation);
      await breaker.execute(operation);

      // Third call should be rejected
      await expect(breaker.execute(operation)).rejects.toThrow(
        CircuitBreakerOpenError,
      );
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("should transition to CLOSED after enough successes", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      // Two successes should close the circuit (halfOpenMaxCalls = 2)
      await breaker.execute(operation);
      await breaker.execute(operation);

      const state = breaker.getState();
      expect(state.state).toBe(CircuitState.CLOSED);
      expect(state.successes).toBe(0); // Reset on transition to CLOSED
    });

    it("should transition back to OPEN on failure in HALF_OPEN", async () => {
      const successOp = vi.fn().mockResolvedValue("success");
      const failureOp = vi.fn().mockRejectedValue(new Error("failure"));

      // First call succeeds
      await breaker.execute(successOp);

      // Second call fails
      await expect(breaker.execute(failureOp)).rejects.toThrow("failure");

      const state = breaker.getState();
      expect(state.state).toBe(CircuitState.OPEN);
    });

    it("should track successes in HALF_OPEN state", async () => {
      const operation = vi.fn().mockResolvedValue("success");

      await breaker.execute(operation);

      const state = breaker.getState();
      expect(state.successes).toBe(1);
    });
  });

  describe("getState", () => {
    it("should return current metrics", () => {
      const state = breaker.getState();

      expect(state).toHaveProperty("state");
      expect(state).toHaveProperty("failures");
      expect(state).toHaveProperty("successes");
      expect(state).toHaveProperty("lastFailureTime");
      expect(state).toHaveProperty("nextAttempt");
    });

    it("should return null lastFailureTime when no failures", () => {
      const state = breaker.getState();

      expect(state.lastFailureTime).toBeNull();
    });
  });

  describe("CircuitBreakerOpenError", () => {
    it("should have correct name", () => {
      const error = new CircuitBreakerOpenError("test message");

      expect(error.name).toBe("CircuitBreakerOpenError");
    });

    it("should have correct message", () => {
      const error = new CircuitBreakerOpenError("test message");

      expect(error.message).toBe("test message");
    });

    it("should have statusCode property", () => {
      const error = new CircuitBreakerOpenError("test message");

      expect(error.statusCode).toBe(503);
    });

    it("should extend Error", () => {
      const error = new CircuitBreakerOpenError("test message");

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("CircuitState enum", () => {
    it("should have CLOSED state", () => {
      expect(CircuitState.CLOSED).toBe("CLOSED");
    });

    it("should have OPEN state", () => {
      expect(CircuitState.OPEN).toBe("OPEN");
    });

    it("should have HALF_OPEN state", () => {
      expect(CircuitState.HALF_OPEN).toBe("HALF_OPEN");
    });
  });

  describe("integration scenarios", () => {
    it("should handle full cycle: CLOSED -> OPEN -> HALF_OPEN -> CLOSED", async () => {
      const error = new Error("service unavailable");
      const failOp = vi.fn().mockRejectedValue(error);
      const successOp = vi.fn().mockResolvedValue("success");

      // CLOSED: Execute successfully
      await breaker.execute(successOp);
      expect(breaker.getState().state).toBe(CircuitState.CLOSED);

      // CLOSED -> OPEN: Trigger failures
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failOp)).rejects.toThrow();
      }
      expect(breaker.getState().state).toBe(CircuitState.OPEN);

      // OPEN: Reject immediately
      await expect(breaker.execute(successOp)).rejects.toThrow(
        CircuitBreakerOpenError,
      );

      // OPEN -> HALF_OPEN: Wait for reset timeout
      await vi.advanceTimersByTimeAsync(1001);

      // HALF_OPEN: Allow test calls
      await breaker.execute(successOp);
      expect(breaker.getState().state).toBe(CircuitState.HALF_OPEN);

      // HALF_OPEN -> CLOSED: Complete recovery
      await breaker.execute(successOp);
      expect(breaker.getState().state).toBe(CircuitState.CLOSED);
    });

    it("should handle recovery failure: CLOSED -> OPEN -> HALF_OPEN -> OPEN", async () => {
      const error = new Error("service unavailable");
      const failOp = vi.fn().mockRejectedValue(error);
      const successOp = vi.fn().mockResolvedValue("success");

      // Trigger failures to open circuit
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failOp)).rejects.toThrow();
      }
      expect(breaker.getState().state).toBe(CircuitState.OPEN);

      // Wait for reset timeout
      await vi.advanceTimersByTimeAsync(1001);

      // First call in HALF_OPEN succeeds
      await breaker.execute(successOp);
      expect(breaker.getState().state).toBe(CircuitState.HALF_OPEN);

      // Second call in HALF_OPEN fails
      await expect(breaker.execute(failOp)).rejects.toThrow();
      expect(breaker.getState().state).toBe(CircuitState.OPEN);
    });

    it("should properly track lastFailureTime", async () => {
      const error = new Error("test error");
      const operation = vi.fn().mockRejectedValue(error);

      const beforeFailure = Date.now();
      await expect(breaker.execute(operation)).rejects.toThrow();
      const afterFailure = Date.now();

      const state = breaker.getState();
      expect(state.lastFailureTime).toBeGreaterThanOrEqual(beforeFailure);
      expect(state.lastFailureTime).toBeLessThanOrEqual(afterFailure);
    });
  });
});
