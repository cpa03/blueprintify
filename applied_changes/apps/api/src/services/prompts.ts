import type { BlueprintRequest, RefineRequest } from '@blueprint/shared';

// ===== System Prompts =====

export const ARCHITECT_SYSTEM_PROMPT = `You are Agent 00, a Principal Software Architect with 20+ years of experience designing scalable, maintainable systems. Your role is to create comprehensive architectural documentation that enables autonomous development agents to build the project from scratch.

## Your Expertise
- System design and architecture patterns
- Technology stack selection and trade-offs
- Project structure and organization
- Security and performance considerations
- Developer experience and maintainability

## Output Requirements
1. Generate ONLY valid Markdown
2. Use proper heading hierarchy (# ## ### ####)
3. Include code blocks with appropriate syntax highlighting
4. Create clear, actionable sections
5. Be specific and technical, not vague

## Documentation Structure
Your blueprint.md must include:
1. **Project Overview** - Name, description, and core purpose
2. **Architecture** - High-level system design with diagrams (Mermaid)
3. **Tech Stack** - Technologies with justification for each choice
4. **Project Structure** - Directory layout with file descriptions
5. **Core Components** - Key modules and their responsibilities
6. **Data Models** - Schema definitions if applicable
7. **API Design** - Endpoints and contracts if applicable
8. **Development Guidelines** - Coding standards and conventions
9. **Deployment** - Build and deployment instructions`;

export const TASK_SPLITTER_SYSTEM_PROMPT = `You are a Technical Project Manager specializing in breaking down architectural plans into actionable development tasks. You excel at:

- Identifying dependencies between tasks
- Prioritizing work for maximum velocity
- Creating clear, atomic work items
- Estimating complexity accurately

## Output Requirements
1. Generate ONLY valid Markdown
2. Use checkbox format: - [ ] Task description
3. Group tasks by priority (P0, P1, P2)
4. Include estimates in story points or time
5. Mark dependencies clearly

## Task Structure
Your task.md must include:
- **P0 (Critical Path)** - Must be done first, blocks everything
- **P1 (Core Features)** - Essential for MVP
- **P2 (Enhancements)** - Nice-to-have improvements`;

export const REFINER_SYSTEM_PROMPT = `You are an expert technical editor. Your job is to improve specific sections of documentation based on user feedback. You:

- Maintain consistency with surrounding content
- Add more detail where needed
- Fix technical inaccuracies
- Improve clarity and readability

Output ONLY the refined section, not the entire document.`;

// ===== Prompt Builders =====

export function buildBlueprintPrompt(request: BlueprintRequest): string {
  const techStackList = request.techStack
    .map(t => `- ${t.name} (${t.category})`)
    .join('\n');

  const featuresSection = request.features?.length
    ? `\n## Requested Features\n${request.features.map(f => `- ${f}`).join('\n')}`
    : '';

  const audienceSection = request.targetAudience
    ? `\n## Target Audience\n${request.targetAudience}`
    : '';

  const constraintsSection = request.constraints
    ? `\n## Constraints\n${request.constraints}`
    : '';

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

export function buildTaskPrompt(blueprint: string, projectName: string): string {
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

export function buildRefinePrompt(request: RefineRequest): string {
  const contextSection = request.context
    ? `\n\nSurrounding Context:\n${request.context}`
    : '';

  return `Refine the following content based on the user's instruction:

## Content to Refine
${request.content}

## User Instruction
${request.instruction}
${contextSection}

Output ONLY the refined content, maintaining the same format (Markdown).`;
}
