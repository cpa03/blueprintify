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

describe("Integration: End-to-End M2 Workflows", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();

    app = new Hono<{ Bindings: typeof MOCK_ENV }>();
    app.route("/generate", generateRoute);
    app.route("/refine", refineRoute);
    app.route("/export", exportRoute);
    app.route("/import", importRoute);
    app.route("/storage", storageRoute);
    app.route("/tasks", tasksRoute);
    app.onError(errorHandler);

    vi.mock("../services/openai", () => ({
      streamCompletion: vi.fn().mockImplementation(async function* () {
        yield "# Test Blueprint\n\n";
        yield "## Overview\n";
        yield "This is a test blueprint.\n";
      }),
    }));

    vi.mock("../utils/stream", () => ({
      createStreamFromGenerator: vi.fn().mockImplementation((generator) => {
        return new ReadableStream({
          async start(controller) {
            for await (const chunk of generator) {
              controller.enqueue(new TextEncoder().encode(chunk));
            }
            controller.close();
          },
        });
      }),
      createSSEResponse: vi.fn().mockImplementation((stream) => {
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
            description: "A test project",
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
      expect(exportData).toHaveProperty("files");
    });

    it("should generate blueprint, refine it, then export", async () => {
      const generateRes = await app.request(
        "/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: "Test Project",
            description: "A test project",
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
            format: "zip",
            blueprint:
              "# Refined Blueprint\n\n## Overview\nThis is a refined test blueprint with more details.\n",
            tasks: "## Tasks\n- [ ] Task 1\n- [ ] Task 2\n",
          }),
        },
        MOCK_ENV,
      );

      expect(exportRes.status).toBe(200);
      const exportData = await exportRes.json();
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
            data: projectData,
            format: "json",
          }),
        },
        MOCK_ENV,
      );

      expect(importRes.status).toBe(200);
      const importData = await importRes.json();
      expect(importData.success).toBe(true);
      expect(importData.data.projectName).toBe("Roundtrip Test");

      const exportRes = await app.request(
        "/export",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            format: "json",
            blueprint: projectData.blueprint,
            tasks: projectData.tasks,
            metadata: projectData.metadata,
          }),
        },
        MOCK_ENV,
      );

      expect(exportRes.status).toBe(200);
      const exportData = await exportRes.json();
      expect(exportData.success).toBe(true);
    });
  });

  describe("Workflow 3: Storage Operations Flow", () => {
    it("should store, retrieve, and delete data", async () => {
      const testData = {
        blueprint: "# Stored Blueprint\n",
        tasks: "## Tasks\n",
      };

      const storeRes = await app.request(
        "/storage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "test-session",
            data: testData,
          }),
        },
        MOCK_ENV,
      );

      expect(storeRes.status).toBe(200);

      const getRes = await app.request(
        "/storage?key=test-session",
        { method: "GET" },
        MOCK_ENV,
      );

      expect(getRes.status).toBe(200);

      const quotaRes = await app.request(
        "/storage/quota",
        { method: "GET" },
        MOCK_ENV,
      );

      expect(quotaRes.status).toBe(200);
      const quotaData = await quotaRes.json();
      expect(quotaData).toHaveProperty("used");
      expect(quotaData).toHaveProperty("total");

      const deleteRes = await app.request(
        "/storage?key=test-session",
        { method: "DELETE" },
        MOCK_ENV,
      );

      expect(deleteRes.status).toBe(200);
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
      const data = await res.json();
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
      const data = await res.json();
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
            description: "Test description",
          }),
        },
        envWithoutKey,
      );

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe("Workflow 5: Concurrent Operations", () => {
    it("should handle concurrent storage operations", async () => {
      const operations = Array.from({ length: 5 }, (_, i) => ({
        key: `concurrent-test-${i}`,
        data: { test: `data-${i}` },
      }));

      const promises = operations.map((op) =>
        app.request(
          "/storage",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(op),
          },
          MOCK_ENV,
        ),
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
              description: "Testing concurrent requests",
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

  describe("Workflow 6: Session State Synchronization", () => {
    it("should maintain session consistency across multiple requests", async () => {
      const sessionId = `session-${Date.now()}`;

      await app.request(
        "/storage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: sessionId,
            data: { step: 1, projectName: "Test" },
          }),
        },
        MOCK_ENV,
      );

      await app.request(
        "/storage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: sessionId,
            data: { step: 2, projectName: "Test", blueprint: "# Step 2" },
          }),
        },
        MOCK_ENV,
      );

      const getRes = await app.request(
        `/storage?key=${sessionId}`,
        { method: "GET" },
        MOCK_ENV,
      );

      expect(getRes.status).toBe(200);
    });
  });
});
