# Frontend Testing Strategy Guide

> **Critical Coverage Gap Resolution** - Addressing Issue #79

This document provides a comprehensive testing strategy for the Blueprintify frontend, addressing the critical test coverage gap identified in our codebase analysis.

## Current Test Status

### Critical Findings

- **Frontend Test Files**: 0 (complete gap)
- **Total Frontend Tests**: 0
- **API Test Coverage**: 4/4 tests passing (38ms)
- **Critical User Flows**: Untested

## Recommended Testing Stack

### Core Testing Framework

- **Vitest** - Fast unit test framework (already a devDependency)
- **@testing-library/react** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM environment for Node.js testing

### Component Testing

```typescript
// Example: Wizard Component Test
import { render, screen } from '@testing-library/react'
import { Wizard } from '../components/Wizard'

describe('Wizard Component', () => {
  it('renders initial step correctly', () => {
    render(<Wizard />)
    expect(screen.getByText('Project Name')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<Wizard />)
    // Test validation logic
  })
})
```

### Integration Testing

```typescript
// Example: Complete User Flow
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../App'

describe('Blueprint Generation Flow', () => {
  it('completes full wizard to generation', async () => {
    render(<App />)

    // Step 1: Project Details
    fireEvent.change(screen.getByLabelText('Project Name'), {
      target: { value: 'Test Project' }
    })

    // Step 2: Tech Stack Selection
    fireEvent.click(screen.getByText('Next'))
    // Continue through all steps...

    // Verify generation starts
    await waitFor(() => {
      expect(screen.getByText('Generating blueprint...')).toBeInTheDocument()
    })
  })
})
```

## Test Structure

### Directory Layout

```
apps/web/src/
├── __tests__/
│   ├── components/
│   │   ├── Wizard.test.tsx
│   │   ├── Editor.test.tsx
│   │   ├── Header.test.tsx
│   │   └── StepIndicator.test.tsx
│   ├── hooks/
│   │   ├── useBlueprintStream.test.ts
│   │   └── useLocalStorage.test.ts
│   ├── integration/
│   │   ├── complete-flow.test.tsx
│   │   ├── export-flow.test.tsx
│   │   └── streaming-flow.test.tsx
│   └── utils/
│       └── api.test.ts
├── setupTests.ts
└── test-utils.tsx
```

### Test Configuration

#### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### setupTests.ts

```typescript
import "@testing-library/jest-dom";
import { beforeAll, afterEach, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./__tests__/mocks/server";

// Setup MSW for API mocking
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
```

## Priority Test Implementation

### Phase 1: Critical Components (Week 1)

1. **Wizard Component** - Project creation flow
2. **Editor Component** - Blueprint editing and preview
3. **useBlueprintStream Hook** - Real-time streaming functionality
4. **API Service Layer** - Backend communication

### Phase 2: Integration Tests (Week 2)

1. **Complete User Journey** - Wizard → Generate → View → Export
2. **Streaming Tests** - SSE connection handling
3. **LocalStorage Tests** - Session persistence
4. **Error Handling** - API failures and network issues

### Phase 3: E2E Tests (Week 3)

1. **Playwright Configuration** - Cross-browser testing
2. **Critical User Paths** - Full application workflows
3. **Performance Tests** - Load time and rendering
4. **Accessibility Tests** - Screen reader and keyboard navigation

## Mock Strategy

### API Mocking with MSW

```typescript
// src/__tests__/mocks/handlers.ts
import { rest } from "msw";
import { blueprintMock } from "../fixtures/blueprint";

export const handlers = [
  rest.post("/api/generate", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set("Content-Type", "text/event-stream"),
      ctx.body(
        `data: ${JSON.stringify({ type: "chunk", content: blueprintMock })}`,
      ),
    );
  }),

  rest.get("/api/health", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ status: "ok" }));
  }),
];
```

### Test Fixtures

```typescript
// src/__tests__/fixtures/blueprint.ts
export const blueprintMock = {
  projectName: "Test Project",
  description: "Test Description",
  techStack: ["React", "TypeScript"],
  structure: {
    "src/": {
      "App.tsx": "// React app component",
      "index.tsx": "// Entry point",
    },
  },
};
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/frontend-tests.yml
name: Frontend Tests

on:
  push:
    branches: [main, agent]
  pull_request:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run frontend tests
        run: npm run test:frontend

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./apps/web/coverage/lcov.info
```

## Testing Commands

### Package.json Updates

```json
{
  "scripts": {
    "test:frontend": "vitest run --coverage apps/web",
    "test:frontend:watch": "vitest apps/web",
    "test:frontend:ui": "vitest --ui apps/web",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "coverage:frontend": "vitest run --coverage apps/web && open apps/web/coverage/index.html"
  }
}
```

## Success Metrics

### Coverage Targets

- **Unit Test Coverage**: 85%+
- **Integration Test Coverage**: 70%+
- **E2E Test Coverage**: All critical user paths
- **Test Execution Time**: < 5 seconds for unit tests

### Quality Gates

- All tests must pass before PR merge
- Coverage thresholds enforced in CI
- No flaky tests allowed
- Performance regressions detected

## Implementation Timeline

### Week 1: Foundation

- [ ] Install testing dependencies
- [ ] Configure Vitest and testing environment
- [ ] Create basic component tests for Wizard
- [ ] Setup MSW for API mocking

### Week 2: Coverage

- [ ] Complete component test suite
- [ ] Implement integration tests
- [ ] Add error handling tests
- [ ] Setup CI/CD integration

### Week 3: Advanced Testing

- [ ] Configure Playwright for E2E tests
- [ ] Add accessibility testing
- [ ] Performance testing integration
- [ ] Documentation and training

## Best Practices

### Component Testing

- Test user behavior, not implementation details
- Use meaningful test descriptions
- Mock external dependencies
- Test edge cases and error states

### Integration Testing

- Focus on user workflows
- Test component interactions
- Verify data flow through the application
- Include loading and error states

### E2E Testing

- Test critical user journeys
- Include cross-browser testing
- Test real browser behavior
- Avoid testing implementation details

## Common Pitfalls to Avoid

1. **Testing Implementation Details** - Focus on user behavior
2. **Over-mocking** - Only mock external dependencies
3. **Brittle Tests** - Use stable selectors and test structure
4. **Ignoring Performance** - Monitor test execution time
5. **Missing Edge Cases** - Test error states and boundaries

---

**Priority**: CRITICAL - This addresses the complete lack of frontend test coverage which is a significant quality and maintainability risk for the project.

**Next Steps**: Implement Phase 1 immediately, starting with Wizard component tests and basic test infrastructure setup.
