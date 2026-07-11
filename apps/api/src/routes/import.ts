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
import { CONTEXT_KEYS, ImportRequestSchema } from "@blueprint/shared";
import { ErrorType, createErrorJson } from "../errors";
import { ERROR_CODES } from "@blueprint/shared";
import { validateJson, validatePromptInjection } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { secureLogError } from "../utils/secureLog";
import {
  IMPORT_CONFIG,
  IMPORT_REGEX,
  HTTP_STATUS,
  IMPORT_ERROR_MESSAGES,
} from "../config/constants";
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
  validatePromptInjection([{ path: "data", label: "import data" }]),
  async (c) => {
    const { data, format, overwrite } = c.get(CONTEXT_KEYS.VALIDATED_DATA);

    try {
      const warnings: string[] = [];

      if (format === "json") {
        try {
          const parsed = JSON.parse(data);

          if (!parsed.projectName || !parsed.blueprint) {
            return c.json(
              createErrorJson(ErrorType.VALIDATION, IMPORT_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, {
                code: ERROR_CODES.VALIDATION_ERROR,
              }),
              HTTP_STATUS.BAD_REQUEST
            );
          }

          if (parsed.version && parsed.version !== IMPORT_CONFIG.EXPECTED_VERSION) {
            warnings.push(
              `Version mismatch: expected ${IMPORT_CONFIG.EXPECTED_VERSION}, got ${parsed.version}`
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
            createErrorJson(ErrorType.VALIDATION, IMPORT_ERROR_MESSAGES.INVALID_JSON_FORMAT, {
              code: ERROR_CODES.VALIDATION_ERROR,
              details:
                parseError instanceof Error ? { parseMessage: parseError.message } : undefined,
            }),
            HTTP_STATUS.BAD_REQUEST
          );
        }
      }

      if (format === "markdown") {
        // Parse markdown format - look for title at start of document
        // Match only if # is at the start of the document (not ## or later in the doc)
        const projectNameMatch = data.match(IMPORT_REGEX.PROJECT_NAME);
        const projectName = projectNameMatch?.[1]?.trim() ?? IMPORT_CONFIG.DEFAULT_PROJECT_NAME;

        const blueprintMatch = data.match(IMPORT_REGEX.BLUEPRINT_SECTION);
        const blueprint = blueprintMatch?.[1]?.trim() ?? "";

        const tasksMatch = data.match(IMPORT_REGEX.TASKS_SECTION);
        const tasks = tasksMatch?.[1]?.trim();

        if (!blueprint) {
          return c.json(
            createErrorJson(ErrorType.VALIDATION, IMPORT_ERROR_MESSAGES.MISSING_BLUEPRINT_CONTENT, {
              code: ERROR_CODES.VALIDATION_ERROR,
            }),
            HTTP_STATUS.BAD_REQUEST
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
        createErrorJson(ErrorType.VALIDATION, IMPORT_ERROR_MESSAGES.UNSUPPORTED_FORMAT(format), {
          code: ERROR_CODES.VALIDATION_ERROR,
        }),
        HTTP_STATUS.BAD_REQUEST
      );
    } catch (error) {
      secureLogError("Import error", error, { format, overwrite });
      return c.json(
        createErrorJson(
          ErrorType.INTERNAL,
          error instanceof Error ? error.message : IMPORT_ERROR_MESSAGES.IMPORT_FAILED,
          { code: ERROR_CODES.INTERNAL_ERROR }
        ),
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

export default app;
