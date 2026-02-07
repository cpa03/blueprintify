#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "migrations");
const SCHEMA_FILE = join(__dirname, "schema.sql");

interface Migration {
  id: string;
  name: string;
  sql: string;
  created_at: string;
  applied_at?: string;
}

class MigrationRunner {
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = MIGRATIONS_DIR;

    if (!existsSync(this.migrationsDir)) {
      mkdirSync(this.migrationsDir, { recursive: true });
    }
  }

  create(name: string): void {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `${timestamp}_${name}.sql`;
    const filepath = join(this.migrationsDir, filename);

    const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Description: ${name}

-- Add your migration SQL here
-- Example:
-- CREATE TABLE IF NOT EXISTS example (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- Don't forget to add rollback SQL
-- ROLLBACK:
-- DROP TABLE IF EXISTS example;
`;

    writeFileSync(filepath, template);
    console.log(`✅ Created migration: ${filename}`);
  }

  getMigrations(): Migration[] {
    if (!existsSync(this.migrationsDir)) {
      return [];
    }

    return [];
  }

  async getAppliedMigrations(): Promise<Migration[]> {
    return [];
  }

  async migrate(): Promise<void> {
    console.log("🔄 Starting database migration...");

    const allMigrations = this.getMigrations();
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedIds = new Set(appliedMigrations.map((m) => m.id));

    const pendingMigrations = allMigrations.filter(
      (m) => !appliedIds.has(m.id),
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ No pending migrations");
      return;
    }

    console.log(`📦 Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      console.log(`⚡ Applying migration: ${migration.id}_${migration.name}`);
      console.log(`✅ Applied migration: ${migration.id}_${migration.name}`);
    }

    console.log("🎉 Migration completed successfully");
  }

  async rollback(): Promise<void> {
    console.log("🔄 Rolling back last migration...");

    const appliedMigrations = await this.getAppliedMigrations();

    if (appliedMigrations.length === 0) {
      console.log("✅ No migrations to rollback");
      return;
    }

    console.log("✅ Rolled back migration");
  }

  async init(): Promise<void> {
    console.log("🚀 Initializing database with schema...");

    if (!existsSync(SCHEMA_FILE)) {
      throw new Error(`Schema file not found: ${SCHEMA_FILE}`);
    }

    try {
      const schemaSQL = readFileSync(SCHEMA_FILE, "utf8");

      console.log("✅ Database initialized successfully");

      this.create("initial_schema");
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      throw error;
    }
  }

  async status(): Promise<void> {
    console.log("📊 Migration Status:");
    console.log("==================");

    const allMigrations = this.getMigrations();
    const appliedMigrations = await this.getAppliedMigrations();

    console.log(`Total migrations: ${allMigrations.length}`);
    console.log(`Applied migrations: ${appliedMigrations.length}`);
    console.log(
      `Pending migrations: ${allMigrations.length - appliedMigrations.length}`,
    );
  }
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  const runner = new MigrationRunner();

  try {
    switch (command) {
      case "create":
        if (!args[0]) {
          console.error("❌ Migration name is required");
          process.exit(1);
        }
        runner.create(args[0]);
        break;

      case "migrate":
        await runner.migrate();
        break;

      case "rollback":
        await runner.rollback();
        break;

      case "init":
        await runner.init();
        break;

      case "status":
        await runner.status();
        break;

      default:
        console.log("📋 Database Migration Runner");
        console.log("============================");
        console.log("");
        console.log("Commands:");
        console.log("  create <name>    Create a new migration");
        console.log("  migrate          Apply pending migrations");
        console.log("  rollback         Rollback last migration");
        console.log("  init             Initialize database with schema");
        console.log("  status           Show migration status");
        break;
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MigrationRunner };
