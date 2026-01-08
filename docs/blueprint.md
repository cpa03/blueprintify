# System Blueprint

> **Single Source of Truth** for Blueprintify architecture, design constraints, and technical standards.

**Version**: 1.0.0
**Last Updated**: 2026-01-08
**Status**: Active

---

## 1. System Overview

Blueprintify is a monorepo application consisting of:

- **Frontend**: React + Vite web application
- **Backend**: Cloudflare Workers API using Hono framework
- **Shared**: Common types, schemas, and utilities

---

## 2. Architecture

### 2.1 Monorepo Structure

```
├── apps/
│   ├── api/          # Cloudflare Workers API (Hono)
│   └── web/          # React frontend (Vite)
├── packages/
│   └── shared/       # Shared types and utilities
├── .opencode/
│   ├── agent/        # Agent definitions
│   ├── skill/        # Reusable skills
│   ├── command/      # Custom commands
│   └── plugin/       # Plugins (hooks)
└── docs/             # Documentation
```

### 2.2 Technology Stack

**Frontend (apps/web)**

- Framework: React
- Build Tool: Vite
- UI Library: shadcn/ui
- Styling: Tailwind CSS
- Editor: Monaco/CodeMirror

**Backend (apps/api)**

- Runtime: Cloudflare Workers
- Framework: Hono
- Validation: Zod
- Streaming: Server-Sent Events (SSE)

**Shared (packages/shared)**

- Validation: Zod schemas
- Types: TypeScript

---

## 3. Design Constraints

### 3.1 Code Standards

**TypeScript**

- Strict mode enabled (`strict: true`)
- No `any` type - use `unknown`
- Interfaces for object shapes
- `type` for unions, intersects, and computed types
- Explicit return types on public functions

**React**

- Functional components with hooks only
- Composition over inheritance
- `React.memo` for expensive renders
- `useCallback` for callbacks
- `useMemo` for computed values

**API (Cloudflare Workers + Hono)**

- Validate all inputs with Zod
- Consistent JSON response shapes
- Proper HTTP status codes
- Error handling middleware

### 3.2 Performance Constraints

- Lazy load components when possible
- Minimize bundle size
- Implement caching strategies
- Optimize images and assets
- Profile before optimizing

### 3.3 Security Constraints

- NEVER expose secrets (API keys, tokens)
- Validate all user inputs
- Sanitize all outputs (markdown/HTML)
- Parameterized queries for database operations

### 3.4 Operational Constraints

- **Model**: `opencode/glm-4.7-free`
- **CI Runner**: `ubuntu-24.04-arm`
- **Git Branch**: Work on `agent` branch
- **Commits**: Conventional Commits format

---

## 4. API Contracts

### 4.1 Response Shape

```typescript
// Success Response
{
  success: true;
  data: T;
  message?: string;
}

// Error Response
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### 4.2 Streaming Endpoint

**Endpoint**: `POST /api/generate`

**Request**:

```typescript
{
  projectDescription: string;
  techStack: string[];
}
```

**Response**: Server-Sent Events (SSE) streaming generated content

---

## 5. Component Architecture

### 5.1 Wizard Flow

The application follows a multi-step wizard pattern:

1. **Step 1**: Project Description Input
2. **Step 2**: Tech Stack Selection
3. **Step 3**: Review & Generate

### 5.2 Editor View

Split-pane layout:

- **Left Pane**: Generated Markdown content (read-only or editable)
- **Right Pane**: Live preview with syntax highlighting

---

## 6. Quality Standards

### 6.1 Testing

- Unit tests for utilities and pure functions
- Integration tests for API endpoints
- Component tests for critical UI paths

### 6.2 Documentation

- All public APIs documented with JSDoc
- Component props documented
- Complex logic explained in comments

### 6.3 Error Handling

- Consistent error logging
- User-friendly error messages
- Proper error recovery paths

---

## 7. Deployment Strategy

### 7.1 Frontend

- Built with Vite
- Static deployment to CDN

### 7.2 Backend

- Deployed to Cloudflare Workers
- Zero cold start time
- Global edge deployment

---

## 8. Success Metrics

- **User Experience**: Complete "Input → Generate → View" flow under 30 seconds
- **Performance**: Time to interactive < 3 seconds
- **Reliability**: 99.9% uptime for API
- **Code Quality**: TypeScript strict mode, zero `any` types

---

## 9. Version History

| Version | Date       | Changes                      |
| ------- | ---------- | ---------------------------- |
| 1.0.0   | 2026-01-08 | Initial blueprint definition |

---

**End of Blueprint**
