# API Error Codes Reference

> Comprehensive reference for all API error types, codes, and handling strategies.

## Error Response Format

All API errors return a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "type": "validation",
    "message": "Project name is required",
    "code": "VALIDATION_ERROR",
    "details": {
      "projectName": ["Project name is required"]
    },
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

### Response Fields

| Field             | Type    | Description                             |
| ----------------- | ------- | --------------------------------------- |
| `success`         | boolean | Always `false` for error responses      |
| `error.type`      | string  | Error category (see Error Types below)  |
| `error.message`   | string  | Human-readable error description        |
| `error.code`      | string  | Machine-readable error code             |
| `error.details`   | object  | Additional error context (optional)     |
| `error.timestamp` | string  | ISO 8601 timestamp of the error         |
| `error.requestId` | string  | Unique request identifier for debugging |

## Error Types

### Validation Errors (400)

| Code               | Message Pattern           | Resolution                                          |
| ------------------ | ------------------------- | --------------------------------------------------- |
| `VALIDATION_ERROR` | Request validation failed | Check the `details` field for specific field errors |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "validation",
    "message": "Request validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "projectName": ["Project name is required"],
      "description": ["Description must be at least 10 characters"]
    },
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

**Common Validation Scenarios:**

- Missing required fields
- Invalid field formats
- Field length constraints not met
- Invalid enum values

---

### Authentication Errors (401)

| Code                   | Message Pattern         | Resolution                               |
| ---------------------- | ----------------------- | ---------------------------------------- |
| `AUTHENTICATION_ERROR` | Authentication required | Provide valid authentication credentials |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "authentication",
    "message": "Authentication required",
    "code": "AUTHENTICATION_ERROR",
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

---

### Authorization Errors (403)

| Code                  | Message Pattern          | Resolution                                          |
| --------------------- | ------------------------ | --------------------------------------------------- |
| `AUTHORIZATION_ERROR` | Insufficient permissions | Request elevated permissions or check access rights |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "authorization",
    "message": "Insufficient permissions to access this resource",
    "code": "AUTHORIZATION_ERROR",
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

---

### Not Found Errors (404)

| Code              | Message Pattern    | Resolution                                  |
| ----------------- | ------------------ | ------------------------------------------- |
| `NOT_FOUND_ERROR` | Resource not found | Verify the resource identifier and endpoint |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "not_found",
    "message": "Share not found",
    "code": "NOT_FOUND_ERROR",
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

---

### Configuration Errors (500/503)

| Code                  | Message Pattern             | Resolution                                           |
| --------------------- | --------------------------- | ---------------------------------------------------- |
| `CONFIGURATION_ERROR` | Service configuration error | Check server configuration and environment variables |

**Common Causes:**

- Missing OpenAI API key
- Invalid API key configuration
- Missing required environment variables

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "configuration",
    "message": "API_KEY is not configured",
    "code": "CONFIGURATION_ERROR",
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

---

### Network Errors (502)

| Code            | Message Pattern        | Resolution                               |
| --------------- | ---------------------- | ---------------------------------------- |
| `NETWORK_ERROR` | Network error occurred | Check network connectivity and try again |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "network",
    "message": "Network error occurred",
    "code": "NETWORK_ERROR",
    "details": {
      "reason": "Connection timeout"
    },
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

---

### AI Service Errors (503)

| Code               | Message Pattern  | Resolution                             |
| ------------------ | ---------------- | -------------------------------------- |
| `AI_SERVICE_ERROR` | AI service error | Retry later or check AI service status |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "ai_service",
    "message": "AI service error",
    "code": "AI_SERVICE_ERROR",
    "details": {
      "reason": "Rate limit exceeded"
    },
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

---

### Internal Server Errors (500)

| Code             | Message Pattern       | Resolution                        |
| ---------------- | --------------------- | --------------------------------- |
| `INTERNAL_ERROR` | Internal server error | Contact support if issue persists |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "internal",
    "message": "An unexpected error occurred",
    "code": "INTERNAL_ERROR",
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

---

### Service Unavailable Errors (503)

| Code                  | Message Pattern                 | Resolution                |
| --------------------- | ------------------------------- | ------------------------- |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | Retry after a short delay |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "service_unavailable",
    "message": "Service is temporarily unavailable",
    "code": "SERVICE_UNAVAILABLE",
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

---

## Special Error Codes

### Circuit Breaker Errors

| Code                   | Message Pattern         | Resolution                                      |
| ---------------------- | ----------------------- | ----------------------------------------------- |
| `CIRCUIT_BREAKER_OPEN` | Circuit breaker is open | Wait for the circuit breaker to reset and retry |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "service_unavailable",
    "message": "Circuit breaker is open",
    "code": "CIRCUIT_BREAKER_OPEN",
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

**Handling Strategy:**

The circuit breaker prevents cascading failures by temporarily blocking requests when the AI service is experiencing issues. Wait for the configured reset time before retrying.

---

### Rate Limiting Errors

| Code               | Message Pattern   | Resolution                                                 |
| ------------------ | ----------------- | ---------------------------------------------------------- |
| `RATE_LIMIT_ERROR` | Too many requests | Reduce request frequency and implement exponential backoff |

**Example Response:**

```json
{
  "success": false,
  "error": {
    "type": "service_unavailable",
    "message": "Rate limit exceeded",
    "code": "RATE_LIMIT_ERROR",
    "timestamp": "2026-02-23T16:00:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

---

## Error Handling Best Practices

### Client-Side Handling

```typescript
async function handleApiError(response: Response): Promise<void> {
  if (!response.ok) {
    const data = await response.json();

    switch (data.error.code) {
      case "VALIDATION_ERROR":
        // Handle validation errors
        console.error("Validation failed:", data.error.details);
        break;
      case "AUTHENTICATION_ERROR":
        // Redirect to login or refresh token
        break;
      case "RATE_LIMIT_ERROR":
        // Implement exponential backoff
        await sleep(calculateBackoff(response));
        break;
      case "CIRCUIT_BREAKER_OPEN":
        // Wait and retry
        await sleep(5000);
        break;
      default:
        // Log and notify user
        console.error("API Error:", data.error);
    }
  }
}
```

### Retry Strategy

For transient errors, implement a retry strategy:

| Error Type             | Retry Recommended | Delay                             |
| ---------------------- | ----------------- | --------------------------------- |
| `NETWORK_ERROR`        | Yes               | Exponential backoff               |
| `AI_SERVICE_ERROR`     | Yes               | 5-30 seconds                      |
| `RATE_LIMIT_ERROR`     | Yes               | Respect Retry-After header        |
| `CIRCUIT_BREAKER_OPEN` | Yes               | Wait for reset (typically 30s)    |
| `VALIDATION_ERROR`     | No                | Fix request and retry immediately |
| `AUTHENTICATION_ERROR` | No                | Re-authenticate first             |
| `NOT_FOUND_ERROR`      | No                | Resource doesn't exist            |
| `INTERNAL_ERROR`       | Maybe             | After delay, then contact support |

---

## HTTP Status Code Mapping

| Error Type            | HTTP Status | Description                                   |
| --------------------- | ----------- | --------------------------------------------- |
| `validation`          | 400         | Bad Request - Invalid input                   |
| `authentication`      | 401         | Unauthorized - Missing or invalid credentials |
| `authorization`       | 403         | Forbidden - Insufficient permissions          |
| `not_found`           | 404         | Not Found - Resource doesn't exist            |
| `configuration`       | 500/503     | Internal Error - Server configuration issue   |
| `network`             | 502         | Bad Gateway - Network failure                 |
| `ai_service`          | 503         | Service Unavailable - AI service unavailable  |
| `internal`            | 500         | Internal Server Error - Unexpected error      |
| `service_unavailable` | 503         | Service Unavailable - Temporary outage        |

---

## Related Documentation

- [API Documentation](./api-documentation.md) - Complete API reference
- [User Guide](./user-guide.md) - Getting started with the API
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

---

_Last Updated: 2026-02-26_
