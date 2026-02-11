export * from "./config";
import { z } from "zod";
export declare const TechStackCategory: z.ZodEnum<["frontend", "backend", "database", "hosting", "ai", "testing", "styling", "other"]>;
export declare const DatabaseSubcategory: z.ZodEnum<["relational", "nosql", "vector", "graph", "edge", "search", "cache", "serverless"]>;
export declare const TechStackItem: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodEnum<["frontend", "backend", "database", "hosting", "ai", "testing", "styling", "other"]>;
    subcategory: z.ZodOptional<z.ZodEnum<["relational", "nosql", "vector", "graph", "edge", "search", "cache", "serverless"]>>;
    version: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
    version?: string | undefined;
    description?: string | undefined;
    features?: string[] | undefined;
    subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
}, {
    name: string;
    category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
    version?: string | undefined;
    description?: string | undefined;
    features?: string[] | undefined;
    subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
}>;
export declare const BlueprintRequestSchema: z.ZodObject<{
    projectName: z.ZodString;
    description: z.ZodString;
    techStack: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodEnum<["frontend", "backend", "database", "hosting", "ai", "testing", "styling", "other"]>;
        subcategory: z.ZodOptional<z.ZodEnum<["relational", "nosql", "vector", "graph", "edge", "search", "cache", "serverless"]>>;
        version: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
        description?: string | undefined;
        features?: string[] | undefined;
        subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
    }, {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
        description?: string | undefined;
        features?: string[] | undefined;
        subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
    }>, "many">;
    features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    targetAudience: z.ZodOptional<z.ZodString>;
    constraints: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    projectName: string;
    techStack: {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
        description?: string | undefined;
        features?: string[] | undefined;
        subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
    }[];
    features?: string[] | undefined;
    targetAudience?: string | undefined;
    constraints?: string | undefined;
}, {
    description: string;
    projectName: string;
    techStack: {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
        description?: string | undefined;
        features?: string[] | undefined;
        subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
    }[];
    features?: string[] | undefined;
    targetAudience?: string | undefined;
    constraints?: string | undefined;
}>;
export declare const TaskGenerationRequestSchema: z.ZodObject<{
    blueprint: z.ZodString;
    projectName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    blueprint: string;
    projectName: string;
}, {
    blueprint: string;
    projectName: string;
}>;
export declare const TaskStatusSchema: z.ZodEnum<["todo", "in_progress", "done"]>;
export declare const TaskPrioritySchema: z.ZodEnum<["low", "medium", "high", "critical"]>;
export declare const TaskItemSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["todo", "in_progress", "done"]>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "todo" | "in_progress" | "done";
    id: string;
    title: string;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    dependencies?: string[] | undefined;
}, {
    status: "todo" | "in_progress" | "done";
    id: string;
    title: string;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    dependencies?: string[] | undefined;
}>;
export declare const TaskListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["todo", "in_progress", "done"]>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    description: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "todo" | "in_progress" | "done";
    id: string;
    title: string;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    dependencies?: string[] | undefined;
}, {
    status: "todo" | "in_progress" | "done";
    id: string;
    title: string;
    description?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    dependencies?: string[] | undefined;
}>, "many">;
export declare const RefineRequestSchema: z.ZodObject<{
    content: z.ZodString;
    instruction: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    instruction: string;
    context?: string | undefined;
}, {
    content: string;
    instruction: string;
    context?: string | undefined;
}>;
export declare const TemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    icon: z.ZodString;
    projectName: z.ZodString;
    defaultDescription: z.ZodString;
    techStack: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodEnum<["frontend", "backend", "database", "hosting", "ai", "testing", "styling", "other"]>;
        subcategory: z.ZodOptional<z.ZodEnum<["relational", "nosql", "vector", "graph", "edge", "search", "cache", "serverless"]>>;
        version: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
        description?: string | undefined;
        features?: string[] | undefined;
        subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
    }, {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
        description?: string | undefined;
        features?: string[] | undefined;
        subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
    }>, "many">;
    features: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    projectName: string;
    techStack: {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
        description?: string | undefined;
        features?: string[] | undefined;
        subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
    }[];
    features: string[];
    name: string;
    icon: string;
    defaultDescription: string;
}, {
    id: string;
    description: string;
    projectName: string;
    techStack: {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
        description?: string | undefined;
        features?: string[] | undefined;
        subcategory?: "relational" | "nosql" | "vector" | "graph" | "edge" | "search" | "cache" | "serverless" | undefined;
    }[];
    features: string[];
    name: string;
    icon: string;
    defaultDescription: string;
}>;
export declare const ErrorTypeSchema: z.ZodEnum<["validation", "authentication", "authorization", "not_found", "configuration", "network", "ai_service", "internal"]>;
export declare const ErrorDetailSchema: z.ZodObject<{
    type: z.ZodEnum<["validation", "authentication", "authorization", "not_found", "configuration", "network", "ai_service", "internal"]>;
    message: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodString;
    requestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "validation" | "authentication" | "authorization" | "not_found" | "configuration" | "network" | "ai_service" | "internal";
    timestamp: string;
    code?: string | undefined;
    details?: Record<string, unknown> | undefined;
    requestId?: string | undefined;
}, {
    message: string;
    type: "validation" | "authentication" | "authorization" | "not_found" | "configuration" | "network" | "ai_service" | "internal";
    timestamp: string;
    code?: string | undefined;
    details?: Record<string, unknown> | undefined;
    requestId?: string | undefined;
}>;
export declare const ErrorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        type: z.ZodEnum<["validation", "authentication", "authorization", "not_found", "configuration", "network", "ai_service", "internal"]>;
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        timestamp: z.ZodString;
        requestId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        type: "validation" | "authentication" | "authorization" | "not_found" | "configuration" | "network" | "ai_service" | "internal";
        timestamp: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
        requestId?: string | undefined;
    }, {
        message: string;
        type: "validation" | "authentication" | "authorization" | "not_found" | "configuration" | "network" | "ai_service" | "internal";
        timestamp: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
        requestId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    success: false;
    error: {
        message: string;
        type: "validation" | "authentication" | "authorization" | "not_found" | "configuration" | "network" | "ai_service" | "internal";
        timestamp: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
        requestId?: string | undefined;
    };
}, {
    success: false;
    error: {
        message: string;
        type: "validation" | "authentication" | "authorization" | "not_found" | "configuration" | "network" | "ai_service" | "internal";
        timestamp: string;
        code?: string | undefined;
        details?: Record<string, unknown> | undefined;
        requestId?: string | undefined;
    };
}>;
export declare const StreamChunkSchema: z.ZodObject<{
    type: z.ZodEnum<["content", "error", "done"]>;
    content: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "done" | "content" | "error";
    content?: string | undefined;
    error?: string | undefined;
}, {
    type: "done" | "content" | "error";
    content?: string | undefined;
    error?: string | undefined;
}>;
export declare const GenerationResultSchema: z.ZodObject<{
    blueprint: z.ZodString;
    tasks: z.ZodOptional<z.ZodString>;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    blueprint: string;
    generatedAt: string;
    tasks?: string | undefined;
}, {
    blueprint: string;
    generatedAt: string;
    tasks?: string | undefined;
}>;
export declare const SuccessResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    success: true;
    data?: unknown;
}, {
    success: true;
    data?: unknown;
}>;
export declare const TECH_STACK_OPTIONS: {
    readonly frontend: readonly [{
        readonly name: "React";
        readonly category: "frontend";
    }, {
        readonly name: "Vue.js";
        readonly category: "frontend";
    }, {
        readonly name: "Next.js";
        readonly category: "frontend";
    }, {
        readonly name: "Svelte";
        readonly category: "frontend";
    }, {
        readonly name: "Angular";
        readonly category: "frontend";
    }, {
        readonly name: "Astro";
        readonly category: "frontend";
    }];
    readonly backend: readonly [{
        readonly name: "Hono";
        readonly category: "backend";
    }, {
        readonly name: "Express";
        readonly category: "backend";
    }, {
        readonly name: "Fastify";
        readonly category: "backend";
    }, {
        readonly name: "NestJS";
        readonly category: "backend";
    }, {
        readonly name: "Django";
        readonly category: "backend";
    }, {
        readonly name: "FastAPI";
        readonly category: "backend";
    }];
    readonly database: readonly [{
        readonly name: "PostgreSQL";
        readonly category: "database";
        readonly subcategory: "relational";
        readonly description: "Advanced open-source relational database with strong ACID compliance";
    }, {
        readonly name: "MySQL";
        readonly category: "database";
        readonly subcategory: "relational";
        readonly description: "Popular open-source relational database known for reliability";
    }, {
        readonly name: "PlanetScale";
        readonly category: "database";
        readonly subcategory: "serverless";
        readonly description: "MySQL-compatible serverless database platform";
    }, {
        readonly name: "MongoDB";
        readonly category: "database";
        readonly subcategory: "nosql";
        readonly description: "Document-oriented NoSQL database for modern applications";
    }, {
        readonly name: "Redis";
        readonly category: "database";
        readonly subcategory: "cache";
        readonly description: "In-memory data structure store for caching and messaging";
    }, {
        readonly name: "DynamoDB";
        readonly category: "database";
        readonly subcategory: "nosql";
        readonly description: "AWS fully managed NoSQL database service";
    }, {
        readonly name: "Cassandra";
        readonly category: "database";
        readonly subcategory: "nosql";
        readonly description: "Distributed NoSQL database for high scalability";
    }, {
        readonly name: "Pinecone";
        readonly category: "database";
        readonly subcategory: "vector";
        readonly description: "Managed vector database for AI/ML applications";
    }, {
        readonly name: "Weaviate";
        readonly category: "database";
        readonly subcategory: "vector";
        readonly description: "Open-source vector database with GraphQL API";
    }, {
        readonly name: "Chroma";
        readonly category: "database";
        readonly subcategory: "vector";
        readonly description: "Open-source vector database for AI applications";
    }, {
        readonly name: "Neo4j";
        readonly category: "database";
        readonly subcategory: "graph";
        readonly description: "Leading graph database platform for connected data";
    }, {
        readonly name: "Amazon Neptune";
        readonly category: "database";
        readonly subcategory: "graph";
        readonly description: "AWS managed graph database service";
    }, {
        readonly name: "FaunaDB";
        readonly category: "database";
        readonly subcategory: "edge";
        readonly description: "Global serverless database with strong consistency";
    }, {
        readonly name: "Upstash";
        readonly category: "database";
        readonly subcategory: "edge";
        readonly description: "Serverless Redis-compatible database with edge capabilities";
    }, {
        readonly name: "Cloudflare D1";
        readonly category: "database";
        readonly subcategory: "serverless";
        readonly description: "SQLite-based serverless database at the edge";
    }, {
        readonly name: "Supabase";
        readonly category: "database";
        readonly subcategory: "serverless";
        readonly description: "Open-source Firebase alternative with PostgreSQL backend";
    }, {
        readonly name: "Elasticsearch";
        readonly category: "database";
        readonly subcategory: "search";
        readonly description: "Distributed search and analytics engine";
    }, {
        readonly name: "Algolia";
        readonly category: "database";
        readonly subcategory: "search";
        readonly description: "Managed search-as-a-service platform";
    }];
    readonly hosting: readonly [{
        readonly name: "Cloudflare";
        readonly category: "hosting";
    }, {
        readonly name: "Vercel";
        readonly category: "hosting";
    }, {
        readonly name: "Netlify";
        readonly category: "hosting";
    }, {
        readonly name: "AWS";
        readonly category: "hosting";
    }, {
        readonly name: "Railway";
        readonly category: "hosting";
    }, {
        readonly name: "Fly.io";
        readonly category: "hosting";
    }];
    readonly styling: readonly [{
        readonly name: "Tailwind CSS";
        readonly category: "styling";
    }, {
        readonly name: "Styled Components";
        readonly category: "styling";
    }, {
        readonly name: "CSS Modules";
        readonly category: "styling";
    }, {
        readonly name: "Sass/SCSS";
        readonly category: "styling";
    }];
};
