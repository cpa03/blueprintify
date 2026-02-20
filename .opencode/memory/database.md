# Database Memory and Conventions

## Schema Version

- Current Version: 1.3.2
- Last Updated: 2026-02-20
- Schema File: `schema.sql`

## Database Service Layer

- Location: `apps/api/src/db/index.ts`
- Mock Implementation: `MockDatabaseService` for development
- Production: D1 bindings configured in `apps/api/src/types.ts`
- All tables have corresponding Zod schemas and TypeScript types
- **Test Coverage**: `apps/api/src/db/index.test.ts` - 45 comprehensive tests covering all CRUD operations

## Available Methods

### Template Operations

- `createTemplate(template)` - Create a new template
- `getTemplateById(id)` - Get template by ID
- `getPublicTemplates()` - Get all public templates
- `getTemplatesByCategory(category)` - Get templates by category
- `getTemplatesByCreator(userId)` - Get templates created by a specific user (v1.3.2)
- `updateTemplate(id, updates)` - Update template
- `deleteTemplate(id)` - Delete template
- `incrementTemplateUsage(id)` - Increment usage count

## Default Values (v1.3.1)

The MockDatabaseService applies default values matching Zod schema defaults:

| Entity    | Field         | Default |
| --------- | ------------- | ------- |
| Blueprint | `version`     | `1`     |
| Task      | `version`     | `1`     |
| Template  | `usage_count` | `0`     |

Create method signatures accept optional version/usage_count to allow caller override.

## Naming Conventions

### Tables

- Use snake_case for table names (e.g., `users`, `project_blueprints`)
- Use plural form for table names
- Prefix with descriptive category when needed (e.g., `auth_sessions`)

### Columns

- Use snake_case for column names (e.g., `created_at`, `user_id`)
- Use descriptive names that clearly indicate purpose
- Foreign key columns should follow pattern: `{table}_id` (e.g., `user_id`, `project_id`)

### Indexes

- Use descriptive prefix: `idx_{table}_{column(s)}` (e.g., `idx_users_email`)
- For composite indexes: `idx_{table}_{column1}_{column2}` (e.g., `idx_projects_user_id_status`)
- Document the query pattern each index optimizes

### Constraints

- Foreign keys: `fk_{table}_{column}` (e.g., `fk_projects_user_id`)
- Unique constraints: `uk_{table}_{column}` (e.g., `uk_users_email`)
- Check constraints: `ck_{table}_{condition}` (e.g., `ck_projects_status`)

## Data Types

### Primary Keys

- Use `TEXT` for UUID/string-based primary keys
- Format: `{table}_{timestamp}_{random}` (e.g., `user_1707347200_abc123def`)

### Timestamps

- Always include `created_at` and `updated_at` columns
- Use `DATETIME DEFAULT CURRENT_TIMESTAMP`
- Timestamp updates handled at application layer (SQLite triggers cause recursion on self-UPDATE)

### JSON Data

- Store complex data as JSON strings in `TEXT` columns
- Document the structure in column comments
- Use Zod schemas for validation in application code

## Indexing Strategy

### Primary Indexes

- All tables have primary key indexes automatically

### Foreign Key Indexes

- Always index foreign key columns for join performance
- Example: `idx_projects_user_id`

### Composite Indexes (v1.3.0)

Use composite indexes for common multi-column query patterns:

| Index                                 | Query Pattern                                                 |
| ------------------------------------- | ------------------------------------------------------------- |
| `idx_projects_user_id_status`         | User's active projects (dashboard)                            |
| `idx_blueprints_project_id_version`   | Latest blueprint version for project (version history lookup) |
| `idx_analytics_user_id_event_type`    | User-specific analytics                                       |
| `idx_templates_category_is_public`    | Public templates by category                                  |
| `idx_templates_created_by_category`   | User's templates by category (filtered my templates page)     |
| `idx_analytics_event_type_created_at` | Time-based analytics (event trends)                           |
| `idx_sessions_user_id_expires_at`     | Active sessions for user (session validation)                 |

### Query Optimization

- Index columns frequently used in WHERE clauses
- Index columns used in ORDER BY clauses
- Use composite indexes for multi-column queries
- Document the purpose of each index

### Performance Considerations

- Limit indexes to what's necessary for performance
- Monitor query performance and add indexes as needed
- Use `EXPLAIN QUERY PLAN` to analyze slow queries

## Data Integrity

### CHECK Constraints (v1.2.0)

Use CHECK constraints to enforce valid values at the database level:

```sql
-- Projects status must be one of these values
CONSTRAINT ck_projects_status CHECK (status IN ('active', 'archived', 'deleted'))

-- Templates category must be one of these values
CONSTRAINT ck_templates_category CHECK (category IN ('frontend', 'backend', 'fullstack', 'general'))

-- Analytics event_type must be one of these values
CONSTRAINT ck_analytics_event_type CHECK (event_type IN ('blueprint_generated', 'task_generated', 'template_used', 'export', 'import', 'refine', 'session_start', 'session_end'))
```

### Foreign Keys

- Enable foreign key constraints: `PRAGMA foreign_keys = ON`
- Use `ON DELETE CASCADE` for dependent data
- Use `ON DELETE SET NULL` for optional relationships
- Define explicit constraint names for documentation

### Constraints

- Add NOT NULL constraints where appropriate
- Use UNIQUE constraints for natural keys
- Include CHECK constraints for data validation

## Migration Strategy

### Version Control

- All schema changes must go through migrations
- Use timestamp-based migration filenames
- Include rollback SQL in every migration

### Migration Files

- Format: `{timestamp}_{description}.sql`
- Include forward and rollback SQL
- Add descriptive comments for complex changes

### Safety Rules

- Never use `DROP` without proper safeguards
- Always test migrations on staging first
- Include data validation in migrations

## Security Considerations

### Data Access

- Implement proper row-level security
- Use parameterized queries to prevent SQL injection
- Validate all inputs at application level

### Sensitive Data

- Never store passwords in plain text
- Use encryption for sensitive personal data
- Consider data retention policies

## Performance Optimization

### Query Patterns

- Use prepared statements for repeated queries
- Implement proper pagination for large result sets
- Cache frequently accessed data

### Connection Management

- Use connection pooling for high traffic
- Implement proper timeout handling
- Monitor connection usage patterns

## Monitoring and Maintenance

### Health Checks

- Implement database health check endpoints
- Monitor query performance metrics
- Set up alerts for slow queries

### Backup Strategy

- Regular automated backups
- Test restore procedures
- Document recovery processes

## Environment-Specific Considerations

### Development

- Use mock database service for local development
- Include sample data for testing
- Enable detailed query logging

### Production (Cloudflare D1)

- Optimize for edge performance
- Consider read replicas for scaling
- Implement proper error handling for network issues

### Testing

- Use transaction rollback for test isolation
- Include database tests in CI/CD pipeline
- Test with realistic data volumes
