import { z } from 'zod';
import {
  TechStackCategory,
  TechStackItem,
  BlueprintRequestSchema,
  TaskGenerationRequestSchema,
  RefineRequestSchema,
  TemplateSchema,
  StreamChunkSchema,
  GenerationResultSchema,
  TaskStatusSchema,
  TaskPrioritySchema,
  TaskItemSchema
} from './schema';

// ===== Inferred Types from Zod Schemas =====
export type TechStackCategoryType = z.infer<typeof TechStackCategory>;
export type TechStackItemType = z.infer<typeof TechStackItem>;
export type BlueprintRequest = z.infer<typeof BlueprintRequestSchema>;
export type TaskGenerationRequest = z.infer<typeof TaskGenerationRequestSchema>;
export type RefineRequest = z.infer<typeof RefineRequestSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type StreamChunk = z.infer<typeof StreamChunkSchema>;
export type GenerationResult = z.infer<typeof GenerationResultSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type TaskItem = z.infer<typeof TaskItemSchema>;

// ===== Wizard Step Types =====
export type WizardStep = 'info' | 'stack' | 'features' | 'review' | 'generating';

export interface WizardState {
  currentStep: WizardStep;
  projectName: string;
  description: string;
  techStack: TechStackItemType[];
  features: string[];
  targetAudience: string;
  constraints: string;
}

// ===== Session Types =====
export interface Session {
  id: string;
  wizardState: WizardState;
  generatedBlueprint: string | null;
  generatedTasks: string | null;
  createdAt: string;
  updatedAt: string;
}

// ===== API Client Types =====
export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

// ===== Editor Types =====
export type EditorTab = 'blueprint' | 'tasks';

export interface EditorState {
  activeTab: EditorTab;
  blueprintContent: string;
  tasksContent: string;
  isDirty: boolean;
}
