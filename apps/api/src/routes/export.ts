import { Hono } from "hono";
import { CONTEXT_KEYS, AUTH_DEFAULTS, ExportRequestSchema } from "@blueprint/shared";
import { ErrorType, createErrorJson } from "../errors";
import { ERROR_CODES } from "@blueprint/shared";
import { validateJson, validatePromptInjection } from "../middleware/validator";
import { rateLimit, rateLimitConfigs } from "../middleware/rateLimit";
import { authorize } from "../middleware/authorize";
import { secureLogError } from "../utils/secureLog";
import {
  API_METADATA,
  HTTP_STATUS,
  EXPORT_ERROR_MESSAGES,
  EXPORT_TEMPLATES,
  INJECTION_FIELD_DEFINITIONS,
  EXPORT_FORMATS,
  FILENAME_PATTERNS,
  LOG_CONTEXT,
} from "../config/constants";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

app.post(
  "/",
  rateLimit(rateLimitConfigs.standard),
  validateJson(ExportRequestSchema),
  validatePromptInjection(INJECTION_FIELD_DEFINITIONS.EXPORT),
  authorize(AUTH_DEFAULTS.DEFAULT_ROLE),
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

      if (format === EXPORT_FORMATS.JSON) {
        return c.json({
          success: true,
          data: exportData,
          filename: FILENAME_PATTERNS.EXPORT_JSON(projectName),
        });
      }

      if (format === EXPORT_FORMATS.MARKDOWN) {
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
            filename: FILENAME_PATTERNS.EXPORT_MARKDOWN(projectName),
          },
        });
      }

      if (format === EXPORT_FORMATS.ZIP) {
        return c.json({
          success: true,
          data: {
            manifest: exportData,
            filename: FILENAME_PATTERNS.EXPORT_ZIP(projectName),
            note: "ZIP generation should be handled client-side or with additional service",
          },
        });
      }

      return c.json(
        createErrorJson(ErrorType.VALIDATION, EXPORT_ERROR_MESSAGES.UNSUPPORTED_FORMAT(format), {
          code: ERROR_CODES.VALIDATION_ERROR,
        }),
        HTTP_STATUS.BAD_REQUEST
      );
    } catch (error) {
      secureLogError(LOG_CONTEXT.EXPORT, error, { projectName, format });
      return c.json(
        createErrorJson(
          ErrorType.INTERNAL,
          error instanceof Error ? error.message : EXPORT_ERROR_MESSAGES.EXPORT_FAILED,
          { code: ERROR_CODES.INTERNAL_ERROR }
        ),
        HTTP_STATUS.INTERNAL_ERROR
      );
    }
  }
);

export default app;
