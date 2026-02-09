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

Refine a specific section of generated content using AI assistance.

#### Request Body

```typescript
interface RefineRequest {
  content: string; // Current content to refine
  instruction: string; // Instruction for refinement
  section?: string; // Optional section identifier
}
```

#### Response

Streams refined content line by line via SSE.

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

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "details": {
    "field": ["Validation error messages"]
  },
  "timestamp": "2026-02-09T02:53:14.000Z",
  "requestId": "req_1234567890"
}
```

### Common Error Codes

| Status Code | Description                                       | Example Response                                                                              |
| ----------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 400         | Bad Request - Invalid input data                  | `{"error": "Invalid request body", "details": {"projectName": ["Project name is required"]}}` |
| 401         | Unauthorized - Missing or invalid API key         | `{"error": "OpenAI API key not configured"}`                                                  |
| 429         | Too Many Requests - Rate limit exceeded           | `{"error": "OpenAI API rate limit exceeded", "retryAfter": 60}`                               |
| 500         | Internal Server Error - API or LLM provider error | `{"error": "Internal server error", "details": {"type": "OpenAI API Error"}}`                 |
| 503         | Service Unavailable - OpenAI API downtime         | `{"error": "Service temporarily unavailable", "retryAfter": 300}`                             |

### Detailed Error Scenarios

#### 1. Validation Errors (400)

**Missing Required Fields:**

```json
{
  "error": "Validation failed",
  "details": {
    "projectName": ["Project name is required and must be 1-100 characters"],
    "description": ["Description is required and must be 1-1000 characters"],
    "techStack": ["Tech stack must contain at least one technology"]
  }
}
```

**Invalid Field Formats:**

```json
{
  "error": "Invalid field formats",
  "details": {
    "projectName": ["Project name contains invalid characters"],
    "targetAudience": [
      "Target audience exceeds maximum length of 500 characters"
    ]
  }
}
```

#### 2. Authentication Errors (401)

**Missing API Key:**

```json
{
  "error": "OpenAI API key not configured",
  "details": {
    "solution": "Set OPENAI_API_KEY environment variable"
  }
}
```

**Invalid API Key:**

```json
{
  "error": "Invalid OpenAI API key",
  "details": {
    "message": "The provided API key is invalid or expired",
    "solution": "Verify your API key in OpenAI dashboard"
  }
}
```

#### 3. Rate Limiting (429)

**OpenAI API Rate Limit:**

```json
{
  "error": "OpenAI API rate limit exceeded",
  "details": {
    "limit": 60,
    "remaining": 0,
    "resetTime": "2026-02-09T03:00:00.000Z",
    "retryAfter": 45
  }
}
```

**Token Usage Limit:**

```json
{
  "error": "Token usage limit exceeded",
  "details": {
    "tokensUsed": 4096,
    "tokensLimit": 4096,
    "suggestion": "Reduce input length or use a model with higher token limit"
  }
}
```

#### 4. Server Errors (500)

**OpenAI API Unavailable:**

```json
{
  "error": "OpenAI API service unavailable",
  "details": {
    "originalError": "Connection timeout",
    "timestamp": "2026-02-09T02:53:14.000Z"
  }
}
```

**Model Unavailable:**

```json
{
  "error": "Specified model not available",
  "details": {
    "model": "gpt-4o-mini",
    "availableModels": ["gpt-3.5-turbo", "gpt-4"],
    "suggestion": "Use an available model or check model status"
  }
}
```

#### 5. Service Unavailable (503)

**OpenAI Service Downtime:**

```json
{
  "error": "OpenAI services temporarily unavailable",
  "details": {
    "statusPage": "https://status.openai.com/",
    "estimatedRecovery": "2026-02-09T03:30:00.000Z",
    "retryAfter": 1800
  }
}
```

### Error Handling Best Practices

#### Client-Side Error Handling

```typescript
// Robust error handling for API calls
const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        console.error("Validation error:", data.details);
        // Show validation errors to user
        break;

      case 401:
        console.error("Authentication error:", data.error);
        // Redirect to login or show API key setup
        break;

      case 429:
        const retryAfter = data.retryAfter || 60;
        console.error(`Rate limited. Retry after ${retryAfter} seconds`);
        // Implement exponential backoff retry
        break;

      case 500:
        console.error("Server error:", data.error);
        // Show generic error message with retry option
        break;

      case 503:
        console.error("Service unavailable:", data.error);
        // Show maintenance message
        break;

      default:
        console.error("Unexpected error:", data);
    }
  } else if (error.request) {
    console.error("Network error - no response received");
    // Handle network connectivity issues
  } else {
    console.error("Request setup error:", error.message);
  }
};
```

#### Retry Logic Implementation

```typescript
// Exponential backoff retry for rate limits
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<any> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries - 1) {
        const retryAfter = error.response.data?.retryAfter || baseDelay;
        const delay = Math.min(retryAfter * Math.pow(2, attempt), 30000);
        console.log(`Retrying after ${delay}ms (attempt ${attempt + 1})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

### Error Monitoring and Alerting

#### Structured Error Logging

```typescript
// Enhanced error logging for monitoring
interface ErrorLog {
  timestamp: string;
  requestId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  error: string;
  details: any;
  userAgent?: string;
  userId?: string;
}

const logError = (errorLog: ErrorLog) => {
  console.error(
    JSON.stringify({
      ...errorLog,
      service: "blueprintify-api",
      version: "1.2.0",
    }),
  );

  // Send to monitoring service (e.g., Sentry, DataDog)
  // monitoringService.captureException(errorLog);
};
```

#### Health Check with Error Status

```typescript
// Enhanced health check endpoint
app.get("/health", (c) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.2.0",
    services: {
      openai: "connected", // or 'disconnected'
      database: "connected",
    },
    errors: {
      total24h: 12,
      critical24h: 0,
      lastError: null,
    },
  };

  return c.json(health);
});
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

# Test with validation errors
curl -X POST http://localhost:8787/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "",
    "description": "",
    "techStack": [],
    "features": []
  }'

# Test tasks generation
curl -X POST http://localhost:8787/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "blueprint": "# Test Project\n\n## Overview\nA test project",
    "projectName": "Test Project"
  }'

# Test content refinement
curl -X POST http://localhost:8787/refine \
  -H "Content-Type: application/json" \
  -d '{
    "content": "## Authentication\n\nBasic login system",
    "instruction": "Add JWT implementation details",
    "section": "authentication"
  }'
```

### Advanced Testing Scenarios

#### 1. Testing Rate Limiting

```bash
# Simulate rapid requests to trigger rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:8787/generate \
    -H "Content-Type: application/json" \
    -d '{"projectName": "Test '$i'", "description": "Test", "techStack": ["React"], "features": []}' \
    -w "Status: %{http_code}\n"
  sleep 0.5
done
```

#### 2. Testing Large Payloads

```bash
# Test with maximum allowed input sizes
curl -X POST http://localhost:8787/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "'"$(printf 'A%.0s' {1..100})"'",
    "description": "'"$(printf 'B%.0s' {1..1000})"'",
    "techStack": ["'"$(printf 'C%.0s' {1..50})"'"],
    "features": ["'"$(printf 'D%.0s' {1..100})"'"],
    "targetAudience": "'"$(printf 'E%.0s' {1..500})"'",
    "constraints": "'"$(printf 'F%.0s' {1..1000})"'"
  }'
```

#### 3. Testing Special Characters

```bash
# Test with special characters and unicode
curl -X POST http://localhost:8787/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Tëst 🚀 Prøject",
    "description": "A project with special chars: àáâãäåæçèéêë",
    "techStack": ["React", "Node.js", "MongoDB"],
    "features": ["User authentication", "Real-time updates 🔄"],
    "targetAudience": "Développeurs & 开发者",
    "constraints": "Must support: 中文, العربية, русский"
  }'
```

#### 4. Testing Error Scenarios

```bash
# Test malformed JSON
curl -X POST http://localhost:8787/generate \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'

# Test missing required fields
curl -X POST http://localhost:8787/generate \
  -H "Content-Type: application/json" \
  -d '{"techStack": ["React"]}'

# Test invalid HTTP method
curl -GET http://localhost:8787/generate

# Test with invalid content type
curl -X POST http://localhost:8787/generate \
  -H "Content-Type: text/plain" \
  -d 'not json'
```

### Load Testing

#### Using Apache Bench (ab)

```bash
# Install ab: sudo apt-get install apache2-utils (Ubuntu)
# Basic load test
ab -n 100 -c 10 -p test_payload.json -T application/json \
   http://localhost:8787/generate

# Create test_payload.json:
# {"projectName": "Load Test", "description": "Testing", "techStack": ["React"], "features": []}
```

#### Using wrk (HTTP benchmarking tool)

```bash
# Install wrk: brew install wrk (macOS) or apt-get install wrk (Ubuntu)
# Load test script
wrk -t12 -c400 -d30s --script=load_test.lua http://localhost:8787

# Create load_test.lua:
wrk.method = "POST"
wrk.body = '{"projectName": "Load Test", "description": "Testing", "techStack": ["React"], "features": []}'
wrk.headers["Content-Type"] = "application/json"
```

### Integration Testing

#### Postman Collection Example

```json
{
  "info": {
    "name": "Blueprintify API Tests",
    "description": "Comprehensive API test suite"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/"
      }
    },
    {
      "name": "Generate Blueprint",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/generate",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"projectName\": \"Test Project\",\n  \"description\": \"A test project\",\n  \"techStack\": [\"React\", \"Node.js\"],\n  \"features\": [\"User authentication\"]\n}"
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Response contains streaming data\", function () {",
              "    pm.expect(pm.response.text()).to.include(\"data:\");",
              "});"
            ]
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8787"
    }
  ]
}
```

### Automated Testing Scripts

#### Node.js Test Script

```javascript
// test-api.js
const fetch = require("node-fetch");

const API_BASE = "http://localhost:8787";

const testHealth = async () => {
  console.log("Testing health check...");
  const response = await fetch(`${API_BASE}/`);
  const data = await response.json();
  console.log("Health check:", data);
  return response.ok;
};

const testGenerate = async () => {
  console.log("Testing blueprint generation...");
  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectName: "API Test Project",
      description: "Testing API functionality",
      techStack: ["React", "Node.js"],
      features: ["User authentication"],
    }),
  });

  if (response.ok) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      result += chunk;
    }

    console.log(
      "Generation successful, received:",
      result.length,
      "characters",
    );
    return true;
  } else {
    console.error("Generation failed:", response.status);
    return false;
  }
};

const runTests = async () => {
  console.log("Starting API tests...\n");

  const healthOk = await testHealth();
  const generateOk = await testGenerate();

  console.log("\nTest Results:");
  console.log("Health Check:", healthOk ? "✅ PASS" : "❌ FAIL");
  console.log("Generate:", generateOk ? "✅ PASS" : "❌ FAIL");

  if (healthOk && generateOk) {
    console.log("\n🎉 All tests passed!");
  } else {
    console.log("\n💥 Some tests failed!");
    process.exit(1);
  }
};

runTests().catch(console.error);
```

#### Python Test Script

```python
# test_api.py
import requests
import json
import time

API_BASE = 'http://localhost:8787'

def test_health():
    print('Testing health check...')
    response = requests.get(f'{API_BASE}/')
    print(f'Health check: {response.json()}')
    return response.status_code == 200

def test_generate():
    print('Testing blueprint generation...')
    payload = {
        'projectName': 'Python Test Project',
        'description': 'Testing API with Python',
        'techStack': ['React', 'Node.js'],
        'features': ['User authentication']
    }

    response = requests.post(
        f'{API_BASE}/generate',
        json=payload,
        stream=True
    )

    if response.status_code == 200:
        content = ''
        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                if decoded.startswith('data: '):
                    data = decoded[6:]
                    if data == 'DONE':
                        break
                    content += data + '\n'

        print(f'Generation successful, received: {len(content)} characters')
        return True
    else:
        print(f'Generation failed: {response.status_code}')
        return False

def run_tests():
    print('Starting API tests...\n')

    health_ok = test_health()
    generate_ok = test_generate()

    print('\nTest Results:')
    print(f'Health Check: {"✅ PASS" if health_ok else "❌ FAIL"}')
    print(f'Generate: {"✅ PASS" if generate_ok else "❌ FAIL"}')

    if health_ok and generate_ok:
        print('\n🎉 All tests passed!')
    else:
        print('\n💥 Some tests failed!')
        exit(1)

if __name__ == '__main__':
    run_tests()
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
