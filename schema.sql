-- Blueprintify Database Schema
-- Cloudflare D1 (SQLite) Database Schema
-- Version: 1.0.0

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table for user accounts and preferences
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    preferences TEXT, -- JSON string for user preferences
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blueprints table for generated blueprint content
CREATE TABLE IF NOT EXISTS blueprints (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Generated blueprint markdown content
    metadata TEXT, -- JSON string for generation metadata
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Tasks table for generated task lists
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    blueprint_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Generated task list content
    metadata TEXT, -- JSON string for generation metadata
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    created_by TEXT, -- User ID who created the template
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Sessions table for user session management
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_data TEXT, -- JSON string for session data
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics table for usage tracking
CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event_type TEXT NOT NULL, -- blueprint_generated, task_generated, template_used, etc.
    event_data TEXT, -- JSON string for event data
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS blueprint_shares (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    blueprint TEXT NOT NULL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

-- Indexes for performance optimization
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

-- Triggers for automatic timestamp updates
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