-- Blueprintify Enhanced Database Schema
-- Cloudflare D1 (SQLite) Database Schema - Performance Optimized
-- Version: 2.0.0
-- Optimized for production workloads with 10K+ users

-- Enable foreign key constraints and WAL mode for better concurrency
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = memory;

-- Users table for user accounts and preferences
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    preferences TEXT, -- JSON string for user preferences
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at DATETIME,
    status TEXT DEFAULT 'active', -- active, suspended, deleted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL -- Soft delete timestamp
);

-- Projects table for project configurations
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT, -- JSON array of tech stack items
    features TEXT, -- JSON array of features
    target_audience TEXT,
    constraints TEXT,
    status TEXT DEFAULT 'active', -- active, archived, deleted
    visibility TEXT DEFAULT 'private', -- private, public, shared
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL, -- Soft delete timestamp
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blueprints table for generated blueprint content
CREATE TABLE IF NOT EXISTS blueprints (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Generated blueprint markdown content
    content_hash TEXT, -- SHA256 hash for content deduplication
    metadata TEXT, -- JSON string for generation metadata
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active', -- active, archived, deleted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL, -- Soft delete timestamp
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Tasks table for generated task lists
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    blueprint_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Generated task list content
    content_hash TEXT, -- SHA256 hash for content deduplication
    metadata TEXT, -- JSON string for generation metadata
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active', -- active, completed, deleted
    priority TEXT DEFAULT 'medium', -- low, medium, high
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL, -- Soft delete timestamp
    FOREIGN KEY (blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE
);

-- Templates table for template definitions
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    project_name TEXT NOT NULL,
    default_description TEXT NOT NULL,
    tech_stack TEXT, -- JSON array of tech stack items
    features TEXT, -- JSON array of features
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, deprecated, deleted
    created_by TEXT, -- User ID who created the template
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL, -- Soft delete timestamp
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Sessions table for user session management
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_data TEXT, -- JSON string for session data
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics table for usage tracking (optimized for time-series data)
CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event_type TEXT NOT NULL, -- blueprint_generated, task_generated, template_used, etc.
    event_data TEXT, -- JSON string for event data
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

-- Audit trail table for tracking important changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_values TEXT, -- JSON string of old values (for updates/deletes)
    new_values TEXT, -- JSON string of new values (for inserts/updates)
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Optimized indexes for common query patterns

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_status_active ON users(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- Projects table indexes (composite for common queries)
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_user_visibility ON projects(user_id, visibility);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(status, updated_at) WHERE status = 'active';

-- Blueprints table indexes (composite for project queries)
CREATE INDEX IF NOT EXISTS idx_blueprints_project_id ON blueprints(project_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_project_status ON blueprints(project_id, status);
CREATE INDEX IF NOT EXISTS idx_blueprints_content_hash ON blueprints(content_hash);
CREATE INDEX IF NOT EXISTS idx_blueprints_updated_at ON blueprints(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_active ON blueprints(status, updated_at) WHERE status = 'active';

-- Tasks table indexes (composite for blueprint queries)
CREATE INDEX IF NOT EXISTS idx_tasks_blueprint_id ON tasks(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_blueprint_status ON tasks(blueprint_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_content_hash ON tasks(content_hash);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority, status);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at DESC);

-- Templates table indexes (composite for browsing)
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_category_public ON templates(category, is_public) WHERE is_public = 1;
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_usage_count ON templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_public_active ON templates(is_public, status) WHERE is_public = 1 AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);

-- Sessions table indexes (optimized for cleanup)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expires_at) WHERE expires_at < CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_sessions_ip_address ON sessions(ip_address);

-- Analytics table indexes (optimized for time-series queries)
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_time ON analytics(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_time ON analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_time ON audit_logs(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enhanced triggers for automatic timestamp updates and audit logging

CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_projects_timestamp 
    AFTER UPDATE ON projects
    BEGIN
        UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_blueprints_timestamp 
    AFTER UPDATE ON blueprints
    BEGIN
        UPDATE blueprints SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp 
    AFTER UPDATE ON tasks
    BEGIN
        UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_templates_timestamp 
    AFTER UPDATE ON templates
    BEGIN
        UPDATE templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_sessions_timestamp 
    AFTER UPDATE ON sessions
    BEGIN
        UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Audit logging triggers for important tables
CREATE TRIGGER IF NOT EXISTS audit_users_insert
    AFTER INSERT ON users
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, created_at)
        VALUES ('users', NEW.id, 'INSERT', json_object(
            'id', NEW.id,
            'email', NEW.email,
            'name', NEW.name,
            'status', NEW.status
        ), CURRENT_TIMESTAMP);
    END;

CREATE TRIGGER IF NOT EXISTS audit_projects_insert
    AFTER INSERT ON projects
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id, created_at)
        VALUES ('projects', NEW.id, 'INSERT', json_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'name', NEW.name,
            'status', NEW.status
        ), NEW.user_id, CURRENT_TIMESTAMP);
    END;

CREATE TRIGGER IF NOT EXISTS audit_templates_usage
    AFTER UPDATE OF usage_count ON templates
    BEGIN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, created_at)
        VALUES ('templates', NEW.id, 'USAGE_UPDATE', json_object(
            'id', NEW.id,
            'usage_count', NEW.usage_count
        ), CURRENT_TIMESTAMP);
    END;

-- Views for common queries (performance optimization)
CREATE VIEW IF NOT EXISTS active_projects AS
SELECT p.*, u.name as user_name, u.email as user_email
FROM projects p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'active' AND u.status = 'active'
ORDER BY p.updated_at DESC;

CREATE VIEW IF NOT EXISTS public_templates AS
SELECT t.*, u.name as creator_name
FROM templates t
LEFT JOIN users u ON t.created_by = u.id
WHERE t.is_public = 1 AND t.status = 'active'
ORDER BY t.usage_count DESC, t.created_at DESC;

CREATE VIEW IF NOT EXISTS user_analytics_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    COUNT(CASE WHEN a.event_type = 'blueprint_generated' THEN 1 END) as blueprints_created,
    COUNT(CASE WHEN a.event_type = 'task_generated' THEN 1 END) as tasks_generated,
    COUNT(CASE WHEN a.event_type = 'template_used' THEN 1 END) as templates_used,
    MAX(a.created_at) as last_activity,
    COUNT(a.id) as total_events
FROM users u
LEFT JOIN analytics a ON u.id = a.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email;

-- Insert default templates (updated with new fields)
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

-- Performance optimization settings
-- These should be set when connecting to the database
PRAGMA optimize;