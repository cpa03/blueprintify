import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createCircuitBreaker,
  CircuitBreakerOpenError,
  CircuitState,
  type CircuitBreaker,
} from "./circuitBreaker";

describe("Circuit Breaker Utilities", () => {
  describe("CircuitBreakerOpenError", () => {
    it("should create error with message", () => {
      const error = new CircuitBreakerOpenError("Circuit breaker is OPEN");
      expect(error.message).toBe("Circuit breaker is OPEN");
      expect(error.name).toBe("CircuitBreakerOpenError");
      expect(error.statusCode).toBe(503);
    });

    it("should extend Error class", () => {
      const error = new CircuitBreakerOpenError("Test error");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CircuitBreakerOpenError);
    });
  });

  describe("createCircuitBreaker", () => {
    it("should create circuit breaker with default config", () => {
      const breaker = createCircuitBreaker();
      const state = breaker.getState();

      expect(state.state).toBe(CircuitState.CLOSED);
      expect(state.failures).toBe(0);
      expect(state.successes).toBe(0);
      expect(state.lastFailureTime).toBeNull();
    });

    it("should create circuit breaker with custom config", () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 3,
        resetTimeoutMs: 5000,
        halfOpenMaxCalls: 2,
      });

      const state = breaker.getState();
      expect(state.state).toBe(CircuitState.CLOSED);
    });
  });

  describe("CircuitBreaker", () => {
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

    describe("CLOSED state", () => {
      it("should execute operation successfully in CLOSED state", async () => {
        const operation = vi.fn().mockResolvedValue("success");

        const result = await breaker.execute(operation);

        expect(result).toBe("success");
        expect(operation).toHaveBeenCalledTimes(1);

        const state = breaker.getState();
        expect(state.state).toBe(CircuitState.CLOSED);
        expect(state.failures).toBe(0);
      });

      it("should track failures but stay CLOSED below threshold", async () => {
        const operation = vi.fn().mockRejectedValue(new Error("fail"));

        await expect(breaker.execute(operation)).rejects.toThrow("fail");
        await expect(breaker.execute(operation)).rejects.toThrow("fail");

        const state = breaker.getState();
        expect(state.state).toBe(CircuitState.CLOSED);
        expect(state.failures).toBe(2);
      });

      it("should open circuit when failure threshold reached", async () => {
        const operation = vi.fn().mockRejectedValue(new Error("fail"));

        // Trigger 3 failures to reach threshold
        await expect(breaker.execute(operation)).rejects.toThrow("fail");
        await expect(breaker.execute(operation)).rejects.toThrow("fail");
        await expect(breaker.execute(operation)).rejects.toThrow("fail");

        const state = breaker.getState();
        expect(state.state).toBe(CircuitState.OPEN);
        expect(state.failures).toBe(3);
      });

      it("should reset failure count on success", async () => {
        const failOperation = vi.fn().mockRejectedValue(new Error("fail"));
        const successOperation = vi.fn().mockResolvedValue("success");

        // Trigger 2 failures
        await expect(breaker.execute(failOperation)).rejects.toThrow("fail");
        await expect(breaker.execute(failOperation)).rejects.toThrow("fail");

        expect(breaker.getState().failures).toBe(2);

        // Success should reset failures
        await breaker.execute(successOperation);

        const state = breaker.getState();
        expect(state.failures).toBe(0);
        expect(state.state).toBe(CircuitState.CLOSED);
      });
    });

    describe("OPEN state", () => {
      beforeEach(async () => {
        // Open the circuit
        const operation = vi.fn().mockRejectedValue(new Error("fail"));
        await expect(breaker.execute(operation)).rejects.toThrow("fail");
        await expect(breaker.execute(operation)).rejects.toThrow("fail");
        await expect(breaker.execute(operation)).rejects.toThrow("fail");
      });

      it("should reject requests immediately in OPEN state", async () => {
        const operation = vi.fn().mockResolvedValue("success");

        await expect(breaker.execute(operation)).rejects.toThrow(
          CircuitBreakerOpenError,
        );
        expect(operation).not.toHaveBeenCalled();
      });

      it("should transition to HALF_OPEN after reset timeout", async () => {
        // Advance past reset timeout
        vi.advanceTimersByTime(1001);

        const operation = vi.fn().mockResolvedValue("success");
        await breaker.execute(operation);

        const state = breaker.getState();
        expect(state.state).toBe(CircuitState.HALF_OPEN);
      });

      it("should provide nextAttempt timestamp in OPEN state", () => {
        const state = breaker.getState();
        expect(state.nextAttempt).toBeGreaterThan(Date.now());
      });
    });

    describe("HALF_OPEN state", () => {
      beforeEach(async () => {
        // Open the circuit
        const operation = vi.fn().mockRejectedValue(new Error("fail"));
        await expect(breaker.execute(operation)).rejects.toThrow("fail");
        await expect(breaker.execute(operation)).rejects.toThrow("fail");
        await expect(breaker.execute(operation)).rejects.toThrow("fail");

        // Advance past reset timeout to enter HALF_OPEN
        vi.advanceTimersByTime(1001);
      });

      it("should allow limited calls in HALF_OPEN state", async () => {
        const operation = vi.fn().mockResolvedValue("success");

        // First call should succeed
        await breaker.execute(operation);
        expect(operation).toHaveBeenCalledTimes(1);

        // Second call should succeed (halfOpenMaxCalls = 2)
        await breaker.execute(operation);
        expect(operation).toHaveBeenCalledTimes(2);
      });

      it("should close circuit after successful calls in HALF_OPEN", async () => {
        const operation = vi.fn().mockResolvedValue("success");

        // Make 2 successful calls (halfOpenMaxCalls = 2)
        await breaker.execute(operation);
        await breaker.execute(operation);

        const state = breaker.getState();
        expect(state.state).toBe(CircuitState.CLOSED);
        expect(state.successes).toBe(0); // Reset after closing
      });

      it("should reopen circuit on failure in HALF_OPEN", async () => {
        const successOperation = vi.fn().mockResolvedValue("success");
        const failOperation = vi.fn().mockRejectedValue(new Error("fail"));

        // One successful call
        await breaker.execute(successOperation);

        // Failure should reopen circuit
        await expect(breaker.execute(failOperation)).rejects.toThrow("fail");

        const state = breaker.getState();
        expect(state.state).toBe(CircuitState.OPEN);
      });

      it("should reject calls when HALF_OPEN max calls exceeded", async () => {
        // The beforeEach opens the circuit and advances fake timers, but Date.now()
        // doesn't respond to fake timers. We need to mock system time to trigger
        // the transition to HALF_OPEN state.
        vi.setSystemTime(Date.now() + 1001);
        const setupOp = vi.fn().mockResolvedValue("success");
        await breaker.execute(setupOp); // This transitions to HALF_OPEN

        const operation = vi.fn().mockResolvedValue("success");

        // Make 2 calls (halfOpenMaxCalls = 2)
        await breaker.execute(operation);
        await breaker.execute(operation);

        // Third call should be rejected
        await expect(breaker.execute(operation)).rejects.toThrow(
          CircuitBreakerOpenError,
        );


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

      it("should track lastFailureTime on failure", async () => {
        const operation = vi.fn().mockRejectedValue(new Error("fail"));
        const beforeTime = Date.now();

        await expect(breaker.execute(operation)).rejects.toThrow("fail");

        const state = breaker.getState();
        expect(state.lastFailureTime).toBeGreaterThanOrEqual(beforeTime);
      });
    });

    describe("edge cases", () => {
      it("should handle concurrent operations", async () => {
        const operation = vi.fn().mockResolvedValue("success");

        const results = await Promise.all([
          breaker.execute(operation),
          breaker.execute(operation),
          breaker.execute(operation),
        ]);

        expect(results).toEqual(["success", "success", "success"]);
      });

      it("should handle operation that throws non-Error object", async () => {
        const operation = vi.fn().mockRejectedValue("string error");

        await expect(breaker.execute(operation)).rejects.toBe("string error");

        const state = breaker.getState();
        expect(state.failures).toBe(1);
      });

      it("should handle operation that throws null", async () => {
        const operation = vi.fn().mockRejectedValue(null);

        await expect(breaker.execute(operation)).rejects.toBeNull();

        const state = breaker.getState();
        expect(state.failures).toBe(1);
      });

      it("should handle operation that throws undefined", async () => {
        const operation = vi.fn().mockRejectedValue(undefined);

        await expect(breaker.execute(operation)).rejects.toBeUndefined();

        const state = breaker.getState();
        expect(state.failures).toBe(1);
      });
    });

    describe("configuration", () => {
      it("should respect custom failureThreshold", async () => {
        const customBreaker = createCircuitBreaker({
          failureThreshold: 1,
          resetTimeoutMs: 1000,
          halfOpenMaxCalls: 1,
        });

        const operation = vi.fn().mockRejectedValue(new Error("fail"));

        // Single failure should open circuit
        await expect(customBreaker.execute(operation)).rejects.toThrow("fail");

        expect(customBreaker.getState().state).toBe(CircuitState.OPEN);
      });

      it("should respect custom resetTimeoutMs", async () => {
        const customBreaker = createCircuitBreaker({
          failureThreshold: 1,
          resetTimeoutMs: 5000,
          halfOpenMaxCalls: 1,
        });

        const operation = vi.fn().mockRejectedValue(new Error("fail"));

        // Open the circuit
        await expect(customBreaker.execute(operation)).rejects.toThrow("fail");

        // Should still be OPEN after 4999ms (using system time mock)
        vi.setSystemTime(Date.now() + 4999);
        await expect(customBreaker.execute(operation)).rejects.toThrow(
          CircuitBreakerOpenError,
        );

        // Should transition to HALF_OPEN after 5000ms
        vi.setSystemTime(Date.now() + 5001);
        const successOp = vi.fn().mockResolvedValue("success");
        await customBreaker.execute(successOp);
        expect(customBreaker.getState().state).toBe(CircuitState.HALF_OPEN);


      });

      it("should respect custom halfOpenMaxCalls", async () => {
        const customBreaker = createCircuitBreaker({
          failureThreshold: 1,
          resetTimeoutMs: 1000,
          halfOpenMaxCalls: 3,
        });

        const operation = vi.fn().mockRejectedValue(new Error("fail"));

        // Open the circuit
        await expect(customBreaker.execute(operation)).rejects.toThrow("fail");

        // Advance to HALF_OPEN
        vi.advanceTimersByTime(1001);

        const successOp = vi.fn().mockResolvedValue("success");

        // Should allow 3 calls in HALF_OPEN
        await customBreaker.execute(successOp);
        await customBreaker.execute(successOp);
        await customBreaker.execute(successOp);

        // Circuit should be CLOSED after 3 successes
        expect(customBreaker.getState().state).toBe(CircuitState.CLOSED);
      });
    });
  });

  describe("CircuitState enum", () => {
    it("should have correct state values", () => {
      expect(CircuitState.CLOSED).toBe("CLOSED");
      expect(CircuitState.OPEN).toBe("OPEN");
      expect(CircuitState.HALF_OPEN).toBe("HALF_OPEN");
    });
  });
});
