import { describe, it, expect, beforeEach, vi } from "vitest";
import { useEditorStore } from "./editor";

describe("editor store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useEditorStore.getState().reset();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = useEditorStore.getState();
      expect(state.activeTab).toBe("blueprint");
      expect(state.blueprintContent).toBe("");
      expect(state.tasksContent).toBe("");
      expect(state.isDirty).toBe(false);
      expect(state.isGenerating).toBe(false);
      expect(state.generationProgress).toBe("");
    });
  });

  describe("setActiveTab", () => {
    it("should set active tab to blueprint", () => {
      const { setActiveTab } = useEditorStore.getState();
      setActiveTab("blueprint");
      expect(useEditorStore.getState().activeTab).toBe("blueprint");
    });

    it("should set active tab to tasks", () => {
      const { setActiveTab } = useEditorStore.getState();
      setActiveTab("tasks");
      expect(useEditorStore.getState().activeTab).toBe("tasks");
    });
  });

  describe("setBlueprintContent", () => {
    it("should set blueprint content", () => {
      const { setBlueprintContent } = useEditorStore.getState();
      setBlueprintContent("# My Blueprint");
      expect(useEditorStore.getState().blueprintContent).toBe("# My Blueprint");
    });

    it("should mark state as dirty", () => {
      const { setBlueprintContent } = useEditorStore.getState();
      setBlueprintContent("# My Blueprint");
      expect(useEditorStore.getState().isDirty).toBe(true);
    });
  });

  describe("appendBlueprintContent", () => {
    it("should append content to blueprint", () => {
      const { setBlueprintContent, appendBlueprintContent } =
        useEditorStore.getState();
      setBlueprintContent("# Start");
      appendBlueprintContent(" + More");
      expect(useEditorStore.getState().blueprintContent).toBe("# Start + More");
    });

    it("should mark state as dirty when appending", () => {
      const { appendBlueprintContent } = useEditorStore.getState();
      appendBlueprintContent("new content");
      expect(useEditorStore.getState().isDirty).toBe(true);
    });
  });

  describe("setTasksContent", () => {
    it("should set tasks content", () => {
      const { setTasksContent } = useEditorStore.getState();
      setTasksContent("- Task 1\n- Task 2");
      expect(useEditorStore.getState().tasksContent).toBe("- Task 1\n- Task 2");
    });

    it("should mark state as dirty", () => {
      const { setTasksContent } = useEditorStore.getState();
      setTasksContent("new tasks");
      expect(useEditorStore.getState().isDirty).toBe(true);
    });
  });

  describe("appendTasksContent", () => {
    it("should append content to tasks", () => {
      const { setTasksContent, appendTasksContent } = useEditorStore.getState();
      setTasksContent("- Task 1");
      appendTasksContent("\n- Task 2");
      expect(useEditorStore.getState().tasksContent).toBe("- Task 1\n- Task 2");
    });

    it("should mark state as dirty when appending", () => {
      const { appendTasksContent } = useEditorStore.getState();
      appendTasksContent("new content");
      expect(useEditorStore.getState().isDirty).toBe(true);
    });
  });

  describe("setIsGenerating", () => {
    it("should set isGenerating to true", () => {
      const { setIsGenerating } = useEditorStore.getState();
      setIsGenerating(true);
      expect(useEditorStore.getState().isGenerating).toBe(true);
    });

    it("should set isGenerating to false", () => {
      const { setIsGenerating } = useEditorStore.getState();
      setIsGenerating(true);
      setIsGenerating(false);
      expect(useEditorStore.getState().isGenerating).toBe(false);
    });
  });

  describe("setGenerationProgress", () => {
    it("should set generation progress message", () => {
      const { setGenerationProgress } = useEditorStore.getState();
      setGenerationProgress("Generating section 1...");
      expect(useEditorStore.getState().generationProgress).toBe(
        "Generating section 1...",
      );
    });
  });

  describe("markClean", () => {
    it("should mark state as clean", () => {
      const { setBlueprintContent, markClean } = useEditorStore.getState();
      setBlueprintContent("content");
      expect(useEditorStore.getState().isDirty).toBe(true);
      markClean();
      expect(useEditorStore.getState().isDirty).toBe(false);
    });
  });

  describe("cancelGeneration", () => {
    it("should cancel generation and set progress message", () => {
      const { setIsGenerating, setGenerationProgress, cancelGeneration } =
        useEditorStore.getState();
      setIsGenerating(true);
      setGenerationProgress("In progress");
      cancelGeneration();
      const state = useEditorStore.getState();
      expect(state.isGenerating).toBe(false);
      expect(state.generationProgress).toBe("Generation cancelled");
    });
  });

  describe("reset", () => {
    it("should reset to initial state", () => {
      const {
        setBlueprintContent,
        setTasksContent,
        setActiveTab,
        setIsGenerating,
        setGenerationProgress,
        reset,
      } = useEditorStore.getState();

      setActiveTab("tasks");
      setBlueprintContent("Blueprint content");
      setTasksContent("Tasks content");
      setIsGenerating(true);
      setGenerationProgress("Progress");

      reset();

      const state = useEditorStore.getState();
      expect(state.activeTab).toBe("blueprint");
      expect(state.blueprintContent).toBe("");
      expect(state.tasksContent).toBe("");
      expect(state.isDirty).toBe(false);
      expect(state.isGenerating).toBe(false);
      expect(state.generationProgress).toBe("");
    });
  });

  describe("flushStorage", () => {
    it("should have flushStorage method", () => {
      const { flushStorage } = useEditorStore.getState();
      expect(typeof flushStorage).toBe("function");
    });
  });

  describe("content security validation", () => {
    it("should accept valid content", () => {
      const { setBlueprintContent } = useEditorStore.getState();
      expect(() => setBlueprintContent("# Valid Content")).not.toThrow();
    });

    it("should reject content with potential XSS (script tags)", () => {
      const { setBlueprintContent } = useEditorStore.getState();
      // The store throws SecurityError for dangerous content
      expect(() =>
        setBlueprintContent("<script>alert('xss')</script>"),
      ).toThrow();
    });
  });
});
