-- ============================================================================
-- Blueprintify Database Schema
-- ============================================================================
-- Cloudflare D1 (SQLite) Database Schema
-- Version: 1.3.0
-- Last Updated: 2026-02-18
-- 
-- Schema Conventions:
-- - Table names: snake_case, plural form (e.g., users, project_blueprints)
-- - Column names: snake_case (e.g., created_at, user_id)
-- - Foreign keys: fk_{table}_{column} (e.g., fk_projects_user_id)
-- - Unique constraints: uk_{table}_{column} (e.g., uk_users_email)
-- - Check constraints: ck_{table}_{condition} (e.g., ck_projects_status)
-- - Indexes: idx_{table}_{column(s)} (e.g., idx_users_email)
-- ============================================================================

-- Enable foreign key constraints (required for referential integrity)
PRAGMA foreign_keys = ON;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user accounts and preferences for the application.
-- Primary key uses TEXT for UUID-based identifiers.
-- Format: user_{timestamp}_{random}
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    preferences TEXT, -- JSON string for user preferences (schema: UserPreferences)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email)
);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
-- Stores project configurations and metadata.
-- Status values: 'active', 'archived', 'deleted'
-- tech_stack and features stored as JSON arrays for flexibility.
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT, -- JSON array of TechStackItem objects
    features TEXT, -- JSON array of feature strings
    target_audience TEXT,
    constraints TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_projects_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT ck_projects_status CHECK (status IN ('active', 'archived', 'deleted'))
);

-- ============================================================================
-- BLUEPRINTS TABLE
-- ============================================================================
-- Stores generated blueprint content for projects.
-- Version field enables content versioning and history tracking.
CREATE TABLE IF NOT EXISTS blueprints (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Generated blueprint markdown content
    metadata TEXT, -- JSON object with generation metadata (model, tokens, etc.)
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_blueprints_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
-- Stores generated task lists derived from blueprints.
-- Version field enables task list versioning.
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    blueprint_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Generated task list markdown content
    metadata TEXT, -- JSON object with generation metadata
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_blueprint_id FOREIGN KEY (blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE
);

-- ============================================================================
-- TEMPLATES TABLE
-- ============================================================================
-- Stores template definitions for quick project setup.
-- Categories: 'frontend', 'backend', 'fullstack', 'general'
-- is_public: 1 = public template, 0 = private (user-created)
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    project_name TEXT NOT NULL,
    default_description TEXT NOT NULL,
    tech_stack TEXT, -- JSON array of TechStackItem objects
    features TEXT, -- JSON array of feature strings
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    created_by TEXT, -- User ID who created the template (NULL for system templates)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_templates_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_templates_category CHECK (category IN ('frontend', 'backend', 'fullstack', 'general'))
);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
-- Stores user session data for authentication.
-- expires_at: Session expiration timestamp for cleanup.
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_data TEXT, -- JSON object with session data
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- ANALYTICS TABLE
-- ============================================================================
-- Stores usage tracking events for analytics.
-- Event types: 'blueprint_generated', 'task_generated', 'template_used', 'export', 'import', 'refine'
-- Note: user_id can be NULL for anonymous events.
CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event_type TEXT NOT NULL,
    event_data TEXT, -- JSON object with event-specific data
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_analytics_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_analytics_event_type CHECK (event_type IN ('blueprint_generated', 'task_generated', 'template_used', 'export', 'import', 'refine', 'session_start', 'session_end'))
);

-- ============================================================================
-- BLUEPRINT_SHARES TABLE
-- ============================================================================
-- Stores shared blueprints for public/private sharing.
-- expires_at: Optional expiration for share links.
CREATE TABLE IF NOT EXISTS blueprint_shares (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    blueprint TEXT NOT NULL, -- Full blueprint content
    metadata TEXT, -- JSON object with share metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Single-column indexes for primary lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_blueprints_project_id ON blueprints(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_blueprint_id ON tasks(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_blueprint_shares_expires_at ON blueprint_shares(expires_at);

-- Composite indexes for common query patterns
-- User's active projects (most common dashboard query)
CREATE INDEX IF NOT EXISTS idx_projects_user_id_status ON projects(user_id, status);

-- Latest blueprint version for project (version history lookup)
CREATE INDEX IF NOT EXISTS idx_blueprints_project_id_version ON blueprints(project_id, version DESC);

-- User-specific analytics (dashboard stats)
CREATE INDEX IF NOT EXISTS idx_analytics_user_id_event_type ON analytics(user_id, event_type);

-- Time-based analytics queries (event trends over time)
CREATE INDEX IF NOT EXISTS idx_analytics_event_type_created_at ON analytics(event_type, created_at);

-- Public templates by category (template browser)
CREATE INDEX IF NOT EXISTS idx_templates_category_is_public ON templates(category, is_public);

-- User's templates (my templates page)
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);

-- Popular templates (sorted by usage)
CREATE INDEX IF NOT EXISTS idx_templates_usage_count ON templates(usage_count DESC);

-- Active sessions for user (session validation)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id_expires_at ON sessions(user_id, expires_at);

-- Blueprint shares cleanup (expired shares)
CREATE INDEX IF NOT EXISTS idx_blueprint_shares_created_at ON blueprint_shares(created_at);

-- Timestamp updates handled at application layer (SQLite triggers cause recursion on self-UPDATE)

-- Insert default templates
INSERT OR IGNORE INTO templates (
    id, name, description, icon, project_name, default_description, tech_stack, features, category
) VALUES 
(
    'react-starter',
    'React Starter',
    'A modern React application with Vite, TypeScript, and Tailwind CSS',
    '⚛️',
    'React App',
    'A modern React application built with Vite, TypeScript, and Tailwind CSS for rapid development.',
    '[{"name": "React", "category": "frontend"}, {"name": "Vite", "category": "frontend"}, {"name": "TypeScript", "category": "frontend"}, {"name": "Tailwind CSS", "category": "styling"}]',
    '["Hot reload", "TypeScript support", "Tailwind CSS styling", "Component-based architecture"]',
    'frontend'
),
(
    'fullstack-next',
    'Full-Stack Next.js',
    'Full-stack application with Next.js, TypeScript, and PostgreSQL',
    '🚀',
    'Next.js App',
    'A full-stack web application using Next.js with TypeScript, featuring server-side rendering and API routes.',
    '[{"name": "Next.js", "category": "frontend"}, {"name": "TypeScript", "category": "frontend"}, {"name": "PostgreSQL", "category": "database", "subcategory": "relational"}, {"name": "Prisma", "category": "database"}]',
    '["Server-side rendering", "API routes", "Database integration", "Authentication ready"]',
    'fullstack'
),
(
    'cloudflare-api',
    'Cloudflare Workers API',
    'Serverless API using Cloudflare Workers and Hono framework',
    '☁️',
    'Workers API',
    'A serverless API built with Cloudflare Workers and Hono framework, optimized for edge deployment.',
    '[{"name": "Cloudflare Workers", "category": "hosting"}, {"name": "Hono", "category": "backend"}, {"name": "TypeScript", "category": "frontend"}, {"name": "Cloudflare D1", "category": "database", "subcategory": "serverless"}]',
    '["Edge deployment", "Fast performance", "TypeScript support", "Built-in database"]',
    'backend'
);