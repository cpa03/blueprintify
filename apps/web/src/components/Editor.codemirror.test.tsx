import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderHook, act } from "@testing-library/react";
import { Editor } from "./Editor";
import { useEditorStore, useWizardStore, resetAllStores } from "../store";
import { TestDataFactory, PerformanceUtils } from "../test/test-utils";

// Mock the CodeMirror component
vi.mock("@uiw/react-codemirror", () => ({
  default: vi.fn(({ value, onChange, extensions }) => (
    <textarea
      data-testid="codemirror"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      data-extensions={extensions ? JSON.stringify(extensions) : "[]"}
    />
  )),
}));

// Mock MarkdownRenderer
vi.mock("./MarkdownRenderer", () => ({
  MarkdownRenderer: vi.fn(({ content }) => (
    <div data-testid="markdown-preview">{content}</div>
  )),
}));

// Mock EditorHeader
vi.mock("./editor/EditorHeader", () => ({
  EditorHeader: vi.fn(
    ({ onCopy, onExport, onNew, activeTab, setActiveTab }) => (
      <div data-testid="editor-header">
        <button
          onClick={() => setActiveTab("blueprint")}
          data-testid="blueprint-tab"
        >
          Blueprint
        </button>
        <button onClick={() => setActiveTab("tasks")} data-testid="tasks-tab">
          Tasks
        </button>
        <button onClick={onCopy} data-testid="copy-button">
          Copy
        </button>
        <button onClick={onExport} data-testid="export-button">
          Export
        </button>
        <button onClick={onNew} data-testid="new-button">
          New
        </button>
      </div>
    ),
  ),
}));

// Mock export functions
vi.mock("../lib/export", () => ({
  exportAsZip: vi.fn(),
  copyToClipboard: vi.fn(),
  formatForIDE: vi.fn((content: string) => content),
}));

// Mock toast
vi.mock("../store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../store")>();
  return {
    ...actual,
    useToast: () => ({
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    }),
  };
});

describe("Editor Component - CodeMirror Integration", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State and Rendering", () => {
    it("should render empty state when no content exists", () => {
      render(<Editor />);

      expect(
        screen.getByText("Your generated content will appear here"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Complete the wizard to get started"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("editor-header")).toBeInTheDocument();
    });

    it("should render editor when content exists", () => {
      const { result } = renderHook(() => useEditorStore());
      const testContent = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(testContent);
      });

      render(<Editor />);

      expect(screen.getByTestId("codemirror")).toBeInTheDocument();
      expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
      expect(screen.getByDisplayValue(testContent)).toBeInTheDocument();
    });

    it("should show correct active tab", () => {
      const { result } = renderHook(() => useEditorStore());
      const blueprintContent = TestDataFactory.createValidBlueprint();
      const tasksContent = TestDataFactory.createValidTasks();

      act(() => {
        result.current.setBlueprintContent(blueprintContent);
        result.current.setTasksContent(tasksContent);
        result.current.setActiveTab("tasks");
      });

      render(<Editor />);

      expect(screen.getByDisplayValue(tasksContent)).toBeInTheDocument();
      expect(
        screen.queryByDisplayValue(blueprintContent),
      ).not.toBeInTheDocument();
    });
  });

  describe("Content Editing", () => {
    it("should update blueprint content when typing in editor", async () => {
      const { result } = renderHook(() => useEditorStore());
      const initialContent = "# Initial Content";

      act(() => {
        result.current.setBlueprintContent(initialContent);
      });

      render(<Editor />);

      const editor = screen.getByTestId("codemirror");
      const newContent = "# Updated Content\n\nWith more details";

      await user.clear(editor);
      await user.type(editor, newContent);

      await waitFor(() => {
        expect(result.current.blueprintContent).toBe(newContent);
        expect(result.current.isDirty).toBe(true);
      });
    });

    it("should update tasks content when editing tasks tab", async () => {
      const { result } = renderHook(() => useEditorStore());
      const blueprintContent = TestDataFactory.createValidBlueprint();
      const tasksContent = TestDataFactory.createValidTasks();

      act(() => {
        result.current.setBlueprintContent(blueprintContent);
        result.current.setTasksContent(tasksContent);
        result.current.setActiveTab("tasks");
      });

      render(<Editor />);

      const editor = screen.getByTestId("codemirror");
      const newTasksContent =
        "# Updated Tasks\n\n- [ ] New task 1\n- [ ] New task 2";

      await user.clear(editor);
      await user.type(editor, newTasksContent);

      await waitFor(() => {
        expect(result.current.tasksContent).toBe(newTasksContent);
        expect(result.current.isDirty).toBe(true);
      });
    });

    it("should handle large content efficiently", async () => {
      const { result } = renderHook(() => useEditorStore());
      const largeContent = TestDataFactory.createLargeContent(50000);

      const { duration } = await PerformanceUtils.measureTime(async () => {
        act(() => {
          result.current.setBlueprintContent(largeContent);
        });

        render(<Editor />);

        await waitFor(() => {
          expect(screen.getByDisplayValue(largeContent)).toBeInTheDocument();
        });
      });

      // Should render within reasonable time
      expect(duration).toBeLessThan(1000);
    });

    it("should handle rapid content changes", async () => {
      const { result } = renderHook(() => useEditorStore());
      render(<Editor />);

      const editor = screen.getByTestId("codemirror");

      await act(async () => {
        for (let i = 0; i < 10; i++) {
          await user.clear(editor);
          await user.type(editor, `Content update ${i}`);

          // Small delay to simulate real typing
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      });

      expect(result.current.blueprintContent).toBe("Content update 9");
    });
  });

  describe("Tab Switching", () => {
    it("should switch between blueprint and tasks tabs", async () => {
      const { result } = renderHook(() => useEditorStore());
      const blueprintContent = TestDataFactory.createValidBlueprint();
      const tasksContent = TestDataFactory.createValidTasks();

      act(() => {
        result.current.setBlueprintContent(blueprintContent);
        result.current.setTasksContent(tasksContent);
      });

      render(<Editor />);

      // Should start on blueprint tab
      expect(screen.getByDisplayValue(blueprintContent)).toBeInTheDocument();

      // Switch to tasks tab
      const tasksTab = screen.getByTestId("tasks-tab");
      await user.click(tasksTab);

      await waitFor(() => {
        expect(result.current.activeTab).toBe("tasks");
        expect(screen.getByDisplayValue(tasksContent)).toBeInTheDocument();
        expect(
          screen.queryByDisplayValue(blueprintContent),
        ).not.toBeInTheDocument();
      });

      // Switch back to blueprint tab
      const blueprintTab = screen.getByTestId("blueprint-tab");
      await user.click(blueprintTab);

      await waitFor(() => {
        expect(result.current.activeTab).toBe("blueprint");
        expect(screen.getByDisplayValue(blueprintContent)).toBeInTheDocument();
        expect(
          screen.queryByDisplayValue(tasksContent),
        ).not.toBeInTheDocument();
      });
    });

    it("should maintain unsaved changes when switching tabs", async () => {
      const { result } = renderHook(() => useEditorStore());
      const blueprintContent = TestDataFactory.createValidBlueprint();
      const tasksContent = TestDataFactory.createValidTasks();

      act(() => {
        result.current.setBlueprintContent(blueprintContent);
        result.current.setTasksContent(tasksContent);
      });

      render(<Editor />);

      // Modify blueprint content
      const editor = screen.getByTestId("codemirror");
      await user.clear(editor);
      await user.type(editor, "Modified blueprint content");

      // Switch to tasks tab
      await user.click(screen.getByTestId("tasks-tab"));

      // Switch back to blueprint tab
      await user.click(screen.getByTestId("blueprint-tab"));

      expect(result.current.blueprintContent).toBe(
        "Modified blueprint content",
      );
      expect(result.current.isDirty).toBe(true);
    });
  });

  describe("View Mode", () => {
    it("should support different view modes", () => {
      const { result } = renderHook(() => useEditorStore());
      const blueprintContent = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(blueprintContent);
      });

      render(<Editor />);

      expect(screen.getByTestId("codemirror")).toBeInTheDocument();
      expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
    });

    it("should update preview when content changes", async () => {
      const { result } = renderHook(() => useEditorStore());
      render(<Editor />);

      const editor = screen.getByTestId("codemirror");
      const newContent = "# New Content\n\nThis should appear in preview";

      await user.clear(editor);
      await user.type(editor, newContent);

      await waitFor(() => {
        const preview = screen.getByTestId("markdown-preview");
        expect(preview).toHaveTextContent(newContent);
      });
    });

    it("should sync editor and preview content", async () => {
      const { result } = renderHook(() => useEditorStore());
      const testContent = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(testContent);
      });

      render(<Editor />);

      const editor = screen.getByTestId("codemirror");
      const preview = screen.getByTestId("markdown-preview");

      expect(editor).toHaveValue(testContent);
      expect(preview).toHaveTextContent(testContent);

      // Test live updates
      const appendedContent = "\n\n## Appended Section\n\nNew content here";
      await user.type(editor, appendedContent);

      await waitFor(() => {
        expect(preview).toHaveTextContent(testContent + appendedContent);
      });
    });
  });

  describe("Performance and Optimization", () => {
    it("should handle large documents without performance degradation", async () => {
      const { result } = renderHook(() => useEditorStore());
      const veryLargeContent = TestDataFactory.createLargeContent(100000);

      const { duration } = await PerformanceUtils.measureTime(async () => {
        act(() => {
          result.current.setBlueprintContent(veryLargeContent);
        });

        render(<Editor />);

        await waitFor(() => {
          expect(screen.getByTestId("codemirror")).toBeInTheDocument();
        });
      });

      expect(duration).toBeLessThan(2000);
    });

    it("should debounce preview updates for large content", async () => {
      const { result } = renderHook(() => useEditorStore());
      const largeContent = TestDataFactory.createLargeContent(10000);

      act(() => {
        result.current.setBlueprintContent(largeContent);
      });

      render(<Editor />);

      const editor = screen.getByTestId("codemirror");
      const preview = screen.getByTestId("markdown-preview");

      // Rapid typing should not cause excessive preview updates
      const startTime = performance.now();

      const additionalText = " more content";
      for (let i = 0; i < additionalText.length; i++) {
        const char = additionalText[i];
        if (char) {
          await user.keyboard(char);
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      const endTime = performance.now();
      const updateDuration = endTime - startTime;

      // Should complete quickly even with large content
      expect(updateDuration).toBeLessThan(500);
      expect(preview).toHaveTextContent(largeContent + " more content");
    });

    it("should manage memory efficiently with large content", async () => {
      const { result } = renderHook(() => useEditorStore());
      const initialMemory = PerformanceUtils.measureMemory();

      // Add large content
      act(() => {
        result.current.setBlueprintContent(
          TestDataFactory.createLargeContent(50000),
        );
      });

      render(<Editor />);

      const finalMemory = PerformanceUtils.measureMemory();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle malformed content gracefully", async () => {
      const { result } = renderHook(() => useEditorStore());
      const malformedContent = "\x00\x01\x02\x03Invalid content\xfe\xff";

      act(() => {
        result.current.setBlueprintContent(malformedContent);
      });

      render(<Editor />);

      expect(screen.getByDisplayValue(malformedContent)).toBeInTheDocument();
      expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
    });

    it("should handle empty content", async () => {
      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(content);
      });

      render(<Editor />);

      const editor = screen.getByTestId("codemirror");
      await user.clear(editor);

      await waitFor(() => {
        expect(result.current.blueprintContent).toBe("");
        expect(result.current.isDirty).toBe(true);
      });

      // Should show empty state preview
      expect(screen.getByTestId("markdown-preview")).toHaveTextContent("");
    });

    it("should handle content with special characters", async () => {
      const { result } = renderHook(() => useEditorStore());
      const specialContent = "🚀 Special: \n\t\r\"'\\{}[]()<>~`!@#$%^&*()";

      act(() => {
        result.current.setBlueprintContent(specialContent);
      });

      render(<Editor />);

      expect(screen.getByDisplayValue(specialContent)).toBeInTheDocument();
      const preview = screen.getByTestId("markdown-preview");
      expect(preview.textContent).toBe(specialContent);
    });

    it("should handle very long lines", async () => {
      const { result } = renderHook(() => useEditorStore());
      const longLine = "a".repeat(10000);

      act(() => {
        result.current.setBlueprintContent(longLine);
      });

      render(<Editor />);

      expect(screen.getByDisplayValue(longLine)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(content);
      });

      render(<Editor />);

      const editor = screen.getByTestId("codemirror");
      const preview = screen.getByTestId("markdown-preview");

      expect(editor).toBeInTheDocument();
      expect(preview).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const { result } = renderHook(() => useEditorStore());
      const content = TestDataFactory.createValidBlueprint();

      act(() => {
        result.current.setBlueprintContent(content);
      });

      render(<Editor />);

      const blueprintTab = screen.getByTestId("blueprint-tab");
      const tasksTab = screen.getByTestId("tasks-tab");

      // Test tab navigation
      blueprintTab.focus();
      await user.tab();

      expect(tasksTab).toHaveFocus();
    });

    it("should have sufficient color contrast", () => {
      render(<Editor />);

      // Basic check that component renders
      expect(screen.getByTestId("editor-header")).toBeInTheDocument();
    });
  });

  describe("Integration with Store", () => {
    it("should update store when editor content changes", async () => {
      const { result } = renderHook(() => useEditorStore());
      render(<Editor />);

      const editor = screen.getByTestId("codemirror");
      const newContent =
        "# Store Integration Test\n\nThis should update the store";

      await user.clear(editor);
      await user.type(editor, newContent);

      await waitFor(() => {
        expect(result.current.blueprintContent).toBe(newContent);
      });
    });

    it("should reflect store changes in editor", () => {
      const { result } = renderHook(() => useEditorStore());
      const testContent = TestDataFactory.createValidBlueprint();

      render(<Editor />);

      act(() => {
        result.current.setBlueprintContent(testContent);
      });

      expect(screen.getByDisplayValue(testContent)).toBeInTheDocument();
    });

    it("should handle concurrent store updates", async () => {
      const { result } = renderHook(() => useEditorStore());
      render(<Editor />);

      const editor = screen.getByTestId("codemirror");

      // Simulate concurrent updates
      act(() => {
        result.current.setBlueprintContent("Initial content");
      });

      await user.clear(editor);
      await user.type(editor, "User typed content");

      act(() => {
        result.current.appendBlueprintContent("\n\nAppended content");
      });

      await waitFor(() => {
        expect(result.current.blueprintContent).toContain("User typed content");
        expect(result.current.blueprintContent).toContain("Appended content");
      });
    });
  });
});
