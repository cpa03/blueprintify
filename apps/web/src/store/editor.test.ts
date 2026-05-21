import { describe, it, expect, beforeEach, vi } from "vitest";
import { useEditorStore } from "./editor";

// Mock the storage module
vi.mock("../lib/storage", () => ({
  editorStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock the persistence module
vi.mock("./persistence", () => ({
  createPersistedStore: vi.fn(() => ({
    loadState: vi.fn(),
    debouncedSave: vi.fn(),
    cancelSave: vi.fn(),
    flushSave: vi.fn(),
  })),
}));

// Mock the security module
vi.mock("../lib/security", () => ({
  sanitizeForStorage: vi.fn((content) => ({
    isValid: true,
    sanitized: content,
  })),
  handleSecurityError: vi.fn((error) => error),
}));

// Mock constants
vi.mock("../config/constants", () => ({
  GENERATION_MESSAGES: {
    CANCELLED: "Generation cancelled",
    ERROR: "An error occurred during generation",
  },
  DEBOUNCE_CONFIG: {
    WIZARD: 300,
    EDITOR: 300,
  },
  EDITOR_TABS: {
    BLUEPRINT: "blueprint",
    TASKS: "tasks",
  },
}));

describe("editor store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useEditorStore.getState().reset();
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
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
    it("should update blueprint content", () => {
      const { setBlueprintContent } = useEditorStore.getState();

      setBlueprintContent("# My Blueprint");

      expect(useEditorStore.getState().blueprintContent).toBe("# My Blueprint");
    });

    it("should mark store as dirty", () => {
      const { setBlueprintContent } = useEditorStore.getState();

      setBlueprintContent("# My Blueprint");

      expect(useEditorStore.getState().isDirty).toBe(true);
    });
  });

  describe("appendBlueprintContent", () => {
    it("should append content to existing blueprint", () => {
      const { setBlueprintContent, appendBlueprintContent } = useEditorStore.getState();

      setBlueprintContent("# Part 1");
      appendBlueprintContent("\n## Part 2");

      expect(useEditorStore.getState().blueprintContent).toBe("# Part 1\n## Part 2");
    });

    it("should mark store as dirty", () => {
      const { appendBlueprintContent } = useEditorStore.getState();

      appendBlueprintContent("New content");

      expect(useEditorStore.getState().isDirty).toBe(true);
    });
  });

  describe("setTasksContent", () => {
    it("should update tasks content", () => {
      const { setTasksContent } = useEditorStore.getState();

      setTasksContent("- Task 1\n- Task 2");

      expect(useEditorStore.getState().tasksContent).toBe("- Task 1\n- Task 2");
    });

    it("should mark store as dirty", () => {
      const { setTasksContent } = useEditorStore.getState();

      setTasksContent("# Tasks");

      expect(useEditorStore.getState().isDirty).toBe(true);
    });
  });

  describe("appendTasksContent", () => {
    it("should append content to existing tasks", () => {
      const { setTasksContent, appendTasksContent } = useEditorStore.getState();

      setTasksContent("- Task 1");
      appendTasksContent("\n- Task 2");

      expect(useEditorStore.getState().tasksContent).toBe("- Task 1\n- Task 2");
    });

    it("should mark store as dirty", () => {
      const { appendTasksContent } = useEditorStore.getState();

      appendTasksContent("New task");

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
    it("should update generation progress", () => {
      const { setGenerationProgress } = useEditorStore.getState();

      setGenerationProgress("Generating section 1...");

      expect(useEditorStore.getState().generationProgress).toBe("Generating section 1...");
    });
  });

  describe("markClean", () => {
    it("should mark store as clean", () => {
      const { setBlueprintContent, markClean } = useEditorStore.getState();

      setBlueprintContent("# Content");
      markClean();

      expect(useEditorStore.getState().isDirty).toBe(false);
    });
  });

  describe("cancelGeneration", () => {
    it("should stop generation and set progress message", () => {
      const { setIsGenerating, setGenerationProgress, cancelGeneration } =
        useEditorStore.getState();

      setIsGenerating(true);
      setGenerationProgress("Processing...");

      cancelGeneration();

      const state = useEditorStore.getState();
      expect(state.isGenerating).toBe(false);
      expect(state.generationProgress).toBe("Generation cancelled");
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      const {
        setBlueprintContent,
        setTasksContent,
        setIsGenerating,
        setGenerationProgress,
        reset,
      } = useEditorStore.getState();

      // Modify state
      setBlueprintContent("# Blueprint");
      setTasksContent("- Task 1");
      setIsGenerating(true);
      setGenerationProgress("Working...");

      // Reset
      reset();

      // Verify reset
      const state = useEditorStore.getState();
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
});
