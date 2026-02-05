-- Blueprintify Database Schema
-- Cloudflare D1 (SQLite) Implementation
-- Created: 2026-02-05

-- ===== Core Tables =====

-- Templates table for predefined project templates
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    project_name TEXT NOT NULL,
    default_description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tech stack options table
CREATE TABLE tech_stack_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Blueprint junction table for template tech stacks
CREATE TABLE template_tech_stack (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id TEXT NOT NULL,
    tech_stack_id INTEGER NOT NULL,
    version TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (tech_stack_id) REFERENCES tech_stack_options(id) ON DELETE CASCADE,
    UNIQUE(template_id, tech_stack_id)
);

-- Blueprints table for user-generated project definitions
CREATE TABLE blueprints (
    id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    description TEXT NOT NULL,
    blueprint_content TEXT NOT NULL,
    target_audience TEXT,
    constraints TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Blueprint tech stack junction table
CREATE TABLE blueprint_tech_stack (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blueprint_id TEXT NOT NULL,
    tech_stack_id INTEGER NOT NULL,
    version TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE,
    FOREIGN KEY (tech_stack_id) REFERENCES tech_stack_options(id) ON DELETE CASCADE,
    UNIQUE(blueprint_id, tech_stack_id)
);

-- Features table for blueprint features
CREATE TABLE blueprint_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blueprint_id TEXT NOT NULL,
    feature TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE
);

-- Tasks table for generated development tasks
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    blueprint_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    order_index INTEGER NOT NULL DEFAULT 0,
    parent_task_id TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blueprint_id) REFERENCES blueprints(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task dependencies junction table
CREATE TABLE task_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    depends_on_task_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(task_id, depends_on_task_id)
);

-- ===== Sessions Table for Wizard Flow =====

-- User sessions for wizard progress persistence
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    current_step TEXT NOT NULL DEFAULT 'project-details',
    blueprint_id TEXT,
    template_id TEXT,
    project_data TEXT, -- JSON object for form data
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (blueprint_id) REFERENCES blueprints(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
);

-- ===== Indexes for Performance =====

-- Templates indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_active ON templates(is_active);
CREATE INDEX idx_templates_usage_count ON templates(usage_count DESC);

-- Blueprints indexes
CREATE INDEX idx_blueprints_status ON blueprints(status);
CREATE INDEX idx_blueprints_created_at ON blueprints(created_at DESC);
CREATE INDEX idx_blueprints_project_name ON blueprints(project_name);

-- Tasks indexes
CREATE INDEX idx_tasks_blueprint_id ON tasks(blueprint_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_order ON tasks(blueprint_id, order_index);

-- Sessions indexes
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_sessions_blueprint_id ON user_sessions(blueprint_id);

-- Tech stack indexes
CREATE INDEX idx_tech_stack_category ON tech_stack_options(category);
CREATE INDEX idx_tech_stack_active ON tech_stack_options(is_active);

-- ===== Triggers for Data Integrity =====

-- Update updated_at timestamps
CREATE TRIGGER update_templates_updated_at 
    AFTER UPDATE ON templates
    FOR EACH ROW
    BEGIN
        UPDATE templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_blueprints_updated_at 
    AFTER UPDATE ON blueprints
    FOR EACH ROW
    BEGIN
        UPDATE blueprints SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_tasks_updated_at 
    AFTER UPDATE ON tasks
    FOR EACH ROW
    BEGIN
        UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_sessions_updated_at 
    AFTER UPDATE ON user_sessions
    FOR EACH ROW
    BEGIN
        UPDATE user_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Increment template usage count
CREATE TRIGGER increment_template_usage_count
    AFTER INSERT ON blueprint_tech_stack
    WHEN NEW.template_id IS NOT NULL
    BEGIN
        UPDATE templates SET usage_count = usage_count + 1 WHERE id = NEW.template_id;
    END;

-- ===== Views for Common Queries =====

-- Blueprint with all related data
CREATE VIEW blueprint_details AS
SELECT 
    b.id,
    b.project_name,
    b.description,
    b.blueprint_content,
    b.target_audience,
    b.constraints,
    b.status,
    b.created_at,
    b.updated_at,
    GROUP_CONCAT(DISTINCT tso.name) as tech_stack,
    GROUP_CONCAT(DISTINCT bf.feature) as features
FROM blueprints b
LEFT JOIN blueprint_tech_stack bts ON b.id = bts.blueprint_id
LEFT JOIN tech_stack_options tso ON bts.tech_stack_id = tso.id
LEFT JOIN blueprint_features bf ON b.id = bf.blueprint_id
GROUP BY b.id;

-- Tasks with dependencies
CREATE VIEW task_details AS
SELECT 
    t.id,
    t.blueprint_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.order_index,
    t.parent_task_id,
    t.created_at,
    t.updated_at,
    b.project_name,
    GROUP_CONCAT(DISTINCT td.depends_on_task_id) as dependencies
FROM tasks t
JOIN blueprints b ON t.blueprint_id = b.id
LEFT JOIN task_dependencies td ON t.id = td.task_id
GROUP BY t.id;