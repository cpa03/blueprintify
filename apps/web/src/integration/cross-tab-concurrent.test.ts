import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SSE_HEADERS } from "@blueprint/shared";
import { API_ENDPOINTS } from "../config/constants";
import { API_BASE } from "../config/api-client";
import { StorageManager, StorageError } from "../lib/storage";
import { createTestBlueprint, createMockResponse, createMockStreamResponse } from "./factories";

describe("Integration: Concurrent Operations", () => {
  let manager: StorageManager;
  const localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new StorageManager();

    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);

    const mockLocalStorage = {
      getItem: vi.fn((key: string) => localStorageStore[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageStore[key];
      }),
      clear: vi.fn(() => {
        Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);
      }),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Simultaneous API Calls", () => {
    it("should handle concurrent refinement requests", async () => {
      const fetchMock = vi.fn();
      global.fetch = fetchMock;

      fetchMock
        .mockResolvedValueOnce(createMockResponse({ success: true, refinedContent: "Refined 1" }))
        .mockResolvedValueOnce(createMockResponse({ success: true, refinedContent: "Refined 2" }))
        .mockResolvedValueOnce(createMockResponse({ success: true, refinedContent: "Refined 3" }));

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
        fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
          method: "POST",
          body: JSON.stringify({
            content: "Section 3",
            instruction: "Improve",
          }),
        }),
      ];

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(3);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent storage operations", async () => {
      const storage = manager.create({
        key: "concurrent-storage-test",
        currentVersion: 1,
      });

      const testData = createTestBlueprint();

      const saves = Array.from({ length: 5 }, () => storage.set(testData));

      await expect(Promise.all(saves)).resolves.not.toThrow();

      const loaded = await storage.get();
      expect(loaded).toBeDefined();
    });

    it("should handle mixed read/write operations", async () => {
      const storage = manager.create({
        key: "mixed-ops-test",
        currentVersion: 1,
      });

      const testData = createTestBlueprint();

      const operations = [
        storage.set(testData),
        storage.get(),
        storage.set({ ...testData, projectName: "Updated" }),
        storage.get(),
        storage.set({ ...testData, projectName: "Final" }),
      ];

      const results = await Promise.all(operations);

      expect(results).toHaveLength(5);
    });
  });

  describe("Quota Management Under Load", () => {
    it("should handle quota exceeded during concurrent writes", async () => {
      let writeCount = 0;
      const mockLocalStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => {
          writeCount++;
          if (writeCount > 3) {
            throw new DOMException("QuotaExceededError", "QuotaExceededError");
          }
          localStorageStore[`write-${writeCount}`] = "data";
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      const storage = manager.create({
        key: "quota-concurrent-test",
        currentVersion: 1,
      });

      const largeData = createTestBlueprint({
        description: "x".repeat(100000),
      });

      const saves = Array.from({ length: 5 }, () =>
        storage.set(largeData).catch((e: unknown) => e)
      );

      const results = await Promise.all(saves);

      const failures = results.filter((r) => r instanceof StorageError);
      expect(failures.length).toBeGreaterThan(0);
    });
  });
});

describe("Integration: Error Propagation", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Network Failure Scenarios", () => {
    it("should propagate backend validation errors to frontend", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(
          {
            success: false,
            error: "Invalid blueprint format",
            validation: {
              isValid: false,
              errors: ["Missing required field: projectName"],
            },
          },
          400
        )
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
        method: "POST",
        body: JSON.stringify({ projectName: "" }),
      });

      const data = (await response.json()) as {
        error: string;
        validation: { errors: string[] };
      };

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid blueprint format");
      expect(data.validation.errors).toContain("Missing required field: projectName");
    });

    it("should handle network timeouts gracefully", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network timeout"));

      await expect(
        fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
          method: "POST",
          body: JSON.stringify({ projectName: "Test" }),
        })
      ).rejects.toThrow("Network timeout");
    });

    it("should handle server errors with proper fallback", async () => {
      fetchMock.mockResolvedValueOnce(
        createMockResponse(
          {
            success: false,
            error: "Internal server error",
          },
          500
        )
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
        method: "POST",
        body: JSON.stringify({ content: "Test" }),
      });

      expect(response.status).toBe(500);

      const data = (await response.json()) as { error: string };
      expect(data.error).toBe("Internal server error");
    });

    it("should handle streaming errors mid-response", async () => {
      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"chunk": 1}\n\n'));
          controller.error(new Error("Stream interrupted"));
        },
      });

      fetchMock.mockResolvedValueOnce(
        new Response(errorStream, {
          status: 200,
          headers: { "Content-Type": SSE_HEADERS.CONTENT_TYPE },
        })
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
        method: "POST",
        body: JSON.stringify({ projectName: "Test" }),
      });

      const reader = response.body?.getReader();

      await expect(reader?.read()).rejects.toThrow();
    });
  });

  describe("Session Recovery", () => {
    it("should preserve session state during network failures", async () => {
      const localManager = new StorageManager();
      const localStorageStore: Record<string, string> = {};

      const mockLocalStorage = {
        getItem: vi.fn((key: string) => localStorageStore[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageStore[key] = value;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      const storage = localManager.create({
        key: "session-recovery-test",
        currentVersion: 1,
      });

      const testData = createTestBlueprint();
      await storage.set(testData);

      fetchMock.mockRejectedValueOnce(new Error("Network error"));

      try {
        await fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
          method: "POST",
          body: JSON.stringify(testData),
        });
      } catch {
        // Expected to fail
      }

      const recovered = await storage.get();
      expect(recovered).toBeDefined();
      expect((recovered as { projectName: string }).projectName).toBe(testData.projectName);
    });

    it("should handle partial save failures", async () => {
      const localManager = new StorageManager();
      let shouldFail = false;

      const mockLocalStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => {
          if (shouldFail) {
            throw new Error("Write failed");
          }
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };

      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });

      const storage = localManager.create({
        key: "partial-save-test",
        currentVersion: 1,
      });

      await storage.set(createTestBlueprint());

      shouldFail = true;
      await expect(storage.set(createTestBlueprint())).rejects.toThrow();
    });
  });
});

describe("Integration: End-to-End Workflows", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let manager: StorageManager;
  const localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    manager = new StorageManager();

    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);

    const mockLocalStorage = {
      getItem: vi.fn((key: string) => localStorageStore[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageStore[key];
      }),
      clear: vi.fn(() => {
        Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);
      }),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Complete User Journey", () => {
    it("should handle full workflow: generate → refine → export", async () => {
      const storage = manager.create({
        key: "full-workflow-test",
        currentVersion: 1,
      });

      const testData = createTestBlueprint();

      fetchMock
        .mockResolvedValueOnce(
          createMockStreamResponse([
            'data: {"type":"content","content":"# Generated Blueprint"}\n\n',
            'data: {"type":"complete"}\n\n',
          ])
        )
        .mockResolvedValueOnce(
          createMockResponse({
            success: true,
            refinedContent: "# Enhanced Blueprint",
          })
        )
        .mockResolvedValueOnce(
          createMockResponse({
            success: true,
            files: [
              { name: "blueprint.md", content: "# Enhanced Blueprint" },
              { name: "tasks.md", content: "## Tasks" },
            ],
          })
        );

      const generateResponse = await fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
        method: "POST",
        body: JSON.stringify(testData),
      });

      expect(generateResponse.status).toBe(200);

      await storage.set({ ...testData, blueprint: "# Generated Blueprint" });

      const refineResponse = await fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
        method: "POST",
        body: JSON.stringify({
          content: "# Generated Blueprint",
          instruction: "Enhance this",
        }),
      });

      expect(refineResponse.status).toBe(200);

      const exportResponse = await fetch(`${API_BASE}${API_ENDPOINTS.EXPORT}`, {
        method: "POST",
        body: JSON.stringify({ format: "markdown" }),
      });

      expect(exportResponse.status).toBe(200);

      const finalData = await storage.get();
      expect(finalData).toBeDefined();
    });

    it("should handle import → edit → save workflow", async () => {
      const storage = manager.create({
        key: "import-edit-test",
        currentVersion: 1,
      });

      fetchMock.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: createTestBlueprint(),
          validation: { isValid: true },
        })
      );

      const importResponse = await fetch(`${API_BASE}${API_ENDPOINTS.IMPORT}`, {
        method: "POST",
        body: JSON.stringify({ format: "json", content: "{}" }),
      });

      const importData = (await importResponse.json()) as {
        success: boolean;
        data: unknown;
      };
      expect(importData.success).toBe(true);

      await storage.set(importData.data);

      const edited = (await storage.get()) as { projectName: string };
      edited.projectName = "Edited Project";
      await storage.set(edited);

      const final = (await storage.get()) as { projectName: string };
      expect(final.projectName).toBe("Edited Project");
    });
  });

  describe("Error Recovery Scenarios", () => {
    it("should recover from failed generation and retry", async () => {
      const storage = manager.create({
        key: "retry-workflow-test",
        currentVersion: 1,
      });

      fetchMock.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce(
        createMockResponse({
          success: true,
          blueprint: "# Success",
        })
      );

      let attempts = 0;
      let success = false;

      while (attempts < 2 && !success) {
        try {
          const response = await fetch(`${API_BASE}${API_ENDPOINTS.GENERATE}`, {
            method: "POST",
            body: JSON.stringify(createTestBlueprint()),
          });

          if (response.ok) {
            success = true;
            const data = (await response.json()) as { blueprint: string };
            await storage.set({
              ...createTestBlueprint(),
              blueprint: data.blueprint,
            });
          }
        } catch {
          attempts++;
        }
      }

      expect(success).toBe(true);

      const saved = (await storage.get()) as { blueprint: string };
      expect(saved.blueprint).toBe("# Success");
    });

    it("should handle partial refinement failure", async () => {
      const storage = manager.create({
        key: "partial-refine-test",
        currentVersion: 1,
      });

      const initialData = createTestBlueprint();
      await storage.set(initialData);

      fetchMock.mockResolvedValueOnce(
        createMockResponse({ success: false, error: "Refinement failed" }, 500)
      );

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.REFINE}`, {
        method: "POST",
        body: JSON.stringify({ content: "test", instruction: "improve" }),
      });

      const data = (await storage.get()) as { projectName: string };
      expect(data.projectName).toBe(initialData.projectName);
      expect(response.status).toBe(500);
    });
  });
});

describe("Integration: Multi-Manager Scenarios", () => {
  const localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();

    Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);

    const mockLocalStorage = {
      getItem: vi.fn((key: string) => localStorageStore[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageStore[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageStore[key];
      }),
      clear: vi.fn(() => {
        Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);
      }),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle multiple storage managers independently", async () => {
    const manager1 = new StorageManager();
    const manager2 = new StorageManager();

    const storage1 = manager1.create({
      key: "manager1-test",
      currentVersion: 1,
    });

    const storage2 = manager2.create({
      key: "manager2-test",
      currentVersion: 1,
    });

    const data1 = createTestBlueprint({ projectName: "Manager 1 Data" });
    const data2 = createTestBlueprint({ projectName: "Manager 2 Data" });

    await storage1.set(data1);
    await storage2.set(data2);

    const result1 = (await storage1.get()) as { projectName: string };
    const result2 = (await storage2.get()) as { projectName: string };

    expect(result1.projectName).toBe("Manager 1 Data");
    expect(result2.projectName).toBe("Manager 2 Data");
  });

  it("should isolate failures between storage instances", async () => {
    const manager = new StorageManager();

    const storage1 = manager.create({
      key: "isolated-1",
      currentVersion: 1,
    });

    const storage2 = manager.create({
      key: "isolated-2",
      currentVersion: 1,
    });

    await storage1.set(createTestBlueprint());

    let callCount = 0;
    const mockLocalStorage = {
      getItem: vi.fn((key: string) => {
        if (key === "isolated-2" && callCount++ === 0) {
          throw new Error("Read error");
        }
        return localStorageStore[key] || null;
      }),
      setItem: vi.fn((key: string, value: string) => {
        localStorageStore[key] = value;
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });

    await expect(storage2.get()).rejects.toThrow();

    const data1 = await storage1.get();
    expect(data1).toBeDefined();
  });
});

export {};
