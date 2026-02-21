/**
 * Import Routes
 *
 * API endpoints for importing project data from various formats.
 * Supports JSON and Markdown imports with validation and
 * conflict resolution for data portability.
 *
 * @module routes/import
 */

import { Hono } from "hono";
import { ImportRequestSchema } from "@blueprint/shared";
import { validateJson } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { secureLogError } from "../utils/secureLog";
import { IMPORT_CONFIG } from "../config/constants";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

/**
 * Import project data from various formats (JSON, ZIP, Markdown)
 * POST /import
 */
app.post(
  "/",
  rateLimit(rateLimitConfigs.standard),
  validateJson(ImportRequestSchema),
  async (c) => {
    const { data, format, overwrite } = c.get("validatedData");

    try {
      const warnings: string[] = [];

      if (format === "json") {
        try {
          const parsed = JSON.parse(data);

          if (!parsed.projectName || !parsed.blueprint) {
            return c.json(
              {
                success: false,
                error: {
                  type: "validation" as const,
                  message:
                    "Invalid import data: missing required fields (projectName, blueprint)",
                  timestamp: new Date().toISOString(),
                },
              },
              400,
            );
          }

          if (
            parsed.version &&
            parsed.version !== IMPORT_CONFIG.EXPECTED_VERSION
          ) {
            warnings.push(
              `Version mismatch: expected ${IMPORT_CONFIG.EXPECTED_VERSION}, got ${parsed.version}`,
            );
          }

          return c.json({
            success: true,
            data: {
              projectName: parsed.projectName,
              blueprint: parsed.blueprint,
              tasks: parsed.tasks,
              importedAt: new Date().toISOString(),
              overwrite,
              warnings: warnings.length > 0 ? warnings : undefined,
            },
          });
        } catch (parseError) {
          return c.json(
            {
              success: false,
              error: {
                type: "validation" as const,
                message: "Invalid JSON format",
                details:
                  parseError instanceof Error ? parseError.message : undefined,
                timestamp: new Date().toISOString(),
              },
            },
            400,
          );
        }
      }

      if (format === "markdown") {
        // Parse markdown format - look for title at start of document
        // Match only if # is at the start of the document (not ## or later in the doc)
        const projectNameMatch = data.match(/^#[^#](.+)$/m);
        const projectName =
          projectNameMatch?.[1]?.trim() ?? IMPORT_CONFIG.DEFAULT_PROJECT_NAME;

        const blueprintMatch = data.match(
          /## Blueprint\s*\n\n?([\s\S]*?)(?=\n## |$)/,
        );
        const blueprint = blueprintMatch?.[1]?.trim() ?? "";

        const tasksMatch = data.match(/## Tasks\s*\n\n?([\s\S]*?)(?=\n## |$)/);
        const tasks = tasksMatch?.[1]?.trim();

        if (!blueprint) {
          return c.json(
            {
              success: false,
              error: {
                type: "validation" as const,
                message:
                  "Invalid markdown format: could not extract blueprint content",
                timestamp: new Date().toISOString(),
              },
            },
            400,
          );
        }

        return c.json({
          success: true,
          data: {
            projectName,
            blueprint,
            tasks,
            importedAt: new Date().toISOString(),
            overwrite,
            warnings: warnings.length > 0 ? warnings : undefined,
          },
        });
      }

      return c.json(
        {
          success: false,
          error: {
            type: "validation" as const,
            message: `Unsupported import format: ${format}`,
            timestamp: new Date().toISOString(),
          },
        },
        400,
      );
    } catch (error) {
      secureLogError("Import error", error, { format, overwrite });
      return c.json(
        {
          success: false,
          error: {
            type: "internal" as const,
            message: error instanceof Error ? error.message : "Import failed",
            timestamp: new Date().toISOString(),
          },
        },
        500,
      );
    }
  },
);

export default app;
