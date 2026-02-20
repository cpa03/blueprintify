/**
 * Circuit Breaker Unit Tests
 * Tests the circuit breaker pattern implementation for resilient API interactions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createCircuitBreaker,
  CircuitBreakerOpenError,
  CircuitState,
} from "./circuitBreaker";

describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("should create a circuit breaker with default config", () => {
      const breaker = createCircuitBreaker();
      const state = breaker.getState();

      expect(state.state).toBe(CircuitState.CLOSED);
      expect(state.failures).toBe(0);
      expect(state.successes).toBe(0);
      expect(state.lastFailureTime).toBeNull();
    });

    it("should create a circuit breaker with custom config", () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 3,
        resetTimeoutMs: 5000,
        halfOpenMaxCalls: 2,
      });
      const state = breaker.getState();

      expect(state.state).toBe(CircuitState.CLOSED);
    });
  });

  describe("CLOSED state", () => {
    it("should execute function successfully in CLOSED state", async () => {
      const breaker = createCircuitBreaker();
      const result = await breaker.execute(() => Promise.resolve("success"));

      expect(result).toBe("success");
      expect(breaker.getState().state).toBe(CircuitState.CLOSED);
    });

    it("should track failures in CLOSED state", async () => {
      const breaker = createCircuitBreaker({ failureThreshold: 3 });

      // First failure
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail"))),
      ).rejects.toThrow("fail");

      expect(breaker.getState().failures).toBe(1);
      expect(breaker.getState().state).toBe(CircuitState.CLOSED);
    });

    it("should reset failure count on success", async () => {
      const breaker = createCircuitBreaker({ failureThreshold: 3 });

      // Cause a failure
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail"))),
      ).rejects.toThrow("fail");
      expect(breaker.getState().failures).toBe(1);

      // Success should reset
      await breaker.execute(() => Promise.resolve("success"));
      expect(breaker.getState().failures).toBe(0);
    });

    it("should open circuit after reaching failure threshold", async () => {
      const breaker = createCircuitBreaker({ failureThreshold: 2 });

      // First failure
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail 1"))),
      ).rejects.toThrow("fail 1");

      // Second failure - should open circuit
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail 2"))),
      ).rejects.toThrow("fail 2");

      expect(breaker.getState().state).toBe(CircuitState.OPEN);
    });
  });

  describe("OPEN state", () => {
    it("should reject requests immediately in OPEN state", async () => {
      const breaker = createCircuitBreaker({ failureThreshold: 1 });

      // Trigger open state
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail"))),
      ).rejects.toThrow("fail");

      expect(breaker.getState().state).toBe(CircuitState.OPEN);

      // Should reject immediately
      await expect(
        breaker.execute(() => Promise.resolve("success")),
      ).rejects.toThrow(CircuitBreakerOpenError);
    });

    it("should transition to HALF_OPEN after reset timeout", async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 1,
        resetTimeoutMs: 5000,
      });

      // Trigger open state
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail"))),
      ).rejects.toThrow("fail");

      expect(breaker.getState().state).toBe(CircuitState.OPEN);

      // Advance time past reset timeout
      vi.advanceTimersByTime(5001);

      // Next call should be allowed (HALF_OPEN)
      const result = await breaker.execute(() => Promise.resolve("success"));
      expect(result).toBe("success");
    });

    it("should include correct status code in CircuitBreakerOpenError", () => {
      const error = new CircuitBreakerOpenError("Service unavailable");
      expect(error.statusCode).toBe(503);
      expect(error.name).toBe("CircuitBreakerOpenError");
    });
  });

  describe("HALF_OPEN state", () => {
    it("should allow limited calls in HALF_OPEN state", async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 1,
        resetTimeoutMs: 5000,
        halfOpenMaxCalls: 2,
      });

      // Trigger open state
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail"))),
      ).rejects.toThrow("fail");

      // Advance to HALF_OPEN
      vi.advanceTimersByTime(5001);

      // First call should succeed
      const result1 = await breaker.execute(() => Promise.resolve("success1"));
      expect(result1).toBe("success1");

      // Second call should succeed
      const result2 = await breaker.execute(() => Promise.resolve("success2"));
      expect(result2).toBe("success2");

      // Circuit should be CLOSED now (2 successes = halfOpenMaxCalls)
      expect(breaker.getState().state).toBe(CircuitState.CLOSED);
    });

    it("should open circuit again on failure in HALF_OPEN state", async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 1,
        resetTimeoutMs: 5000,
        halfOpenMaxCalls: 2,
      });

      // Trigger open state
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail"))),
      ).rejects.toThrow("fail");

      // Advance to HALF_OPEN
      vi.advanceTimersByTime(5001);

      // Failure in HALF_OPEN should open circuit again
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail again"))),
      ).rejects.toThrow("fail again");

      expect(breaker.getState().state).toBe(CircuitState.OPEN);
    });

    it("should reject calls when HALF_OPEN max calls reached", async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 1,
        resetTimeoutMs: 5000,
        halfOpenMaxCalls: 2,
      });

      // Trigger open state
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail"))),
      ).rejects.toThrow("fail");

      // Advance to HALF_OPEN
      vi.advanceTimersByTime(5001);

      // First call should be allowed
      const result1 = await breaker.execute(() => Promise.resolve("success1"));
      expect(result1).toBe("success1");

      // Second call should be allowed (still in HALF_OPEN with 1 success)
      const result2 = await breaker.execute(() => Promise.resolve("success2"));
      expect(result2).toBe("success2");

      // Circuit should be CLOSED now (2 successes = halfOpenMaxCalls)
      expect(breaker.getState().state).toBe(CircuitState.CLOSED);
    });
  });

  describe("getState", () => {
    it("should return correct metrics", async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 2,
        resetTimeoutMs: 10000,
      });

      // Initial state
      let state = breaker.getState();
      expect(state.state).toBe(CircuitState.CLOSED);
      expect(state.failures).toBe(0);
      expect(state.successes).toBe(0);
      expect(state.lastFailureTime).toBeNull();

      // After failure
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail"))),
      ).rejects.toThrow("fail");

      state = breaker.getState();
      expect(state.failures).toBe(1);
      expect(state.lastFailureTime).toBeGreaterThan(0);

      // After second failure (OPEN state)
      await expect(
        breaker.execute(() => Promise.reject(new Error("fail"))),
      ).rejects.toThrow("fail");

      state = breaker.getState();
      expect(state.state).toBe(CircuitState.OPEN);
      expect(state.nextAttempt).toBeGreaterThan(0);
    });
  });

  describe("concurrent operations", () => {
    it("should handle multiple concurrent executions", async () => {
      const breaker = createCircuitBreaker({ failureThreshold: 5 });

      const promises = Array.from({ length: 5 }, (_, i) =>
        breaker.execute(() => Promise.resolve(`result-${i}`)),
      );

      const results = await Promise.all(promises);
      expect(results).toEqual([
        "result-0",
        "result-1",
        "result-2",
        "result-3",
        "result-4",
      ]);
    });
  });
});
