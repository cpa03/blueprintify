import { z } from 'zod';
// ===== Tech Stack Options =====
export const TechStackCategory = z.enum([
    'frontend',
    'backend',
    'database',
    'hosting',
    'ai',
    'testing',
    'styling',
    'other'
]);
export const TechStackItem = z.object({
    name: z.string().min(1),
    category: TechStackCategory,
    version: z.string().optional()
});
// ===== Blueprint Request Schema =====
export const BlueprintRequestSchema = z.object({
    projectName: z.string().min(1, 'Project name is required').max(100),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
    techStack: z.array(TechStackItem).min(1, 'At least one technology is required'),
    features: z.array(z.string().min(1)).optional(),
    targetAudience: z.string().optional(),
    constraints: z.string().optional()
});
// ===== Task Generation Schema =====
export const TaskGenerationRequestSchema = z.object({
    blueprint: z.string().min(1, 'Blueprint content is required'),
    projectName: z.string().min(1)
});
// ===== Task Item Schema (Future Proofing) =====
export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'done']);
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const TaskItemSchema = z.object({
    id: z.string(),
    title: z.string(),
    status: TaskStatusSchema,
    priority: TaskPrioritySchema.optional(),
    description: z.string().optional(),
    dependencies: z.array(z.string()).optional()
});
export const TaskListSchema = z.array(TaskItemSchema);
// ===== Refinement Request Schema =====
export const RefineRequestSchema = z.object({
    content: z.string().min(1, 'Content to refine is required'),
    instruction: z.string().min(1, 'Refinement instruction is required'),
    context: z.string().optional()
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
    features: z.array(z.string())
});
// ===== API Response Schemas =====
export const StreamChunkSchema = z.object({
    type: z.enum(['content', 'error', 'done']),
    content: z.string().optional(),
    error: z.string().optional()
});
export const GenerationResultSchema = z.object({
    blueprint: z.string(),
    tasks: z.string().optional(),
    generatedAt: z.string()
});
// ===== Predefined Tech Stack Options =====
export const TECH_STACK_OPTIONS = {
    frontend: [
        { name: 'React', category: 'frontend' },
        { name: 'Vue.js', category: 'frontend' },
        { name: 'Next.js', category: 'frontend' },
        { name: 'Svelte', category: 'frontend' },
        { name: 'Angular', category: 'frontend' },
        { name: 'Astro', category: 'frontend' }
    ],
    backend: [
        { name: 'Hono', category: 'backend' },
        { name: 'Express', category: 'backend' },
        { name: 'Fastify', category: 'backend' },
        { name: 'NestJS', category: 'backend' },
        { name: 'Django', category: 'backend' },
        { name: 'FastAPI', category: 'backend' }
    ],
    database: [
        { name: 'PostgreSQL', category: 'database' },
        { name: 'MySQL', category: 'database' },
        { name: 'MongoDB', category: 'database' },
        { name: 'Supabase', category: 'database' },
        { name: 'Cloudflare D1', category: 'database' },
        { name: 'PlanetScale', category: 'database' }
    ],
    hosting: [
        { name: 'Cloudflare', category: 'hosting' },
        { name: 'Vercel', category: 'hosting' },
        { name: 'Netlify', category: 'hosting' },
        { name: 'AWS', category: 'hosting' },
        { name: 'Railway', category: 'hosting' },
        { name: 'Fly.io', category: 'hosting' }
    ],
    styling: [
        { name: 'Tailwind CSS', category: 'styling' },
        { name: 'Styled Components', category: 'styling' },
        { name: 'CSS Modules', category: 'styling' },
        { name: 'Sass/SCSS', category: 'styling' }
    ]
};
