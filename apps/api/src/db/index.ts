// Database types for type safety
export type DatabaseClient = {
  prepare: (query: string) => {
    bind: (...params: any[]) => {
      run: () => Promise<any>;
      all: () => Promise<any>;
      first: () => Promise<any>;
    };
    run: () => Promise<any>;
    all: () => Promise<any>;
    first: () => Promise<any>;
  };
  batch: (statements: any[]) => Promise<any>;
  exec: (sql: string) => Promise<any>;
};

// Database singleton
let db: DatabaseClient | null = null;

export function getDatabase(): DatabaseClient {
  if (!db) {
    // @ts-ignore - DB binding is available at runtime in Cloudflare Workers
    const d1Database = globalThis.DB;
    if (!d1Database) {
      throw new Error(
        "D1 database binding not found. Please configure D1 in wrangler.toml",
      );
    }
    db = d1Database;
  }
  return db as DatabaseClient;
}

// Database initialization
export async function initializeDatabase() {
  const client = getDatabase();

  try {
    // Check if tables exist by querying one
    await client.prepare("SELECT 1 FROM projects LIMIT 1").first();
    console.log("Database already initialized");
    return;
  } catch (error) {
    console.log("Initializing database...");
  }

  try {
    // For now, manually run the initial schema
    // In a real deployment, you'd use wrangler d1 migrations apply
    const fs = await import("fs");
    const path = await import("path");

    const migrationsDir = path.join(process.cwd(), "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file: string) => file.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");

      console.log(`Executing migration: ${file}`);
      await client.exec(migrationSQL);
    }

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

// Helper functions for common operations
export const dbHelpers = {
  // Generate UUID for new records
  generateId: () => crypto.randomUUID(),

  // Format timestamp for database
  now: () => new Date().toISOString(),

  // Handle database errors consistently
  handleError: (error: unknown, operation: string) => {
    console.error(`Database error in ${operation}:`, error);
    throw new Error(`Database operation failed: ${operation}`);
  },
};

// Export commonly used query builders
export const queries = {
  // Projects
  createProject: (
    id: string,
    name: string,
    description: string,
    targetAudience?: string,
    constraints?: string,
  ) => ({
    sql: `INSERT INTO projects (id, name, description, target_audience, constraints) VALUES (?, ?, ?, ?, ?)`,
    params: [id, name, description, targetAudience, constraints],
  }),

  getProject: (id: string) => ({
    sql: `SELECT * FROM projects WHERE id = ?`,
    params: [id],
  }),

  // Blueprints
  createBlueprint: (
    id: string,
    projectId: string | null,
    name: string,
    content: string,
    type: string = "generated",
  ) => ({
    sql: `INSERT INTO blueprints (id, project_id, name, content, blueprint_type) VALUES (?, ?, ?, ?, ?)`,
    params: [id, projectId, name, content, type],
  }),

  getBlueprint: (id: string) => ({
    sql: `SELECT * FROM blueprints WHERE id = ?`,
    params: [id],
  }),

  // Templates
  getActiveTemplates: () => ({
    sql: `SELECT * FROM templates WHERE is_active = 1 ORDER BY name`,
    params: [],
  }),

  getTemplateWithDetails: (id: string) => ({
    sql: `
      SELECT 
        t.*,
        GROUP_CONCAT(DISTINCT ts.name) as tech_stack,
        GROUP_CONCAT(DISTINCT tf.feature) as features
      FROM templates t
      LEFT JOIN template_tech_stack ts ON t.id = ts.template_id
      LEFT JOIN template_features tf ON t.id = tf.template_id
      WHERE t.id = ?
      GROUP BY t.id
    `,
    params: [id],
  }),
};
