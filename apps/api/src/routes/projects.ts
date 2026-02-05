import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { projectService } from "../services/projects";
import { BlueprintRequestSchema } from "@blueprint/shared";

const projects = new Hono();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  target_audience: z.string().optional(),
  constraints: z.string().optional(),
  tech_stack: z
    .array(
      z.object({
        name: z.string(),
        category: z.enum([
          "frontend",
          "backend",
          "database",
          "hosting",
          "ai",
          "testing",
          "styling",
          "other",
        ]),
        version: z.string().optional(),
      }),
    )
    .optional(),
  features: z.array(z.string()).optional(),
});

// List projects with pagination
projects.get("/", async (c) => {
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = parseInt(c.req.query("offset") || "0");

  try {
    const projects = await projectService.listProjects(limit, offset);
    return c.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal",
          message: "Failed to fetch projects",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Get project by ID
projects.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const project = await projectService.getProjectWithDetails(id);

    if (!project) {
      return c.json(
        {
          success: false,
          error: {
            type: "not_found",
            message: "Project not found",
            timestamp: new Date().toISOString(),
          },
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: project,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal",
          message: "Failed to fetch project",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Create new project
projects.post("/", zValidator("json", createProjectSchema), async (c) => {
  const data = c.req.valid("json");

  try {
    const project = await projectService.createProject(data);
    return c.json(
      {
        success: true,
        data: project,
      },
      201,
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal",
          message: "Failed to create project",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Update project
projects.put(
  "/:id",
  zValidator("json", createProjectSchema.partial()),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    try {
      const project = await projectService.updateProject(id, data);

      if (!project) {
        return c.json(
          {
            success: false,
            error: {
              type: "not_found",
              message: "Project not found",
              timestamp: new Date().toISOString(),
            },
          },
          404,
        );
      }

      return c.json({
        success: true,
        data: project,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            type: "internal",
            message: "Failed to update project",
            timestamp: new Date().toISOString(),
          },
        },
        500,
      );
    }
  },
);

// Delete project
projects.delete("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const deleted = await projectService.deleteProject(id);

    if (!deleted) {
      return c.json(
        {
          success: false,
          error: {
            type: "not_found",
            message: "Project not found",
            timestamp: new Date().toISOString(),
          },
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal",
          message: "Failed to delete project",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Get project tech stack
projects.get("/:id/tech-stack", async (c) => {
  const id = c.req.param("id");

  try {
    const techStack = await projectService.getProjectTechStack(id);
    return c.json({
      success: true,
      data: techStack,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal",
          message: "Failed to fetch project tech stack",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Get project features
projects.get("/:id/features", async (c) => {
  const id = c.req.param("id");

  try {
    const features = await projectService.getProjectFeatures(id);
    return c.json({
      success: true,
      data: features,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal",
          message: "Failed to fetch project features",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

export default projects;
