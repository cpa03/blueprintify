import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import { MOCK_ENV } from "../test-utils";
import { errorHandler } from "../middleware/errorHandler";
import generateRoute from "../routes/generate";
import refineRoute from "../routes/refine";
import exportRoute from "../routes/export";
import importRoute from "../routes/import";
import storageRoute from "../routes/storage";
import tasksRoute from "../routes/tasks";
import {
  setDefaultContainer,
  resetContainer,
  createMockContainer,
} from "../di/container";

interface ApiResponse {
  success: boolean;
  error?: {
    type: string;
  };
  data?: {
    projectName?: string;
  };
}

interface QuotaResponse {
  used: number;
  total: number;
}

describe("Integration: End-to-End M2 Workflows", () => {
  let app: Hono<{ Bindings: typeof MOCK_ENV }>;

  beforeEach(() => {
    vi.clearAllMocks();

    const mockContainer = createMockContainer();
    setDefaultContainer(mockContainer);

    app = new Hono<{ Bindings: typeof MOCK_ENV }>();
    app.route("/generate", generateRoute);
    app.route("/refine", refineRoute);
    app.route("/export", exportRoute);
    app.route("/import", importRoute);
    app.route("/storage", storageRoute);
    app.route("/tasks", tasksRoute);
    app.onError(errorHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetContainer();
  });

  describe("Workflow 1: Complete Blueprint Generation Flow", () => {
    it("should generate blueprint, then export it", async () => {
      const generateRes = await app.request(
        "/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: "Test Project",
            description: "A comprehensive test project for integration testing",
            techStack: [{ name: "React", category: "frontend" }],
          }),
        },
        MOCK_ENV,
      );

      expect(generateRes.status).toBe(200);
      expect(generateRes.headers.get("Content-Type")).toContain(
        "text/event-stream",
      );

      const exportRes = await app.request(
        "/export",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: "Test Project",
            format: "markdown",
            blueprint:
              "# Test Blueprint\n\n## Overview\nThis is a test blueprint.\n",
            tasks: "## Tasks\n- [ ] Task 1\n",
          }),
        },
        MOCK_ENV,
      );

      expect(exportRes.status).toBe(200);
      const exportData = await exportRes.json();
      expect(exportData).toHaveProperty("success", true);
      expect(exportData).toHaveProperty("data");
    });

    it("should generate blueprint, refine it, then export", async () => {
      const generateRes = await app.request(
        "/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: "Test Project",
            description: "A comprehensive test project for integration testing",
            techStack: [{ name: "React", category: "frontend" }],
          }),
        },
        MOCK_ENV,
      );

      expect(generateRes.status).toBe(200);

      const refineRes = await app.request(
        "/refine",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content:
              "# Test Blueprint\n\n## Overview\nThis is a test blueprint.\n",
            instruction: "Add more details to the overview section",
          }),
        },
        MOCK_ENV,
      );

      expect(refineRes.status).toBe(200);

      const exportRes = await app.request(
        "/export",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: "Test Project",
            format: "zip",
            blueprint:
              "# Refined Blueprint\n\n## Overview\nThis is a refined test blueprint with more details.\n",
            tasks: "## Tasks\n- [ ] Task 1\n- [ ] Task 2\n",
          }),
        },
        MOCK_ENV,
      );

      expect(exportRes.status).toBe(200);
      const exportData = (await exportRes.json()) as ApiResponse;
      expect(exportData.success).toBe(true);
    });
  });

  describe("Workflow 2: Import and Export Roundtrip", () => {
    it("should import project data and export it back", async () => {
      const projectData = {
        projectName: "Roundtrip Test",
        description: "Testing import/export",
        blueprint: "# Roundtrip Blueprint\n",
        tasks: "## Tasks\n- [ ] Test task\n",
        metadata: {
          version: "1.0.0",
          createdAt: new Date().toISOString(),
        },
      };

      const importRes = await app.request(
        "/import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: JSON.stringify(projectData),
            format: "json",
          }),
        },
        MOCK_ENV,
      );

      expect(importRes.status).toBe(200);
      const importData = (await importRes.json()) as ApiResponse;
      expect(importData.success).toBe(true);
      expect(importData.data?.projectName).toBe("Roundtrip Test");

      const exportRes = await app.request(
        "/export",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: projectData.projectName,
            format: "json",
            blueprint: projectData.blueprint,
            tasks: projectData.tasks,
            metadata: projectData.metadata,
          }),
        },
        MOCK_ENV,
      );

      expect(exportRes.status).toBe(200);
      const exportData = (await exportRes.json()) as ApiResponse;
      expect(exportData.success).toBe(true);
    });
  });

  describe("Workflow 3: Storage Operations Flow", () => {
    it("should get storage quota and clear storage", async () => {
      // Storage is client-side (localStorage), server only provides quota info
      const quotaRes = await app.request(
        "/storage/quota",
        { method: "GET" },
        MOCK_ENV,
      );

      expect(quotaRes.status).toBe(200);
      const quotaData = (await quotaRes.json()) as { data: QuotaResponse };
      expect(quotaData.data).toHaveProperty("used");
      expect(quotaData.data).toHaveProperty("total");

      const clearRes = await app.request(
        "/storage/clear",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm: true }),
        },
        MOCK_ENV,
      );

      expect(clearRes.status).toBe(200);
      const clearData = (await clearRes.json()) as { success: boolean };
      expect(clearData.success).toBe(true);
    });
  });

  describe("Workflow 4: Error Propagation Across Services", () => {
    it("should propagate validation errors from generation to response", async () => {
      const res = await app.request(
        "/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: "Missing project name",
          }),
        },
        MOCK_ENV,
      );

      expect(res.status).toBe(400);
      const data = (await res.json()) as ApiResponse;
      expect(data.success).toBe(false);
      expect(data.error).toHaveProperty("type", "validation");
    });

    it("should handle malformed import data gracefully", async () => {
      const res = await app.request(
        "/import",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: "invalid json structure",
            format: "json",
          }),
        },
        MOCK_ENV,
      );

      expect(res.status).toBe(400);
      const data = (await res.json()) as ApiResponse;
      expect(data.success).toBe(false);
    });

    it("should handle missing API key errors", async () => {
      const envWithoutKey = { ...MOCK_ENV, OPENAI_API_KEY: "" };

      const res = await app.request(
        "/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: "Test",
            description: "Test description for validation",
            techStack: [{ name: "React", category: "frontend" }],
          }),
        },
        envWithoutKey,
      );

      expect([400, 500]).toContain(res.status);
      const data = (await res.json()) as ApiResponse;
      expect(data.success).toBe(false);
    });
  });

  describe("Workflow 5: Concurrent Operations", () => {
    it("should handle concurrent quota requests", async () => {
      const promises = Array.from({ length: 5 }, () =>
        app.request("/storage/quota", { method: "GET" }, MOCK_ENV),
      );

      const results = await Promise.all(promises);

      results.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });

    it("should handle concurrent generation requests", async () => {
      const requests = Array.from({ length: 3 }, () =>
        app.request(
          "/generate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectName: "Concurrent Test",
              description: "Testing concurrent requests with validation",
              techStack: [{ name: "React", category: "frontend" }],
            }),
          },
          MOCK_ENV,
        ),
      );

      const results = await Promise.all(requests);

      results.forEach((res) => {
        expect([200, 429]).toContain(res.status);
      });
    });
  });

  describe("Workflow 6: API Health and Consistency", () => {
    it("should maintain consistent responses across multiple quota checks", async () => {
      const results = await Promise.all([
        app.request("/storage/quota", { method: "GET" }, MOCK_ENV),
        app.request("/storage/quota", { method: "GET" }, MOCK_ENV),
        app.request("/storage/quota", { method: "GET" }, MOCK_ENV),
      ]);

      results.forEach((res) => {
        expect(res.status).toBe(200);
      });

      const data = (await Promise.all(results.map((r) => r.json()))) as Array<{
        data: { total: number };
      }>;
      const firstQuota = data[0]!.data.total;
      data.forEach((d) => {
        expect(d.data.total).toBe(firstQuota);
      });
    });
  });
});
