# Database Memory and Conventions

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

### Constraints

- Foreign keys: `fk_{table}_{column}` (e.g., `fk_projects_user_id`)
- Unique constraints: `uk_{table}_{column}` (e.g., `uk_users_email`)
- Check constraints: `ck_{table}_{condition}` (e.g., `ck_users_email_format`)

## Data Types

### Primary Keys

- Use `TEXT` for UUID/string-based primary keys
- Format: `{table}_{timestamp}_{random}` (e.g., `user_1707347200_abc123def`)

### Timestamps

- Always include `created_at` and `updated_at` columns
- Use `DATETIME DEFAULT CURRENT_TIMESTAMP`
- Create triggers for automatic `updated_at` updates

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

### Query Optimization

- Index columns frequently used in WHERE clauses
- Index columns used in ORDER BY clauses
- Consider composite indexes for multi-column queries

### Performance Considerations

- Limit indexes to what's necessary for performance
- Monitor query performance and add indexes as needed
- Use `EXPLAIN QUERY PLAN` to analyze slow queries

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

## Data Integrity

### Foreign Keys

- Enable foreign key constraints: `PRAGMA foreign_keys = ON`
- Use `ON DELETE CASCADE` for dependent data
- Use `ON DELETE SET NULL` for optional relationships

### Constraints

- Add NOT NULL constraints where appropriate
- Use UNIQUE constraints for natural keys
- Include CHECK constraints for data validation

### Triggers

- Create triggers for automatic timestamp updates
- Use triggers for complex data validation
- Document trigger behavior clearly

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
