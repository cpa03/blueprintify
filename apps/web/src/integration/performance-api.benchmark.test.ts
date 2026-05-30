import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SSE_HEADERS, HTTP_HEADERS } from "@blueprint/shared";
import { API_ENDPOINTS } from "../config/constants";
import { API_BASE } from "../config/api-client";
import { createTestBlueprint, createLargeBlueprint, createMockResponse } from "./factories";

async function measureAsync<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

describe("Performance Benchmarks: API Integration", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Blueprint Generation Performance", () => {
    it("should complete generation request under 500ms", async () => {
      const testData = createTestBlueprint();

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          blueprint: testData.blueprint,
        })
      );

      const { duration } = await measureAsync(() =>
        fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
          method: "POST",
          headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
          body: JSON.stringify({
            projectName: testData.projectName,
            description: testData.description,
          }),
        })
      );

      expect(duration).toBeLessThan(500);
    });

    it("should handle streaming response setup under 100ms", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: {"type":"chunk","content":"Test"}\n\n')
          );
          controller.close();
        },
      });

      fetchMock.mockResolvedValueOnce(
        new Response(stream, {
          status: 200,
          headers: { "Content-Type": SSE_HEADERS.CONTENT_TYPE },
        })
      );

      const { duration } = await measureAsync(() =>
        fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
          method: "POST",
          body: JSON.stringify({ projectName: "Test", description: "Test" }),
        })
      );

      expect(duration).toBeLessThan(100);
    });

    it("should handle large blueprint generation efficiently", async () => {
      const largeData = createLargeBlueprint(50); // 50KB

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          blueprint: largeData.blueprint,
        })
      );

      const { duration } = await measureAsync(() =>
        fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
          method: "POST",
          body: JSON.stringify({
            projectName: largeData.projectName,
            description: largeData.description,
          }),
        })
      );

      expect(duration).toBeLessThan(1000);
    });
  });

  describe("Refinement API Performance", () => {
    it("should complete refinement request under 300ms", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          refinedContent: "Refined content",
        })
      );

      const { duration } = await measureAsync(() =>
        fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
          method: "POST",
          headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
          body: JSON.stringify({
            content: "Test content",
            instruction: "Improve",
          }),
        })
      );

      expect(duration).toBeLessThan(300);
    });

    it("should handle concurrent refinement requests efficiently", async () => {
      fetchMock.mockResolvedValue(createMockResponse({ success: true }));

      const startTime = performance.now();

      const requests = Array.from({ length: 5 }, () =>
        fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
          method: "POST",
          body: JSON.stringify({ content: "Test", instruction: "Improve" }),
        })
      );

      await Promise.all(requests);

      const totalDuration = performance.now() - startTime;
      const averageDuration = totalDuration / 5;

      expect(averageDuration).toBeLessThan(200);
    });
  });

  describe("Export/Import Performance", () => {
    it("should export small project under 200ms", async () => {
      const testData = createTestBlueprint();

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          format: "json",
          data: testData,
        })
      );

      const { duration } = await measureAsync(() =>
        fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
          method: "POST",
          headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
          body: JSON.stringify({
            format: "json",
            blueprint: testData.blueprint,
            tasks: testData.tasks,
          }),
        })
      );

      expect(duration).toBeLessThan(200);
    });

    it("should export large project under 1000ms", async () => {
      const largeData = createLargeBlueprint(100);

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          format: "json",
          data: largeData,
        })
      );

      const { duration } = await measureAsync(() =>
        fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
          method: "POST",
          body: JSON.stringify({
            format: "json",
            blueprint: largeData.blueprint,
          }),
        })
      );

      expect(duration).toBeLessThan(1000);
    });

    it("should import project under 300ms", async () => {
      const testData = createTestBlueprint();

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: testData,
          validation: { isValid: true },
        })
      );

      const { duration } = await measureAsync(() =>
        fetch(`${API_BASE}${API_ENDPOINTS.IMPORT}`, {
          method: "POST",
          headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
          body: JSON.stringify({
            format: "json",
            data: testData,
          }),
        })
      );

      expect(duration).toBeLessThan(300);
    });
  });

  describe("Storage API Performance", () => {
    it("should get quota information under 100ms", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          quota: { used: 1024, total: 5242880 },
        })
      );

      const { duration } = await measureAsync(() => fetch(`${API_BASE}/storage/quota`));

      expect(duration).toBeLessThan(100);
    });

    it("should sync storage under 200ms", async () => {
      fetchMock.mockResolvedValueOnce(createMockResponse({ success: true }));

      const { duration } = await measureAsync(() =>
        fetch(`${API_BASE}/storage/sync`, {
          method: "POST",
          headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
          body: JSON.stringify({
            key: "test-session",
            data: { step: 1 },
          }),
        })
      );

      expect(duration).toBeLessThan(200);
    });
  });

  describe("End-to-End Workflow Performance", () => {
    it("should complete full generate-refine-export workflow under 2000ms", async () => {
      const testData = createTestBlueprint();

      fetchMock
        .mockResolvedValueOnce(createMockResponse({ blueprint: testData.blueprint }))
        .mockResolvedValueOnce(createMockResponse({ refinedContent: testData.blueprint }))
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      const startTime = performance.now();

      // Generate
      await fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
        method: "POST",
        body: JSON.stringify({
          projectName: testData.projectName,
          description: testData.description,
        }),
      });

      // Refine
      await fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
        method: "POST",
        body: JSON.stringify({
          content: testData.blueprint,
          instruction: "Improve",
        }),
      });

      // Export
      await fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
        method: "POST",
        body: JSON.stringify({
          format: "json",
          blueprint: testData.blueprint,
        }),
      });

      const totalDuration = performance.now() - startTime;
      expect(totalDuration).toBeLessThan(2000);
    });

    it("should handle rapid sequential requests efficiently", async () => {
      fetchMock.mockResolvedValue(createMockResponse({ success: true }));

      const iterations = 10;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        await fetch(`${API_BASE}/storage/quota`);
      }

      const totalDuration = performance.now() - startTime;
      const averageDuration = totalDuration / iterations;

      expect(averageDuration).toBeLessThan(50);
    });
  });
});
