import { z } from "zod";
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
  TaskItemSchema,
  ExportFormatSchema,
  ExportRequestSchema,
  ImportRequestSchema,
  ImportResultSchema,
  StorageQuotaSchema,
  StorageClearRequestSchema,
  StorageReportRequestSchema,
} from "./schema.js";

// ===== Inferred Types from Zod Schemas =====

/**
 * Technology stack category (e.g., "frontend", "backend", "database")
 * Used to organize tech stack items in the wizard.
 */
export type TechStackCategoryType = z.infer<typeof TechStackCategory>;

/**
 * Individual technology item with name, category, and optional version.
 * Represents a single technology choice in the project configuration.
 */
export type TechStackItemType = z.infer<typeof TechStackItem>;

/**
 * Request payload for blueprint generation.
 * Contains project configuration including name, description, tech stack, and features.
 */
export type BlueprintRequest = z.infer<typeof BlueprintRequestSchema>;

/**
 * Request payload for task generation from blueprint content.
 */
export type TaskGenerationRequest = z.infer<typeof TaskGenerationRequestSchema>;

/**
 * Request payload for refining specific content sections.
 * Used for AI-powered content enhancement in the editor.
 */
export type RefineRequest = z.infer<typeof RefineRequestSchema>;

/**
 * Predefined project template for quick-start configuration.
 * Provides default values for common project types.
 */
export type Template = z.infer<typeof TemplateSchema>;

/**
 * Single chunk of streaming response from AI generation.
 * Contains incremental content delivered via Server-Sent Events (SSE).
 */
export type StreamChunk = z.infer<typeof StreamChunkSchema>;

/**
 * Complete result of blueprint or task generation.
 * Contains the full generated content and metadata.
 */
export type GenerationResult = z.infer<typeof GenerationResultSchema>;

/**
 * Status of a generated task (e.g., "pending", "in_progress", "completed").
 */
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

/**
 * Priority level for tasks (e.g., "high", "medium", "low").
 */
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

/**
 * Individual task item with title, description, status, and priority.
 * Represents a single actionable item in the generated task list.
 */
export type TaskItem = z.infer<typeof TaskItemSchema>;

// ===== Export/Import Types (M2) =====

/**
 * Supported export format for project data.
 * Values: "zip", "json", "markdown"
 */
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

/**
 * Request payload for exporting project data.
 * Specifies the format and content to export.
 */
export type ExportRequest = z.infer<typeof ExportRequestSchema>;

/**
 * Request payload for importing project data.
 * Contains the data to import and optional conflict resolution strategy.
 */
export type ImportRequest = z.infer<typeof ImportRequestSchema>;

/**
 * Result of an import operation.
 * Contains success status, imported data, and any warnings/errors.
 */
export type ImportResult = z.infer<typeof ImportResultSchema>;

/**
 * Current storage quota information.
 * Shows used/available space in localStorage.
 */
export type StorageQuota = z.infer<typeof StorageQuotaSchema>;

/**
 * Request payload for clearing stored data.
 */
export type StorageClearRequest = z.infer<typeof StorageClearRequestSchema>;

/**
 * Request payload for reporting client storage usage.
 */
export type StorageReportRequest = z.infer<typeof StorageReportRequestSchema>;

// ===== Wizard Step Types =====

/**
 * Wizard step identifier in the project configuration flow.
 * Steps: info (project info), stack (tech stack), features, review, generating
 */
export type WizardStep = "info" | "stack" | "features" | "review" | "generating";

/**
 * Complete wizard form state representing user's project configuration.
 * Persisted across sessions for draft preservation.
 */
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

/**
 * User session containing wizard state and generated content.
 * Tracks project configuration and AI outputs across time.
 */
export interface Session {
  id: string;
  wizardState: WizardState;
  generatedBlueprint: string | null;
  generatedTasks: string | null;
  createdAt: string;
  updatedAt: string;
}

// ===== API Client Types =====

/**
 * Callback handlers for streaming AI responses.
 * Used with SSE (Server-Sent Events) for real-time content generation.
 */
export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
  onRetry?: (attempt: number, maxRetries: number) => void;
}

// ===== Editor Types =====

/**
 * Editor tab identifier for split-pane view.
 * Tabs: blueprint (architecture doc), tasks (task list)
 */
export type EditorTab = "blueprint" | "tasks";

/**
 * Editor state for the split-pane markdown editor.
 * Tracks active tab and content for both blueprint and tasks.
 */
export interface EditorState {
  activeTab: EditorTab;
  blueprintContent: string;
  tasksContent: string;
  isDirty: boolean;
}
