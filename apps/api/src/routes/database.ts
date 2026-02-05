import { Hono } from "hono";
import { DatabaseService } from "../services/database";
import { validateJson } from "../middleware/validator";
import { z } from "zod";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

// Validation schemas
const CreateBlueprintSchema = z.object({
  project_name: z.string().min(1),
  description: z.string().min(1),
  blueprint_content: z.string().min(1),
  target_audience: z.string().optional(),
  constraints: z.string().optional(),
  status: z.string().default("draft"),
});

const CreateTaskSchema = z.object({
  blueprint_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().default("todo"),
  priority: z.string().default("medium"),
  order_index: z.number().default(0),
  parent_task_id: z.string().optional(),
});

const CreateSessionSchema = z.object({
  current_step: z.string().default("project-details"),
  blueprint_id: z.string().optional(),
  template_id: z.string().optional(),
  project_data: z.string().optional(),
  expires_at: z.string().optional(),
});

// ===== Blueprint Routes =====

app.get("/blueprints", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const status = c.req.query("status") || "draft";

  try {
    const blueprints = await db.getBlueprintsByStatus(status);
    return c.json({ success: true, data: blueprints });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to fetch blueprints", type: "database" },
      },
      500,
    );
  }
});

app.get("/blueprints/:id", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param("id");

  try {
    const blueprint = await db.getBlueprint(id);
    if (!blueprint) {
      return c.json(
        {
          success: false,
          error: { message: "Blueprint not found", type: "not_found" },
        },
        404,
      );
    }
    return c.json({ success: true, data: blueprint });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to fetch blueprint", type: "database" },
      },
      500,
    );
  }
});

app.post("/blueprints", validateJson(CreateBlueprintSchema), async (c) => {
  const db = new DatabaseService(c.env.DB);
  const data = c.get("validatedData");

  try {
    const id = await db.createBlueprint(data);
    return c.json({ success: true, data: { id } }, 201);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to create blueprint", type: "database" },
      },
      500,
    );
  }
});

app.patch("/blueprints/:id/status", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param("id");
  const { status } = await c.req.json();

  if (!status) {
    return c.json(
      {
        success: false,
        error: { message: "Status is required", type: "validation" },
      },
      400,
    );
  }

  try {
    const success = await db.updateBlueprintStatus(id, status);
    if (!success) {
      return c.json(
        {
          success: false,
          error: { message: "Blueprint not found", type: "not_found" },
        },
        404,
      );
    }
    return c.json({ success: true, data: { updated: true } });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to update blueprint", type: "database" },
      },
      500,
    );
  }
});

app.delete("/blueprints/:id", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param("id");

  try {
    const success = await db.deleteBlueprint(id);
    if (!success) {
      return c.json(
        {
          success: false,
          error: { message: "Blueprint not found", type: "not_found" },
        },
        404,
      );
    }
    return c.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to delete blueprint", type: "database" },
      },
      500,
    );
  }
});

// ===== Task Routes =====

app.get("/blueprints/:blueprintId/tasks", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const blueprintId = c.req.param("blueprintId");

  try {
    const tasks = await db.getTasksByBlueprint(blueprintId);
    return c.json({ success: true, data: tasks });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to fetch tasks", type: "database" },
      },
      500,
    );
  }
});

app.post("/tasks", validateJson(CreateTaskSchema), async (c) => {
  const db = new DatabaseService(c.env.DB);
  const data = c.get("validatedData");

  try {
    const id = await db.createTask(data);
    return c.json({ success: true, data: { id } }, 201);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to create task", type: "database" },
      },
      500,
    );
  }
});

app.patch("/tasks/:id/status", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param("id");
  const { status } = await c.req.json();

  if (!status) {
    return c.json(
      {
        success: false,
        error: { message: "Status is required", type: "validation" },
      },
      400,
    );
  }

  try {
    const success = await db.updateTaskStatus(id, status);
    if (!success) {
      return c.json(
        {
          success: false,
          error: { message: "Task not found", type: "not_found" },
        },
        404,
      );
    }
    return c.json({ success: true, data: { updated: true } });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to update task", type: "database" },
      },
      500,
    );
  }
});

// ===== Template Routes =====

app.get("/templates", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const category = c.req.query("category");

  try {
    let templates;
    if (category) {
      templates = await db.getTemplatesByCategory(category);
    } else {
      // Get all active templates by querying each category
      const categories = [
        "web-development",
        "api-development",
        "static-site",
        "mobile-development",
        "e-commerce",
        "saas",
      ];
      templates = [];
      for (const cat of categories) {
        const catTemplates = await db.getTemplatesByCategory(cat);
        templates.push(...catTemplates);
      }
    }
    return c.json({ success: true, data: templates });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to fetch templates", type: "database" },
      },
      500,
    );
  }
});

app.get("/templates/:id", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param("id");

  try {
    const template = await db.getTemplate(id);
    if (!template) {
      return c.json(
        {
          success: false,
          error: { message: "Template not found", type: "not_found" },
        },
        404,
      );
    }

    // Increment usage count
    await db.incrementTemplateUsage(id);

    return c.json({ success: true, data: template });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to fetch template", type: "database" },
      },
      500,
    );
  }
});

// ===== Tech Stack Routes =====

app.get("/tech-stack", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const category = c.req.query("category");

  try {
    let techStack;
    if (category) {
      techStack = await db.getTechStackByCategory(category);
    } else {
      techStack = await db.getAllTechStackOptions();
    }
    return c.json({ success: true, data: techStack });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: "Failed to fetch tech stack options",
          type: "database",
        },
      },
      500,
    );
  }
});

// ===== Session Routes =====

app.post("/sessions", validateJson(CreateSessionSchema), async (c) => {
  const db = new DatabaseService(c.env.DB);
  const data = c.get("validatedData");

  // Set default expiration to 24 hours from now
  const expiresAt =
    data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  try {
    const id = await db.createUserSession({
      ...data,
      expires_at: expiresAt,
    });
    return c.json({ success: true, data: { id } }, 201);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to create session", type: "database" },
      },
      500,
    );
  }
});

app.get("/sessions/:id", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param("id");

  try {
    const session = await db.getUserSession(id);
    if (!session) {
      return c.json(
        {
          success: false,
          error: { message: "Session not found or expired", type: "not_found" },
        },
        404,
      );
    }
    return c.json({ success: true, data: session });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to fetch session", type: "database" },
      },
      500,
    );
  }
});

app.patch("/sessions/:id", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param("id");
  const updates = await c.req.json();

  try {
    const success = await db.updateUserSession(id, updates);
    if (!success) {
      return c.json(
        {
          success: false,
          error: { message: "Session not found", type: "not_found" },
        },
        404,
      );
    }
    return c.json({ success: true, data: { updated: true } });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to update session", type: "database" },
      },
      500,
    );
  }
});

app.delete("/sessions/:id", async (c) => {
  const db = new DatabaseService(c.env.DB);
  const id = c.req.param("id");

  try {
    const success = await db.deleteUserSession(id);
    if (!success) {
      return c.json(
        {
          success: false,
          error: { message: "Session not found", type: "not_found" },
        },
        404,
      );
    }
    return c.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: { message: "Failed to delete session", type: "database" },
      },
      500,
    );
  }
});

// ===== Health Check =====

app.get("/health", async (c) => {
  const db = new DatabaseService(c.env.DB);

  try {
    const isHealthy = await db.healthCheck();
    return c.json({
      success: true,
      data: {
        database: isHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          message: "Database health check failed",
          type: "database",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

export default app;
