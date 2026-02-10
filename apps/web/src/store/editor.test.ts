import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useEditorStore } from "../store/editor";
import { LocalStorageMock, TestDataFactory } from "../test/test-utils";

describe("Editor Store - LocalStorage Functionality", () => {
  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    localStorageMock = new LocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Reset store state
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.reset();
    });
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("Persistence", () => {
    it("should persist blueprint content to localStorage", () => {
      const { result } = renderHook(() => useEditorStore());
      const testContent = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(testContent);
      });

      expect(localStorageMock.getItem("blueprintify-editor")).toBe(
        JSON.stringify({
          state: {
            blueprintContent: testContent,
            tasksContent: "",
          },
          version: 0,
        }),
      );
    });

    it("should persist tasks content to localStorage", () => {
      const { result } = renderHook(() => useEditorStore());
      const testContent = TestDataFactory.createValidTasks();

      act(() => {
        result.current.setTasksContent(testContent);
      });

      expect(localStorageMock.getItem("blueprintify-editor")).toBe(
        JSON.stringify({
          state: {
            blueprintContent: "",
            tasksContent: testContent,
          },
          version: 0,
        }),
      );
    });

    it("should persist both blueprint and tasks content", () => {
      const { result } = renderHook(() => useEditorStore());
      const blueprintContent = TestDataFactory.createValidBlueprint();
      const tasksContent = TestDataFactory.createValidTasks();

      act(() => {
        result.current.setBlueprintContent(blueprintContent);
        result.current.setTasksContent(tasksContent);
      });

      expect(localStorageMock.getItem("blueprintify-editor")).toBe(
        JSON.stringify({
          state: {
            blueprintContent,
            tasksContent,
          },
          version: 0,
        }),
      );
    });

    it("should initialize with data from localStorage", () => {
      const savedData = {
        blueprintContent: TestDataFactory.createValidBlueprint(),
        tasksContent: TestDataFactory.createValidTasks(),
      };

      localStorageMock.setItem(
        "blueprintify-editor",
        JSON.stringify({
          state: savedData,
          version: 0,
        }),
      );

      const { result } = renderHook(() => useEditorStore());

      expect(result.current.blueprintContent).toBe(savedData.blueprintContent);
      expect(result.current.tasksContent).toBe(savedData.tasksContent);
    });

    it("should handle corrupted localStorage data gracefully", () => {
      localStorageMock.setItem("blueprintify-editor", "{invalid json");

      const { result } = renderHook(() => useEditorStore());

      // Should fall back to default values
      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
    });

    it("should handle missing localStorage data gracefully", () => {
      const { result } = renderHook(() => useEditorStore());

      // Should initialize with default values
      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
    });
  });

  describe("State Management", () => {
    it("should mark content as dirty when blueprint content changes", () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.setBlueprintContent("New content");
      });

      expect(result.current.isDirty).toBe(true);
    });

    it("should mark content as dirty when tasks content changes", () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.setTasksContent("New tasks");
      });

      expect(result.current.isDirty).toBe(true);
    });

    it("should mark content as clean when markClean is called", () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setBlueprintContent("New content");
        result.current.markClean();
      });

      expect(result.current.isDirty).toBe(false);
    });

    it("should handle append content correctly", () => {
      const { result } = renderHook(() => useEditorStore());
      const initialContent = "Initial";
      const appendContent = " appended";

      act(() => {
        result.current.setBlueprintContent(initialContent);
        result.current.appendBlueprintContent(appendContent);
      });

      expect(result.current.blueprintContent).toBe(
        initialContent + appendContent,
      );
      expect(result.current.isDirty).toBe(true);
    });

    it("should handle tab switching", () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.activeTab).toBe("blueprint");

      act(() => {
        result.current.setActiveTab("tasks");
      });

      expect(result.current.activeTab).toBe("tasks");

      act(() => {
        result.current.setActiveTab("blueprint");
      });

      expect(result.current.activeTab).toBe("blueprint");
    });

    it("should manage generation state", () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.generationProgress).toBe("");

      act(() => {
        result.current.setIsGenerating(true);
        result.current.setGenerationProgress("Generating content...");
      });

      expect(result.current.isGenerating).toBe(true);
      expect(result.current.generationProgress).toBe("Generating content...");

      act(() => {
        result.current.cancelGeneration();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.generationProgress).toBe("Generation cancelled");
    });

    it("should reset all state", () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setBlueprintContent("Blueprint content");
        result.current.setTasksContent("Tasks content");
        result.current.setActiveTab("tasks");
        result.current.setIsGenerating(true);
        result.current.setGenerationProgress("Progress");
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
      expect(result.current.activeTab).toBe("blueprint");
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.generationProgress).toBe("");
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe("Partial Persistence", () => {
    it("should only persist content fields, not transient state", () => {
      const { result } = renderHook(() => useEditorStore());
      const blueprintContent = "Blueprint content";
      const tasksContent = "Tasks content";

      act(() => {
        result.current.setBlueprintContent(blueprintContent);
        result.current.setTasksContent(tasksContent);
        result.current.setActiveTab("tasks");
        result.current.setIsGenerating(true);
        result.current.setGenerationProgress("In progress");
      });

      const storedData = JSON.parse(
        localStorageMock.getItem("blueprintify-editor")!,
      );

      // Should only persist content fields
      expect(storedData.state).toEqual({
        blueprintContent,
        tasksContent,
      });

      // Should not persist transient state
      expect(storedData.state.activeTab).toBeUndefined();
      expect(storedData.state.isGenerating).toBeUndefined();
      expect(storedData.state.generationProgress).toBeUndefined();
      expect(storedData.state.isDirty).toBeUndefined();
    });
  });

  describe("Performance with Large Content", () => {
    it("should handle large content efficiently", async () => {
      const { result } = renderHook(() => useEditorStore());
      const largeContent = TestDataFactory.createLargeContent(50000);

      const startTime = performance.now();

      await act(async () => {
        result.current.setBlueprintContent(largeContent);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000);
      expect(result.current.blueprintContent).toBe(largeContent);
    });

    it("should handle rapid content changes", async () => {
      const { result } = renderHook(() => useEditorStore());

      const startTime = performance.now();

      await act(async () => {
        for (let i = 0; i < 100; i++) {
          result.current.appendBlueprintContent(`Chunk ${i}\n`);
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
      expect(result.current.blueprintContent).toContain("Chunk 99");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty strings", () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setBlueprintContent("");
        result.current.setTasksContent("");
      });

      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
      expect(result.current.isDirty).toBe(true);
    });

    it("should handle null/undefined content gracefully", () => {
      const { result } = renderHook(() => useEditorStore());

      // These shouldn't crash the store
      expect(() => {
        act(() => {
          result.current.setBlueprintContent(null as any);
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.setBlueprintContent(undefined as any);
        });
      }).not.toThrow();
    });

    it("should handle special characters in content", () => {
      const { result } = renderHook(() => useEditorStore());
      const specialContent = "Special chars: \n\t\r\"'\\{}[]()<>~`!@#$%^&*()";

      act(() => {
        result.current.setBlueprintContent(specialContent);
      });

      expect(result.current.blueprintContent).toBe(specialContent);

      // Should persist correctly
      const stored = JSON.parse(
        localStorageMock.getItem("blueprintify-editor")!,
      );
      expect(stored.state.blueprintContent).toBe(specialContent);
    });

    it("should handle Unicode content", () => {
      const { result } = renderHook(() => useEditorStore());
      const unicodeContent = "Unicode: 🚀 ñáéíóú 中文 العربية русский";

      act(() => {
        result.current.setBlueprintContent(unicodeContent);
      });

      expect(result.current.blueprintContent).toBe(unicodeContent);

      // Should persist correctly
      const stored = JSON.parse(
        localStorageMock.getItem("blueprintify-editor")!,
      );
      expect(stored.state.blueprintContent).toBe(unicodeContent);
    });
  });
});
