/**
 * SSE Stream Utilities Tests
 *
 * Tests for SSE formatting, response creation, and async generator streaming.
 * Verifies correct SSE protocol format and proper event handling.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEV_DEFAULTS, SSE_HEADERS, CORS_DEFAULTS, HTTP_METHODS } from "@blueprint/shared";
import { formatSSE, createSSEResponse, createStreamFromGenerator } from "./stream";
import { setEnvConfig, SSE_CORS_HEADERS } from "../config/constants";
import type { SSEMessage } from "./stream";

function makeMinimalEnvConfig(): Record<string, unknown> {
  return {
    CORS_ORIGIN: DEV_DEFAULTS.PLAYWRIGHT_TEST_URL,
    CORS_MAX_AGE: 86400,
    OPENAI_API_KEY: "test-key",
    OPENAI_MODEL: "gpt-4o-mini",
    OPENAI_TIMEOUT_MS: 30000,
    OPENAI_MAX_TOKENS: 4096,
    OPENAI_TEMPERATURE: 0.7,
    API_VERSION: "1.0.0",
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_STRICT_MAX: 30,
    RATE_LIMIT_STANDARD_MAX: 100,
    RATE_LIMIT_LENIENT_MAX: 300,
    STORAGE_QUOTA_MB: 5,
    GITHUB_URL: "https://github.com/test",
    PROJECT_HOMEPAGE_URL: "https://test.example.com",
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: 5,
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: 30000,
    CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS: 3,
  };
}

describe("formatSSE", () => {
  it("should format data-only SSE message", () => {
    const message: SSEMessage = { data: "hello world" };
    expect(formatSSE(message)).toBe("data: hello world\n\n");
  });

  it("should format SSE message with event type", () => {
    const message: SSEMessage = { event: "update", data: "payload" };
    expect(formatSSE(message)).toBe("event: update\ndata: payload\n\n");
  });

  it("should format SSE message with ID", () => {
    const message: SSEMessage = { id: "42", data: "state" };
    expect(formatSSE(message)).toBe("id: 42\ndata: state\n\n");
  });

  it("should format SSE message with event, id, and data", () => {
    const message: SSEMessage = { event: "msg", id: "1", data: "content" };
    expect(formatSSE(message)).toBe("event: msg\nid: 1\ndata: content\n\n");
  });

  it("should split multi-line data into separate data: lines", () => {
    const message: SSEMessage = { data: "line1\nline2\nline3" };
    expect(formatSSE(message)).toBe("data: line1\ndata: line2\ndata: line3\n\n");
  });

  it("should handle empty data string", () => {
    const message: SSEMessage = { data: "" };
    expect(formatSSE(message)).toBe("data: \n\n");
  });

  it("should handle JSON data without corruption", () => {
    const jsonData = JSON.stringify({ type: "content", text: "hello" });
    const message: SSEMessage = { data: jsonData };
    const result = formatSSE(message);
    expect(result).toContain('data: {"type":"content","text":"hello"}');
    expect(result).toMatch(/\n\n$/);
  });

  it("should not include event line if event is undefined", () => {
    const message: SSEMessage = { data: "test" };
    expect(formatSSE(message)).not.toContain("event:");
  });

  it("should not include id line if id is undefined", () => {
    const message: SSEMessage = { data: "test" };
    expect(formatSSE(message)).not.toContain("id:");
  });
});

describe("createSSEResponse", () => {
  beforeEach(() => {
    setEnvConfig(makeMinimalEnvConfig() as never);
  });

  it("should return a Response object", () => {
    const stream = new ReadableStream({
      start(c) {
        c.close();
      },
    });
    const response = createSSEResponse(stream);
    expect(response).toBeInstanceOf(Response);
  });

  it("should set correct SSE content type header", () => {
    const stream = new ReadableStream({
      start(c) {
        c.close();
      },
    });
    const response = createSSEResponse(stream);
    expect(response.headers.get("Content-Type")).toBe(SSE_HEADERS.CONTENT_TYPE);
  });

  it("should set cache-control to no-cache", () => {
    const stream = new ReadableStream({
      start(c) {
        c.close();
      },
    });
    const response = createSSEResponse(stream);
    expect(response.headers.get("Cache-Control")).toBe(SSE_HEADERS.CACHE_CONTROL);
  });

  it("should set connection to keep-alive", () => {
    const stream = new ReadableStream({
      start(c) {
        c.close();
      },
    });
    const response = createSSEResponse(stream);
    expect(response.headers.get("Connection")).toBe(SSE_HEADERS.CONNECTION);
  });

  it("should set X-Accel-Buffering to no", () => {
    const stream = new ReadableStream({
      start(c) {
        c.close();
      },
    });
    const response = createSSEResponse(stream);
    expect(response.headers.get("X-Accel-Buffering")).toBe("no");
  });

  it("should set CORS origin header from config", () => {
    const stream = new ReadableStream({
      start(c) {
        c.close();
      },
    });
    const response = createSSEResponse(stream);
    expect(response.headers.get(SSE_CORS_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN)).toBe(
      DEV_DEFAULTS.PLAYWRIGHT_TEST_URL
    );
  });

  it("should set CORS methods header", () => {
    const stream = new ReadableStream({
      start(c) {
        c.close();
      },
    });
    const response = createSSEResponse(stream);
    const methods = response.headers.get(SSE_CORS_HEADERS.ACCESS_CONTROL_ALLOW_METHODS);
    expect(methods).toContain(HTTP_METHODS.GET);
    expect(methods).toContain(HTTP_METHODS.POST);
  });

  it("should set CORS headers header", () => {
    const stream = new ReadableStream({
      start(c) {
        c.close();
      },
    });
    const response = createSSEResponse(stream);
    const headers = response.headers.get(SSE_CORS_HEADERS.ACCESS_CONTROL_ALLOW_HEADERS);
    expect(headers).toContain("Content-Type");
    expect(headers).toContain(CORS_DEFAULTS.ALLOW_HEADERS[1]);
  });
});

describe("createStreamFromGenerator", () => {
  beforeEach(() => {
    setEnvConfig(makeMinimalEnvConfig() as never);
  });

  it("should create a ReadableStream", () => {
    async function* gen() {
      /* empty */
    }
    const stream = createStreamFromGenerator(gen());
    expect(stream).toBeInstanceOf(ReadableStream);
  });

  it("should emit content events from generator chunks", async () => {
    async function* gen() {
      yield "hello";
      yield "world";
    }

    const stream = createStreamFromGenerator(gen());
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value));
    }

    const fullOutput = chunks.join("");
    expect(fullOutput).toContain('"type":"content"');
    expect(fullOutput).toContain('"content":"hello"');
    expect(fullOutput).toContain('"content":"world"');
  });

  it("should emit a done event after all content", async () => {
    async function* gen() {
      yield "only chunk";
    }

    const stream = createStreamFromGenerator(gen());
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullOutput = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullOutput += decoder.decode(value);
    }

    expect(fullOutput).toContain('"type":"done"');
  });

  it("should call onComplete callback after successful completion", async () => {
    const onComplete = vi.fn();

    async function* gen() {
      yield "data";
    }

    const stream = createStreamFromGenerator(gen(), onComplete);
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      decoder.decode(value);
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("should emit error event when generator throws", async () => {
    async function* gen() {
      throw new Error("stream failure");
      yield "unreachable";
    }

    const stream = createStreamFromGenerator(gen());
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullOutput = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullOutput += decoder.decode(value);
    }

    expect(fullOutput).toContain('"type":"error"');
    expect(fullOutput).toContain("stream failure");
    expect(fullOutput).not.toContain("unreachable");
  });

  it("should format each chunk as proper SSE", async () => {
    async function* gen() {
      yield "chunk";
    }

    const stream = createStreamFromGenerator(gen());
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullOutput = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullOutput += decoder.decode(value);
    }

    // Each message should end with \n\n
    const messages = fullOutput.split("\n\n").filter(Boolean);
    expect(messages.length).toBeGreaterThanOrEqual(2); // content + done
    for (const msg of messages) {
      expect(msg).toMatch(/^(event: .+\n)?(id: .+\n)?(data: .+\n?)+$/);
    }
  });

  it("should handle empty generator without errors", async () => {
    async function* gen() {
      /* no yields */
    }

    const stream = createStreamFromGenerator(gen());
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullOutput = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullOutput += decoder.decode(value);
    }

    // Should only have the done event
    expect(fullOutput).toContain('"type":"done"');
  });

  it("should not call onComplete on generator error", async () => {
    const onComplete = vi.fn();

    // eslint-disable-next-line require-yield
    async function* gen() {
      throw new Error("fail");
    }

    const stream = createStreamFromGenerator(gen(), onComplete);
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      decoder.decode(value);
    }

    expect(onComplete).not.toHaveBeenCalled();
  });
});
