-- Initial Database Schema for Blueprint Generator
-- Migration: 001_initial_schema.sql
-- Created: 2026-02-05

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Projects table: Stores user project configurations
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    target_audience TEXT,
    constraints TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tech stack selections for projects
CREATE TABLE project_tech_stack (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'hosting', 'ai', 'testing', 'styling', 'other')),
    version TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Features for projects
CREATE TABLE project_features (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    feature TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Blueprints table: Stores generated architectural blueprints
CREATE TABLE blueprints (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    blueprint_type TEXT DEFAULT 'generated' CHECK (blueprint_type IN ('generated', 'template', 'custom')),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Generation history: Tracks blueprint generation attempts
CREATE TABLE generation_history (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    blueprint_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    generation_time_ms INTEGER,
    error_message TEXT,
    error_details TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (blueprint_id) REFERENCES blueprints(id) ON DELETE SET NULL
);

-- Templates table: Predefined project templates
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    default_description TEXT NOT NULL,
    project_name_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Template tech stack options
CREATE TABLE template_tech_stack (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'hosting', 'ai', 'testing', 'styling', 'other')),
    is_default BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);

-- Template predefined features
CREATE TABLE template_features (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    feature TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);

-- Indexes for performance optimization

-- Projects indexes
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Blueprint indexes
CREATE INDEX idx_blueprints_project_id ON blueprints(project_id);
CREATE INDEX idx_blueprints_name ON blueprints(name);
CREATE INDEX idx_blueprints_generated_at ON blueprints(generated_at);
CREATE INDEX idx_blueprints_type ON blueprints(blueprint_type);

-- Generation history indexes
CREATE INDEX idx_generation_history_project_id ON generation_history(project_id);
CREATE INDEX idx_generation_history_status ON generation_history(status);
CREATE INDEX idx_generation_history_started_at ON generation_history(started_at);

-- Template indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_active ON templates(is_active);

-- Tech stack indexes
CREATE INDEX idx_project_tech_stack_project_id ON project_tech_stack(project_id);
CREATE INDEX idx_project_tech_stack_category ON project_tech_stack(category);
CREATE INDEX idx_template_tech_stack_template_id ON template_tech_stack(template_id);

-- Feature indexes
CREATE INDEX idx_project_features_project_id ON project_features(project_id);
CREATE INDEX idx_template_features_template_id ON template_features(template_id);