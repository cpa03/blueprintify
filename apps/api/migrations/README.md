# Database Setup

This directory contains the database schema and migrations for the Blueprint Generator application using Cloudflare D1.

## Database Structure

### Tables

#### `projects`

Stores user project configurations.

- `id`: UUID primary key
- `name`: Project name
- `description`: Project description
- `target_audience`: Target audience (optional)
- `constraints`: Project constraints (optional)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### `project_tech_stack`

Tech stack selections for projects.

- `id`: UUID primary key
- `project_id`: Foreign key to projects
- `name`: Technology name
- `category`: Technology category
- `version`: Version (optional)
- `created_at`: Creation timestamp

#### `project_features`

Features for projects.

- `id`: UUID primary key
- `project_id`: Foreign key to projects
- `feature`: Feature description
- `created_at`: Creation timestamp

#### `blueprints`

Generated architectural blueprints.

- `id`: UUID primary key
- `project_id`: Foreign key to projects (nullable)
- `name`: Blueprint name
- `content`: Blueprint content (markdown)
- `blueprint_type`: Type (generated, template, custom)
- `generated_at`: Generation timestamp
- `updated_at`: Last update timestamp

#### `generation_history`

Tracks blueprint generation attempts.

- `id`: UUID primary key
- `project_id`: Foreign key to projects
- `blueprint_id`: Foreign key to blueprints (nullable)
- `status`: Generation status
- `started_at`: Start timestamp
- `completed_at`: Completion timestamp (nullable)
- `generation_time_ms`: Generation time in milliseconds
- `error_message`: Error message (nullable)
- `error_details`: Error details (nullable)

#### `templates`

Predefined project templates.

- `id`: UUID primary key
- `name`: Template name (unique)
- `description`: Template description
- `icon`: Icon emoji
- `category`: Template category
- `default_description`: Default project description
- `project_name_template`: Project name template
- `is_active`: Active status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### `template_tech_stack`

Template tech stack options.

- `id`: UUID primary key
- `template_id`: Foreign key to templates
- `name`: Technology name
- `category`: Technology category
- `is_default`: Default selection flag
- `sort_order`: Display order
- `created_at`: Creation timestamp

#### `template_features`

Template predefined features.

- `id`: UUID primary key
- `template_id`: Foreign key to templates
- `feature`: Feature description
- `sort_order`: Display order
- `created_at`: Creation timestamp

## Migrations

Migrations are stored in the `migrations/` directory with numeric prefixes:

- `001_initial_schema.sql`: Creates all tables and indexes
- `002_seed_data.sql`: Populates initial template data

## Local Development

For local development, the database will be automatically initialized when the API starts.

## Production Deployment

### Using Wrangler

1. Create D1 database:

```bash
wrangler d1 create blueprint-generator-db
```

2. Update `wrangler.toml` with the database ID

3. Run migrations:

```bash
wrangler d1 migrations apply blueprint-generator-db
```

4. Deploy:

```bash
wrangler deploy
```

### Seeded Templates

The database includes the following initial templates:

1. **Web Application** (`web-app-starter`)
   - Full-stack web application
   - React/Next.js + Hono/Express
   - PostgreSQL/MongoDB
   - Vercel/Cloudflare hosting

2. **Mobile Application** (`mobile-app`)
   - Cross-platform mobile app
   - React Native/Flutter
   - Firebase database
   - AWS hosting

3. **API Service** (`api-service`)
   - RESTful API
   - Hono/Express/Fastify
   - PostgreSQL/MongoDB/Redis
   - Railway/AWS hosting

4. **Microservice** (`microservice`)
   - Containerized service
   - Hono + Docker + Kubernetes
   - PostgreSQL + Redis
   - Prometheus monitoring

5. **SaaS Platform** (`saas-platform`)
   - Multi-tenant SaaS
   - Next.js + Hono
   - PostgreSQL + Stripe
   - AWS + Datadog

## Database Services

### Project Service (`/src/services/projects.ts`)

- CRUD operations for projects
- Tech stack and feature management
- Pagination support

### Template Service (`/src/services/templates.ts`)

- Template listing and details
- Category-based filtering
- Tech stack and feature retrieval

### Database Client (`/src/db/index.ts`)

- D1 database abstraction
- Migration runner
- Helper functions and query builders

## API Endpoints

### Templates

- `GET /templates` - List active templates
- `GET /templates/:id` - Get template details
- `GET /templates/category/:category` - Get templates by category
- `GET /templates/:id/tech-stack` - Get template tech stack
- `GET /templates/:id/features` - Get template features

### Projects

- `GET /projects` - List projects (with pagination)
- `GET /projects/:id` - Get project details
- `POST /projects` - Create new project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/tech-stack` - Get project tech stack
- `GET /projects/:id/features` - Get project features

## Performance Considerations

- **Indexes**: All foreign keys and frequently queried fields are indexed
- **Pagination**: List operations support limit/offset for large datasets
- **Constraints**: Database-level constraints ensure data integrity
- **Foreign Keys**: Cascade deletes maintain referential integrity
