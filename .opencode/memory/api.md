# API Patterns & Conventions

## Documentation

- Everything must be documented in OpenAPI/Swagger.

## Security

- All endpoints must be authenticated.

## Error Handling

### Error Response Format

All API errors follow a standardized format:

```typescript
{
  success: false,
  error: {
    type: 'validation' | 'authentication' | 'authorization' | 'not_found' | 'configuration' | 'network' | 'ai_service' | 'internal',
    message: string,
    code?: string,
    details?: Record<string, unknown>,
    timestamp: string (ISO 8601)
  }
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Validation Error (Bad Request)
- `401` - Authentication Error
- `403` - Authorization Error
- `404` - Not Found
- `500` - Internal Server Error / Configuration Error
- `502` - Network Error / AI Service Error

### Error Types

- **ValidationError** (400): Invalid request data, failed schema validation
- **AuthenticationError** (401): Missing or invalid credentials
- **AuthorizationError** (403): User lacks permission
- **NotFoundError** (404): Resource not found
- **ConfigurationError** (500): Service configuration issues (e.g., missing API keys)
- **NetworkError** (502): Network connectivity issues
- **AIServiceError** (502): AI service errors (OpenAI, etc.)
- **InternalServerError** (500): Unexpected server errors

### Throwing Errors in Routes

Always use the custom error classes from `apps/api/src/errors.ts`:

```typescript
import { ConfigurationError, ValidationError } from "../errors";

// Configuration error
if (!c.env.OPENAI_API_KEY) {
  throw new ConfigurationError("OpenAI API key not configured");
}

// Validation error
throw new ValidationError("Invalid request data", {
  field: "projectName",
  reason: "Must be at least 1 character",
});
```

The global error handler in `apps/api/src/middleware/errorHandler.ts` will automatically:

1. Catch the error
2. Format it according to the standard response shape
3. Return the appropriate HTTP status code
4. Log the error for debugging

## Lessons Learned

- (Empty initially)
