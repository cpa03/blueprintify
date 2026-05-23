/**
 * Database Service for Cloudflare D1
 *
 * Provides data access layer for the Blueprintify application.
 * Handles all database operations with proper error handling and type safety.
 */

import { z } from "zod";
import { ERROR_MESSAGES } from "../config/constants";

// Database schemas for type safety
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar_url: z.string().optional(),
  preferences: z.string().optional(), // JSON string
  created_at: z.string(),
  updated_at: z.string(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tech_stack: z.string().optional(), // JSON string
  features: z.string().optional(), // JSON string
  target_audience: z.string().optional(),
  constraints: z.string().optional(),
  status: z.string().default("active"),
  created_at: z.string(),
  updated_at: z.string(),
});

export const BlueprintSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  title: z.string(),
  content: z.string(),
  metadata: z.string().optional(), // JSON string
  version: z.number().default(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TaskSchema = z.object({
  id: z.string(),
  blueprint_id: z.string(),
  title: z.string(),
  content: z.string(),
  metadata: z.string().optional(), // JSON string
  version: z.number().default(1),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  project_name: z.string(),
  default_description: z.string(),
  tech_stack: z.string().optional(), // JSON string
  features: z.string().optional(), // JSON string
  category: z.string().default("general"),
  is_public: z.boolean().default(true),
  usage_count: z.number().default(0),
  created_by: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SessionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  session_data: z.string().optional(), // JSON string
  expires_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AnalyticsSchema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  event_type: z.string(),
  event_data: z.string().optional(), // JSON string
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: z.string(),
});

export const BlueprintShareSchema = z.object({
  id: z.string(),
  title: z.string(),
  blueprint: z.string(),
  metadata: z.string().optional(), // JSON string
  created_at: z.string(),
  expires_at: z.string().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Blueprint = z.infer<typeof BlueprintSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Analytics = z.infer<typeof AnalyticsSchema>;
export type BlueprintShare = z.infer<typeof BlueprintShareSchema>;

// Note: D1 database access is currently handled directly via c.env.DB in the share routes.
// A future DatabaseService implementation should be created when a proper D1-based
// service layer is needed. The Zod schemas above define the data models for reference.

// Utility functions for JSON serialization
export function serializeJSON(data: unknown): string {
  return JSON.stringify(data);
}

export function deserializeJSON<T>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    throw new DatabaseError(
      ERROR_MESSAGES.JSON_PARSE_FAILURE(
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR
      ),
      error instanceof Error ? error : undefined
    );
  }
}

// Error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class DatabaseValidationError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "DatabaseValidationError";
  }
}

export class DatabaseNotFoundError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "DatabaseNotFoundError";
  }
}
