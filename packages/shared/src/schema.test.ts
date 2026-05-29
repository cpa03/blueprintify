import { describe, it, expect } from "vitest";
import {
  TechStackCategory,
  DatabaseSubcategory,
  TechStackItem,
  BlueprintRequestSchema,
  TaskStatusSchema,
  TaskPrioritySchema,
  TaskItemSchema,
  TaskListSchema,
  ExportFormatSchema,
  ExportRequestSchema,
  ImportRequestSchema,
  StorageClearRequestSchema,
  SuccessResponseSchema,
} from "./schema";
import { EXPORT_LIMITS } from "./config";

describe("TechStackCategory Schema", () => {
  it("should validate valid tech stack categories", () => {
    const categories = [
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
      const result = TechStackCategory.safeParse(category);
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid tech stack categories", () => {
    const result = TechStackCategory.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

describe("DatabaseSubcategory Schema", () => {
  it("should validate valid database subcategories", () => {
    const subcategories = [
      "relational",
      "nosql",
      "vector",
      "graph",
      "edge",
      "search",
      "cache",
      "serverless",
    ];
    subcategories.forEach((subcategory) => {
      const result = DatabaseSubcategory.safeParse(subcategory);
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid database subcategories", () => {
    const result = DatabaseSubcategory.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

describe("TechStackItem Schema", () => {
  it("should validate a valid tech stack item", () => {
    const item = {
      name: "React",
      category: "frontend" as const,
      version: "18.2.0",
    };
    const result = TechStackItem.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("should validate tech stack item with all fields", () => {
    const item = {
      name: "PostgreSQL",
      category: "database" as const,
      subcategory: "relational" as const,
      version: "15.0",
      description: "Open source relational database",
      features: ["ACID", "JSON support"],
    };
    const result = TechStackItem.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("should reject item with empty name", () => {
    const item = {
      name: "",
      category: "frontend" as const,
    };
    const result = TechStackItem.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("should reject item with invalid category", () => {
    const item = {
      name: "Test",
      category: "invalid",
    };
    const result = TechStackItem.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("should reject item with invalid subcategory", () => {
    const item = {
      name: "Test",
      category: "database" as const,
      subcategory: "invalid",
    };
    const result = TechStackItem.safeParse(item);
    expect(result.success).toBe(false);
  });
});

describe("BlueprintRequestSchema", () => {
  it("should validate a valid blueprint request", () => {
    const request = {
      projectName: "My Project",
      description: "A test project",
      techStack: [{ name: "React", category: "frontend" as const }],
      features: ["Authentication"],
    };
    const result = BlueprintRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should reject request without projectName", () => {
    const request = {
      description: "A test project",
      techStack: [{ name: "React", category: "frontend" as const }],
    };
    const result = BlueprintRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it("should reject request with empty techStack", () => {
    const request = {
      projectName: "My Project",
      description: "A test project",
      techStack: [],
    };
    const result = BlueprintRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

describe("TaskStatusSchema", () => {
  it("should validate valid task statuses", () => {
    const statuses = ["todo", "in_progress", "done"];
    statuses.forEach((status) => {
      const result = TaskStatusSchema.safeParse(status);
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid task status", () => {
    const result = TaskStatusSchema.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

describe("TaskPrioritySchema", () => {
  it("should validate valid task priorities", () => {
    const priorities = ["low", "medium", "high", "critical"];
    priorities.forEach((priority) => {
      const result = TaskPrioritySchema.safeParse(priority);
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid task priority", () => {
    const result = TaskPrioritySchema.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

describe("TaskItemSchema", () => {
  it("should validate a valid task item", () => {
    const task = {
      id: "task-1",
      title: "Implement auth",
      description: "Add authentication",
      status: "todo" as const,
      priority: "high" as const,
    };
    const result = TaskItemSchema.safeParse(task);
    expect(result.success).toBe(true);
  });

  it("should validate task item with all fields", () => {
    const task = {
      id: "task-1",
      title: "Implement auth",
      description: "Add authentication",
      status: "in_progress" as const,
      priority: "critical" as const,
      assignee: "John",
      dependencies: ["task-0"],
      estimatedHours: 8,
    };
    const result = TaskItemSchema.safeParse(task);
    expect(result.success).toBe(true);
  });
});

describe("TaskListSchema", () => {
  it("should validate a valid task list", () => {
    const tasks = [
      { id: "task-1", title: "Task 1", status: "todo" as const, priority: "low" as const },
      { id: "task-2", title: "Task 2", status: "done" as const, priority: "high" as const },
    ];
    const result = TaskListSchema.safeParse(tasks);
    expect(result.success).toBe(true);
  });

  it("should validate empty task list", () => {
    const tasks: never[] = [];
    const result = TaskListSchema.safeParse(tasks);
    expect(result.success).toBe(true);
  });
});

describe("ExportFormatSchema", () => {
  it("should validate valid export formats", () => {
    ["json", "zip", "markdown"].forEach((format) => {
      const result = ExportFormatSchema.safeParse(format);
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid export format", () => {
    const result = ExportFormatSchema.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

describe("ExportRequestSchema", () => {
  it("should reject blueprint exceeding max length", () => {
    const result = ExportRequestSchema.safeParse({
      projectName: "Test",
      blueprint: "x".repeat(EXPORT_LIMITS.MAX_BLUEPRINT_LENGTH + 1),
      format: "json",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain("blueprint");
    }
  });

  it("should accept blueprint at max length", () => {
    const result = ExportRequestSchema.safeParse({
      projectName: "Test",
      blueprint: "x".repeat(EXPORT_LIMITS.MAX_BLUEPRINT_LENGTH),
      format: "json",
    });
    expect(result.success).toBe(true);
  });

  it("should reject tasks exceeding max length", () => {
    const result = ExportRequestSchema.safeParse({
      projectName: "Test",
      blueprint: "valid content",
      tasks: "x".repeat(EXPORT_LIMITS.MAX_TASKS_LENGTH + 1),
      format: "json",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain("tasks");
    }
  });

  it("should accept missing tasks", () => {
    const result = ExportRequestSchema.safeParse({
      projectName: "Test",
      blueprint: "valid content",
      format: "json",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty blueprint", () => {
    const result = ExportRequestSchema.safeParse({
      projectName: "Test",
      blueprint: "",
      format: "json",
    });
    expect(result.success).toBe(false);
  });
});

describe("ImportRequestSchema", () => {
  it("should reject data exceeding max length", () => {
    const result = ImportRequestSchema.safeParse({
      data: "x".repeat(EXPORT_LIMITS.MAX_IMPORT_DATA_LENGTH + 1),
      format: "json",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain("data");
    }
  });

  it("should accept data at max length", () => {
    const result = ImportRequestSchema.safeParse({
      data: "x".repeat(EXPORT_LIMITS.MAX_IMPORT_DATA_LENGTH),
      format: "json",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty data", () => {
    const result = ImportRequestSchema.safeParse({
      data: "",
      format: "json",
    });
    expect(result.success).toBe(false);
  });
});

describe("StorageClearRequestSchema", () => {
  it("should validate a valid storage clear request", () => {
    const request = {
      confirm: true,
    };
    const result = StorageClearRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("should reject request without confirm", () => {
    const request = {};
    const result = StorageClearRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

describe("SuccessResponseSchema", () => {
  it("should validate a valid success response", () => {
    const response = {
      success: true,
      data: { id: "123" },
    };
    const result = SuccessResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });
});
