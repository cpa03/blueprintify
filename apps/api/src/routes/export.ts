/**
 * Export Routes
 *
 * API endpoints for exporting project data in various formats.
 * Supports JSON, Markdown, and ZIP manifest exports with
 * structured response formats for client-side processing.
 *
 * @module routes/export
 */

import { Hono } from "hono";
import { CONTEXT_KEYS, ExportRequestSchema } from "@blueprint/shared";
import { ErrorType } from "../errors";
import { validateJson, validatePromptInjection } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { secureLogError } from "../utils/secureLog";
import {
  API_METADATA,
  HTTP_STATUS,
  EXPORT_ERROR_MESSAGES,
  EXPORT_TEMPLATES,
} from "../config/constants";
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
  validatePromptInjection([
    { path: "projectName", label: "project name" },
    { path: "blueprint", label: "blueprint content" },
  ]),
  async (c) => {
    const { projectName, blueprint, tasks, format } = c.get(CONTEXT_KEYS.VALIDATED_DATA);

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
        let markdown = EXPORT_TEMPLATES.MARKDOWN.HEADER(projectName);
        markdown += EXPORT_TEMPLATES.MARKDOWN.EXPORTED_LINE(timestamp);
        markdown += EXPORT_TEMPLATES.MARKDOWN.BLUEPRINT_SECTION(blueprint);
        if (tasks) {
          markdown += EXPORT_TEMPLATES.MARKDOWN.TASKS_SECTION(tasks);
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
            type: ErrorType.VALIDATION,
            message: EXPORT_ERROR_MESSAGES.UNSUPPORTED_FORMAT(format),
            timestamp: new Date().toISOString(),
          },
        },
        HTTP_STATUS.BAD_REQUEST
      );
    } catch (error) {
      secureLogError("Export error", error, { projectName, format });
      return c.json(
        {
          success: false,
          error: {
            type: ErrorType.INTERNAL,
            message: error instanceof Error ? error.message : EXPORT_ERROR_MESSAGES.EXPORT_FAILED,
            timestamp: new Date().toISOString(),
          },
        },
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

export default app;
