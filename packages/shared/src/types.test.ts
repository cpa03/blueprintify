import { describe, it, expect } from "vitest";
import type {
  TechStackCategoryType,
  TechStackItemType,
  BlueprintRequest,
  TaskStatus,
  TaskPriority,
  TaskItem,
  ExportFormat,
  StorageQuota,
  StorageClearRequest,
  WizardStep,
  WizardState,
  Session,
  EditorTab,
  EditorState,
} from "./types.js";

describe("Type Exports", () => {
  describe("TechStackCategoryType", () => {
    it("should be exported", () => {
      const type: TechStackCategoryType = "frontend";
      expect(type).toBe("frontend");
    });

    it("should accept all valid categories", () => {
      const categories: TechStackCategoryType[] = [
        "frontend",
        "backend",
        "database",
        "hosting",
        "ai",
        "testing",
        "styling",
        "other",
      ];
      categories.forEach((category) => {
        expect(category).toBeDefined();
      });
    });
  });

  describe("TechStackItemType", () => {
    it("should be exported", () => {
      const item: TechStackItemType = {
        name: "React",
        category: "frontend",
      };
      expect(item.name).toBe("React");
      expect(item.category).toBe("frontend");
    });
  });

  describe("BlueprintRequest", () => {
    it("should be exported", () => {
      const request: BlueprintRequest = {
        projectName: "Test Project",
        description: "Test description",
        techStack: [{ name: "React", category: "frontend" }],
      };
      expect(request.projectName).toBe("Test Project");
    });
  });

  describe("TaskStatus", () => {
    it("should be exported", () => {
      const status: TaskStatus = "todo";
      expect(status).toBe("todo");
    });

    it("should accept all valid statuses", () => {
      const statuses: TaskStatus[] = ["todo", "in_progress", "done"];
      statuses.forEach((status) => {
        expect(status).toBeDefined();
      });
    });
  });

  describe("TaskPriority", () => {
    it("should be exported", () => {
      const priority: TaskPriority = "high";
      expect(priority).toBe("high");
    });

    it("should accept all valid priorities", () => {
      const priorities: TaskPriority[] = ["low", "medium", "high", "critical"];
      priorities.forEach((priority) => {
        expect(priority).toBeDefined();
      });
    });
  });

  describe("TaskItem", () => {
    it("should be exported", () => {
      const task: TaskItem = {
        id: "task-1",
        title: "Test Task",
        status: "todo",
        priority: "medium",
      };
      expect(task.id).toBe("task-1");
      expect(task.title).toBe("Test Task");
    });
  });

  describe("ExportFormat", () => {
    it("should be exported", () => {
      const format: ExportFormat = "json";
      expect(format).toBe("json");
    });

    it("should accept all valid formats", () => {
      const formats: ExportFormat[] = ["json", "zip", "markdown"];
      formats.forEach((format) => {
        expect(format).toBeDefined();
      });
    });
  });

  describe("StorageQuota", () => {
    it("should be exported", () => {
      const quota: StorageQuota = {
        used: 1000,
        total: 5000000,
        percentage: 0.02,
        projects: 5,
      };
      expect(quota.used).toBe(1000);
      expect(quota.total).toBe(5000000);
    });
  });

  describe("StorageClearRequest", () => {
    it("should be exported", () => {
      const request: StorageClearRequest = {
        confirm: true,
      };
      expect(request.confirm).toBe(true);
    });
  });

  describe("WizardStep", () => {
    it("should be exported", () => {
      const step: WizardStep = "info";
      expect(step).toBe("info");
    });

    it("should accept all valid steps", () => {
      const steps: WizardStep[] = ["info", "stack", "features", "review", "generating"];
      steps.forEach((step) => {
        expect(step).toBeDefined();
      });
    });
  });

  describe("WizardState", () => {
    it("should be exported", () => {
      const state: WizardState = {
        currentStep: "info",
        projectName: "Test Project",
        description: "A test project",
        techStack: [],
        features: [],
        targetAudience: "developers",
        constraints: "",
      };
      expect(state.currentStep).toBe("info");
      expect(state.projectName).toBe("Test Project");
    });
  });

  describe("Session", () => {
    it("should be exported", () => {
      const session: Session = {
        id: "session-1",
        wizardState: {
          currentStep: "info",
          projectName: "Test",
          description: "Test",
          techStack: [],
          features: [],
          targetAudience: "developers",
          constraints: "",
        },
        generatedBlueprint: null,
        generatedTasks: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };
      expect(session.id).toBe("session-1");
      expect(session.wizardState.projectName).toBe("Test");
    });
  });

  describe("EditorTab", () => {
    it("should be exported", () => {
      const tab: EditorTab = "blueprint";
      expect(tab).toBe("blueprint");
    });

    it("should accept all valid tabs", () => {
      const tabs: EditorTab[] = ["blueprint", "tasks"];
      tabs.forEach((tab) => {
        expect(tab).toBeDefined();
      });
    });
  });

  describe("EditorState", () => {
    it("should be exported", () => {
      const state: EditorState = {
        activeTab: "blueprint",
        blueprintContent: "# Blueprint",
        tasksContent: "- Task 1",
        isDirty: false,
      };
      expect(state.activeTab).toBe("blueprint");
      expect(state.isDirty).toBe(false);
    });
  });
});
