# API Documentation

This document provides comprehensive API documentation for the Blueprintify backend service built with Cloudflare Workers and Hono.

## Base URL

```
https://blueprintify-api.your-domain.workers.dev
```

\*For local development: `http://localhost:8787`

## Authentication

The API uses API key authentication via the `x-api-key` header. All endpoints except the health check (`GET /`) and warmup (`GET /warmup`) require a valid API key.

The `API_KEY` environment variable must be configured server-side (set via `.dev.vars` locally or `wrangler secret put API_KEY` in production). If `API_KEY` is not configured, protected endpoints return `503 Service Unavailable`.

Authentication uses constant-time string comparison to prevent timing attacks.

## Environment Variables

| Variable          | Required | Default                     | Description                                  |
| ----------------- | -------- | --------------------------- | -------------------------------------------- |
| `OPENAI_API_KEY`  | Yes      | -                           | Your OpenAI API key (starts with `sk-`)      |
| `OPENAI_BASE_URL` | No       | `https://api.openai.com/v1` | Custom API base URL for compatible providers |
| `OPENAI_MODEL`    | No       | `gpt-4o-mini`               | Model to use for generations                 |

## API Metadata

| Field   | Value                   | Description                  |
| ------- | ----------------------- | ---------------------------- |
| Name    | Blueprint Generator API | Service name                 |
| Version | 1.0.0                   | Current API version          |
| Status  | healthy                 | Health check response status |

## Endpoints

### GET /

Health check endpoint to verify the API is running and provide API metadata.

#### Response

```json
{
  "name": "Blueprint Generator API",
  "version": "1.0.0",
  "status": "healthy",
  "endpoints": {
    "generate": "POST /generate",
    "tasks": "POST /tasks",
    "refine": "POST /refine",
    "export": "POST /export",
    "import": "POST /import",
    "storageQuota": "GET /storage/quota",
    "storageClear": "DELETE /storage/clear",
    "shareCreate": "POST /share",
    "shareGet": "GET /share/:id",
    "shareDelete": "DELETE /share/:id"
  }
}
```

### GET /warmup

Endpoint for pre-warming the circuit breaker on worker startup. Initializes the OpenAI circuit breaker and returns its state.

#### Response

```json
{
  "status": "ok",
  "timestamp": 1716825600000,
  "circuitBreaker": {
    "state": "closed",
    "failures": 0,
    "successes": 0,
    "isColdStart": true,
    "coldStartRemainingMs": 30000
  }
}
```

### POST /generate

Generate a project blueprint based on user input. This endpoint streams the response using Server-Sent Events (SSE).

#### Request Body

```typescript
interface GenerateRequest {
  projectName: string; // Project name (1-100 chars)
  description: string; // Project description (10-2000 chars)
  techStack: TechStackItem[]; // Array of selected technologies with metadata
  features?: string[]; // Array of desired features
  targetAudience?: string; // Optional target audience
  constraints?: string; // Optional project constraints
}

interface TechStackItem {
  name: string;
  category:
    | "frontend"
    | "backend"
    | "database"
    | "hosting"
    | "ai"
    | "testing"
    | "styling"
    | "other";
  subcategory?:
    | "relational"
    | "nosql"
    | "vector"
    | "graph"
    | "edge"
    | "search"
    | "cache"
    | "serverless";
  version?: string;
  description?: string;
  features?: string[];
}
```

#### Validation Rules

- `projectName`: Required, 1-100 characters
- `description`: Required, 10-2000 characters
- `techStack`: Required, at least 1 item

#### Response

Streams `blueprint.md` content line by line via SSE.

**Event Stream Format:**

```
data: # Project: [project-name]

data: ## Overview
data: [Generated content...]

data: DONE
```

#### Example Request

```bash
curl -X POST http://localhost:8787/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "My App",
    "description": "A comprehensive web application for task management with real-time collaboration features",
    "techStack": [
      {
        "name": "React",
        "category": "frontend",
        "version": "18.2.0",
        "description": "UI library for building user interfaces"
      },
      {
        "name": "Hono",
        "category": "backend",
        "version": "3.0.0",
        "description": "Ultra-lightweight web framework for Cloudflare Workers"
      },
      {
        "name": "PostgreSQL",
        "category": "database",
        "subcategory": "relational",
        "description": "Advanced open-source relational database"
      }
    ],
    "features": ["User authentication", "Task CRUD", "Real-time updates", "Team collaboration"],
    "targetAudience": "Individual users and small teams",
    "constraints": "Must work offline first, then sync when online"
  }'
```

#### Error Responses

```json
{
  "error": "Invalid request body",
  "details": {
    "projectName": ["Project name is required"]
  }
}
```

### POST /tasks

Generate project tasks based on a previously generated blueprint. This endpoint also streams the response using SSE.

#### Request Body

```typescript
interface TasksRequest {
  blueprint: string; // The generated blueprint.md content
  projectName: string; // Project name from the original request
}
```

#### Response

Streams `task.md` content line by line via SSE with the same format as `/generate`.

#### Example Request

```bash
curl -X POST http://localhost:8787/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "blueprint": "# Project: My App\n\n## Overview...",
    "projectName": "My App"
  }'
```

### POST /refine

Refine a specific section of generated content using AI assistance.

#### Request Body

```typescript
interface RefineRequest {
  content: string; // Content to refine (required, min 1 char)
  instruction: string; // Refinement instruction (required, min 1 char)
  context?: string; // Optional context for better refinement
}
```

#### Validation Rules

- `content`: Required, minimum 1 character
- `instruction`: Required, minimum 1 character
- `context`: Optional string for additional context

#### Response

Streams refined content line by line via SSE.

#### Example Request

```bash
curl -X POST http://localhost:8787/refine \
  -H "Content-Type: application/json" \
  -d '{
    "content": "## Authentication\n\nBasic login system",
    "instruction": "Add detailed implementation notes for JWT authentication with refresh tokens",
    "context": "This is for a React app with Hono backend, targeting enterprise users who need secure session management"
  }'
```

### POST /export

Export project data in various formats (JSON, ZIP, Markdown).

#### Request Body

```typescript
interface ExportRequest {
  projectName: string; // Project name for filename
  blueprint: string; // Blueprint content to export
  tasks?: string; // Optional tasks content
  format: "json" | "zip" | "markdown"; // Export format
}
```

#### Response

Returns exported data in the requested format.

**JSON Format Response:**

```json
{
  "success": true,
  "data": {
    "projectName": "My Project",
    "blueprint": "# Project: My App...",
    "tasks": "## Tasks...",
    "exportedAt": "2026-02-18T10:00:00.000Z",
    "version": "1.0.0",
    "format": "json"
  },
  "filename": "My_Project_export.json"
}
```

**Markdown Format Response:**

```json
{
  "success": true,
  "data": {
    "content": "# My Project\n\nExported: 2026-02-18T10:00:00.000Z\n\n## Blueprint\n\n...",
    "filename": "My_Project.md"
  }
}
```

#### Example Request

```bash
curl -X POST http://localhost:8787/export \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "My App",
    "blueprint": "# Project: My App\n\n## Overview\n...",
    "tasks": "## Tasks\n\n- [ ] Setup project",
    "format": "json"
  }'
```

### POST /import

Import project data from various formats (JSON, Markdown).

#### Request Body

```typescript
interface ImportRequest {
  data: string; // Raw data to import (JSON string or markdown)
  format: "json" | "markdown"; // Import format
  overwrite?: boolean; // Whether to overwrite existing data
}
```

#### Response

Returns parsed and validated import data.

```json
{
  "success": true,
  "data": {
    "projectName": "My Project",
    "blueprint": "# Project: My App...",
    "tasks": "## Tasks...",
    "importedAt": "2026-02-18T10:00:00.000Z",
    "overwrite": false,
    "warnings": ["Version mismatch: expected 1.0.0, got 0.9.0"]
  }
}
```

#### Example Request

```bash
curl -X POST http://localhost:8787/import \
  -H "Content-Type: application/json" \
  -d '{
    "data": "{\"projectName\":\"My App\",\"blueprint\":\"# Project: My App\",\"version\":\"1.0.0\"}",
    "format": "json",
    "overwrite": false
  }'
```

### GET /storage/quota

Get storage quota information.

#### Response

```json
{
  "success": true,
  "data": {
    "used": 0,
    "total": 5242880,
    "percentage": 0,
    "projects": 0,
    "note": "Server-side storage tracking. Client-side storage quota available via localStorage API."
  }
}
```

#### Example Request

```bash
curl http://localhost:8787/storage/quota
```

### POST /storage/report

Report client-side localStorage usage to the server for distributed quota tracking. Clients periodically report their storage utilization so the server can provide accurate aggregate quota information.

#### Request Body

```typescript
interface StorageReportRequest {
  used: number; // Bytes used by the client
  total: number; // Total quota bytes available
  projects: number; // Number of stored projects
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "stored": true,
    "timestamp": "2026-02-18T10:00:00.000Z"
  }
}
```

#### Example Request

```bash
curl -X POST http://localhost:8787/storage/report \
  -H "Content-Type: application/json" \
  -d '{"used": 1048576, "total": 5242880, "projects": 3}'
```

### DELETE /storage/clear

Clear all stored data. Requires confirmation.

#### Request Body

```typescript
interface StorageClearRequest {
  confirm: boolean; // Must be true to confirm deletion
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "cleared": true,
    "message": "Server-side storage cleared. Client-side storage must be cleared via localStorage API.",
    "timestamp": "2026-02-18T10:00:00.000Z"
  }
}
```

#### Example Request

```bash
curl -X DELETE http://localhost:8787/storage/clear \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'
```

### POST /share

Create a shareable blueprint link. Shares expire after 30 days.

#### Request Body

```typescript
interface ShareCreateRequest {
  title: string; // Share title (1-200 chars)
  blueprint: string; // Blueprint content (1-50000 chars)
  metadata?: {
    projectName?: string;
    techStack?: string[];
    author?: string;
  };
}
```

#### Response

```json
{
  "id": "abc123def456",
  "url": "https://your-domain.com/share/abc123def456",
  "expiresAt": "2026-03-20T10:00:00.000Z"
}
```

#### Example Request

```bash
curl -X POST http://localhost:8787/share \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project Blueprint",
    "blueprint": "# Project: My App\n\n## Overview\n...",
    "metadata": {
      "projectName": "My App",
      "techStack": ["React", "TypeScript"],
      "author": "Developer"
    }
  }'
```

### GET /share/:id

Retrieve a shared blueprint by ID.

#### Response

```json
{
  "id": "abc123def456",
  "title": "My Project Blueprint",
  "blueprint": "# Project: My App\n\n## Overview\n...",
  "metadata": {
    "projectName": "My App",
    "techStack": ["React", "TypeScript"],
    "author": "Developer"
  },
  "createdAt": "2026-02-18T10:00:00.000Z",
  "expiresAt": "2026-03-20T10:00:00.000Z"
}
```

#### Error Responses

- **404 Not Found**: Share not found or has expired

#### Example Request

```bash
curl http://localhost:8787/share/abc123def456
```

### DELETE /share/:id

Delete a shared blueprint.

#### Response

```json
{
  "message": "Share deleted successfully"
}
```

#### Example Request

```bash
curl -X DELETE http://localhost:8787/share/abc123def456
```

## Error Handling

All endpoints return consistent error responses using structured JSON format:

```json
{
  "success": false,
  "error": {
    "type": "validation|authentication|authorization|not_found|configuration|network|ai_service|internal",
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {
      "field": ["Validation error messages"]
    },
    "timestamp": "2026-02-11T20:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

The `requestId` field provides a unique identifier for each request, enabling efficient debugging and log correlation across distributed systems.

### Error Types

| Type             | Description                                         | HTTP Status |
| ---------------- | --------------------------------------------------- | ----------- |
| `validation`     | Request validation failed                           | 400         |
| `authentication` | Authentication required                             | 401         |
| `authorization`  | Insufficient permissions                            | 403         |
| `not_found`      | Resource not found                                  | 404         |
| `configuration`  | Service configuration error (e.g., missing API key) | 503         |
| `network`        | Network error occurred                              | 500         |
| `ai_service`     | AI service error                                    | 503         |
| `internal`       | Internal server error                               | 500         |

### Common Error Scenarios

#### Validation Errors (400)

```json
{
  "success": false,
  "error": {
    "type": "validation",
    "message": "Request validation failed",
    "details": {
      "projectName": ["Project name is required"],
      "description": ["Description must be at least 10 characters"]
    },
    "timestamp": "2026-02-11T20:00:00.000Z"
  }
}
```

#### Configuration Errors (503)

```json
{
  "success": false,
  "error": {
    "type": "configuration",
    "message": "OpenAI API key not configured",
    "code": "CONFIGURATION_ERROR",
    "timestamp": "2026-02-11T20:00:00.000Z"
  }
}
```

#### AI Service Errors (503)

```json
{
  "success": false,
  "error": {
    "type": "ai_service",
    "message": "AI service error",
    "code": "AI_SERVICE_ERROR",
    "timestamp": "2026-02-11T20:00:00.000Z"
  }
}
```

## Tech Stack Categories

The API supports detailed tech stack categorization for better project planning and technology selection.

### Main Categories

| Category   | Description                             | Example Technologies                               |
| ---------- | --------------------------------------- | -------------------------------------------------- |
| `frontend` | User interface libraries and frameworks | React, Vue.js, Next.js, Svelte, Angular, Astro     |
| `backend`  | Server-side frameworks and runtimes     | Hono, Express, Fastify, NestJS, Django, FastAPI    |
| `database` | Data storage solutions                  | PostgreSQL, MongoDB, Redis, Pinecone, Neo4j        |
| `hosting`  | Deployment and hosting platforms        | Cloudflare, Vercel, Netlify, AWS, Railway, Fly.io  |
| `ai`       | AI/ML services and libraries            | OpenAI, Anthropic, Hugging Face                    |
| `testing`  | Testing frameworks and tools            | Jest, Cypress, Playwright, Vitest                  |
| `styling`  | CSS and styling solutions               | Tailwind CSS, Styled Components, CSS Modules, Sass |
| `other`    | Miscellaneous tools and utilities       | Git, Docker, CI/CD tools                           |

### Database Subcategories

| Subcategory  | Description                   | Example Technologies                 |
| ------------ | ----------------------------- | ------------------------------------ |
| `relational` | Traditional SQL databases     | PostgreSQL, MySQL, PlanetScale       |
| `nosql`      | Document and key-value stores | MongoDB, Redis, DynamoDB, Cassandra  |
| `vector`     | Vector databases for AI       | Pinecone, Weaviate, Chroma           |
| `graph`      | Graph databases               | Neo4j, Amazon Neptune                |
| `edge`       | Edge-optimized databases      | FaunaDB, Upstash, Cloudflare D1      |
| `search`     | Search and analytics engines  | Elasticsearch, Algolia               |
| `cache`      | In-memory caching             | Redis                                |
| `serverless` | Serverless database platforms | PlanetScale, Cloudflare D1, Supabase |

### Example Tech Stack Item

```json
{
  "name": "PostgreSQL",
  "category": "database",
  "subcategory": "relational",
  "version": "15.0",
  "description": "Advanced open-source relational database with strong ACID compliance",
  "features": ["ACID compliance", "JSON support", "Full-text search", "Window functions"]
}
```

## Rate Limiting

Currently, there are no explicit rate limits implemented. However, the OpenAI API has its own rate limits that may affect request processing.

## SDK and Client Examples

### JavaScript/TypeScript (Node.js)

```typescript
class BlueprintifyClient {
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:8787") {
    this.baseUrl = baseUrl;
  }

  async generateBlueprint(request: GenerateRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let blueprint = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "DONE") {
              return blueprint;
            }
            if (data) {
              blueprint += data + "\n";
            }
          }
        }
      }
    }

    return blueprint;
  }
}

// Usage
const client = new BlueprintifyClient();
const blueprint = await client.generateBlueprint({
  projectName: "My Project",
  description: "A test project",
  techStack: ["React", "TypeScript"],
  features: ["User authentication"],
});
```

### Python

```python
import requests
import json

class BlueprintifyClient:
    def __init__(self, base_url="http://localhost:8787"):
        self.base_url = base_url

    def generate_blueprint(self, request_data):
        response = requests.post(
            f"{self.base_url}/generate",
            json=request_data,
            stream=True
        )

        if response.status_code != 200:
            response.raise_for_status()

        blueprint = ""
        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                if decoded.startswith('data: '):
                    data = decoded[6:]
                    if data == 'DONE':
                        break
                    if data:
                        blueprint += data + '\n'

        return blueprint

# Usage
client = BlueprintifyClient()
blueprint = client.generate_blueprint({
    "projectName": "My Project",
    "description": "A test project",
    "techStack": ["React", "TypeScript"],
    "features": ["User authentication"]
})
```

## Development Testing

### Using curl for Testing

```bash
# Test health check
curl http://localhost:8787

# Test blueprint generation
curl -X POST http://localhost:8787/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Project",
    "description": "A test project for API documentation",
    "techStack": ["React", "Node.js"],
    "features": ["User authentication", "Database integration"]
  }'
```

### Testing with EventSource (Browser)

```javascript
const generateBlueprint = (data) => {
  const eventSource = new EventSource("/generate", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });

  eventSource.onmessage = (event) => {
    if (event.data === "DONE") {
      eventSource.close();
      return;
    }
    console.log("Received:", event.data);
  };

  eventSource.onerror = (error) => {
    console.error("EventSource failed:", error);
    eventSource.close();
  };
};
```

## Monitoring and Debugging

### Logging

The API provides detailed logging for debugging. Enable debug mode:

```bash
DEBUG=* npm run dev:api
```

### Common Issues

1. **OpenAI API Key Issues**
   - Ensure the API key is valid and has sufficient credits
   - Check that the `.dev.vars` file exists in `apps/api/`
   - Copy from the example file: `cp apps/api/.dev.vars.example apps/api/.dev.vars`

2. **Streaming Issues**
   - SSE connections may be interrupted by proxies or firewalls
   - Ensure proper CORS headers are configured

3. **Validation Errors**
   - Check request body format matches expected schema
   - Verify all required fields are present

## WebSocket Support

Currently, the API uses Server-Sent Events (SSE) for streaming. WebSocket support is planned for future releases to enable bidirectional communication.

## Version History

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 1.0.0   | 2026-02-18 | Initial release with core features                 |
|         |            | Added export, import, storage, and share endpoints |
|         |            | Enhanced error handling with structured responses  |
|         |            | RequestId in error responses for traceability      |
|         |            | Comprehensive validation using Zod schemas         |
|         |            | Tech stack metadata support with categorization    |
|         |            | Server-Sent Events (SSE) for streaming responses   |
|         |            | Share functionality with 30-day expiration         |

## Planned Features

The following features are planned for future releases:

- **WebSocket Support** - Bidirectional communication for real-time collaboration
- **Rate Limiting Enhancements** - Advanced rate limiting with user quotas
- **Authentication** - Optional API key authentication for enterprise use
- **Versioning** - API versioning support for backward compatibility

## SSE Stream Format

All streaming endpoints use Server-Sent Events with the following format:

```
data: [content line]
data: [another content line]
data: DONE
```

**Event Types:**

- `content` - Streaming content data
- `error` - Error information during streaming
- `done` - Stream completion marker

**Headers:**

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

---

For issues or questions about the API, please create an issue in the GitHub repository.
