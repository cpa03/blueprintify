/**
 * Prompt Service Module
 *
 * Provides system prompts and prompt builders for AI generation operations.
 * System prompts are re-exported from configuration for backward compatibility.
 *
 * @module services/prompts
 */

import type { BlueprintRequest, RefineRequest } from "@blueprint/shared";
import { PROMPT_CONFIG } from "../config/constants";

// ===== System Prompts =====
// Re-export from config for backward compatibility

/** System prompt for the Architect AI persona (Principal Software Architect) */
export const ARCHITECT_SYSTEM_PROMPT = PROMPT_CONFIG.ARCHITECT_SYSTEM;

/** System prompt for the Task Splitter AI persona (Technical Project Manager) */
export const TASK_SPLITTER_SYSTEM_PROMPT = PROMPT_CONFIG.TASK_SPLITTER_SYSTEM;

/** System prompt for the Refiner AI persona (Technical Editor) */
export const REFINER_SYSTEM_PROMPT = PROMPT_CONFIG.REFINER_SYSTEM;

// ===== Input Sanitization =====

/** Maximum length for any single user input field */
const MAX_INPUT_LENGTH = 5000;

/** Patterns that indicate prompt injection attempts (case-insensitive) */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,
  /forget\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,
  /disregard\s+(all\s+)?(previous\s+)?(instructions|prompts?|directives?|commands?)/gi,
  /system\s+prompts?:/gi,
  /you\s+(are\s+)?(now|will\s+now)\s+(an?\s+)?/gi,
  /act\s+as\s+(an?\s+)?/gi,
  /new\s+(instructions|prompts?|directives?):/gi,
  /over[-\s]?ride\s+(instructions|prompts?|directives?)/gi,
];

/**
 * Sanitizes user input to prevent prompt injection attacks.
 *
 * @param input - Raw user input string
 * @returns Sanitized string with injection patterns removed
 */
export function sanitizePromptInput(input: string): string {
  if (!input) return input;

  let sanitized = input;

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[redacted]");
  }

  sanitized = Array.from(sanitized)
    .filter((c) => {
      const code = c.charCodeAt(0);
      return !(code < 32 && code !== 9 && code !== 10 && code !== 13);
    })
    .join("");

  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
  }

  return sanitized.trim();
}

/**
 * Wraps user-provided content in XML-style delimiters to clearly separate
 * it from system instructions, reducing prompt injection risk.
 */
function withUserDelimiters(content: string): string {
  return `<user_input>\n${content}\n</user_input>`;
}

// ===== Prompt Builders =====

/**
 * Builds a user prompt for blueprint generation from the request data.
 * @param request - The blueprint request containing project details
 * @returns Formatted prompt string for AI processing
 */
export function buildBlueprintPrompt(request: BlueprintRequest): string {
  const techStackList = request.techStack.map((t) => `- ${t.name} (${t.category})`).join("\n");

  const sanitizedFeatures = request.features?.map((f) => sanitizePromptInput(f)) ?? [];
  const featuresSection = sanitizedFeatures.length
    ? `\n## Requested Features\n${sanitizedFeatures.map((f) => `- ${f}`).join("\n")}`
    : "";

  const audienceSection = request.targetAudience
    ? `\n## Target Audience\n${sanitizePromptInput(request.targetAudience)}`
    : "";

  const constraintsSection = request.constraints
    ? `\n## Constraints\n${sanitizePromptInput(request.constraints)}`
    : "";

  return `Generate a comprehensive blueprint.md for the following project:

# Project: ${sanitizePromptInput(request.projectName)}

## Description
${withUserDelimiters(sanitizePromptInput(request.description))}

## Tech Stack
${techStackList}
${featuresSection}
${audienceSection}
${constraintsSection}

Create a production-ready architectural blueprint that an autonomous development agent can use to build this project from scratch. Be thorough and specific.`;
}

/**
 * Builds a user prompt for task generation from a blueprint.
 * @param blueprint - The blueprint content to generate tasks from
 * @param projectName - The name of the project
 * @returns Formatted prompt string for AI processing
 */
export function buildTaskPrompt(blueprint: string, projectName: string): string {
  return `Based on the following blueprint.md, generate a comprehensive task.md checklist:

---
${blueprint}
---

Create prioritized tasks (P0, P1, P2) for building "${sanitizePromptInput(projectName)}" from scratch. Each task should be:
- Atomic and clearly defined
- Include file paths when applicable
- Estimate complexity (S/M/L or story points)
- Note dependencies on other tasks`;
}

/**
 * Builds a user prompt for content refinement.
 * @param request - The refine request containing content and instructions
 * @returns Formatted prompt string for AI processing
 */
export function buildRefinePrompt(request: RefineRequest): string {
  const contextSection = request.context
    ? `\n\nSurrounding Context:\n${withUserDelimiters(sanitizePromptInput(request.context))}`
    : "";

  return `Refine the following content based on the user's instruction:

## Content to Refine
${withUserDelimiters(sanitizePromptInput(request.content))}

## User Instruction
${withUserDelimiters(sanitizePromptInput(request.instruction))}
${contextSection}

Output ONLY the refined content, maintaining the same format (Markdown).`;
}
