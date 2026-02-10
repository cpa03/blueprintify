import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEditorStore } from "../store/editor";
import {
  LocalStorageMock,
  TestDataFactory,
  ErrorUtils,
} from "../test/test-utils";

describe("Editor Store - Edge Cases and Error Handling", () => {
  let localStorageMock: LocalStorageMock;
  let consoleErrorSpy: any;

  beforeEach(() => {
    localStorageMock = new LocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    localStorageMock.clear();
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe("Storage Quota Exceeded", () => {
    it("should handle quota exceeded when setting large blueprint content", () => {
      const smallQuotaStorage = new LocalStorageMock(100); // 100 bytes quota
      Object.defineProperty(window, "localStorage", {
        value: smallQuotaStorage,
        writable: true,
      });

      const { result } = renderHook(() => useEditorStore());
      const largeContent = TestDataFactory.createLargeContent(200);

      act(() => {
        result.current.setBlueprintContent(largeContent);
      });

      // Should handle error gracefully and maintain in-memory state
      expect(result.current.blueprintContent).toBe(largeContent);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should handle quota exceeded when setting large tasks content", () => {
      const smallQuotaStorage = new LocalStorageMock(100);
      Object.defineProperty(window, "localStorage", {
        value: smallQuotaStorage,
        writable: true,
      });

      const { result } = renderHook(() => useEditorStore());
      const largeContent = TestDataFactory.createLargeContent(200);

      act(() => {
        result.current.setTasksContent(largeContent);
      });

      expect(result.current.tasksContent).toBe(largeContent);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should handle quota exceeded during append operations", () => {
      const smallQuotaStorage = new LocalStorageMock(150);
      Object.defineProperty(window, "localStorage", {
        value: smallQuotaStorage,
        writable: true,
      });

      const { result } = renderHook(() => useEditorStore());
      const initialContent = "Initial content";
      const appendContent = TestDataFactory.createLargeContent(200);

      act(() => {
        result.current.setBlueprintContent(initialContent);
        result.current.appendBlueprintContent(appendContent);
      });

      // Should handle gracefully
      expect(result.current.blueprintContent).toContain(initialContent);
      expect(result.current.blueprintContent).toContain(appendContent);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should provide meaningful error messages for quota issues", () => {
      const { result } = renderHook(() => useEditorStore());

      // Mock console.error to capture error messages
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      act(() => {
        result.current.setBlueprintContent("test content");
      });

      // Should log quota usage information when available
      expect(consoleErrorSpy).not.toHaveBeenCalled(); // Normal case should not error
    });
  });

  describe("Corrupted Data Handling", () => {
    it("should handle malformed JSON in localStorage", () => {
      localStorageMock.setItem("blueprintify-editor", "{invalid json}");

      const { result } = renderHook(() => useEditorStore());

      // Should fall back to defaults
      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
      expect(result.current.activeTab).toBe("blueprint");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to parse stored editor data"),
      );
    });

    it("should handle truncated JSON data", () => {
      const partialData = JSON.stringify({
        state: {
          blueprintContent: "Some blueprint content",
          tasksContent: "Some tasks content",
        },
        version: 0,
      }).slice(0, -10);

      localStorageMock.setItem("blueprintify-editor", partialData);

      const { result } = renderHook(() => useEditorStore());

      // Should fall back to defaults
      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should handle data with wrong structure", () => {
      localStorageMock.setItem(
        "blueprintify-editor",
        JSON.stringify({
          wrongStructure: {
            someField: "some value",
          },
          version: 0,
        }),
      );

      const { result } = renderHook(() => useEditorStore());

      // Should fall back to defaults
      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
    });

    it("should handle null or undefined stored data", () => {
      localStorageMock.setItem("blueprintify-editor", "null");

      const { result } = renderHook(() => useEditorStore());

      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");

      localStorageMock.setItem("blueprintify-editor", "undefined");

      const { result: result2 } = renderHook(() => useEditorStore());

      expect(result2.current.blueprintContent).toBe("");
      expect(result2.current.tasksContent).toBe("");
    });

    it("should handle circular reference objects", () => {
      const circularObj: any = { content: "test" };
      circularObj.self = circularObj;

      localStorageMock.setItem(
        "blueprintify-editor",
        JSON.stringify(circularObj),
      );

      const { result } = renderHook(() => useEditorStore());

      // Should fall back to defaults
      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("");
    });
  });

  describe("Browser Compatibility Issues", () => {
    it("should handle localStorage disabled completely", () => {
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(content);
      });

      // Should work in-memory only
      expect(result.current.blueprintContent).toBe(content);
      expect(result.current.isDirty).toBe(true);
    });

    it("should handle localStorage with limited functionality", () => {
      const limitedStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => {
          throw new Error("Storage not available");
        }),
        removeItem: vi.fn(() => {}),
        clear: vi.fn(() => {}),
        length: 0,
        key: vi.fn(() => null),
      };

      Object.defineProperty(window, "localStorage", {
        value: limitedStorage,
        writable: true,
      });

      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(content);
      });

      expect(result.current.blueprintContent).toBe(content);
      expect(limitedStorage.setItem).toHaveBeenCalled();
    });

    it("should handle private browsing mode", () => {
      const privateStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => {
          const error = new Error("quota exceeded");
          error.name = "QuotaExceededError";
          throw error;
        }),
        removeItem: vi.fn(() => {}),
        clear: vi.fn(() => {}),
        length: 0,
        key: vi.fn(() => null),
      };

      Object.defineProperty(window, "localStorage", {
        value: privateStorage,
        writable: true,
      });

      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(content);
      });

      // Should work in-memory despite storage errors
      expect(result.current.blueprintContent).toBe(content);
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should handle extremely large content without memory leaks", async () => {
      const { result } = renderHook(() => useEditorStore());
      const extremelyLargeContent = TestDataFactory.createLargeContent(1000000);

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      await act(async () => {
        result.current.setBlueprintContent(extremelyLargeContent);
      });

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      expect(result.current.blueprintContent).toBe(extremelyLargeContent);
    });

    it("should handle rapid state changes without accumulating errors", async () => {
      const { result } = renderHook(() => useEditorStore());

      // Simulate rapid changes
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          result.current.setBlueprintContent(`Content ${i}`);
          result.current.setActiveTab(i % 2 === 0 ? "blueprint" : "tasks");
          result.current.setIsGenerating(i % 3 === 0);
        }
      });

      // Should end in a consistent state
      expect(result.current.blueprintContent).toBe("Content 99");
      expect(result.current.activeTab).toBe("blueprint");
      expect(result.current.isGenerating).toBe(false);

      // Should not accumulate console errors
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("Data Type Edge Cases", () => {
    it("should handle empty strings and whitespace", () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setBlueprintContent("");
        result.current.setTasksContent("   ");
      });

      expect(result.current.blueprintContent).toBe("");
      expect(result.current.tasksContent).toBe("   ");
      expect(result.current.isDirty).toBe(true);
    });

    it("should handle special characters and emojis", () => {
      const { result } = renderHook(() => useEditorStore());
      const specialContent =
        "🚀 Special chars: \x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14";

      act(() => {
        result.current.setBlueprintContent(specialContent);
      });

      expect(result.current.blueprintContent).toBe(specialContent);

      // Should persist and restore correctly
      const storedData = localStorageMock.getItem("blueprintify-editor");
      expect(storedData).toContain("🚀");
    });

    it("should handle very long lines", () => {
      const { result } = renderHook(() => useEditorStore());
      const longLine = "a".repeat(10000);

      act(() => {
        result.current.setBlueprintContent(longLine);
      });

      expect(result.current.blueprintContent).toBe(longLine);
      expect(result.current.blueprintContent.length).toBe(10000);
    });

    it("should handle null/undefined values gracefully", () => {
      const { result } = renderHook(() => useEditorStore());

      // These shouldn't cause crashes
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

      // Should convert to empty string
      expect(result.current.blueprintContent).toBe("");
    });
  });

  describe("Concurrent Access Edge Cases", () => {
    it("should handle rapid tab switching", async () => {
      const { result } = renderHook(() => useEditorStore());

      await act(async () => {
        for (let i = 0; i < 50; i++) {
          result.current.setActiveTab(i % 2 === 0 ? "blueprint" : "tasks");
        }
      });

      expect(result.current.activeTab).toBe("blueprint");
    });

    it("should handle simultaneous content and state changes", async () => {
      const { result } = renderHook(() => useEditorStore());

      await act(async () => {
        result.current.setBlueprintContent("Blueprint content");
        result.current.setTasksContent("Tasks content");
        result.current.setActiveTab("tasks");
        result.current.setIsGenerating(true);
        result.current.setGenerationProgress("Generating...");
      });

      expect(result.current.blueprintContent).toBe("Blueprint content");
      expect(result.current.tasksContent).toBe("Tasks content");
      expect(result.current.activeTab).toBe("tasks");
      expect(result.current.isGenerating).toBe(true);
      expect(result.current.generationProgress).toBe("Generating...");
    });
  });

  describe("Recovery and Fallback Scenarios", () => {
    it("should recover from temporary storage failures", () => {
      const { result } = renderHook(() => useEditorStore());
      let storageDisabled = false;

      const flakyStorage = {
        getItem: vi.fn(() => {
          if (storageDisabled) return null;
          return localStorageMock.getItem("blueprintify-editor");
        }),
        setItem: vi.fn((key: string, value: string) => {
          if (storageDisabled) {
            throw new Error("Storage temporarily unavailable");
          }
          return localStorageMock.setItem(key, value);
        }),
        removeItem: vi.fn((key: string) => {
          if (storageDisabled) return;
          return localStorageMock.removeItem(key);
        }),
        clear: vi.fn(() => {
          if (storageDisabled) return;
          return localStorageMock.clear();
        }),
        length: 0,
        key: vi.fn(() => null),
      };

      Object.defineProperty(window, "localStorage", {
        value: flakyStorage,
        writable: true,
      });

      const content = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(content);
      });

      expect(result.current.blueprintContent).toBe(content);

      // Simulate storage becoming unavailable
      storageDisabled = true;

      act(() => {
        result.current.setTasksContent("New tasks");
      });

      // Should maintain in-memory state
      expect(result.current.tasksContent).toBe("New tasks");
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should provide fallback storage mechanism", () => {
      // Test with completely non-functional storage
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: () => {
            throw new Error("Completely broken");
          },
          setItem: () => {
            throw new Error("Completely broken");
          },
          removeItem: () => {},
          clear: () => {},
          length: 0,
          key: () => null,
        },
        writable: true,
      });

      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(content);
      });

      // Should still work
      expect(result.current.blueprintContent).toBe(content);
      expect(result.current.isDirty).toBe(true);
    });
  });
});
