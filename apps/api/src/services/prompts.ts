import type { BlueprintRequest, RefineRequest } from "@blueprint/shared";
import { PROMPT_CONFIG } from "../config/constants";

// ===== System Prompts =====
// Re-export from config for backward compatibility

export const ARCHITECT_SYSTEM_PROMPT = PROMPT_CONFIG.ARCHITECT_SYSTEM;

export const TASK_SPLITTER_SYSTEM_PROMPT = PROMPT_CONFIG.TASK_SPLITTER_SYSTEM;

export const REFINER_SYSTEM_PROMPT = PROMPT_CONFIG.REFINER_SYSTEM;

// ===== Prompt Builders =====

/**
 * Builds a user prompt for blueprint generation from the request data.
 * @param request - The blueprint request containing project details
 * @returns Formatted prompt string for AI processing
 */
export function buildBlueprintPrompt(request: BlueprintRequest): string {
  const techStackList = request.techStack
    .map((t) => `- ${t.name} (${t.category})`)
    .join("\n");

  const featuresSection = request.features?.length
    ? `\n## Requested Features\n${request.features.map((f) => `- ${f}`).join("\n")}`
    : "";

  const audienceSection = request.targetAudience
    ? `\n## Target Audience\n${request.targetAudience}`
    : "";

  const constraintsSection = request.constraints
    ? `\n## Constraints\n${request.constraints}`
    : "";

  return `Generate a comprehensive blueprint.md for the following project:

# Project: ${request.projectName}

## Description
${request.description}

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
export function buildTaskPrompt(
  blueprint: string,
  projectName: string,
): string {
  return `Based on the following blueprint.md, generate a comprehensive task.md checklist:

---
${blueprint}
---

Create prioritized tasks (P0, P1, P2) for building "${projectName}" from scratch. Each task should be:
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
    ? `\n\nSurrounding Context:\n${request.context}`
    : "";

  return `Refine the following content based on the user's instruction:

## Content to Refine
${request.content}

## User Instruction
${request.instruction}
${contextSection}

Output ONLY the refined content, maintaining the same format (Markdown).`;
}
