import type { D1Database } from "@cloudflare/workers-types";

export interface BlueprintRow {
  id: string;
  project_name: string;
  description: string;
  blueprint_content: string;
  target_audience?: string;
  constraints?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  blueprint_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  order_index: number;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  project_name: string;
  default_description: string;
  category: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TechStackOptionRow {
  id: number;
  name: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSessionRow {
  id: string;
  current_step: string;
  blueprint_id?: string;
  template_id?: string;
  project_data?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export class DatabaseService {
  constructor(private db: D1Database) {}

  // ===== Blueprint Operations =====

  async createBlueprint(
    data: Omit<BlueprintRow, "id" | "created_at" | "updated_at">,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO blueprints (id, project_name, description, blueprint_content, target_audience, constraints, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt
      .bind(
        id,
        data.project_name,
        data.description,
        data.blueprint_content,
        data.target_audience,
        data.constraints,
        data.status,
        now,
        now,
      )
      .run();

    return id;
  }

  async getBlueprint(id: string): Promise<BlueprintRow | null> {
    const stmt = this.db.prepare("SELECT * FROM blueprints WHERE id = ?");
    const result = await stmt.bind(id).first<BlueprintRow>();
    return result || null;
  }

  async getBlueprintsByStatus(status: string): Promise<BlueprintRow[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM blueprints WHERE status = ? ORDER BY created_at DESC",
    );
    const result = await stmt.bind(status).all<BlueprintRow>();
    return result.results || [];
  }

  async updateBlueprintStatus(id: string, status: string): Promise<boolean> {
    const stmt = this.db.prepare(
      "UPDATE blueprints SET status = ? WHERE id = ?",
    );
    const result = await stmt.bind(status, id).run();
    return result.success || false;
  }

  async deleteBlueprint(id: string): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM blueprints WHERE id = ?");
    const result = await stmt.bind(id).run();
    return result.success || false;
  }

  // ===== Task Operations =====

  async createTask(
    data: Omit<TaskRow, "id" | "created_at" | "updated_at">,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, blueprint_id, title, description, status, priority, order_index, parent_task_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt
      .bind(
        id,
        data.blueprint_id,
        data.title,
        data.description,
        data.status,
        data.priority,
        data.order_index,
        data.parent_task_id,
        now,
        now,
      )
      .run();

    return id;
  }

  async getTasksByBlueprint(blueprintId: string): Promise<TaskRow[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM tasks WHERE blueprint_id = ? ORDER BY order_index ASC",
    );
    const result = await stmt.bind(blueprintId).all<TaskRow>();
    return result.results || [];
  }

  async updateTaskStatus(id: string, status: string): Promise<boolean> {
    const stmt = this.db.prepare("UPDATE tasks SET status = ? WHERE id = ?");
    const result = await stmt.bind(status, id).run();
    return result.success || false;
  }

  async deleteTask(id: string): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM tasks WHERE id = ?");
    const result = await stmt.bind(id).run();
    return result.success || false;
  }

  // ===== Template Operations =====

  async getTemplatesByCategory(category: string): Promise<TemplateRow[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM templates WHERE category = ? AND is_active = TRUE ORDER BY usage_count DESC",
    );
    const result = await stmt.bind(category).all<TemplateRow>();
    return result.results || [];
  }

  async getTemplate(id: string): Promise<TemplateRow | null> {
    const stmt = this.db.prepare(
      "SELECT * FROM templates WHERE id = ? AND is_active = TRUE",
    );
    const result = await stmt.bind(id).first<TemplateRow>();
    return result || null;
  }

  async incrementTemplateUsage(id: string): Promise<boolean> {
    const stmt = this.db.prepare(
      "UPDATE templates SET usage_count = usage_count + 1 WHERE id = ?",
    );
    const result = await stmt.bind(id).run();
    return result.success || false;
  }

  // ===== Tech Stack Operations =====

  async getTechStackByCategory(
    category: string,
  ): Promise<TechStackOptionRow[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM tech_stack_options WHERE category = ? AND is_active = TRUE ORDER BY name ASC",
    );
    const result = await stmt.bind(category).all<TechStackOptionRow>();
    return result.results || [];
  }

  async getAllTechStackOptions(): Promise<TechStackOptionRow[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM tech_stack_options WHERE is_active = TRUE ORDER BY category, name",
    );
    const result = await stmt.all<TechStackOptionRow>();
    return result.results || [];
  }

  // ===== User Session Operations =====

  async createUserSession(
    data: Omit<UserSessionRow, "created_at" | "updated_at">,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO user_sessions (id, current_step, blueprint_id, template_id, project_data, created_at, updated_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt
      .bind(
        id,
        data.current_step,
        data.blueprint_id,
        data.template_id,
        data.project_data,
        now,
        now,
        data.expires_at,
      )
      .run();

    return id;
  }

  async getUserSession(id: string): Promise<UserSessionRow | null> {
    const stmt = this.db.prepare(
      "SELECT * FROM user_sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP",
    );
    const result = await stmt.bind(id).first<UserSessionRow>();
    return result || null;
  }

  async updateUserSession(
    id: string,
    updates: Partial<Omit<UserSessionRow, "id" | "created_at">>,
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const setClause = [];
    const bindValues = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = ?`);
        bindValues.push(value);
      }
    });

    if (setClause.length === 0) return false;

    setClause.push("updated_at = ?");
    bindValues.push(now);
    bindValues.push(id);

    const stmt = this.db.prepare(
      `UPDATE user_sessions SET ${setClause.join(", ")} WHERE id = ?`,
    );
    const result = await stmt.bind(...bindValues).run();
    return result.success || false;
  }

  async deleteUserSession(id: string): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM user_sessions WHERE id = ?");
    const result = await stmt.bind(id).run();
    return result.success || false;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const stmt = this.db.prepare(
      "DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP",
    );
    const result = await stmt.run();
    return result.meta?.changes || 0;
  }

  // ===== Health Check =====

  async healthCheck(): Promise<boolean> {
    try {
      const stmt = this.db.prepare("SELECT 1 as test");
      await stmt.first();
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }
}
