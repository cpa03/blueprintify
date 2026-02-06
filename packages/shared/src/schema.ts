export * from "./config";

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

// Database subcategories for enhanced categorization
export const DatabaseSubcategory = z.enum([
  "relational",
  "nosql",
  "vector",
  "graph",
  "edge",
  "search",
  "cache",
  "serverless",
]);

export const TechStackItem = z.object({
  name: z.string().min(1),
  category: TechStackCategory,
  subcategory: DatabaseSubcategory.optional(),
  version: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
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

// ===== Task Item Schema (Future Proofing) =====
export const TaskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const TaskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const TaskItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema.optional(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});

export const TaskListSchema = z.array(TaskItemSchema);

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

// ===== Error Response Schemas =====
export const ErrorTypeSchema = z.enum([
  "validation",
  "authentication",
  "authorization",
  "not_found",
  "configuration",
  "network",
  "ai_service",
  "internal",
]);

export const ErrorDetailSchema = z.object({
  type: ErrorTypeSchema,
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string(),
  requestId: z.string().optional(),
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: ErrorDetailSchema,
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

// ===== Success Response Schema =====
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
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
    // Relational Databases
    {
      name: "PostgreSQL",
      category: "database" as const,
      subcategory: "relational" as const,
      description:
        "Advanced open-source relational database with strong ACID compliance",
    },
    {
      name: "MySQL",
      category: "database" as const,
      subcategory: "relational" as const,
      description:
        "Popular open-source relational database known for reliability",
    },
    {
      name: "PlanetScale",
      category: "database" as const,
      subcategory: "serverless" as const,
      description: "MySQL-compatible serverless database platform",
    },

    // NoSQL Databases
    {
      name: "MongoDB",
      category: "database" as const,
      subcategory: "nosql" as const,
      description: "Document-oriented NoSQL database for modern applications",
    },
    {
      name: "Redis",
      category: "database" as const,
      subcategory: "cache" as const,
      description: "In-memory data structure store for caching and messaging",
    },
    {
      name: "DynamoDB",
      category: "database" as const,
      subcategory: "nosql" as const,
      description: "AWS fully managed NoSQL database service",
    },
    {
      name: "Cassandra",
      category: "database" as const,
      subcategory: "nosql" as const,
      description: "Distributed NoSQL database for high scalability",
    },

    // Vector Databases
    {
      name: "Pinecone",
      category: "database" as const,
      subcategory: "vector" as const,
      description: "Managed vector database for AI/ML applications",
    },
    {
      name: "Weaviate",
      category: "database" as const,
      subcategory: "vector" as const,
      description: "Open-source vector database with GraphQL API",
    },
    {
      name: "Chroma",
      category: "database" as const,
      subcategory: "vector" as const,
      description: "Open-source vector database for AI applications",
    },

    // Graph Databases
    {
      name: "Neo4j",
      category: "database" as const,
      subcategory: "graph" as const,
      description: "Leading graph database platform for connected data",
    },
    {
      name: "Amazon Neptune",
      category: "database" as const,
      subcategory: "graph" as const,
      description: "AWS managed graph database service",
    },

    // Edge and Serverless Databases
    {
      name: "FaunaDB",
      category: "database" as const,
      subcategory: "edge" as const,
      description: "Global serverless database with strong consistency",
    },
    {
      name: "Upstash",
      category: "database" as const,
      subcategory: "edge" as const,
      description:
        "Serverless Redis-compatible database with edge capabilities",
    },
    {
      name: "Cloudflare D1",
      category: "database" as const,
      subcategory: "serverless" as const,
      description: "SQLite-based serverless database at the edge",
    },
    {
      name: "Supabase",
      category: "database" as const,
      subcategory: "serverless" as const,
      description: "Open-source Firebase alternative with PostgreSQL backend",
    },

    // Search Databases
    {
      name: "Elasticsearch",
      category: "database" as const,
      subcategory: "search" as const,
      description: "Distributed search and analytics engine",
    },
    {
      name: "Algolia",
      category: "database" as const,
      subcategory: "search" as const,
      description: "Managed search-as-a-service platform",
    },
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
