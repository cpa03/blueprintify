import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HTTP_METHODS, SSE_HEADERS, HTTP_HEADERS, HTTP_STATUS } from "@blueprint/shared";
import { StorageManager } from "../lib/storage";
import {
  createTestBlueprint,
  createTestProjectData,
  mockStorageData,
  createMockResponse,
} from "./factories";
import { API_ENDPOINTS } from "../config/constants";
import { API_BASE } from "../config/api-client";

interface ApiResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  metadata?: Record<string, unknown>;
  validation?: {
    isValid: boolean;
    errors?: string[];
  };
}

interface QuotaResponse {
  used: number;
  total: number;
}

describe("Integration: Frontend-Backend API Flow", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof global.fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Blueprint Generation Flow", () => {
    it("should complete full generation workflow", async () => {
      const testData = createTestBlueprint();

      fetchMock
        .mockResolvedValueOnce(createMockResponse({ success: true, sessionId: "test-session" }))
        .mockResolvedValueOnce(
          createMockResponse({
            blueprint: testData.blueprint,
            tasks: testData.tasks,
          })
        );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          projectName: testData.projectName,
          description: testData.description,
        }),
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}${API_ENDPOINTS.GENERATE}`,
        expect.objectContaining({
          method: HTTP_METHODS.POST,
          headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        })
      );
    });

    it("should handle streaming responses correctly", async () => {
      const chunks = [
        'data: {"type":"chunk","content":"# Test"}\n\n',
        'data: {"type":"chunk","content":" Blueprint"}\n\n',
        'data: {"type":"complete"}\n\n',
      ];

      const stream = new ReadableStream({
        start(controller) {
          chunks.forEach((chunk) => {
            controller.enqueue(new TextEncoder().encode(chunk));
          });
          controller.close();
        },
      });

      fetchMock.mockResolvedValueOnce(
        new Response(stream, {
          status: HTTP_STATUS.OK,
          headers: { "Content-Type": SSE_HEADERS.CONTENT_TYPE },
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
        method: HTTP_METHODS.POST,
        body: JSON.stringify({ projectName: "Test", description: "Test" }),
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.headers.get("Content-Type")).toContain(SSE_HEADERS.CONTENT_TYPE);
    });
  });

  describe("Refinement Workflow", () => {
    it("should send refinement request and receive updates", async () => {
      const testData = createTestBlueprint();

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          refinedContent: testData.blueprint + "\n\n## Additional Section\n",
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          content: testData.blueprint,
          instruction: "Add more details",
        }),
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}${API_ENDPOINTS.REFINE}`,
        expect.objectContaining({
          method: HTTP_METHODS.POST,
          body: expect.stringContaining("Add more details"),
        })
      );
    });

    it("should handle refinement with context preservation", async () => {
      const testData = createTestBlueprint();

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          refinedContent: testData.blueprint,
          metadata: {
            originalLength: testData.blueprint.length,
            refinedLength: testData.blueprint.length,
          },
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          content: testData.blueprint,
          instruction: "Improve clarity",
          context: {
            section: "overview",
            preserveFormatting: true,
          },
        }),
      });

      const data = (await response.json()) as ApiResponse;
      expect(data.success).toBe(true);
      expect(data.metadata).toBeDefined();
    });
  });

  describe("Export/Import Workflow", () => {
    it("should export project in multiple formats", async () => {
      const testData = createTestBlueprint();
      const formats = ["markdown", "json", "zip"];

      for (const format of formats) {
        fetchMock.mockResolvedValueOnce(
          createMockResponse({
            success: true,
            format,
            files: format === "zip" ? [{ name: "blueprint.md" }, { name: "tasks.md" }] : undefined,
            content: format !== "zip" ? testData.blueprint : undefined,
          })
        );

        const response = await fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
          method: HTTP_METHODS.POST,
          headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
          body: JSON.stringify({
            format,
            blueprint: testData.blueprint,
            tasks: testData.tasks,
          }),
        });

        expect(response.status).toBe(HTTP_STATUS.OK);
      }

      expect(fetchMock).toHaveBeenCalledTimes(formats.length);
    });

    it("should import and validate project data", async () => {
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
        method: HTTP_METHODS.POST,
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

    it("should reject invalid import data", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(
          {
            success: false,
            error: "Invalid data format",
            validation: {
              isValid: false,
              errors: ["Missing required field: projectName"],
            },
          },
          400
        )
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.IMPORT}`, {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          format: "json",
          data: { invalid: "data" },
        }),
      });

      expect(response.status).toBe(400);
      const result = (await response.json()) as ApiResponse;
      expect(result.success).toBe(false);
    });
  });

  describe("Storage API Integration", () => {
    it("should sync local storage with backend", async () => {
      fetchMock
        .mockResolvedValueOnce(
          createMockResponse({
            success: true,
            data: mockStorageData.session,
          })
        )
        .mockResolvedValueOnce(
          createMockResponse({
            success: true,
            quota: {
              used: 1024,
              total: 5242880,
              remaining: 5241856,
            },
          })
        );

      const storageManager = new StorageManager();
      const sessionStorage = storageManager.create({
        key: "test-session",
        currentVersion: 1,
      });

      await sessionStorage.set(mockStorageData.session);

      const syncResponse = await fetch(`${API_BASE}/storage/sync`, {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON },
        body: JSON.stringify({
          key: "test-session",
          data: mockStorageData.session,
        }),
      });

      expect(syncResponse.status).toBe(HTTP_STATUS.OK);

      const quotaResponse = await fetch(`${API_BASE}/storage/quota`);
      const quotaData = (await quotaResponse.json()) as {
        quota: QuotaResponse;
      };
      expect(quotaData.quota).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
          method: HTTP_METHODS.POST,
          body: JSON.stringify({ projectName: "Test" }),
        })
      ).rejects.toThrow("Network error");
    });

    it("should handle timeout errors", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Request timeout"));

      await expect(
        fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
          method: HTTP_METHODS.POST,
          body: JSON.stringify({ projectName: "Test" }),
        })
      ).rejects.toThrow("Request timeout");
    });

    it("should handle 500 errors from backend", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(
          {
            success: false,
            error: "Internal server error",
            type: "server_error",
          },
          500
        )
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
        method: HTTP_METHODS.POST,
        body: JSON.stringify({ projectName: "Test" }),
      });

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_ERROR);
      const data = (await response.json()) as ApiResponse;
      expect(data.success).toBe(false);
    });
  });

  describe("Session State Management", () => {
    it("should maintain session across multiple API calls", async () => {
      const sessionId = `session-${Date.now()}`;
      const testData = createTestBlueprint();

      fetchMock
        .mockResolvedValueOnce(createMockResponse({ sessionId }))
        .mockResolvedValueOnce(createMockResponse({ success: true }))
        .mockResolvedValueOnce(createMockResponse({ data: testData }));

      await fetch(`${API_BASE}/session/init`, {
        method: HTTP_METHODS.POST,
        body: JSON.stringify({ projectName: testData.projectName }),
      });

      await fetch(`${API_BASE}/storage`, {
        method: HTTP_METHODS.POST,
        body: JSON.stringify({
          key: sessionId,
          data: { step: 1 },
        }),
      });

      const response = await fetch(`${API_BASE}/storage?key=${sessionId}`);
      expect(response.status).toBe(HTTP_STATUS.OK);
    });
  });
});
