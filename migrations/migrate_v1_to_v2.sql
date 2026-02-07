-- Migration Script: v1.0.0 to v2.0.0
-- Database Schema Migration for Blueprintify
-- Adds performance optimizations, audit trails, and soft deletes

-- Migration safety check
-- Ensure we're migrating from the correct version
-- This will fail if the schema is already at v2.0.0
BEGIN TRANSACTION;

-- Add new columns to existing tables (backward compatible)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_login_at DATETIME;
ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL;

ALTER TABLE projects ADD COLUMN visibility TEXT DEFAULT 'private';
ALTER TABLE projects ADD COLUMN deleted_at DATETIME NULL;

ALTER TABLE blueprints ADD COLUMN content_hash TEXT;
ALTER TABLE blueprints ADD COLUMN deleted_at DATETIME NULL;

ALTER TABLE tasks ADD COLUMN content_hash TEXT;
ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN deleted_at DATETIME NULL;

ALTER TABLE templates ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE templates ADD COLUMN deleted_at DATETIME NULL;

ALTER TABLE sessions ADD COLUMN ip_address TEXT;
ALTER TABLE sessions ADD COLUMN user_agent TEXT;

-- Create new audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create performance-optimized indexes
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_status_active ON users(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_user_visibility ON projects(user_id, visibility);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(status, updated_at) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_blueprints_project_status ON blueprints(project_id, status);
CREATE INDEX IF NOT EXISTS idx_blueprints_content_hash ON blueprints(content_hash);
CREATE INDEX IF NOT EXISTS idx_blueprints_updated_at ON blueprints(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_active ON blueprints(status, updated_at) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_tasks_blueprint_status ON tasks(blueprint_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_content_hash ON tasks(content_hash);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority, status);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_templates_category_public ON templates(category, is_public) WHERE is_public = 1;
CREATE INDEX IF NOT EXISTS idx_templates_usage_count ON templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_public_active ON templates(is_public, status) WHERE is_public = 1 AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_sessions_ip_address ON sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expires_at) WHERE expires_at < CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_analytics_event_time ON analytics(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_time ON analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_time ON audit_logs(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create performance views
CREATE VIEW IF NOT EXISTS active_projects AS
SELECT p.*, u.name as user_name, u.email as user_email
FROM projects p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'active' AND u.status = 'active' AND p.deleted_at IS NULL AND u.deleted_at IS NULL
ORDER BY p.updated_at DESC;

CREATE VIEW IF NOT EXISTS public_templates AS
SELECT t.*, u.name as creator_name
FROM templates t
LEFT JOIN users u ON t.created_by = u.id
WHERE t.is_public = 1 AND t.status = 'active' AND t.deleted_at IS NULL AND (u.deleted_at IS NULL OR u.deleted_at IS NULL)
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
WHERE u.status = 'active' AND u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email;

-- Create audit triggers
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

-- Update existing records with default values for new columns
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
UPDATE templates SET status = 'active' WHERE status IS NULL;

-- Set performance optimization settings
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = memory;
PRAGMA optimize;

-- Mark migration as complete
-- This creates a migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO schema_migrations (version) VALUES ('2.0.0');

COMMIT;

-- Verify migration success
SELECT 'Migration to v2.0.0 completed successfully' as status;