/**
 * Database Service for Cloudflare D1
 *
 * Provides data access layer for the Blueprintify application.
 * Handles all database operations with proper error handling and type safety.
 */

import { z } from "zod";

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

// Type exports
export type User = z.infer<typeof UserSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Blueprint = z.infer<typeof BlueprintSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Template = z.infer<typeof TemplateSchema>;

export interface DatabaseService {
  // User operations
  createUser(
    user: Omit<User, "id" | "created_at" | "updated_at">,
  ): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Project operations
  createProject(
    project: Omit<Project, "id" | "created_at" | "updated_at">,
  ): Promise<Project>;
  getProjectById(id: string): Promise<Project | null>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Blueprint operations
  createBlueprint(
    blueprint: Omit<Blueprint, "id" | "created_at" | "updated_at">,
  ): Promise<Blueprint>;
  getBlueprintById(id: string): Promise<Blueprint | null>;
  getBlueprintsByProjectId(projectId: string): Promise<Blueprint[]>;
  updateBlueprint(id: string, updates: Partial<Blueprint>): Promise<Blueprint>;
  deleteBlueprint(id: string): Promise<void>;

  // Task operations
  createTask(
    task: Omit<Task, "id" | "created_at" | "updated_at">,
  ): Promise<Task>;
  getTaskById(id: string): Promise<Task | null>;
  getTasksByBlueprintId(blueprintId: string): Promise<Task[]>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Template operations
  createTemplate(
    template: Omit<Template, "id" | "created_at" | "updated_at">,
  ): Promise<Template>;
  getTemplateById(id: string): Promise<Template | null>;
  getPublicTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  updateTemplate(id: string, updates: Partial<Template>): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;
  incrementTemplateUsage(id: string): Promise<void>;

  // Analytics operations
  trackEvent(event: {
    user_id?: string;
    event_type: string;
    event_data?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void>;

  // Health check
  healthCheck(): Promise<boolean>;
}

// Mock implementation for development
export class MockDatabaseService implements DatabaseService {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private blueprints: Map<string, Blueprint> = new Map();
  private tasks: Map<string, Task> = new Map();
  private templates: Map<string, Template> = new Map();

  async createUser(
    user: Omit<User, "id" | "created_at" | "updated_at">,
  ): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newUser: User = { ...user, id, created_at: now, updated_at: now };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  async createProject(
    project: Omit<Project, "id" | "created_at" | "updated_at">,
  ): Promise<Project> {
    const id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id,
      created_at: now,
      updated_at: now,
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (p) => p.user_id === userId,
    );
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) throw new Error("Project not found");
    const updatedProject = {
      ...project,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }

  async createBlueprint(
    blueprint: Omit<Blueprint, "id" | "created_at" | "updated_at">,
  ): Promise<Blueprint> {
    const id = `blueprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newBlueprint: Blueprint = {
      ...blueprint,
      id,
      created_at: now,
      updated_at: now,
    };
    this.blueprints.set(id, newBlueprint);
    return newBlueprint;
  }

  async getBlueprintById(id: string): Promise<Blueprint | null> {
    return this.blueprints.get(id) || null;
  }

  async getBlueprintsByProjectId(projectId: string): Promise<Blueprint[]> {
    return Array.from(this.blueprints.values()).filter(
      (b) => b.project_id === projectId,
    );
  }

  async updateBlueprint(
    id: string,
    updates: Partial<Blueprint>,
  ): Promise<Blueprint> {
    const blueprint = this.blueprints.get(id);
    if (!blueprint) throw new Error("Blueprint not found");
    const updatedBlueprint = {
      ...blueprint,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.blueprints.set(id, updatedBlueprint);
    return updatedBlueprint;
  }

  async deleteBlueprint(id: string): Promise<void> {
    this.blueprints.delete(id);
  }

  async createTask(
    task: Omit<Task, "id" | "created_at" | "updated_at">,
  ): Promise<Task> {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newTask: Task = { ...task, id, created_at: now, updated_at: now };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async getTasksByBlueprintId(blueprintId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (t) => t.blueprint_id === blueprintId,
    );
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    const updatedTask = {
      ...task,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async createTemplate(
    template: Omit<Template, "id" | "created_at" | "updated_at">,
  ): Promise<Template> {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newTemplate: Template = {
      ...template,
      id,
      created_at: now,
      updated_at: now,
    };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async getTemplateById(id: string): Promise<Template | null> {
    return this.templates.get(id) || null;
  }

  async getPublicTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).filter((t) => t.is_public);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (t) => t.category === category,
    );
  }

  async updateTemplate(
    id: string,
    updates: Partial<Template>,
  ): Promise<Template> {
    const template = this.templates.get(id);
    if (!template) throw new Error("Template not found");
    const updatedTemplate = {
      ...template,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    this.templates.delete(id);
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (!template) throw new Error("Template not found");
    const updatedTemplate = {
      ...template,
      usage_count: template.usage_count + 1,
      updated_at: new Date().toISOString(),
    };
    this.templates.set(id, updatedTemplate);
  }

  async trackEvent(event: {
    user_id?: string;
    event_type: string;
    event_data?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    console.log("Tracking event:", event);
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

// Factory function to get the appropriate database service
export function getDatabaseService(): DatabaseService {
  // In production, this would return a Cloudflare D1 implementation
  // For now, return the mock implementation
  return new MockDatabaseService();
}

// Utility functions for JSON serialization
export function serializeJSON(data: unknown): string {
  return JSON.stringify(data);
}

export function deserializeJSON<T>(json: string): T {
  return JSON.parse(json);
}

// Error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "NotFoundError";
  }
}
