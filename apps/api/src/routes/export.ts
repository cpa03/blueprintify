import { Hono } from "hono";
import { ExportRequestSchema } from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { API_METADATA } from "../config/constants";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * Export project data in various formats (JSON, ZIP, Markdown)
 * POST /export
 */
app.post(
  "/",
  rateLimit(rateLimitConfigs.standard),
  validateJson(ExportRequestSchema),
  async (c) => {
    const { projectName, blueprint, tasks, format } = c.get("validatedData");

    try {
      const timestamp = new Date().toISOString();
      const exportData = {
        projectName,
        blueprint,
        tasks,
        exportedAt: timestamp,
        version: API_METADATA.VERSION,
        format,
      };

      if (format === "json") {
        return c.json({
          success: true,
          data: exportData,
          filename: `${projectName.replace(/\s+/g, "_")}_export.json`,
        });
      }

      if (format === "markdown") {
        let markdown = `# ${projectName}\n\n`;
        markdown += `Exported: ${timestamp}\n\n`;
        markdown += `## Blueprint\n\n${blueprint}\n\n`;
        if (tasks) {
          markdown += `## Tasks\n\n${tasks}\n\n`;
        }

        return c.json({
          success: true,
          data: {
            content: markdown,
            filename: `${projectName.replace(/\s+/g, "_")}.md`,
          },
        });
      }

      if (format === "zip") {
        // For ZIP format, return a manifest that client can use
        return c.json({
          success: true,
          data: {
            manifest: exportData,
            filename: `${projectName.replace(/\s+/g, "_")}.zip`,
            note: "ZIP generation should be handled client-side or with additional service",
          },
        });
      }

      return c.json(
        {
          success: false,
          error: {
            type: "validation" as const,
            message: `Unsupported export format: ${format}`,
            timestamp: new Date().toISOString(),
          },
        },
        400,
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            type: "internal" as const,
            message: error instanceof Error ? error.message : "Export failed",
            timestamp: new Date().toISOString(),
          },
        },
        500,
      );
    }
  },
);

export default app;
