import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { templateService } from "../services/templates";

const templates = new Hono();

// Get all active templates
templates.get("/", async (c) => {
  try {
    const templates = await templateService.getActiveTemplates();
    return c.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal",
          message: "Failed to fetch templates",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Get template with details
templates.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const template = await templateService.getTemplateWithDetails(id);

    if (!template) {
      return c.json(
        {
          success: false,
          error: {
            type: "not_found",
            message: "Template not found",
            timestamp: new Date().toISOString(),
          },
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: template,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal",
          message: "Failed to fetch template",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Get templates by category
templates.get("/category/:category", async (c) => {
  const category = c.req.param("category");

  try {
    const templates = await templateService.getTemplatesByCategory(category);
    return c.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          type: "internal",
          message: "Failed to fetch templates by category",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Get template tech stack
templates.get("/:id/tech-stack", async (c) => {
  const id = c.req.param("id");

  try {
    const techStack = await templateService.getTemplateTechStack(id);
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
          message: "Failed to fetch template tech stack",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

// Get template features
templates.get("/:id/features", async (c) => {
  const id = c.req.param("id");

  try {
    const features = await templateService.getTemplateFeatures(id);
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
          message: "Failed to fetch template features",
          timestamp: new Date().toISOString(),
        },
      },
      500,
    );
  }
});

export default templates;
