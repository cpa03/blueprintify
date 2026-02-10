import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEditorStore } from "../store/editor";
import { useWizardStore } from "../store/wizard";
import { LocalStorageMock, TestDataFactory } from "../test/test-utils";

describe("Editor Store - Integration Tests", () => {
  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    localStorageMock = new LocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("Cross-Session Persistence", () => {
    it("should restore complete session after browser restart", () => {
      const savedEditorData = {
        blueprintContent: TestDataFactory.createValidBlueprint(),
        tasksContent: TestDataFactory.createValidTasks(),
      };

      // Simulate saving data from previous session
      localStorageMock.setItem(
        "blueprintify-editor",
        JSON.stringify({
          state: savedEditorData,
          version: 0,
        }),
      );

      // Simulate new session initialization
      const { result: editorResult } = renderHook(() => useEditorStore());

      expect(editorResult.current.blueprintContent).toBe(
        savedEditorData.blueprintContent,
      );
      expect(editorResult.current.tasksContent).toBe(
        savedEditorData.tasksContent,
      );
      expect(editorResult.current.isDirty).toBe(false);
    });

    it("should handle version migration correctly", () => {
      const legacyData = {
        blueprintContent: "Legacy blueprint",
        tasksContent: "Legacy tasks",
        // Old format might have had additional fields
        activeTab: "tasks",
        isDirty: true,
      };

      localStorageMock.setItem(
        "blueprintify-editor",
        JSON.stringify({
          state: legacyData,
          version: 0,
        }),
      );

      const { result } = renderHook(() => useEditorStore());

      // Should migrate correctly
      expect(result.current.blueprintContent).toBe(legacyData.blueprintContent);
      expect(result.current.tasksContent).toBe(legacyData.tasksContent);
      // Should reset transient state
      expect(result.current.activeTab).toBe("blueprint");
      expect(result.current.isDirty).toBe(false);
    });

    it("should maintain data consistency across multiple store instances", () => {
      const { result: firstInstance } = renderHook(() => useEditorStore());
      const testBlueprint = TestDataFactory.createValidBlueprint();
      const testTasks = TestDataFactory.createValidTasks();

      // Set data in first instance
      act(() => {
        firstInstance.current.setBlueprintContent(testBlueprint);
        firstInstance.current.setTasksContent(testTasks);
      });

      // Create second instance (simulates new component mount)
      const { result: secondInstance } = renderHook(() => useEditorStore());

      // Should have same data
      expect(secondInstance.current.blueprintContent).toBe(testBlueprint);
      expect(secondInstance.current.tasksContent).toBe(testTasks);
    });
  });

  describe("Data Integrity", () => {
    it("should handle JSON parsing errors gracefully", () => {
      localStorageMock.setItem("blueprintify-editor", "invalid json data");

      const { result } = renderHook(() => useEditorStore());

      // Should fall back to defaults
      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
      expect(result.current.activeTab).toBe("blueprint");
    });

    it("should handle missing state field in stored data", () => {
      localStorageMock.setItem(
        "blueprintify-editor",
        JSON.stringify({
          // Missing state field
          version: 0,
        }),
      );

      const { result } = renderHook(() => useEditorStore());

      // Should fall back to defaults
      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
    });

    it("should handle partially corrupted stored data", () => {
      const partialData = {
        blueprintContent: TestDataFactory.createValidBlueprint(),
        // tasksContent is missing
      };

      localStorageMock.setItem(
        "blueprintify-editor",
        JSON.stringify({
          state: partialData,
          version: 0,
        }),
      );

      const { result } = renderHook(() => useEditorStore());

      // Should restore available data and default missing fields
      expect(result.current.blueprintContent).toBe(
        partialData.blueprintContent,
      );
      expect(result.current.tasksContent).toBe("");
    });
  });

  describe("Storage Quota Management", () => {
    it("should handle quota exceeded scenario gracefully", () => {
      const { result } = renderHook(() => useEditorStore());

      // Create small quota localStorage
      const smallQuotaStorage = new LocalStorageMock(1000);
      Object.defineProperty(window, "localStorage", {
        value: smallQuotaStorage,
        writable: true,
      });

      const largeContent = TestDataFactory.createLargeContent(2000);

      // Should handle quota error gracefully
      expect(() => {
        act(() => {
          result.current.setBlueprintContent(largeContent);
        });
      }).not.toThrow();
    });

    it("should optimize storage usage", () => {
      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(content);
        result.current.setTasksContent(TestDataFactory.createValidTasks());
      });

      const storedData = localStorageMock.getItem("blueprintify-editor");
      const dataSize = new Blob([storedData!]).size;

      // Should be reasonably compact (less than 2x the content size)
      const contentSize = new Blob([content]).size;
      expect(dataSize).toBeLessThan(contentSize * 2);
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle large documents without performance degradation", async () => {
      const { result } = renderHook(() => useEditorStore());
      const largeContent = TestDataFactory.createLargeContent(100000);

      const startTime = performance.now();

      await act(async () => {
        result.current.setBlueprintContent(largeContent);
      });

      const endTime = performance.now();
      const operationTime = endTime - startTime;

      // Should complete within reasonable time
      expect(operationTime).toBeLessThan(500);

      // Verify data integrity
      expect(result.current.blueprintContent).toBe(largeContent);
    });

    it("should batch multiple rapid updates efficiently", async () => {
      const { result } = renderHook(() => useEditorStore());

      const startTime = performance.now();

      await act(async () => {
        for (let i = 0; i < 50; i++) {
          result.current.appendBlueprintContent(`Update ${i}\n`);
        }
      });

      const endTime = performance.now();
      const operationTime = endTime - startTime;

      expect(operationTime).toBeLessThan(200);
      expect(result.current.blueprintContent).toContain("Update 49");
    });
  });

  describe("Concurrent Access", () => {
    it("should handle simultaneous updates from multiple components", () => {
      const { result: component1 } = renderHook(() => useEditorStore());
      const { result: component2 } = renderHook(() => useEditorStore());

      const blueprint1 = "Blueprint from component 1";
      const tasks2 = "Tasks from component 2";

      act(() => {
        component1.current.setBlueprintContent(blueprint1);
        component2.current.setTasksContent(tasks2);
      });

      // Both instances should see the final state
      expect(component1.current.blueprintContent).toBe(blueprint1);
      expect(component1.current.tasksContent).toBe(tasks2);
      expect(component2.current.blueprintContent).toBe(blueprint1);
      expect(component2.current.tasksContent).toBe(tasks2);
    });
  });

  describe("Integration with Wizard Store", () => {
    it("should maintain consistency when both stores are active", () => {
      const { result: editorResult } = renderHook(() => useEditorStore());
      const { result: wizardResult } = renderHook(() => useWizardStore());

      const projectData = TestDataFactory.createMockProjectData();
      const blueprintContent = TestDataFactory.createValidBlueprint();
      const tasksContent = TestDataFactory.createValidTasks();

      act(() => {
        // Set up wizard data
        wizardResult.current.setProjectName(projectData.projectName);
        wizardResult.current.setDescription(projectData.description);
        wizardResult.current.setTechStack(projectData.techStack);

        // Set up editor data
        editorResult.current.setBlueprintContent(blueprintContent);
        editorResult.current.setTasksContent(tasksContent);
      });

      // Both stores should maintain their data independently
      expect(wizardResult.current.projectName).toBe(projectData.projectName);
      expect(editorResult.current.blueprintContent).toBe(blueprintContent);

      // localStorage should contain both stores' data
      const editorStorage = localStorageMock.getItem("blueprintify-editor");
      expect(editorStorage).toContain(blueprintContent);
      expect(editorStorage).toContain(tasksContent);
    });

    it("should handle reset across multiple stores", () => {
      const { result: editorResult } = renderHook(() => useEditorStore());
      const { result: wizardResult } = renderHook(() => useWizardStore());

      act(() => {
        // Populate both stores
        editorResult.current.setBlueprintContent("Test blueprint");
        wizardResult.current.setProjectName("Test Project");

        // Reset editor store
        editorResult.current.reset();
      });

      // Editor should be reset
      expect(editorResult.current.blueprintContent).toBe("");
      expect(editorResult.current.tasksContent).toBe("");

      // Wizard should remain unchanged
      expect(wizardResult.current.projectName).toBe("Test Project");
    });
  });

  describe("Browser Compatibility", () => {
    it("should work when localStorage is not available", () => {
      // Simulate localStorage not available
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      // Should not throw and should work in-memory
      expect(() => {
        act(() => {
          result.current.setBlueprintContent(content);
        });
      }).not.toThrow();

      expect(result.current.blueprintContent).toBe(content);
    });

    it("should handle localStorage disabled/in private mode", () => {
      const disabledStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error("localStorage disabled");
        },
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      };

      Object.defineProperty(window, "localStorage", {
        value: disabledStorage,
        writable: true,
      });

      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      // Should handle gracefully
      expect(() => {
        act(() => {
          result.current.setBlueprintContent(content);
        });
      }).not.toThrow();

      expect(result.current.blueprintContent).toBe(content);
    });
  });
});
