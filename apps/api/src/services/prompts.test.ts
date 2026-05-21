import { describe, it, expect } from "vitest";
import {
  buildBlueprintPrompt,
  buildTaskPrompt,
  buildRefinePrompt,
  ARCHITECT_SYSTEM_PROMPT,
  TASK_SPLITTER_SYSTEM_PROMPT,
  REFINER_SYSTEM_PROMPT,
} from "./prompts";
import type { BlueprintRequest, RefineRequest } from "@blueprint/shared";

describe("prompts service", () => {
  describe("System Prompts", () => {
    it("should export ARCHITECT_SYSTEM_PROMPT", () => {
      expect(ARCHITECT_SYSTEM_PROMPT).toBeDefined();
      expect(typeof ARCHITECT_SYSTEM_PROMPT).toBe("string");
      expect(ARCHITECT_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it("should export TASK_SPLITTER_SYSTEM_PROMPT", () => {
      expect(TASK_SPLITTER_SYSTEM_PROMPT).toBeDefined();
      expect(typeof TASK_SPLITTER_SYSTEM_PROMPT).toBe("string");
      expect(TASK_SPLITTER_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });

    it("should export REFINER_SYSTEM_PROMPT", () => {
      expect(REFINER_SYSTEM_PROMPT).toBeDefined();
      expect(typeof REFINER_SYSTEM_PROMPT).toBe("string");
      expect(REFINER_SYSTEM_PROMPT.length).toBeGreaterThan(0);
    });
  });

  describe("buildBlueprintPrompt", () => {
    it("should generate prompt with required fields only", () => {
      const request: BlueprintRequest = {
        projectName: "Test Project",
        description: "A test project description",
        techStack: [
          { name: "React", category: "frontend" },
          { name: "Node.js", category: "backend" },
        ],
      };

      const prompt = buildBlueprintPrompt(request);

      expect(prompt).toContain("# Project: Test Project");
      expect(prompt).toContain("## Description");
      expect(prompt).toContain("A test project description");
      expect(prompt).toContain("## Tech Stack");
      expect(prompt).toContain("- React (frontend)");
      expect(prompt).toContain("- Node.js (backend)");
      expect(prompt).not.toContain("## Requested Features");
      expect(prompt).not.toContain("## Target Audience");
      expect(prompt).not.toContain("## Constraints");
    });

    it("should include features section when provided", () => {
      const request: BlueprintRequest = {
        projectName: "Test Project",
        description: "A test project description",
        techStack: [{ name: "React", category: "frontend" }],
        features: ["User authentication", "Dashboard"],
      };

      const prompt = buildBlueprintPrompt(request);

      expect(prompt).toContain("## Requested Features");
      expect(prompt).toContain("- User authentication");
      expect(prompt).toContain("- Dashboard");
    });

    it("should include target audience section when provided", () => {
      const request: BlueprintRequest = {
        projectName: "Test Project",
        description: "A test project description",
        techStack: [{ name: "React", category: "frontend" }],
        targetAudience: "Enterprise users",
      };

      const prompt = buildBlueprintPrompt(request);

      expect(prompt).toContain("## Target Audience");
      expect(prompt).toContain("Enterprise users");
    });

    it("should include constraints section when provided", () => {
      const request: BlueprintRequest = {
        projectName: "Test Project",
        description: "A test project description",
        techStack: [{ name: "React", category: "frontend" }],
        constraints: "Must work offline",
      };

      const prompt = buildBlueprintPrompt(request);

      expect(prompt).toContain("## Constraints");
      expect(prompt).toContain("Must work offline");
    });

    it("should include all optional sections when all are provided", () => {
      const request: BlueprintRequest = {
        projectName: "Full Project",
        description: "A comprehensive project",
        techStack: [
          { name: "React", category: "frontend" },
          {
            name: "PostgreSQL",
            category: "database",
            subcategory: "relational",
          },
        ],
        features: ["Auth", "API"],
        targetAudience: "Developers",
        constraints: "No external dependencies",
      };

      const prompt = buildBlueprintPrompt(request);

      expect(prompt).toContain("# Project: Full Project");
      expect(prompt).toContain("## Requested Features");
      expect(prompt).toContain("## Target Audience");
      expect(prompt).toContain("## Constraints");
      expect(prompt).toContain("- Auth");
      expect(prompt).toContain("- API");
      expect(prompt).toContain("Developers");
      expect(prompt).toContain("No external dependencies");
    });

    it("should format tech stack with category correctly", () => {
      const request: BlueprintRequest = {
        projectName: "Test",
        description: "Test description",
        techStack: [
          { name: "React", category: "frontend", version: "18.0" },
          {
            name: "PostgreSQL",
            category: "database",
            subcategory: "relational",
          },
        ],
      };

      const prompt = buildBlueprintPrompt(request);

      expect(prompt).toContain("- React (frontend)");
      expect(prompt).toContain("- PostgreSQL (database)");
    });
  });

  describe("buildTaskPrompt", () => {
    it("should generate task prompt with blueprint and project name", () => {
      const blueprint = "# My Blueprint\n\n## Overview\nThis is a test blueprint.";
      const projectName = "My Project";

      const prompt = buildTaskPrompt(blueprint, projectName);

      expect(prompt).toContain("Based on the following blueprint.md");
      expect(prompt).toContain(blueprint);
      expect(prompt).toContain('"My Project"');
      expect(prompt).toContain("prioritized tasks (P0, P1, P2)");
    });

    it("should include task requirements in prompt", () => {
      const blueprint = "Simple blueprint";
      const projectName = "Test";

      const prompt = buildTaskPrompt(blueprint, projectName);

      expect(prompt).toContain("Atomic and clearly defined");
      expect(prompt).toContain("Include file paths when applicable");
      expect(prompt).toContain("Estimate complexity");
      expect(prompt).toContain("Note dependencies");
    });

    it("should handle empty blueprint gracefully", () => {
      const blueprint = "";
      const projectName = "Empty Project";

      const prompt = buildTaskPrompt(blueprint, projectName);

      expect(prompt).toContain("Empty Project");
      expect(prompt).toBeDefined();
    });
  });

  describe("buildRefinePrompt", () => {
    it("should generate refine prompt with content and instruction", () => {
      const request: RefineRequest = {
        content: "## Authentication\n\nBasic login system",
        instruction: "Add JWT implementation details",
      };

      const prompt = buildRefinePrompt(request);

      expect(prompt).toContain("## Content to Refine");
      expect(prompt).toContain("## Authentication");
      expect(prompt).toContain("Basic login system");
      expect(prompt).toContain("## User Instruction");
      expect(prompt).toContain("Add JWT implementation details");
      expect(prompt).toContain("Output ONLY the refined content");
    });

    it("should include context section when provided", () => {
      const request: RefineRequest = {
        content: "## API\n\nREST endpoints",
        instruction: "Add GraphQL support",
        context: "This is for a React app with Hono backend",
      };

      const prompt = buildRefinePrompt(request);

      expect(prompt).toContain("Surrounding Context:");
      expect(prompt).toContain("This is for a React app with Hono backend");
    });

    it("should not include context section when not provided", () => {
      const request: RefineRequest = {
        content: "## Section\n\nContent",
        instruction: "Improve clarity",
      };

      const prompt = buildRefinePrompt(request);

      expect(prompt).not.toContain("Surrounding Context:");
    });

    it("should handle multiline content correctly", () => {
      const request: RefineRequest = {
        content: "## Section 1\n\nContent 1\n\n## Section 2\n\nContent 2",
        instruction: "Merge sections",
      };

      const prompt = buildRefinePrompt(request);

      expect(prompt).toContain("## Section 1");
      expect(prompt).toContain("Content 1");
      expect(prompt).toContain("## Section 2");
      expect(prompt).toContain("Content 2");
    });
  });
});
