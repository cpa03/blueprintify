import { z } from 'zod';
export declare const TechStackCategory: z.ZodEnum<["frontend", "backend", "database", "hosting", "ai", "testing", "styling", "other"]>;
export declare const TechStackItem: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodEnum<["frontend", "backend", "database", "hosting", "ai", "testing", "styling", "other"]>;
    version: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
    version?: string | undefined;
}, {
    name: string;
    category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
    version?: string | undefined;
}>;
export declare const BlueprintRequestSchema: z.ZodObject<{
    projectName: z.ZodString;
    description: z.ZodString;
    techStack: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodEnum<["frontend", "backend", "database", "hosting", "ai", "testing", "styling", "other"]>;
        version: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
    }, {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
    }>, "many">;
    features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    targetAudience: z.ZodOptional<z.ZodString>;
    constraints: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    description: string;
    techStack: {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
    }[];
    features?: string[] | undefined;
    targetAudience?: string | undefined;
    constraints?: string | undefined;
}, {
    projectName: string;
    description: string;
    techStack: {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
    }[];
    features?: string[] | undefined;
    targetAudience?: string | undefined;
    constraints?: string | undefined;
}>;
export declare const TaskGenerationRequestSchema: z.ZodObject<{
    blueprint: z.ZodString;
    projectName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    blueprint: string;
}, {
    projectName: string;
    blueprint: string;
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
        version: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
    }, {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
    }>, "many">;
    features: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    projectName: string;
    description: string;
    techStack: {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
    }[];
    features: string[];
    id: string;
    icon: string;
    defaultDescription: string;
}, {
    name: string;
    projectName: string;
    description: string;
    techStack: {
        name: string;
        category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
        version?: string | undefined;
    }[];
    features: string[];
    id: string;
    icon: string;
    defaultDescription: string;
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
    }, {
        readonly name: "MySQL";
        readonly category: "database";
    }, {
        readonly name: "MongoDB";
        readonly category: "database";
    }, {
        readonly name: "Supabase";
        readonly category: "database";
    }, {
        readonly name: "Cloudflare D1";
        readonly category: "database";
    }, {
        readonly name: "PlanetScale";
        readonly category: "database";
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
