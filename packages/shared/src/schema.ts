import { z } from "zod";

// ===== Tech Stack Options =====
export const TechStackCategory = z.enum([
  "frontend",
  "backend",
  "database",
  "hosting",
  "ai",
  "testing",
  "styling",
  "other",
]);

export const TechStackItem = z.object({
  name: z.string().min(1),
  category: TechStackCategory,
  version: z.string().optional(),
});

// ===== Blueprint Request Schema =====
export const BlueprintRequestSchema = z.object({
  projectName: z.string().min(1, "Project name is required").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  techStack: z
    .array(TechStackItem)
    .min(1, "At least one technology is required"),
  features: z.array(z.string().min(1)).optional(),
  targetAudience: z.string().optional(),
  constraints: z.string().optional(),
});

// ===== Task Generation Schema =====
export const TaskGenerationRequestSchema = z.object({
  blueprint: z.string().min(1, "Blueprint content is required"),
  projectName: z.string().min(1),
});

// ===== Refinement Request Schema =====
export const RefineRequestSchema = z.object({
  content: z.string().min(1, "Content to refine is required"),
  instruction: z.string().min(1, "Refinement instruction is required"),
  context: z.string().optional(),
});

// ===== Template Schema =====
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  projectName: z.string(),
  defaultDescription: z.string(),
  techStack: z.array(TechStackItem),
  features: z.array(z.string()),
});

// ===== API Response Schemas =====
export const StreamChunkSchema = z.object({
  type: z.enum(["content", "error", "done"]),
  content: z.string().optional(),
  error: z.string().optional(),
});

export const GenerationResultSchema = z.object({
  blueprint: z.string(),
  tasks: z.string().optional(),
  generatedAt: z.string(),
});

// ===== Predefined Tech Stack Options =====
export const TECH_STACK_OPTIONS = {
  frontend: [
    { name: "React", category: "frontend" as const },
    { name: "Vue.js", category: "frontend" as const },
    { name: "Next.js", category: "frontend" as const },
    { name: "Svelte", category: "frontend" as const },
    { name: "Angular", category: "frontend" as const },
    { name: "Astro", category: "frontend" as const },
  ],
  backend: [
    { name: "Hono", category: "backend" as const },
    { name: "Express", category: "backend" as const },
    { name: "Fastify", category: "backend" as const },
    { name: "NestJS", category: "backend" as const },
    { name: "Django", category: "backend" as const },
    { name: "FastAPI", category: "backend" as const },
  ],
  database: [
    { name: "PostgreSQL", category: "database" as const },
    { name: "MySQL", category: "database" as const },
    { name: "MongoDB", category: "database" as const },
    { name: "Supabase", category: "database" as const },
    { name: "Cloudflare D1", category: "database" as const },
    { name: "PlanetScale", category: "database" as const },
  ],
  hosting: [
    { name: "Cloudflare", category: "hosting" as const },
    { name: "Vercel", category: "hosting" as const },
    { name: "Netlify", category: "hosting" as const },
    { name: "AWS", category: "hosting" as const },
    { name: "Railway", category: "hosting" as const },
    { name: "Fly.io", category: "hosting" as const },
  ],
  styling: [
    { name: "Tailwind CSS", category: "styling" as const },
    { name: "Styled Components", category: "styling" as const },
    { name: "CSS Modules", category: "styling" as const },
    { name: "Sass/SCSS", category: "styling" as const },
  ],
} as const;
