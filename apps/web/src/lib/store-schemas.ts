import { z } from "zod";

export const TechStackItemSchema = z.object({
  name: z.string(),
  category: z.enum([
    "frontend",
    "backend",
    "database",
    "hosting",
    "ai",
    "testing",
    "styling",
    "other",
  ]),
  description: z.string().optional(),
});

export const WizardStateSchema = z.object({
  currentStep: z.enum(["info", "stack", "features", "review", "generating"]),
  projectName: z.string(),
  description: z.string(),
  techStack: z.array(TechStackItemSchema),
  features: z.array(z.string()),
  targetAudience: z.string(),
  constraints: z.string(),
});

export const EditorStateSchema = z.object({
  activeTab: z.enum(["blueprint", "tasks"]),
  blueprintContent: z.string(),
  tasksContent: z.string(),
  isDirty: z.boolean(),
  isGenerating: z.boolean(),
  generationProgress: z.string(),
});
