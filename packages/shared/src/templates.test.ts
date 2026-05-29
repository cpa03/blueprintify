import { describe, it, expect } from "vitest";
import { STARTER_TEMPLATES } from "./templates.js";

describe("STARTER_TEMPLATES", () => {
  it("should have at least one template", () => {
    expect(STARTER_TEMPLATES.length).toBeGreaterThan(0);
  });

  it("should have unique template IDs", () => {
    const ids = STARTER_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid template IDs", () => {
    STARTER_TEMPLATES.forEach((template) => {
      expect(template.id).toBeTruthy();
      expect(typeof template.id).toBe("string");
      expect(template.id.length).toBeGreaterThan(0);
    });
  });

  it("should have valid template names", () => {
    STARTER_TEMPLATES.forEach((template) => {
      expect(template.name).toBeTruthy();
      expect(typeof template.name).toBe("string");
      expect(template.name.length).toBeGreaterThan(0);
    });
  });

  it("should have valid template descriptions", () => {
    STARTER_TEMPLATES.forEach((template) => {
      expect(template.description).toBeTruthy();
      expect(typeof template.description).toBe("string");
      expect(template.description.length).toBeGreaterThan(10);
    });
  });

  it("should have valid icons", () => {
    STARTER_TEMPLATES.forEach((template) => {
      expect(template.icon).toBeTruthy();
      expect(typeof template.icon).toBe("string");
      // Icons should be single emoji characters
      expect(template.icon.length).toBeGreaterThanOrEqual(1);
      expect(template.icon.length).toBeLessThanOrEqual(4);
    });
  });

  it("should have valid project names", () => {
    STARTER_TEMPLATES.forEach((template) => {
      expect(template.projectName).toBeTruthy();
      expect(typeof template.projectName).toBe("string");
      expect(template.projectName.length).toBeGreaterThan(0);
    });
  });

  it("should have valid default descriptions", () => {
    STARTER_TEMPLATES.forEach((template) => {
      expect(template.defaultDescription).toBeTruthy();
      expect(typeof template.defaultDescription).toBe("string");
      expect(template.defaultDescription.length).toBeGreaterThan(10);
    });
  });

  it("should have non-empty tech stack arrays", () => {
    STARTER_TEMPLATES.forEach((template) => {
      expect(template.techStack).toBeDefined();
      expect(Array.isArray(template.techStack)).toBe(true);
      expect(template.techStack.length).toBeGreaterThan(0);
    });
  });

  it("should have valid tech stack items", () => {
    STARTER_TEMPLATES.forEach((template) => {
      template.techStack.forEach((tech) => {
        expect(tech.name).toBeTruthy();
        expect(tech.category).toBeTruthy();
        const validCategories = [
          "frontend",
          "backend",
          "database",
          "hosting",
          "ai",
          "testing",
          "styling",
          "other",
        ];
        expect(validCategories).toContain(tech.category);
      });
    });
  });

  it("should have non-empty features arrays", () => {
    STARTER_TEMPLATES.forEach((template) => {
      expect(template.features).toBeDefined();
      expect(Array.isArray(template.features)).toBe(true);
      expect(template.features.length).toBeGreaterThan(0);
    });
  });

  it("should have valid feature strings", () => {
    STARTER_TEMPLATES.forEach((template) => {
      template.features.forEach((feature) => {
        expect(feature).toBeTruthy();
        expect(typeof feature).toBe("string");
        expect(feature.length).toBeGreaterThan(0);
      });
    });
  });

  it("should include Next.js SaaS template", () => {
    const template = STARTER_TEMPLATES.find((t) => t.id === "nextjs-saas");
    expect(template).toBeDefined();
    expect(template?.name).toBe("Next.js SaaS Boilerplate");
  });

  it("should include Hono Cloudflare API template", () => {
    const template = STARTER_TEMPLATES.find((t) => t.id === "hono-cloudflare-api");
    expect(template).toBeDefined();
    expect(template?.name).toBe("Hono + Cloudflare Worker API");
  });

  it("should include Chrome Extension template", () => {
    const template = STARTER_TEMPLATES.find((t) => t.id === "chrome-extension");
    expect(template).toBeDefined();
    expect(template?.name).toBe("Chrome Extension");
  });

  it("should include CLI Tool template", () => {
    const template = STARTER_TEMPLATES.find((t) => t.id === "cli-tool");
    expect(template).toBeDefined();
    expect(template?.name).toBe("CLI Tool");
  });

  it("should include React Dashboard template", () => {
    const template = STARTER_TEMPLATES.find((t) => t.id === "react-dashboard");
    expect(template).toBeDefined();
    expect(template?.name).toBe("React Admin Dashboard");
  });

  it("should include Full-Stack Monorepo template", () => {
    const template = STARTER_TEMPLATES.find((t) => t.id === "fullstack-monorepo");
    expect(template).toBeDefined();
    expect(template?.name).toBe("Full-Stack Monorepo");
  });

  it("should have expected number of templates", () => {
    expect(STARTER_TEMPLATES.length).toBe(6);
  });
});
