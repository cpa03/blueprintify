export * from "./config";

import { z } from "zod";
import { VALIDATION_LIMITS } from "./config";

// ===== Tech Stack Options =====

/**
 * Technology stack category enumeration.
 * Used to categorize technologies in the wizard (e.g., "frontend", "backend", "database").
 */
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

/**
 * Database subcategory for fine-grained categorization.
 * Values: relational, nosql, vector, graph, edge, search, cache, serverless
 */
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

/**
 * Individual technology item schema.
 * Represents a single technology choice with name, category, and optional version.
 */
export const TechStackItem = z.object({
  name: z.string().min(1).max(VALIDATION_LIMITS.PROJECT_NAME.MAX),
  category: TechStackCategory,
  subcategory: DatabaseSubcategory.optional(),
  version: z.string().optional(),
  description: z.string().max(VALIDATION_LIMITS.DESCRIPTION.MAX).optional(),
  features: z.array(z.string()).min(1).max(VALIDATION_LIMITS.FEATURE.MAX).optional(),
});

// ===== Blueprint Request Schema =====

/**
 * Request payload for blueprint generation.
 * Contains project configuration including name, description, tech stack, and features.
 */
export const BlueprintRequestSchema = z.object({
  projectName: z
    .string()
    .min(VALIDATION_LIMITS.PROJECT_NAME.MIN, "Project name is required")
    .max(VALIDATION_LIMITS.PROJECT_NAME.MAX),
  description: z
    .string()
    .min(
      VALIDATION_LIMITS.DESCRIPTION.MIN,
      `Description must be at least ${VALIDATION_LIMITS.DESCRIPTION.MIN} characters`
    )
    .max(VALIDATION_LIMITS.DESCRIPTION.MAX),
  techStack: z
    .array(TechStackItem)
    .min(VALIDATION_LIMITS.TECH_STACK.MIN, "At least one technology is required"),
  features: z.array(z.string().min(1)).max(VALIDATION_LIMITS.FEATURE.MAX).optional(),
  targetAudience: z.string().max(VALIDATION_LIMITS.TARGET_AUDIENCE.MAX).optional(),
  constraints: z.string().max(VALIDATION_LIMITS.CONSTRAINTS.MAX).optional(),
});

// ===== Task Generation Schema =====

/**
 * Request payload for task generation from blueprint content.
 */
export const TaskGenerationRequestSchema = z.object({
  blueprint: z
    .string()
    .min(1, "Blueprint content is required")
    .max(
      VALIDATION_LIMITS.DESCRIPTION.MAX,
      `Blueprint must not exceed ${VALIDATION_LIMITS.DESCRIPTION.MAX} characters`
    ),
  projectName: z
    .string()
    .min(VALIDATION_LIMITS.PROJECT_NAME.MIN, "Project name is required")
    .max(VALIDATION_LIMITS.PROJECT_NAME.MAX),
});

// ===== Task Item Schema (Future Proofing) =====

/**
 * Task status enumeration.
 * Values: todo, in_progress, done
 */
export const TaskStatusSchema = z.enum(["todo", "in_progress", "done"]);

/**
 * Task priority enumeration.
 * Values: low, medium, high, critical
 */
export const TaskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

/**
 * Individual task item schema.
 * Represents a single actionable item in the generated task list.
 */
export const TaskItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(VALIDATION_LIMITS.PROJECT_NAME.MAX),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema.optional(),
  description: z.string().max(VALIDATION_LIMITS.DESCRIPTION.MAX).optional(),
  dependencies: z.array(z.string()).optional(),
});

/**
 * Array of task items.
 */
export const TaskListSchema = z.array(TaskItemSchema);

// ===== Refinement Request Schema =====

/**
 * Request payload for refining specific content sections.
 * Used for AI-powered content enhancement in the editor.
 */
export const RefineRequestSchema = z.object({
  content: z
    .string()
    .min(1, "Content to refine is required")
    .max(
      VALIDATION_LIMITS.DESCRIPTION.MAX,
      `Content must not exceed ${VALIDATION_LIMITS.DESCRIPTION.MAX} characters`
    ),
  instruction: z
    .string()
    .min(1, "Refinement instruction is required")
    .max(
      VALIDATION_LIMITS.CONSTRAINTS.MAX,
      `Instruction must not exceed ${VALIDATION_LIMITS.CONSTRAINTS.MAX} characters`
    ),
  context: z.string().optional(),
});

// ===== Template Schema =====

/**
 * Predefined project template schema.
 * Provides default values for common project types.
 */
export const TemplateSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(VALIDATION_LIMITS.PROJECT_NAME.MAX),
  description: z.string().max(VALIDATION_LIMITS.DESCRIPTION.MAX),
  icon: z.string().max(50),
  projectName: z
    .string()
    .min(VALIDATION_LIMITS.PROJECT_NAME.MIN)
    .max(VALIDATION_LIMITS.PROJECT_NAME.MAX),
  defaultDescription: z
    .string()
    .min(VALIDATION_LIMITS.DESCRIPTION.MIN)
    .max(VALIDATION_LIMITS.DESCRIPTION.MAX),
  techStack: z.array(TechStackItem),
  features: z.array(z.string().min(1).max(VALIDATION_LIMITS.FEATURE.MAX)),
});

// ===== Error Response Schemas =====

/**
 * Error type enumeration.
 * Values: validation, authentication, authorization, not_found, configuration, network, ai_service, internal, server_configuration, service_unavailable
 */
export const ErrorTypeSchema = z.enum([
  "validation",
  "authentication",
  "authorization",
  "not_found",
  "configuration",
  "network",
  "ai_service",
  "internal",
  "server_configuration",
  "service_unavailable",
]);

/**
 * Detailed error information schema.
 * Contains error type, message, optional code, details, timestamp, and request ID.
 */
export const ErrorDetailSchema = z.object({
  type: ErrorTypeSchema,
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string(),
  requestId: z.string().optional(),
});

/**
 * Error response schema for failed API requests.
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: ErrorDetailSchema,
});

// ===== API Response Schemas =====

/**
 * Single chunk of streaming response from AI generation.
 * Contains incremental content delivered via Server-Sent Events (SSE).
 */
export const StreamChunkSchema = z.object({
  type: z.enum(["content", "error", "done"]),
  content: z.string().optional(),
  error: z.string().optional(),
});

/**
 * Complete result of blueprint or task generation.
 * Contains the full generated content and metadata.
 */
export const GenerationResultSchema = z.object({
  blueprint: z.string(),
  tasks: z.string().optional(),
  generatedAt: z.string(),
});

// ===== Success Response Schema =====

/**
 * Generic success response schema.
 */
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

// ===== Export/Import Schemas (M2) =====

/**
 * Supported export format enumeration.
 * Values: json, zip, markdown
 */
export const ExportFormatSchema = z.enum(["json", "zip", "markdown"]);

/**
 * Request payload for exporting project data.
 * Specifies the format and content to export.
 */
export const ExportRequestSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  blueprint: z.string().min(1, "Blueprint content is required"),
  tasks: z.string().optional(),
  format: ExportFormatSchema.default("markdown"),
  includeMetadata: z.boolean().default(true),
});

/**
 * Request payload for importing project data.
 * Contains the data to import and optional conflict resolution strategy.
 */
export const ImportRequestSchema = z.object({
  data: z.string().min(1, "Import data is required"),
  format: ExportFormatSchema.default("json"),
  overwrite: z.boolean().default(false),
});

/**
 * Result of an import operation.
 * Contains success status, imported data, and any warnings.
 */
export const ImportResultSchema = z.object({
  projectName: z.string(),
  blueprint: z.string(),
  tasks: z.string().optional(),
  importedAt: z.string(),
  warnings: z.array(z.string()).optional(),
});

// ===== Storage Schemas (M2) =====

/**
 * Storage quota information schema.
 * Shows used/available space and project count.
 */
export const StorageQuotaSchema = z.object({
  used: z.number().int().min(0),
  total: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
  projects: z.number().int().min(0),
});

/**
 * Request payload for clearing stored data.
 * Requires confirmation set to true.
 */
export const StorageClearRequestSchema = z.object({
  confirm: z.boolean().refine((val) => val === true, {
    message: "Must confirm deletion",
  }),
});

// ===== Predefined Tech Stack Options =====

/**
 * Predefined technology stack options for the wizard.
 * Contains categorized lists of popular technologies across different categories.
 */
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
      description: "Advanced open-source relational database with strong ACID compliance",
    },
    {
      name: "MySQL",
      category: "database" as const,
      subcategory: "relational" as const,
      description: "Popular open-source relational database known for reliability",
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
      description: "Serverless Redis-compatible database with edge capabilities",
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
  ai: [
    { name: "OpenAI", category: "ai" as const },
    { name: "Anthropic", category: "ai" as const },
    { name: "Cohere", category: "ai" as const },
    { name: "Hugging Face", category: "ai" as const },
    { name: "LangChain", category: "ai" as const },
  ],
} as const;
