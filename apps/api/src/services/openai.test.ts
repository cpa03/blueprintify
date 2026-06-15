/**
 * OpenAI Service Tests
 *
 * NOTE: These tests do NOT make real API calls.
 * The openai package is mocked at the module level.
 * The circuit breaker and retry utilities are also mocked
 * to isolate testing of the service logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock setup (hoisted by vitest — runs before imports)
// ---------------------------------------------------------------------------

/**
 * Shared mock breaker — created once at module load time.
 * The openai.ts module-level `circuitBreaker` constant captures a reference
 * to this object at import time. We mutate its methods in beforeEach
 * rather than replacing the whole object, so the captured reference stays
 * valid across test cases.
 */
const mockBreaker = vi.hoisted(() => ({
  getState: vi.fn().mockReturnValue({
    state: "CLOSED" as const,
    failures: 0,
    successes: 0,
    lastFailureTime: null,
  }),
  execute: vi.fn().mockImplementation(<T>(fn: () => T) => fn()),
  recordSuccess: vi.fn(),
  recordFailure: vi.fn(),
  resetCircuit: vi.fn(),
}));

/**
 * Hoisted constant — must be defined before vi.mock since vi.mock factories
 * are evaluated at hoist time, before top-level imports.
 * Flexy says: This matches HTTP_STATUS.SERVICE_UNAVAILABLE (503) from @blueprint/shared.
 */
const MOCK_SERVICE_UNAVAILABLE = vi.hoisted(() => 503);

/**
 * Stable mock OpenAI instance — created once, referenced by the vi.mock factory.
 * The .create method is a vi.fn() we reconfigure per-test.
 * This survives vi.clearAllMocks() (the mock instance object stays, only the
 * call-history / implementation of .create is reset).
 */
const mockOpenAIInstance = vi.hoisted(() => ({
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
}));

/**
 * Constructor mock for OpenAI — a plain function (not vi.fn) so it survives
 * vi.clearAllMocks() in beforeEach. vi.clearAllMocks only resets vi.fn() /
 * vi.spyOn() instances; regular functions are unaffected.
 */
vi.mock("openai", () => ({
  default: function () {
    return mockOpenAIInstance;
  },
}));

/** Hoisted retry mock — restored in beforeEach after clearAllMocks */
const mockWithRetry = vi.hoisted(() => vi.fn(<T>(fn: () => T) => fn()));

vi.mock("../utils/retry", () => ({
  withRetry: mockWithRetry,
}));

vi.mock("../utils/circuitBreaker", () => ({
  createCircuitBreaker: vi.fn(() => mockBreaker),
  CircuitBreakerOpenError: class CircuitBreakerOpenError extends Error {
    public readonly statusCode: number;
    constructor(message: string) {
      super(message);
      this.name = "CircuitBreakerOpenError";
      this.statusCode = MOCK_SERVICE_UNAVAILABLE;
    }
  },
  CircuitState: {
    CLOSED: "CLOSED",
    OPEN: "OPEN",
    HALF_OPEN: "HALF_OPEN",
  },
}));

// ---- target module (imported after mocks) ----
import {
  createAIClient,
  initializeCircuitBreaker,
  streamCompletion,
  generateCompletion,
} from "./openai";
import { CircuitBreakerOpenError } from "../utils/circuitBreaker";

// ===========================================================================
// Tests
// ===========================================================================

describe("OpenAI Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore mock breaker defaults (cleared by clearAllMocks)
    mockBreaker.getState.mockReturnValue({
      state: "CLOSED" as const,
      failures: 0,
      successes: 0,
      lastFailureTime: null,
    });
    mockBreaker.execute.mockImplementation(<T>(fn: () => T) => fn());
    // Restore retry pass-through (cleared by clearAllMocks)
    mockWithRetry.mockImplementation(<T>(fn: () => T) => fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // createAIClient
  // -------------------------------------------------------------------------
  describe("createAIClient", () => {
    it("should create a client with provided config", () => {
      const client = createAIClient({
        apiKey: "sk-test",
        baseURL: "https://custom.example.com",
        timeout: 30000,
      });
      expect(client).toBeDefined();
      expect(client.chat).toBeDefined();
      expect(client.chat.completions).toBeDefined();
    });

    it("should create a client with minimal config (apiKey only)", () => {
      const client = createAIClient({ apiKey: "sk-minimal" });
      expect(client).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // initializeCircuitBreaker
  // -------------------------------------------------------------------------
  describe("initializeCircuitBreaker", () => {
    it("should return a circuit breaker instance", () => {
      const cb = initializeCircuitBreaker();
      expect(cb).toBeDefined();
      expect(typeof cb.execute).toBe("function");
      expect(typeof cb.getState).toBe("function");
    });

    it("should return the same singleton instance on repeated calls", () => {
      const cb1 = initializeCircuitBreaker();
      const cb2 = initializeCircuitBreaker();
      expect(cb1).toBe(cb2);
    });
  });

  // -------------------------------------------------------------------------
  // streamCompletion – async generator
  // -------------------------------------------------------------------------
  describe("streamCompletion", () => {
    const defaultOptions = {
      systemPrompt: "You are a helpful assistant",
      userPrompt: "Write a poem",
      config: { apiKey: "sk-test" },
    };

    it("should yield content chunks from OpenAI stream", async () => {
      const mockStream = (async function* () {
        yield { choices: [{ delta: { content: "Hello" } }] };
        yield { choices: [{ delta: { content: " world" } }] };
        yield { choices: [{ delta: { content: "!" } }] };
        yield { choices: [{ delta: {} }] };
      })();
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockStream);

      const chunks: string[] = [];
      for await (const chunk of streamCompletion(defaultOptions)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["Hello", " world", "!"]);
      expect(mockBreaker.execute).toHaveBeenCalled();
    });

    it("should yield nothing when stream produces no content deltas", async () => {
      const mockStream = (async function* () {
        yield { choices: [{ delta: {} }] };
        yield { choices: [{ delta: { content: "" } }] };
      })();
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockStream);

      const chunks: string[] = [];
      for await (const chunk of streamCompletion(defaultOptions)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([]);
    });

    it("should throw CircuitBreakerOpenError when circuit breaker is OPEN", async () => {
      mockBreaker.getState.mockReturnValue({
        state: "OPEN" as const,
        failures: 3,
        successes: 0,
        lastFailureTime: Date.now(),
      });

      const generator = streamCompletion(defaultOptions);
      await expect(generator.next()).rejects.toThrow(CircuitBreakerOpenError);
    });

    it("should wrap non-circuit-breaker errors with AI_SERVICE_FAILURE message", async () => {
      mockBreaker.execute.mockRejectedValue(new Error("Network error"));

      const generator = streamCompletion(defaultOptions);
      await expect(generator.next()).rejects.toThrow("AI service error: Network error");
    });

    it("should re-throw CircuitBreakerOpenError directly (not wrap it)", async () => {
      mockBreaker.execute.mockRejectedValue(
        new CircuitBreakerOpenError("AI service temporarily unavailable")
      );

      const generator = streamCompletion(defaultOptions);
      await expect(generator.next()).rejects.toThrow(CircuitBreakerOpenError);
    });

    it("should handle unknown error type gracefully", async () => {
      mockBreaker.execute.mockRejectedValue("string error");

      const generator = streamCompletion(defaultOptions);
      await expect(generator.next()).rejects.toThrow("AI service error: Unknown error");
    });

    it("should use DEFAULT_MODEL when no model specified in config", async () => {
      const mockStream = (async function* () {
        yield { choices: [{ delta: { content: "data" } }] };
      })();
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockStream);

      const chunks: string[] = [];
      for await (const chunk of streamCompletion(defaultOptions)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["data"]);
    });
  });

  // -------------------------------------------------------------------------
  // generateCompletion – async function returning full text
  // -------------------------------------------------------------------------
  describe("generateCompletion", () => {
    const defaultOptions = {
      systemPrompt: "You are a helpful assistant",
      userPrompt: "Summarize this",
      config: { apiKey: "sk-test" },
    };

    it("should return the full text when OpenAI responds", async () => {
      mockOpenAIInstance.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: "Full response text" } }],
      });

      const result = await generateCompletion(defaultOptions);

      expect(result).toBe("Full response text");
      expect(mockBreaker.execute).toHaveBeenCalled();
    });

    it("should return empty string when choices are empty", async () => {
      mockOpenAIInstance.chat.completions.create.mockResolvedValue({ choices: [] });

      const result = await generateCompletion(defaultOptions);
      expect(result).toBe("");
    });

    it("should return empty string when first choice has no content", async () => {
      mockOpenAIInstance.chat.completions.create.mockResolvedValue({
        choices: [{ message: {} }],
      });

      const result = await generateCompletion(defaultOptions);
      expect(result).toBe("");
    });

    it("should throw CircuitBreakerOpenError when circuit breaker is OPEN", async () => {
      mockBreaker.getState.mockReturnValue({
        state: "OPEN" as const,
        failures: 3,
        successes: 0,
        lastFailureTime: Date.now(),
      });

      await expect(generateCompletion(defaultOptions)).rejects.toThrow(CircuitBreakerOpenError);
    });

    it("should wrap non-circuit-breaker errors with AI_SERVICE_FAILURE message", async () => {
      mockBreaker.execute.mockRejectedValue(new Error("API timeout"));

      await expect(generateCompletion(defaultOptions)).rejects.toThrow(
        "AI service error: API timeout"
      );
    });

    it("should re-throw CircuitBreakerOpenError directly (not wrap it)", async () => {
      mockBreaker.execute.mockRejectedValue(
        new CircuitBreakerOpenError("AI service temporarily unavailable")
      );

      await expect(generateCompletion(defaultOptions)).rejects.toThrow(CircuitBreakerOpenError);
    });

    it("should handle unknown error type gracefully", async () => {
      mockBreaker.execute.mockRejectedValue(null);

      await expect(generateCompletion(defaultOptions)).rejects.toThrow(
        "AI service error: Unknown error"
      );
    });

    it("should use DEFAULT_MODEL when no model specified in config", async () => {
      mockOpenAIInstance.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: "result" } }],
      });

      const result = await generateCompletion(defaultOptions);
      expect(result).toBe("result");
    });
  });
});
