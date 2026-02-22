/**
 * @fileoverview Database Service for Cloudflare D1
 *
 * Provides data access layer for the Blueprintify application.
 * Handles all database operations with proper error handling and type safety.
 *
 * @module db
 * @description Core database service module providing:
 * - User management (CRUD operations)
 * - Project management with status tracking
 * - Blueprint versioning and content storage
 * - Task generation and management
 * - Template system with usage tracking
 * - Session management with expiration
 * - Analytics event tracking
 * - Blueprint sharing with expiration
 *
 * @example
 * // Get database service instance
 * const db = getDatabaseService();
 *
 * // Create a user
 * const user = await db.createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 *
 * // Create a project
 * const project = await db.createProject({
 *   user_id: user.id,
 *   name: 'My Project',
 *   status: 'active'
 * });
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

/**
 * Database service interface defining all data access operations.
 *
 * Provides type-safe CRUD operations for all entities in the Blueprintify application.
 * Implementations must handle proper error handling and maintain data integrity.
 */
export interface DatabaseService {
  /**
   * Creates a new user with auto-generated ID and timestamps.
   * @param user - User data without id, created_at, and updated_at
   * @returns Created user with generated ID and timestamps
   */
  createUser(
    user: Omit<User, "id" | "created_at" | "updated_at">,
  ): Promise<User>;

  /**
   * Retrieves a user by their unique identifier.
   * @param id - User's unique identifier
   * @returns User object or null if not found
   */
  getUserById(id: string): Promise<User | null>;

  /**
   * Retrieves a user by their email address.
   * @param email - User's email address
   * @returns User object or null if not found
   */
  getUserByEmail(email: string): Promise<User | null>;

  /**
   * Updates an existing user's data.
   * @param id - User's unique identifier
   * @param updates - Partial user data to update
   * @returns Updated user object
   * @throws {NotFoundError} When user does not exist
   */
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  /**
   * Deletes a user by their unique identifier.
   * @param id - User's unique identifier
   */
  deleteUser(id: string): Promise<void>;

  /**
   * Creates a new project with auto-generated ID and timestamps.
   * @param project - Project data without id, created_at, and updated_at
   * @returns Created project with generated ID and timestamps
   */
  createProject(
    project: Omit<Project, "id" | "created_at" | "updated_at">,
  ): Promise<Project>;

  /**
   * Retrieves a project by its unique identifier.
   * @param id - Project's unique identifier
   * @returns Project object or null if not found
   */
  getProjectById(id: string): Promise<Project | null>;

  /**
   * Retrieves all projects for a specific user.
   * @param userId - User's unique identifier
   * @returns Array of projects belonging to the user
   */
  getProjectsByUserId(userId: string): Promise<Project[]>;

  /**
   * Retrieves projects for a user filtered by status.
   * @param userId - User's unique identifier
   * @param status - Project status to filter by ('active', 'archived', 'deleted')
   * @returns Array of projects matching the status
   */
  getProjectsByUserIdAndStatus(
    userId: string,
    status: Project["status"],
  ): Promise<Project[]>;

  /**
   * Updates an existing project's data.
   * @param id - Project's unique identifier
   * @param updates - Partial project data to update
   * @returns Updated project object
   * @throws {NotFoundError} When project does not exist
   */
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;

  /**
   * Deletes a project by its unique identifier.
   * @param id - Project's unique identifier
   */
  deleteProject(id: string): Promise<void>;

  /**
   * Creates a new blueprint with auto-generated ID and timestamps.
   * @param blueprint - Blueprint data with optional version (defaults to 1)
   * @returns Created blueprint with generated ID and timestamps
   */
  createBlueprint(
    blueprint: Omit<
      Blueprint,
      "id" | "created_at" | "updated_at" | "version"
    > & { version?: number },
  ): Promise<Blueprint>;

  /**
   * Retrieves a blueprint by its unique identifier.
   * @param id - Blueprint's unique identifier
   * @returns Blueprint object or null if not found
   */
  getBlueprintById(id: string): Promise<Blueprint | null>;

  /**
   * Retrieves all blueprints for a specific project.
   * @param projectId - Project's unique identifier
   * @returns Array of blueprints belonging to the project
   */
  getBlueprintsByProjectId(projectId: string): Promise<Blueprint[]>;

  /**
   * Retrieves the latest blueprint version for a project.
   * @param projectId - Project's unique identifier
   * @returns Latest blueprint or null if no blueprints exist
   */
  getLatestBlueprintByProjectId(projectId: string): Promise<Blueprint | null>;

  /**
   * Updates an existing blueprint's data.
   * @param id - Blueprint's unique identifier
   * @param updates - Partial blueprint data to update
   * @returns Updated blueprint object
   * @throws {NotFoundError} When blueprint does not exist
   */
  updateBlueprint(id: string, updates: Partial<Blueprint>): Promise<Blueprint>;

  /**
   * Deletes a blueprint by its unique identifier.
   * @param id - Blueprint's unique identifier
   */
  deleteBlueprint(id: string): Promise<void>;

  /**
   * Creates a new task with auto-generated ID and timestamps.
   * @param task - Task data with optional version (defaults to 1)
   * @returns Created task with generated ID and timestamps
   */
  createTask(
    task: Omit<Task, "id" | "created_at" | "updated_at" | "version"> & {
      version?: number;
    },
  ): Promise<Task>;

  /**
   * Retrieves a task by its unique identifier.
   * @param id - Task's unique identifier
   * @returns Task object or null if not found
   */
  getTaskById(id: string): Promise<Task | null>;

  /**
   * Retrieves all tasks for a specific blueprint.
   * @param blueprintId - Blueprint's unique identifier
   * @returns Array of tasks belonging to the blueprint
   */
  getTasksByBlueprintId(blueprintId: string): Promise<Task[]>;

  /**
   * Updates an existing task's data.
   * @param id - Task's unique identifier
   * @param updates - Partial task data to update
   * @returns Updated task object
   * @throws {NotFoundError} When task does not exist
   */
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;

  /**
   * Deletes a task by its unique identifier.
   * @param id - Task's unique identifier
   */
  deleteTask(id: string): Promise<void>;

  /**
   * Creates a new template with auto-generated ID and timestamps.
   * @param template - Template data with optional usage_count (defaults to 0)
   * @returns Created template with generated ID and timestamps
   */
  createTemplate(
    template: Omit<
      Template,
      "id" | "created_at" | "updated_at" | "usage_count"
    > & { usage_count?: number },
  ): Promise<Template>;

  /**
   * Retrieves a template by its unique identifier.
   * @param id - Template's unique identifier
   * @returns Template object or null if not found
   */
  getTemplateById(id: string): Promise<Template | null>;

  /**
   * Retrieves all public templates.
   * @returns Array of public templates
   */
  getPublicTemplates(): Promise<Template[]>;

  /**
   * Retrieves templates filtered by category.
   * @param category - Template category ('frontend', 'backend', 'fullstack', 'general')
   * @returns Array of templates in the category
   */
  getTemplatesByCategory(category: string): Promise<Template[]>;

  /**
   * Retrieves public templates filtered by category.
   * Uses idx_templates_category_is_public for optimal query performance.
   * @param category - Template category ('frontend', 'backend', 'fullstack', 'general')
   * @returns Array of public templates in the category
   */
  getPublicTemplatesByCategory(category: string): Promise<Template[]>;

  /**
   * Retrieves templates created by a specific user.
   * @param userId - Creator's unique identifier
   * @returns Array of templates created by the user
   */
  getTemplatesByCreator(userId: string): Promise<Template[]>;

  /**
   * Retrieves popular public templates sorted by usage count.
   * @param limit - Maximum number of templates to return (default: 10)
   * @returns Array of popular templates sorted by usage count descending
   */
  getPopularTemplates(limit?: number): Promise<Template[]>;

  /**
   * Updates an existing template's data.
   * @param id - Template's unique identifier
   * @param updates - Partial template data to update
   * @returns Updated template object
   * @throws {NotFoundError} When template does not exist
   */
  updateTemplate(id: string, updates: Partial<Template>): Promise<Template>;

  /**
   * Deletes a template by its unique identifier.
   * @param id - Template's unique identifier
   */
  deleteTemplate(id: string): Promise<void>;

  /**
   * Increments the usage count for a template.
   * @param id - Template's unique identifier
   * @throws {NotFoundError} When template does not exist
   */
  incrementTemplateUsage(id: string): Promise<void>;

  /**
   * Tracks an analytics event.
   * @param event - Event data including type, optional user_id, and metadata
   */
  trackEvent(event: {
    user_id?: string;
    event_type: string;
    event_data?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void>;

  /**
   * Retrieves analytics events for a specific user.
   * @param userId - User's unique identifier
   * @returns Array of analytics events for the user
   */
  getAnalyticsByUserId(userId: string): Promise<Analytics[]>;

  /**
   * Retrieves analytics events filtered by event type.
   * @param eventType - Event type to filter by
   * @returns Array of analytics events matching the type
   */
  getAnalyticsByEventType(eventType: string): Promise<Analytics[]>;

  /**
   * Retrieves analytics events within a date range.
   * @param startDate - Start of date range (ISO string)
   * @param endDate - End of date range (ISO string)
   * @returns Array of analytics events within the date range
   */
  getAnalyticsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Analytics[]>;

  /**
   * Retrieves analytics events filtered by type and date range.
   * @param eventType - Event type to filter by
   * @param startDate - Start of date range (ISO string)
   * @param endDate - End of date range (ISO string)
   * @returns Array of analytics events matching criteria
   */
  getAnalyticsByEventTypeAndDateRange(
    eventType: string,
    startDate: string,
    endDate: string,
  ): Promise<Analytics[]>;

  /**
   * Creates a new session with auto-generated ID and timestamps.
   * @param session - Session data including user_id and expiration
   * @returns Created session with generated ID and timestamps
   */
  createSession(
    session: Omit<Session, "id" | "created_at" | "updated_at">,
  ): Promise<Session>;

  /**
   * Retrieves a session by its unique identifier.
   * @param id - Session's unique identifier
   * @returns Session object or null if not found
   */
  getSessionById(id: string): Promise<Session | null>;

  /**
   * Retrieves all sessions for a specific user.
   * @param userId - User's unique identifier
   * @returns Array of sessions belonging to the user
   */
  getSessionsByUserId(userId: string): Promise<Session[]>;

  /**
   * Retrieves active (non-expired) sessions for a user.
   * @param userId - User's unique identifier
   * @returns Array of active sessions
   */
  getActiveSessionsForUser(userId: string): Promise<Session[]>;

  /**
   * Deletes a session by its unique identifier.
   * @param id - Session's unique identifier
   */
  deleteSession(id: string): Promise<void>;

  /**
   * Deletes all expired sessions.
   * @returns Number of sessions deleted
   */
  deleteExpiredSessions(): Promise<number>;

  /**
   * Creates a new blueprint share.
   * @param share - Share data including blueprint content and optional expiration
   * @returns Created share with generated timestamp
   */
  createBlueprintShare(
    share: Omit<BlueprintShare, "created_at">,
  ): Promise<BlueprintShare>;

  /**
   * Retrieves a blueprint share by its unique identifier.
   * @param id - Share's unique identifier
   * @returns Share object or null if not found or expired
   */
  getBlueprintShareById(id: string): Promise<BlueprintShare | null>;

  /**
   * Deletes a blueprint share by its unique identifier.
   * @param id - Share's unique identifier
   */
  deleteBlueprintShare(id: string): Promise<void>;

  /**
   * Deletes all expired blueprint shares.
   * @returns Number of shares deleted
   */
  deleteExpiredBlueprintShares(): Promise<number>;

  /**
   * Cleans up all expired data (sessions and shares).
   * @returns Object containing counts of deleted items
   */
  cleanupExpiredData(): Promise<{ sessions: number; shares: number }>;

  /**
   * Counts projects for a user without fetching records.
   * @param userId - User's unique identifier
   * @returns Number of projects
   */
  countProjectsByUserId(userId: string): Promise<number>;

  /**
   * Counts projects for a user filtered by status.
   * @param userId - User's unique identifier
   * @param status - Project status to filter by
   * @returns Number of projects matching the status
   */
  countProjectsByUserIdAndStatus(
    userId: string,
    status: Project["status"],
  ): Promise<number>;

  /**
   * Counts blueprints for a project.
   * @param projectId - Project's unique identifier
   * @returns Number of blueprints
   */
  countBlueprintsByProjectId(projectId: string): Promise<number>;

  /**
   * Counts tasks for a blueprint.
   * @param blueprintId - Blueprint's unique identifier
   * @returns Number of tasks
   */
  countTasksByBlueprintId(blueprintId: string): Promise<number>;

  /**
   * Counts templates created by a user.
   * @param userId - Creator's unique identifier
   * @returns Number of templates
   */
  countTemplatesByCreator(userId: string): Promise<number>;

  /**
   * Counts all public templates.
   * @returns Number of public templates
   */
  countPublicTemplates(): Promise<number>;

  /**
   * Counts templates in a category.
   * @param category - Template category to filter by
   * @returns Number of templates in the category
   */
  countTemplatesByCategory(category: string): Promise<number>;

  /**
   * Counts public templates in a specific category.
   * Uses idx_templates_category_is_public for optimal query performance.
   * @param category - Template category to filter by
   * @returns Number of public templates in the category
   */
  countPublicTemplatesByCategory(category: string): Promise<number>;

  /**
   * Counts analytics events by type.
   * @param eventType - Event type to filter by
   * @returns Number of events
   */
  countAnalyticsByEventType(eventType: string): Promise<number>;

  /**
   * Counts analytics events by type within a date range.
   * @param eventType - Event type to filter by
   * @param startDate - Start of date range (ISO string)
   * @param endDate - End of date range (ISO string)
   * @returns Number of events matching criteria
   */
  countAnalyticsByEventTypeAndDateRange(
    eventType: string,
    startDate: string,
    endDate: string,
  ): Promise<number>;

  /**
   * Counts active sessions for a user.
   * @param userId - User's unique identifier
   * @returns Number of active sessions
   */
  countActiveSessionsForUser(userId: string): Promise<number>;

  /**
   * Checks database health status.
   * @returns True if database is healthy
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Mock implementation of DatabaseService for development and testing.
 *
 * Uses in-memory Maps to simulate database operations without requiring
 * an actual database connection. Suitable for local development and unit tests.
 *
 * @implements {DatabaseService}
 */
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
    if (!user) throw new NotFoundError(`User not found: ${id}`);
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
    if (!project) throw new NotFoundError(`Project not found: ${id}`);
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
    if (!blueprint) throw new NotFoundError(`Blueprint not found: ${id}`);
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
    if (!task) throw new NotFoundError(`Task not found: ${id}`);
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

  async getPublicTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (t) => t.category === category && t.is_public,
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
    if (!template) throw new NotFoundError(`Template not found: ${id}`);
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
    if (!template) throw new NotFoundError(`Template not found: ${id}`);
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

  async countPublicTemplatesByCategory(category: string): Promise<number> {
    return Array.from(this.templates.values()).filter(
      (t) => t.category === category && t.is_public,
    ).length;
  }

  async countAnalyticsByEventType(eventType: string): Promise<number> {
    return Array.from(this.analytics.values()).filter(
      (a) => a.event_type === eventType,
    ).length;
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

/**
 * Factory function to get the appropriate database service instance.
 *
 * Returns a MockDatabaseService for development. In production, this would
 * return a Cloudflare D1 implementation.
 *
 * @returns DatabaseService instance
 */
export function getDatabaseService(): DatabaseService {
  return new MockDatabaseService();
}

/**
 * Serializes data to a JSON string.
 *
 * @param data - Data to serialize
 * @returns JSON string representation
 */
export function serializeJSON(data: unknown): string {
  return JSON.stringify(data);
}

/**
 * Deserializes a JSON string to the specified type.
 *
 * @param json - JSON string to deserialize
 * @returns Parsed data of type T
 * @throws {DatabaseError} When JSON parsing fails
 */
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

/**
 * Base error class for database operations.
 *
 * Provides structured error handling with optional cause chaining.
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Error thrown when data validation fails.
 *
 * Indicates that input data does not conform to expected schema.
 */
export class ValidationError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "ValidationError";
  }
}

/**
 * Error thrown when a requested resource is not found.
 *
 * Indicates that the specified entity does not exist in the database.
 */
export class NotFoundError extends DatabaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = "NotFoundError";
  }
}
