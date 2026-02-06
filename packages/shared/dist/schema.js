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
        { name: "React", category: "frontend" },
        { name: "Vue.js", category: "frontend" },
        { name: "Next.js", category: "frontend" },
        { name: "Svelte", category: "frontend" },
        { name: "Angular", category: "frontend" },
        { name: "Astro", category: "frontend" },
    ],
    backend: [
        { name: "Hono", category: "backend" },
        { name: "Express", category: "backend" },
        { name: "Fastify", category: "backend" },
        { name: "NestJS", category: "backend" },
        { name: "Django", category: "backend" },
        { name: "FastAPI", category: "backend" },
    ],
    database: [
        // Relational Databases
        {
            name: "PostgreSQL",
            category: "database",
            subcategory: "relational",
            description: "Advanced open-source relational database with strong ACID compliance",
        },
        {
            name: "MySQL",
            category: "database",
            subcategory: "relational",
            description: "Popular open-source relational database known for reliability",
        },
        {
            name: "PlanetScale",
            category: "database",
            subcategory: "serverless",
            description: "MySQL-compatible serverless database platform",
        },
        // NoSQL Databases
        {
            name: "MongoDB",
            category: "database",
            subcategory: "nosql",
            description: "Document-oriented NoSQL database for modern applications",
        },
        {
            name: "Redis",
            category: "database",
            subcategory: "cache",
            description: "In-memory data structure store for caching and messaging",
        },
        {
            name: "DynamoDB",
            category: "database",
            subcategory: "nosql",
            description: "AWS fully managed NoSQL database service",
        },
        {
            name: "Cassandra",
            category: "database",
            subcategory: "nosql",
            description: "Distributed NoSQL database for high scalability",
        },
        // Vector Databases
        {
            name: "Pinecone",
            category: "database",
            subcategory: "vector",
            description: "Managed vector database for AI/ML applications",
        },
        {
            name: "Weaviate",
            category: "database",
            subcategory: "vector",
            description: "Open-source vector database with GraphQL API",
        },
        {
            name: "Chroma",
            category: "database",
            subcategory: "vector",
            description: "Open-source vector database for AI applications",
        },
        // Graph Databases
        {
            name: "Neo4j",
            category: "database",
            subcategory: "graph",
            description: "Leading graph database platform for connected data",
        },
        {
            name: "Amazon Neptune",
            category: "database",
            subcategory: "graph",
            description: "AWS managed graph database service",
        },
        // Edge and Serverless Databases
        {
            name: "FaunaDB",
            category: "database",
            subcategory: "edge",
            description: "Global serverless database with strong consistency",
        },
        {
            name: "Upstash",
            category: "database",
            subcategory: "edge",
            description: "Serverless Redis-compatible database with edge capabilities",
        },
        {
            name: "Cloudflare D1",
            category: "database",
            subcategory: "serverless",
            description: "SQLite-based serverless database at the edge",
        },
        {
            name: "Supabase",
            category: "database",
            subcategory: "serverless",
            description: "Open-source Firebase alternative with PostgreSQL backend",
        },
        // Search Databases
        {
            name: "Elasticsearch",
            category: "database",
            subcategory: "search",
            description: "Distributed search and analytics engine",
        },
        {
            name: "Algolia",
            category: "database",
            subcategory: "search",
            description: "Managed search-as-a-service platform",
        },
    ],
    hosting: [
        { name: "Cloudflare", category: "hosting" },
        { name: "Vercel", category: "hosting" },
        { name: "Netlify", category: "hosting" },
        { name: "AWS", category: "hosting" },
        { name: "Railway", category: "hosting" },
        { name: "Fly.io", category: "hosting" },
    ],
    styling: [
        { name: "Tailwind CSS", category: "styling" },
        { name: "Styled Components", category: "styling" },
        { name: "CSS Modules", category: "styling" },
        { name: "Sass/SCSS", category: "styling" },
    ],
};
