import { describe, it, expect, beforeEach } from "vitest";
import {
  MockDatabaseService,
  serializeJSON,
  deserializeJSON,
  DatabaseError,
  ValidationError,
  NotFoundError,
} from "./index";

describe("MockDatabaseService", () => {
  let db: MockDatabaseService;

  beforeEach(() => {
    db = new MockDatabaseService();
  });

  describe("User Operations", () => {
    it("should create a user with auto-generated id and timestamps", async () => {
      const user = await db.createUser({
        email: "test@example.com",
        name: "Test User",
        avatar_url: "https://example.com/avatar.png",
      });

      expect(user.id).toMatch(/^user_\d+_[a-z0-9]+$/);
      expect(user.email).toBe("test@example.com");
      expect(user.name).toBe("Test User");
      expect(user.avatar_url).toBe("https://example.com/avatar.png");
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it("should get user by id", async () => {
      const created = await db.createUser({
        email: "test@example.com",
        name: "Test User",
      });

      const found = await db.getUserById(created.id);
      expect(found).toEqual(created);
    });

    it("should return null for non-existent user", async () => {
      const found = await db.getUserById("non-existent-id");
      expect(found).toBeNull();
    });

    it("should get user by email", async () => {
      const created = await db.createUser({
        email: "test@example.com",
        name: "Test User",
      });

      const found = await db.getUserByEmail("test@example.com");
      expect(found).toEqual(created);
    });

    it("should return null for non-existent email", async () => {
      const found = await db.getUserByEmail("nonexistent@example.com");
      expect(found).toBeNull();
    });

    it("should update a user", async () => {
      const created = await db.createUser({
        email: "test@example.com",
        name: "Test User",
      });

      const updated = await db.updateUser(created.id, {
        name: "Updated Name",
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.email).toBe("test@example.com");
      expect(updated.updated_at).toBeDefined();
    });

    it("should throw error when updating non-existent user", async () => {
      await expect(
        db.updateUser("non-existent-id", { name: "New Name" }),
      ).rejects.toThrow("User not found");
    });

    it("should delete a user", async () => {
      const created = await db.createUser({
        email: "test@example.com",
        name: "Test User",
      });

      await db.deleteUser(created.id);
      const found = await db.getUserById(created.id);
      expect(found).toBeNull();
    });
  });

  describe("Project Operations", () => {
    let userId: string;

    beforeEach(async () => {
      const user = await db.createUser({
        email: "test@example.com",
        name: "Test User",
      });
      userId = user.id;
    });

    it("should create a project with auto-generated id and timestamps", async () => {
      const project = await db.createProject({
        user_id: userId,
        name: "Test Project",
        description: "A test project",
        status: "active",
      });

      expect(project.id).toMatch(/^project_\d+_[a-z0-9]+$/);
      expect(project.user_id).toBe(userId);
      expect(project.name).toBe("Test Project");
      expect(project.description).toBe("A test project");
      expect(project.status).toBe("active");
    });

    it("should get projects by user id", async () => {
      await db.createProject({
        user_id: userId,
        name: "Project 1",
        status: "active",
      });
      await db.createProject({
        user_id: userId,
        name: "Project 2",
        status: "active",
      });

      const projects = await db.getProjectsByUserId(userId);
      expect(projects).toHaveLength(2);
    });

    it("should get projects by user id and status", async () => {
      await db.createProject({
        user_id: userId,
        name: "Active Project",
        status: "active",
      });
      await db.createProject({
        user_id: userId,
        name: "Archived Project",
        status: "archived",
      });
      await db.createProject({
        user_id: userId,
        name: "Another Active",
        status: "active",
      });

      const activeProjects = await db.getProjectsByUserIdAndStatus(
        userId,
        "active",
      );
      expect(activeProjects).toHaveLength(2);
      expect(activeProjects.every((p) => p.status === "active")).toBe(true);

      const archivedProjects = await db.getProjectsByUserIdAndStatus(
        userId,
        "archived",
      );
      expect(archivedProjects).toHaveLength(1);
      expect(archivedProjects[0]!.name).toBe("Archived Project");
    });

    it("should return empty array when no projects match status", async () => {
      await db.createProject({
        user_id: userId,
        name: "Active Project",
        status: "active",
      });

      const deletedProjects = await db.getProjectsByUserIdAndStatus(
        userId,
        "deleted",
      );
      expect(deletedProjects).toHaveLength(0);
    });

    it("should update a project", async () => {
      const created = await db.createProject({
        user_id: userId,
        name: "Test Project",
        status: "active",
      });

      const updated = await db.updateProject(created.id, {
        status: "archived",
      });

      expect(updated.status).toBe("archived");
    });

    it("should delete a project", async () => {
      const created = await db.createProject({
        user_id: userId,
        name: "Test Project",
        status: "active",
      });

      await db.deleteProject(created.id);
      const found = await db.getProjectById(created.id);
      expect(found).toBeNull();
    });
  });

  describe("Blueprint Operations", () => {
    let projectId: string;

    beforeEach(async () => {
      const user = await db.createUser({
        email: "test@example.com",
        name: "Test User",
      });
      const project = await db.createProject({
        user_id: user.id,
        name: "Test Project",
        status: "active",
      });
      projectId = project.id;
    });

    it("should create a blueprint", async () => {
      const blueprint = await db.createBlueprint({
        project_id: projectId,
        title: "Test Blueprint",
        content: "# Blueprint Content",
      });

      expect(blueprint.id).toMatch(/^blueprint_\d+_[a-z0-9]+$/);
      expect(blueprint.project_id).toBe(projectId);
      expect(blueprint.title).toBe("Test Blueprint");
      expect(blueprint.content).toBe("# Blueprint Content");
      expect(blueprint.version).toBe(1);
    });

    it("should get blueprints by project id", async () => {
      await db.createBlueprint({
        project_id: projectId,
        title: "Blueprint 1",
        content: "Content 1",
      });
      await db.createBlueprint({
        project_id: projectId,
        title: "Blueprint 2",
        content: "Content 2",
      });

      const blueprints = await db.getBlueprintsByProjectId(projectId);
      expect(blueprints).toHaveLength(2);
    });

    it("should get latest blueprint by project id", async () => {
      await db.createBlueprint({
        project_id: projectId,
        title: "Blueprint v1",
        content: "Content v1",
        version: 1,
      });
      await db.createBlueprint({
        project_id: projectId,
        title: "Blueprint v3",
        content: "Content v3",
        version: 3,
      });
      await db.createBlueprint({
        project_id: projectId,
        title: "Blueprint v2",
        content: "Content v2",
        version: 2,
      });

      const latest = await db.getLatestBlueprintByProjectId(projectId);
      expect(latest).toBeDefined();
      expect(latest?.version).toBe(3);
      expect(latest?.title).toBe("Blueprint v3");
    });

    it("should return null when no blueprints exist for project", async () => {
      const latest = await db.getLatestBlueprintByProjectId(projectId);
      expect(latest).toBeNull();
    });

    it("should update a blueprint", async () => {
      const created = await db.createBlueprint({
        project_id: projectId,
        title: "Test Blueprint",
        content: "Content",
      });

      const updated = await db.updateBlueprint(created.id, {
        title: "Updated Title",
        version: 2,
      });

      expect(updated.title).toBe("Updated Title");
      expect(updated.version).toBe(2);
    });
  });

  describe("Task Operations", () => {
    let blueprintId: string;

    beforeEach(async () => {
      const user = await db.createUser({
        email: "test@example.com",
        name: "Test User",
      });
      const project = await db.createProject({
        user_id: user.id,
        name: "Test Project",
        status: "active",
      });
      const blueprint = await db.createBlueprint({
        project_id: project.id,
        title: "Test Blueprint",
        content: "Content",
      });
      blueprintId = blueprint.id;
    });

    it("should create a task", async () => {
      const task = await db.createTask({
        blueprint_id: blueprintId,
        title: "Test Task",
        content: "Task content",
      });

      expect(task.id).toMatch(/^task_\d+_[a-z0-9]+$/);
      expect(task.blueprint_id).toBe(blueprintId);
      expect(task.title).toBe("Test Task");
    });

    it("should get tasks by blueprint id", async () => {
      await db.createTask({
        blueprint_id: blueprintId,
        title: "Task 1",
        content: "Content 1",
      });
      await db.createTask({
        blueprint_id: blueprintId,
        title: "Task 2",
        content: "Content 2",
      });

      const tasks = await db.getTasksByBlueprintId(blueprintId);
      expect(tasks).toHaveLength(2);
    });
  });

  describe("Template Operations", () => {
    it("should create a template", async () => {
      const template = await db.createTemplate({
        name: "React Starter",
        description: "A React starter template",
        icon: "⚛️",
        project_name: "React App",
        default_description: "A React application",
        category: "frontend",
        is_public: true,
      });

      expect(template.id).toMatch(/^template_\d+_[a-z0-9]+$/);
      expect(template.name).toBe("React Starter");
      expect(template.category).toBe("frontend");
      expect(template.is_public).toBe(true);
      expect(template.usage_count).toBe(0);
    });

    it("should get public templates", async () => {
      await db.createTemplate({
        name: "Public Template",
        description: "Description",
        icon: "🚀",
        project_name: "Project",
        default_description: "Default",
        category: "frontend",
        is_public: true,
      });
      await db.createTemplate({
        name: "Private Template",
        description: "Description",
        icon: "🔒",
        project_name: "Project",
        default_description: "Default",
        category: "frontend",
        is_public: false,
      });

      const templates = await db.getPublicTemplates();
      expect(templates).toHaveLength(1);
      expect(templates[0]!.name).toBe("Public Template");
    });

    it("should get templates by category", async () => {
      await db.createTemplate({
        name: "Frontend Template",
        description: "Description",
        icon: "🎨",
        project_name: "Project",
        default_description: "Default",
        category: "frontend",
        is_public: true,
      });
      await db.createTemplate({
        name: "Backend Template",
        description: "Description",
        icon: "⚙️",
        project_name: "Project",
        default_description: "Default",
        category: "backend",
        is_public: true,
      });

      const templates = await db.getTemplatesByCategory("frontend");
      expect(templates).toHaveLength(1);
      expect(templates[0]!.category).toBe("frontend");
    });

    it("should increment template usage count", async () => {
      const template = await db.createTemplate({
        name: "Template",
        description: "Description",
        icon: "📄",
        project_name: "Project",
        default_description: "Default",
        category: "general",
        is_public: true,
      });

      await db.incrementTemplateUsage(template.id);
      const found = await db.getTemplateById(template.id);
      expect(found?.usage_count).toBe(1);
    });

    it("should get templates by creator", async () => {
      const user = await db.createUser({
        email: "creator@example.com",
        name: "Creator",
      });

      await db.createTemplate({
        name: "User Template 1",
        description: "Description",
        icon: "📄",
        project_name: "Project",
        default_description: "Default",
        category: "frontend",
        is_public: true,
        created_by: user.id,
      });
      await db.createTemplate({
        name: "User Template 2",
        description: "Description",
        icon: "📄",
        project_name: "Project",
        default_description: "Default",
        category: "backend",
        is_public: false,
        created_by: user.id,
      });
      await db.createTemplate({
        name: "System Template",
        description: "Description",
        icon: "📄",
        project_name: "Project",
        default_description: "Default",
        category: "general",
        is_public: true,
      });

      const userTemplates = await db.getTemplatesByCreator(user.id);
      expect(userTemplates).toHaveLength(2);
      expect(userTemplates.every((t) => t.created_by === user.id)).toBe(true);
    });

    it("should return empty array when user has no templates", async () => {
      const user = await db.createUser({
        email: "nousetemplates@example.com",
        name: "No Templates User",
      });

      const templates = await db.getTemplatesByCreator(user.id);
      expect(templates).toHaveLength(0);
    });
  });

  describe("Session Operations", () => {
    let userId: string;

    beforeEach(async () => {
      const user = await db.createUser({
        email: "test@example.com",
        name: "Test User",
      });
      userId = user.id;
    });

    it("should create a session", async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      const session = await db.createSession({
        user_id: userId,
        session_data: JSON.stringify({ token: "abc123" }),
        expires_at: expiresAt,
      });

      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session.user_id).toBe(userId);
      expect(session.expires_at).toBe(expiresAt);
    });

    it("should get sessions by user id", async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      await db.createSession({
        user_id: userId,
        session_data: "{}",
        expires_at: expiresAt,
      });

      const sessions = await db.getSessionsByUserId(userId);
      expect(sessions).toHaveLength(1);
    });

    it("should delete expired sessions", async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const futureDate = new Date(Date.now() + 3600000).toISOString();

      await db.createSession({
        user_id: userId,
        session_data: "{}",
        expires_at: pastDate,
      });
      await db.createSession({
        user_id: userId,
        session_data: "{}",
        expires_at: futureDate,
      });

      const deleted = await db.deleteExpiredSessions();
      expect(deleted).toBe(1);

      const remaining = await db.getSessionsByUserId(userId);
      expect(remaining).toHaveLength(1);
    });
  });

  describe("Analytics Operations", () => {
    it("should track an event", async () => {
      await db.trackEvent({
        event_type: "blueprint_generated",
        event_data: JSON.stringify({ project: "test" }),
      });

      const events = await db.getAnalyticsByEventType("blueprint_generated");
      expect(events).toHaveLength(1);
      expect(events[0]!.event_type).toBe("blueprint_generated");
    });

    it("should track events with user id", async () => {
      const user = await db.createUser({
        email: "test@example.com",
        name: "Test User",
      });

      await db.trackEvent({
        user_id: user.id,
        event_type: "session_start",
      });

      const events = await db.getAnalyticsByUserId(user.id);
      expect(events).toHaveLength(1);
    });
  });

  describe("BlueprintShare Operations", () => {
    it("should create a blueprint share", async () => {
      const share = await db.createBlueprintShare({
        id: "share_abc123def456",
        title: "Shared Blueprint",
        blueprint: "# Blueprint Content",
      });

      expect(share.id).toBe("share_abc123def456");
      expect(share.title).toBe("Shared Blueprint");
      expect(share.created_at).toBeDefined();
    });

    it("should get blueprint share by id", async () => {
      await db.createBlueprintShare({
        id: "share_test123",
        title: "Shared Blueprint",
        blueprint: "# Content",
      });

      const found = await db.getBlueprintShareById("share_test123");
      expect(found).toBeDefined();
      expect(found?.title).toBe("Shared Blueprint");
    });

    it("should return null for expired share", async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      await db.createBlueprintShare({
        id: "share_expired",
        title: "Expired Share",
        blueprint: "# Content",
        expires_at: pastDate,
      });

      const found = await db.getBlueprintShareById("share_expired");
      expect(found).toBeNull();
    });

    it("should delete expired blueprint shares", async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const futureDate = new Date(Date.now() + 3600000).toISOString();

      await db.createBlueprintShare({
        id: "share_expired",
        title: "Expired",
        blueprint: "# Content",
        expires_at: pastDate,
      });
      await db.createBlueprintShare({
        id: "share_valid",
        title: "Valid",
        blueprint: "# Content",
        expires_at: futureDate,
      });

      const deleted = await db.deleteExpiredBlueprintShares();
      expect(deleted).toBe(1);
    });
  });

  describe("Health Check", () => {
    it("should return true for health check", async () => {
      const healthy = await db.healthCheck();
      expect(healthy).toBe(true);
    });
  });
});

describe("Utility Functions", () => {
  describe("serializeJSON", () => {
    it("should serialize object to JSON string", () => {
      const obj = { name: "test", value: 123 };
      const result = serializeJSON(obj);
      expect(result).toBe('{"name":"test","value":123}');
    });

    it("should serialize array to JSON string", () => {
      const arr = [1, 2, 3];
      const result = serializeJSON(arr);
      expect(result).toBe("[1,2,3]");
    });

    it("should serialize null", () => {
      const result = serializeJSON(null);
      expect(result).toBe("null");
    });

    it("should serialize undefined", () => {
      const result = serializeJSON(undefined);
      expect(result).toBe(undefined);
    });
  });

  describe("deserializeJSON", () => {
    it("should deserialize JSON string to object", () => {
      const result = deserializeJSON<{ name: string; value: number }>(
        '{"name":"test","value":123}',
      );
      expect(result).toEqual({ name: "test", value: 123 });
    });

    it("should deserialize JSON array", () => {
      const result = deserializeJSON<number[]>("[1,2,3]");
      expect(result).toEqual([1, 2, 3]);
    });

    it("should throw DatabaseError for invalid JSON", () => {
      expect(() => deserializeJSON("invalid json")).toThrow(DatabaseError);
    });

    it("should include cause in error for debugging", () => {
      try {
        deserializeJSON("{invalid}");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError);
        expect((error as DatabaseError).cause).toBeDefined();
      }
    });
  });
});

describe("Error Classes", () => {
  describe("DatabaseError", () => {
    it("should create error with message", () => {
      const error = new DatabaseError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("DatabaseError");
    });

    it("should create error with cause", () => {
      const cause = new Error("Original error");
      const error = new DatabaseError("Wrapped error", cause);
      expect(error.cause).toBe(cause);
    });
  });

  describe("ValidationError", () => {
    it("should create validation error", () => {
      const error = new ValidationError("Invalid data");
      expect(error.message).toBe("Invalid data");
      expect(error.name).toBe("ValidationError");
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });

  describe("NotFoundError", () => {
    it("should create not found error", () => {
      const error = new NotFoundError("Resource not found");
      expect(error.message).toBe("Resource not found");
      expect(error.name).toBe("NotFoundError");
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });
});
