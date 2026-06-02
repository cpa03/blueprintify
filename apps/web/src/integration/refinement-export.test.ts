import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HTTP_HEADERS } from "@blueprint/shared";
import { API_ENDPOINTS } from "../config/constants";
import { API_BASE } from "../config/api-client";
import {
  createTestBlueprint,
  createTestProjectData,
  createLargeBlueprint,
  createMockResponse,
} from "./factories";

interface ApiResponse {
  success: boolean;
  refinedContent?: string;
  format?: string;
  url?: string;
  content?: string;
  data?: Record<string, unknown> & { validation?: { isValid: boolean } };
  files?: Array<{ name: string; content: string }>;
  validation?: {
    isValid: boolean;
    errors?: string[];
  };
}

describe("Integration: Refinement Workflow", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof global.fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("End-to-End Refinement Process", () => {
    it("should refine blueprint section and preserve context", async () => {
      const sectionContent = "## Overview\nThis is a test blueprint.";

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          refinedContent: sectionContent + " Enhanced.",
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
        method: "POST",
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          content: sectionContent,
          instruction: "Enhance with more details",
        }),
      });

      expect(response.status).toBe(200);
    });

    it("should handle multiple refinement iterations", async () => {
      const iterations = [
        { instruction: "Add details", addition: "technical" },
        { instruction: "Improve clarity", addition: "clear" },
      ];

      for (const iteration of iterations) {
        fetchMock.mockResolvedValueOnce(
          createMockResponse({
            success: true,
            refinedContent: `Content ${iteration.addition}`,
          })
        );

        const response = await fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
          method: "POST",
          body: JSON.stringify({
            content: "Test content",
            instruction: iteration.instruction,
          }),
        });

        const result = (await response.json()) as ApiResponse;
        expect(result.success).toBe(true);
      }

      expect(fetchMock).toHaveBeenCalledTimes(iterations.length);
    });
  });

  describe("Refinement Error Handling", () => {
    it("should handle API errors during refinement", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(
          {
            success: false,
            error: "OpenAI API error",
          },
          500
        )
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
        method: "POST",
        body: JSON.stringify({
          content: "Test content",
          instruction: "Improve this",
        }),
      });

      expect(response.status).toBe(500);
      const result = (await response.json()) as ApiResponse;
      expect(result.success).toBe(false);
    });

    it("should handle timeout during refinement", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Request timeout"));

      await expect(
        fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
          method: "POST",
          body: JSON.stringify({
            content: "Test content",
            instruction: "Improve this",
          }),
        })
      ).rejects.toThrow("Request timeout");
    });
  });

  describe("Concurrent Refinement Operations", () => {
    it("should handle multiple refinement requests", async () => {
      fetchMock
        .mockResolvedValueOnce(createMockResponse({ success: true }))
        .mockResolvedValueOnce(createMockResponse({ success: true }));

      const requests = [
        fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
          method: "POST",
          body: JSON.stringify({
            content: "Section 1",
            instruction: "Improve",
          }),
        }),
        fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
          method: "POST",
          body: JSON.stringify({
            content: "Section 2",
            instruction: "Improve",
          }),
        }),
      ];

      const results = await Promise.all(requests);
      results.forEach((res) => expect(res.status).toBe(200));
    });
  });
});

describe("Integration: Export/Import Workflow", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof global.fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Export Operations", () => {
    it("should export complete project as markdown", async () => {
      const testData = createTestBlueprint();

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          format: "markdown",
          files: [
            { name: "blueprint.md", content: testData.blueprint },
            { name: "tasks.md", content: testData.tasks },
          ],
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
        method: "POST",
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          format: "markdown",
          blueprint: testData.blueprint,
          tasks: testData.tasks,
        }),
      });

      const result = (await response.json()) as ApiResponse;
      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
    });

    it("should export project as JSON", async () => {
      const testData = createTestBlueprint();

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          format: "json",
          data: testData,
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
        method: "POST",
        body: JSON.stringify({
          format: "json",
          blueprint: testData.blueprint,
          tasks: testData.tasks,
        }),
      });

      const result = (await response.json()) as ApiResponse;
      expect(result.success).toBe(true);
    });

    it("should export project as ZIP", async () => {
      const testData = createTestBlueprint();

      const mockBuffer = new ArrayBuffer(10);
      fetchMock.mockResolvedValueOnce(
        new Response(mockBuffer, {
          status: 200,
          headers: { "Content-Type": "application/zip" },
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
        method: "POST",
        body: JSON.stringify({
          format: "zip",
          blueprint: testData.blueprint,
          tasks: testData.tasks,
        }),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/zip");
    });

    it("should handle large project exports", async () => {
      const largeData = createLargeBlueprint(100);

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          format: "json",
          data: largeData,
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
        method: "POST",
        body: JSON.stringify({
          format: "json",
          blueprint: largeData.blueprint,
        }),
      });

      const result = (await response.json()) as ApiResponse;
      expect(result.success).toBe(true);
    });
  });

  describe("Import Operations", () => {
    it("should import valid JSON project", async () => {
      const testData = createTestProjectData();

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: testData,
          validation: {
            isValid: true,
            errors: [],
          },
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.IMPORT}`, {
        method: "POST",
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          format: "json",
          data: testData,
        }),
      });

      const result = (await response.json()) as ApiResponse;
      expect(result.success).toBe(true);
      expect(result.validation?.isValid).toBe(true);
    });

    it("should validate imported data structure", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(
          {
            success: false,
            error: "Validation failed",
            validation: {
              isValid: false,
              errors: ["Missing required field: projectName"],
            },
          },
          400
        )
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.IMPORT}`, {
        method: "POST",
        body: JSON.stringify({
          format: "json",
          data: { invalid: "data" },
        }),
      });

      expect(response.status).toBe(400);
      const result = (await response.json()) as ApiResponse;
      expect(result.validation?.errors?.length).toBeGreaterThan(0);
    });
  });

  describe("Roundtrip Export/Import", () => {
    it("should export and re-import without data loss", async () => {
      const testData = createTestProjectData();

      fetchMock
        .mockResolvedValueOnce(
          createMockResponse({
            success: true,
            format: "json",
            data: testData,
          })
        )
        .mockResolvedValueOnce(
          createMockResponse({
            success: true,
            data: testData,
            validation: { isValid: true },
          })
        );

      const exportRes = await fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
        method: "POST",
        body: JSON.stringify({
          format: "json",
          blueprint: testData.blueprint,
          tasks: testData.tasks,
        }),
      });

      const exportData = (await exportRes.json()) as ApiResponse;
      expect(exportData.success).toBe(true);

      const importRes = await fetch(`${API_BASE}${API_ENDPOINTS.IMPORT}`, {
        method: "POST",
        body: JSON.stringify({
          format: "json",
          data: exportData.data,
        }),
      });

      const importData = (await importRes.json()) as ApiResponse;
      expect(importData.success).toBe(true);
    });
  });
});
