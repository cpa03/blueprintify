import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { Hono } from "hono";
import { MOCK_ENV } from "../test-utils";
import { errorHandler } from "../middleware/errorHandler";
import generateRoute from "../routes/generate";
import refineRoute from "../routes/refine";
import exportRoute from "../routes/export";
import importRoute from "../routes/import";
import storageRoute from "../routes/storage";
import tasksRoute from "../routes/tasks";
import shareRoute from "../routes/share";
import {
  setDefaultContainer,
  resetContainer,
  createMockContainer,
} from "../di/container";
import { SSE_HEADERS, SHARE_CONFIG } from "../config/constants";

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

let originalConsoleError: typeof console.error;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

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
    app.route("/share", shareRoute);
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
        SSE_HEADERS.CONTENT_TYPE,
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

  describe("Workflow 7: Share Blueprint Flow", () => {
    function createMockShareDB() {
      const storedData = new Map<string, Record<string, unknown>>();

      return {
        prepare: vi.fn((query: string) => ({
          bind: vi.fn((...params: unknown[]) => ({
            run: vi.fn(async () => {
              if (query.includes("INSERT")) {
                const id = params[0] as string;
                storedData.set(id, {
                  id,
                  title: params[1],
                  blueprint: params[2],
                  metadata: params[3],
                  created_at: params[4],
                  expires_at: params[5],
                });
                return { success: true };
              }
              if (query.includes("DELETE")) {
                const id = params[0] as string;
                storedData.delete(id);
                return { success: true };
              }
              return { success: true };
            }),
            first: vi.fn(async () => {
              if (query.includes("SELECT") && params[0]) {
                return storedData.get(params[0] as string) || null;
              }
              return null;
            }),
          })),
        })),
      };
    }

    function createMockEnvWithDB() {
      return {
        ...MOCK_ENV,
        DB: createMockShareDB(),
      };
    }

    it("should create, retrieve, and delete a shared blueprint", async () => {
      const envWithDB = createMockEnvWithDB();

      const createRes = await app.request(
        "/share",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Integration Test Blueprint",
            blueprint: "# Test\n\nIntegration test content",
            metadata: {
              projectName: "Integration Test",
              techStack: ["React", "TypeScript"],
            },
          }),
        },
        envWithDB,
      );

      expect(createRes.status).toBe(200);
      const createData = (await createRes.json()) as {
        id: string;
        url: string;
        expiresAt: string;
      };
      expect(createData.id).toHaveLength(SHARE_CONFIG.ID_LENGTH);
      expect(createData.url).toContain("/share/");

      const getRes = await app.request(
        `/share/${createData.id}`,
        { method: "GET" },
        envWithDB,
      );

      expect(getRes.status).toBe(200);
      const getData = (await getRes.json()) as {
        id: string;
        title: string;
        blueprint: string;
      };
      expect(getData.id).toBe(createData.id);
      expect(getData.title).toBe("Integration Test Blueprint");

      const deleteRes = await app.request(
        `/share/${createData.id}`,
        { method: "DELETE" },
        envWithDB,
      );

      expect(deleteRes.status).toBe(200);
    });

    it("should handle share workflow error cases", async () => {
      const envWithDB = createMockEnvWithDB();

      const invalidIdRes = await app.request(
        "/share/invalid",
        { method: "GET" },
        envWithDB,
      );
      expect(invalidIdRes.status).toBe(400);

      const notFoundRes = await app.request(
        `/share/${"A".repeat(SHARE_CONFIG.ID_LENGTH)}`,
        { method: "GET" },
        envWithDB,
      );
      expect(notFoundRes.status).toBe(404);

      const validationRes = await app.request(
        "/share",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "" }),
        },
        envWithDB,
      );
      expect(validationRes.status).toBe(400);
    });

    it("should handle database not configured gracefully", async () => {
      const res = await app.request(
        "/share",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Test",
            blueprint: "# Test",
          }),
        },
        MOCK_ENV,
      );

      expect(res.status).toBe(500);
      const data = (await res.json()) as { error: string };
      expect(data.error).toBeDefined();
    });
  });
});
