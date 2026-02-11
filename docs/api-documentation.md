# API Documentation

This document provides comprehensive API documentation for the Blueprintify backend service built with Cloudflare Workers and Hono.

## Base URL

```
https://blueprintify-api.your-domain.workers.dev
```

\*For local development: `http://localhost:8787`

## Authentication

Currently, the API does not require authentication. However, all requests must include a valid OpenAI API key configured via environment variables on the server side.

## Environment Variables

| Variable          | Required | Default                     | Description                                  |
| ----------------- | -------- | --------------------------- | -------------------------------------------- |
| `OPENAI_API_KEY`  | Yes      | -                           | Your OpenAI API key (starts with `sk-`)      |
| `OPENAI_BASE_URL` | No       | `https://api.openai.com/v1` | Custom API base URL for compatible providers |
| `OPENAI_MODEL`    | No       | `gpt-4o-mini`               | Model to use for generations                 |

## Endpoints

### GET /

Health check endpoint to verify the API is running.

#### Response

```json
{
  "status": "ok",
  "timestamp": "2026-02-08T05:29:13.000Z"
}
```

### POST /generate

Generate a project blueprint based on user input. This endpoint streams the response using Server-Sent Events (SSE).

#### Request Body

```typescript
interface GenerateRequest {
  projectName: string; // Project name (1-100 chars)
  description: string; // Project description (1-1000 chars)
  techStack: string[]; // Array of selected technologies
  features: string[]; // Array of desired features
  targetAudience?: string; // Optional target audience (1-500 chars)
  constraints?: string; // Optional project constraints (1-1000 chars)
}
```

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
    "description": "A web application for task management",
    "techStack": ["React", "Node.js", "MongoDB"],
    "features": ["User authentication", "Task CRUD", "Real-time updates"],
    "targetAudience": "Individual users and small teams",
    "constraints": "Must work offline"
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

Refine specific sections of generated content using AI assistance while preserving manual edits.

#### Request Body

```typescript
interface RefineRequest {
  content: string; // Current content to refine
  instruction: string; // Instruction for refinement
  section?: string; // Optional section identifier
  refinementType?:
    | "regenerate"
    | "enhance"
    | "expand"
    | "simplify"
    | "fix"
    | "custom"; // Type of refinement
  preserveEdits?: boolean; // Whether to preserve manual edits (default: true)
  context?: {
    wizardState?: object; // Original wizard configuration
    fullBlueprint?: string; // Complete blueprint for context
    targetAudience?: string; // Target audience
    constraints?: string; // Project constraints
  };
  options?: {
    streamResponse?: boolean; // Stream response (default: true)
    preserveFormatting?: boolean; // Preserve formatting (default: true)
    maintainTone?: boolean; // Maintain writing tone (default: true)
    wordCountTarget?: number; // Target word count
    includeCode?: boolean; // Include code examples (default: true)
  };
}
```

#### Response

Streams refined content line by line via SSE with metadata about preserved edits.

**Event Stream Format:**

```
data: {"type": "section", "id": "authentication", "content": "## Authentication\n\n..."}

data: {"type": "preserved_edit", "section": "authentication", "content": "Custom note: Use OAuth2 provider"}

data: {"type": "complete", "sections": ["authentication"], "preservedEdits": 3}

data: DONE
```

#### Example Request

```bash
curl -X POST http://localhost:8787/refine \
  -H "Content-Type: application/json" \
  -d '{
    "content": "## Authentication\n\nBasic login system",
    "instruction": "Add detailed implementation notes for JWT authentication",
    "section": "authentication"
  }'
```

### POST /export

Export blueprints and sessions in various formats including JSON, ZIP, and Markdown.

#### Request Body

```typescript
interface ExportRequest {
  sessionIds?: string[]; // Specific session IDs to export (optional)
  format: "json" | "zip" | "markdown"; // Export format
  options?: {
    includeAssets?: boolean; // Include assets (default: true)
    compress?: boolean; // Compress output (default: true for ZIP)
    includeMetadata?: boolean; // Include metadata (default: true)
    template?: string; // Template to use
    filter?: ExportFilter; // Content filter
  };
}

interface ExportFilter {
  dateRange?: {
    from: string; // ISO date string
    to: string; // ISO date string
  };
  tags?: string[]; // Filter by tags
  isArchived?: boolean; // Include/exclude archived sessions
  minWordCount?: number; // Minimum word count filter
}
```

#### Response

Returns downloadable file in the requested format.

#### Example Request

```bash
curl -X POST http://localhost:8787/export \
  -H "Content-Type: application/json" \
  -d '{
    "sessionIds": ["session-001", "session-002"],
    "format": "zip",
    "options": {
      "includeAssets": true,
      "compress": true,
      "includeMetadata": true
    }
  }' \
  --output blueprint-export.zip
```

### POST /import

Import previously exported blueprints and sessions with validation and conflict resolution.

#### Request Body (multipart/form-data)

```typescript
// Form fields:
interface ImportRequest {
  file: File; // Export file (JSON, ZIP)
  format?: "auto-detect" | "json" | "zip"; // Format (default: auto-detect)
  options?: {
    resolveConflicts?: boolean; // Auto-resolve conflicts (default: false)
    preserveIds?: boolean; // Preserve original IDs (default: false)
    importAssets?: boolean; // Import assets (default: true)
    overwriteExisting?: boolean; // Overwrite existing sessions (default: false)
    createBackup?: boolean; // Create backup before import (default: true)
    validateOnly?: boolean; // Validation only mode (default: false)
    migrationStrategy?: "strict" | "best-effort" | "skip-incompatible";
  };
}
```

#### Response

```json
{
  "validation": {
    "isValid": true,
    "errors": [],
    "warnings": [
      {
        "code": "DEPRECATED_FEATURE",
        "message": "Found deprecated feature 'legacy-export-format'",
        "action": "Will be automatically migrated"
      }
    ],
    "compatibility": {
      "isCompatible": true,
      "supportedVersion": true,
      "migrationRequired": true,
      "migrationPath": ["1.0.0" → "1.1.0"],
      "deprecatedFeatures": ["legacy-export-format"]
    }
  },
  "preview": {
    "sessions": [
      {
        "source": {...},
        "status": "approved",
        "conflicts": []
      }
    ],
    "assets": [...],
    "conflicts": [],
    "warnings": [...],
    "recommendations": [
      "Review migrated sessions for accuracy",
      "Update deprecated field references"
    ]
  }
}
```

#### Example Request

```bash
curl -X POST http://localhost:8787/import \
  -F "file=@blueprint-export.zip" \
  -F "format=auto-detect" \
  -F 'options={
    "createBackup": true,
    "validateOnly": false,
    "migrationStrategy": "best-effort"
  }'
```

### POST /validate

Validate export files before import without actually importing data.

#### Request Body

Same as `/import` endpoint but with `"validateOnly": true` enforced.

#### Response

```json
{
  "isValid": true,
  "errors": [],
  "warnings": [...],
  "recommendations": [...],
  "compatibility": {...},
  "summary": {
    "totalSessions": 5,
    "compatibleSessions": 4,
    "incompatibleSessions": 1,
    "totalAssets": 12,
    "estimatedImportTime": "2.5 seconds"
  }
}
```

#### Advanced Examples

**Batch Refinement:**

```bash
curl -X POST http://localhost:8787/refine \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# My Project\n\n## Architecture\nSimple architecture.\n\n## Database\nBasic database setup.",
    "instruction": "Enhance architecture and database sections with enterprise-level details",
    "refinementType": "enhance",
    "options": {
      "preserveFormatting": true,
      "wordCountTarget": 500
    }
  }'
```

**Custom Refinement:**

```bash
curl -X POST http://localhost:8787/refine \
  -H "Content-Type: application/json" \
  -d '{
    "content": "## Testing\n\nBasic tests needed",
    "instruction": "Create comprehensive testing strategy including unit, integration, and E2E tests. Include Jest, Cypress, and testing best practices.",
    "refinementType": "custom",
    "options": {
      "includeCode": true
    }
  }'
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "details": {
    "field": ["Validation error messages"]
  }
}
```

### Common Error Codes

| Status Code | Description                                              |
| ----------- | -------------------------------------------------------- |
| 400         | Bad Request - Invalid input data                         |
| 500         | Internal Server Error - API or LLM provider error        |
| 503         | Service Unavailable - OpenAI API rate limits or downtime |

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
            blueprint += data + "\n";
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

2. **Streaming Issues**
   - SSE connections may be interrupted by proxies or firewalls
   - Ensure proper CORS headers are configured

3. **Validation Errors**
   - Check request body format matches expected schema
   - Verify all required fields are present

## WebSocket Support

Currently, the API uses Server-Sent Events (SSE) for streaming. WebSocket support is planned for future releases to enable bidirectional communication.

## Version History

| Version | Date       | Changes                                |
| ------- | ---------- | -------------------------------------- |
| 1.0.0   | 2026-02-05 | Initial API with generate endpoint     |
| 1.1.0   | 2026-02-06 | Added tasks and refine endpoints       |
| 1.2.0   | 2026-02-07 | Enhanced error handling and validation |

---

For issues or questions about the API, please create an issue in the GitHub repository.
