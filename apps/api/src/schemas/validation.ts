import { z } from "zod";

const TechStackSchema = z.object({
  frontend: z.object({
    framework: z
      .string()
      .min(1)
      .transform((val) => val.trim()),
    language: z
      .string()
      .min(1)
      .transform((val) => val.trim()),
    styling: z
      .string()
      .transform((val) => val.trim())
      .optional(),
    stateManagement: z
      .string()
      .transform((val) => val.trim())
      .optional(),
  }),
  backend: z.object({
    framework: z
      .string()
      .min(1)
      .transform((val) => val.trim()),
    language: z
      .string()
      .min(1)
      .transform((val) => val.trim()),
    database: z
      .string()
      .transform((val) => val.trim())
      .optional(),
    deployment: z
      .string()
      .transform((val) => val.trim())
      .optional(),
  }),
  infrastructure: z
    .object({
      hosting: z
        .string()
        .transform((val) => val.trim())
        .optional(),
      cicd: z
        .string()
        .transform((val) => val.trim())
        .optional(),
      monitoring: z
        .string()
        .transform((val) => val.trim())
        .optional(),
    })
    .optional(),
});

const ProjectRequirementsSchema = z.object({
  description: z
    .string()
    .min(10)
    .max(2000)
    .transform((val) => val.trim()),
  features: z
    .array(
      z
        .string()
        .min(1)
        .max(100)
        .transform((val) => val.trim()),
    )
    .max(20),
  constraints: z
    .array(
      z
        .string()
        .min(1)
        .max(100)
        .transform((val) => val.trim()),
    )
    .max(10)
    .optional(),
  targetAudience: z
    .string()
    .min(1)
    .max(200)
    .transform((val) => val.trim())
    .optional(),
  timeline: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  teamSize: z.number().int().min(1).max(50).optional(),
});

export const GenerateRequestSchema = z.object({
  projectName: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => val.trim()),
  techStack: TechStackSchema,
  requirements: ProjectRequirementsSchema,
  options: z
    .object({
      includeTests: z.boolean().default(true),
      includeDocs: z.boolean().default(true),
      includeExamples: z.boolean().default(false),
      detailLevel: z
        .enum(["basic", "detailed", "comprehensive"])
        .default("detailed"),
    })
    .optional(),
});

export const TasksRequestSchema = z.object({
  blueprint: z
    .string()
    .min(50)
    .max(10000)
    .transform((val) => val.trim()),
  options: z
    .object({
      priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      timeFrame: z
        .enum(["week", "month", "quarter", "custom"])
        .default("month"),
      teamSize: z.number().int().min(1).max(20).default(3),
      includeDependencies: z.boolean().default(true),
    })
    .optional(),
});

export const RefineRequestSchema = z.object({
  content: z
    .string()
    .min(10)
    .max(5000)
    .transform((val) => val.trim()),
  section: z.enum([
    "overview",
    "architecture",
    "api",
    "database",
    "deployment",
    "security",
    "testing",
    "documentation",
  ]),
  instructions: z
    .string()
    .min(5)
    .max(500)
    .transform((val) => val.trim()),
  options: z
    .object({
      tone: z.enum(["formal", "casual", "technical"]).default("technical"),
      detailLevel: z.enum(["basic", "detailed"]).default("detailed"),
    })
    .optional(),
});

export const ApiKeyCreateSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => val.trim()),
  permissions: z.array(z.string().transform((val) => val.trim())).max(10),
  expiresAt: z.number().int().positive().optional(),
});

export const VALIDATION_SCHEMAS = {
  generate: GenerateRequestSchema,
  tasks: TasksRequestSchema,
  refine: RefineRequestSchema,
  apiKeyCreate: ApiKeyCreateSchema,
} as const;
