/**
 * Database Service for Cloudflare D1
 *
 * Provides data access layer for the Blueprintify application.
 * Handles all database operations with proper error handling and type safety.
 */

import { z } from "zod";
import { ID_GENERATION_CONFIG } from "@blueprint/shared";

const { RANDOM_STRING_LENGTH } = ID_GENERATION_CONFIG;

const ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generate a cryptographically secure random string.
 * Uses crypto.getRandomValues() instead of Math.random() to prevent
 * ID prediction attacks. This is a Cloudflare Workers best practice.
 */
function generateSecureRandomString(length: number): string {
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += ID_CHARS.charAt((randomValues[i] ?? 0) % ID_CHARS.length);
  }
  return result;
}

function generateId(prefix: string): string {
  const randomPart = generateSecureRandomString(RANDOM_STRING_LENGTH);
  return `${prefix}_${Date.now()}_${randomPart}`;
}

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
  getProjectsByUserIdAndStatus(
    userId: string,
    status: Project["status"],
  ): Promise<Project[]>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Blueprint operations
  createBlueprint(
    blueprint: Omit<
      Blueprint,
      "id" | "created_at" | "updated_at" | "version"
    > & { version?: number },
  ): Promise<Blueprint>;
  getBlueprintById(id: string): Promise<Blueprint | null>;
  getBlueprintsByProjectId(projectId: string): Promise<Blueprint[]>;
  getLatestBlueprintByProjectId(projectId: string): Promise<Blueprint | null>;
  updateBlueprint(id: string, updates: Partial<Blueprint>): Promise<Blueprint>;
  deleteBlueprint(id: string): Promise<void>;

  // Task operations
  createTask(
    task: Omit<Task, "id" | "created_at" | "updated_at" | "version"> & {
      version?: number;
    },
  ): Promise<Task>;
  getTaskById(id: string): Promise<Task | null>;
  getTasksByBlueprintId(blueprintId: string): Promise<Task[]>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Template operations
  createTemplate(
    template: Omit<
      Template,
      "id" | "created_at" | "updated_at" | "usage_count"
    > & { usage_count?: number },
  ): Promise<Template>;
  getTemplateById(id: string): Promise<Template | null>;
  getPublicTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  getTemplatesByCreator(userId: string): Promise<Template[]>;
  getPopularTemplates(limit?: number): Promise<Template[]>;
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
  getAnalyticsByUserId(userId: string): Promise<Analytics[]>;
  getAnalyticsByEventType(eventType: string): Promise<Analytics[]>;
  getAnalyticsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Analytics[]>;
  getAnalyticsByEventTypeAndDateRange(
    eventType: string,
    startDate: string,
    endDate: string,
  ): Promise<Analytics[]>;

  // Session operations
  createSession(
    session: Omit<Session, "id" | "created_at" | "updated_at">,
  ): Promise<Session>;
  getSessionById(id: string): Promise<Session | null>;
  getSessionsByUserId(userId: string): Promise<Session[]>;
  getActiveSessionsForUser(userId: string): Promise<Session[]>;
  deleteSession(id: string): Promise<void>;
  deleteExpiredSessions(): Promise<number>;

  // BlueprintShare operations
  createBlueprintShare(
    share: Omit<BlueprintShare, "created_at">,
  ): Promise<BlueprintShare>;
  getBlueprintShareById(id: string): Promise<BlueprintShare | null>;
  deleteBlueprintShare(id: string): Promise<void>;
  deleteExpiredBlueprintShares(): Promise<number>;

  // Cleanup operations
  cleanupExpiredData(): Promise<{ sessions: number; shares: number }>;

  // Count operations (v1.3.3 - efficient counting without fetching records)
  countProjectsByUserId(userId: string): Promise<number>;
  countProjectsByUserIdAndStatus(
    userId: string,
    status: Project["status"],
  ): Promise<number>;
  countBlueprintsByProjectId(projectId: string): Promise<number>;
  countTasksByBlueprintId(blueprintId: string): Promise<number>;
  countTemplatesByCreator(userId: string): Promise<number>;
  countPublicTemplates(): Promise<number>;
  countTemplatesByCategory(category: string): Promise<number>;
  countAnalyticsByEventType(eventType: string): Promise<number>;
  countAnalyticsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<number>;
  countAnalyticsByEventTypeAndDateRange(
    eventType: string,
    startDate: string,
    endDate: string,
  ): Promise<number>;
  countActiveSessionsForUser(userId: string): Promise<number>;

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
  private sessions: Map<string, Session> = new Map();
  private analytics: Map<string, Analytics> = new Map();
  private blueprintShares: Map<string, BlueprintShare> = new Map();

  async createUser(
    user: Omit<User, "id" | "created_at" | "updated_at">,
  ): Promise<User> {
    const id = generateId("user");
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
    if (!user) throw new DatabaseNotFoundError(`User not found: ${id}`);
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
    const id = generateId("project");
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

  async getProjectsByUserIdAndStatus(
    userId: string,
    status: string,
  ): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (p) => p.user_id === userId && p.status === status,
    );
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) throw new DatabaseNotFoundError(`Project not found: ${id}`);
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
    blueprint: Omit<
      Blueprint,
      "id" | "created_at" | "updated_at" | "version"
    > & { version?: number },
  ): Promise<Blueprint> {
    const id = generateId("blueprint");
    const now = new Date().toISOString();
    const newBlueprint: Blueprint = {
      ...blueprint,
      version: blueprint.version ?? 1,
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

  async getLatestBlueprintByProjectId(
    projectId: string,
  ): Promise<Blueprint | null> {
    const blueprints = Array.from(this.blueprints.values())
      .filter((b) => b.project_id === projectId)
      .sort((a, b) => b.version - a.version);
    return blueprints[0] || null;
  }

  async updateBlueprint(
    id: string,
    updates: Partial<Blueprint>,
  ): Promise<Blueprint> {
    const blueprint = this.blueprints.get(id);
    if (!blueprint) throw new DatabaseNotFoundError(`Blueprint not found: ${id}`);
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
    task: Omit<Task, "id" | "created_at" | "updated_at" | "version"> & {
      version?: number;
    },
  ): Promise<Task> {
    const id = generateId("task");
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      version: task.version ?? 1,
      id,
      created_at: now,
      updated_at: now,
    };
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
    if (!task) throw new DatabaseNotFoundError(`Task not found: ${id}`);
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
    template: Omit<
      Template,
      "id" | "created_at" | "updated_at" | "usage_count"
    > & { usage_count?: number },
  ): Promise<Template> {
    const id = generateId("template");
    const now = new Date().toISOString();
    const newTemplate: Template = {
      ...template,
      usage_count: template.usage_count ?? 0,
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

  async getTemplatesByCreator(userId: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (t) => t.created_by === userId,
    );
  }

  async getPopularTemplates(limit: number = 10): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter((t) => t.is_public)
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit);
  }

  async updateTemplate(
    id: string,
    updates: Partial<Template>,
  ): Promise<Template> {
    const template = this.templates.get(id);
    if (!template) throw new DatabaseNotFoundError(`Template not found: ${id}`);
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
    if (!template) throw new DatabaseNotFoundError(`Template not found: ${id}`);
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
    const id = generateId("analytics");
    const newEvent: Analytics = {
      id,
      ...event,
      created_at: new Date().toISOString(),
    };
    this.analytics.set(id, newEvent);
  }

  async getAnalyticsByUserId(userId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      (a) => a.user_id === userId,
    );
  }

  async getAnalyticsByEventType(eventType: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      (a) => a.event_type === eventType,
    );
  }

  async getAnalyticsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Analytics[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Array.from(this.analytics.values()).filter((a) => {
      const createdAt = new Date(a.created_at);
      return createdAt >= start && createdAt <= end;
    });
  }

  async getAnalyticsByEventTypeAndDateRange(
    eventType: string,
    startDate: string,
    endDate: string,
  ): Promise<Analytics[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Array.from(this.analytics.values()).filter((a) => {
      const createdAt = new Date(a.created_at);
      return (
        a.event_type === eventType && createdAt >= start && createdAt <= end
      );
    });
  }

  async createSession(
    session: Omit<Session, "id" | "created_at" | "updated_at">,
  ): Promise<Session> {
    const id = generateId("session");
    const now = new Date().toISOString();
    const newSession: Session = {
      ...session,
      id,
      created_at: now,
      updated_at: now,
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async getSessionById(id: string): Promise<Session | null> {
    return this.sessions.get(id) || null;
  }

  async getSessionsByUserId(userId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (s) => s.user_id === userId,
    );
  }

  async getActiveSessionsForUser(userId: string): Promise<Session[]> {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(
      (s) => s.user_id === userId && new Date(s.expires_at) > now,
    );
  }

  async deleteSession(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async deleteExpiredSessions(): Promise<number> {
    const now = new Date();
    let deleted = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (new Date(session.expires_at) < now) {
        this.sessions.delete(id);
        deleted++;
      }
    }
    return deleted;
  }

  async createBlueprintShare(
    share: Omit<BlueprintShare, "created_at">,
  ): Promise<BlueprintShare> {
    const newShare: BlueprintShare = {
      ...share,
      created_at: new Date().toISOString(),
    };
    this.blueprintShares.set(share.id, newShare);
    return newShare;
  }

  async getBlueprintShareById(id: string): Promise<BlueprintShare | null> {
    const share = this.blueprintShares.get(id);
    if (!share) return null;
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return null;
    }
    return share;
  }

  async deleteBlueprintShare(id: string): Promise<void> {
    this.blueprintShares.delete(id);
  }

  async deleteExpiredBlueprintShares(): Promise<number> {
    const now = new Date();
    let deleted = 0;
    for (const [id, share] of this.blueprintShares.entries()) {
      if (share.expires_at && new Date(share.expires_at) < now) {
        this.blueprintShares.delete(id);
        deleted++;
      }
    }
    return deleted;
  }

  async cleanupExpiredData(): Promise<{ sessions: number; shares: number }> {
    const sessions = await this.deleteExpiredSessions();
    const shares = await this.deleteExpiredBlueprintShares();
    return { sessions, shares };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async countProjectsByUserId(userId: string): Promise<number> {
    return Array.from(this.projects.values()).filter(
      (p) => p.user_id === userId,
    ).length;
  }

  async countProjectsByUserIdAndStatus(
    userId: string,
    status: string,
  ): Promise<number> {
    return Array.from(this.projects.values()).filter(
      (p) => p.user_id === userId && p.status === status,
    ).length;
  }

  async countBlueprintsByProjectId(projectId: string): Promise<number> {
    return Array.from(this.blueprints.values()).filter(
      (b) => b.project_id === projectId,
    ).length;
  }

  async countTasksByBlueprintId(blueprintId: string): Promise<number> {
    return Array.from(this.tasks.values()).filter(
      (t) => t.blueprint_id === blueprintId,
    ).length;
  }

  async countTemplatesByCreator(userId: string): Promise<number> {
    return Array.from(this.templates.values()).filter(
      (t) => t.created_by === userId,
    ).length;
  }

  async countPublicTemplates(): Promise<number> {
    return Array.from(this.templates.values()).filter((t) => t.is_public)
      .length;
  }

  async countTemplatesByCategory(category: string): Promise<number> {
    return Array.from(this.templates.values()).filter(
      (t) => t.category === category,
    ).length;
  }

  async countAnalyticsByEventType(eventType: string): Promise<number> {
    return Array.from(this.analytics.values()).filter(
      (a) => a.event_type === eventType,
    ).length;
  }

  async countAnalyticsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Array.from(this.analytics.values()).filter((a) => {
      const createdAt = new Date(a.created_at);
      return createdAt >= start && createdAt <= end;
    }).length;
  }

  async countAnalyticsByEventTypeAndDateRange(
    eventType: string,
    startDate: string,
    endDate: string,
  ): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Array.from(this.analytics.values()).filter((a) => {
      const createdAt = new Date(a.created_at);
      return (
        a.event_type === eventType && createdAt >= start && createdAt <= end
      );
    }).length;
  }

  async countActiveSessionsForUser(userId: string): Promise<number> {
    const now = new Date();
    return Array.from(this.sessions.values()).filter(
      (s) => s.user_id === userId && new Date(s.expires_at) > now,
    ).length;
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
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    throw new DatabaseError(
      `Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
      error instanceof Error ? error : undefined,
    );
  }
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
