# Frontend Testing Setup Guide

## Overview

This guide covers the complete setup and configuration for frontend testing in the Blueprintify project using Vitest, React Testing Library, and supporting tools.

## Current State Analysis

### Test Coverage Gap

- **API Tests**: 4 passing tests (388ms)
- **Frontend Tests**: 0 files, 0 coverage
- **Critical Components**: 7 components requiring immediate testing

### Component Inventory

```
apps/web/src/
├── components/
│   ├── Header.tsx
│   ├── Wizard.tsx
│   ├── Editor.tsx
│   ├── StepIndicator.tsx
│   ├── TemplateGrid.tsx
│   ├── wizard/
│   │   ├── StepInfo.tsx
│   │   ├── StepStack.tsx
│   │   ├── StepFeatures.tsx
│   │   ├── StepReview.tsx
│   │   └── StepGenerating.tsx
│   └── editor/
│       ├── EditorHeader.tsx
│       └── EditorToolbar.tsx
├── hooks/
│   └── useBlueprintStream.ts
├── lib/
│   ├── api.ts
│   └── export.ts
└── store/
    ├── wizard.ts
    ├── editor.ts
    └── index.ts
```

## 1. Vitest Configuration

### Installation

```bash
# Install testing dependencies
npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install type definitions
npm install --save-dev @types/jsdom vitest/jsdom
```

### Configuration Files

#### `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "dist/",
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

#### `src/test/setup.ts`

```typescript
import "@testing-library/jest-dom";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch if needed for API calls
global.fetch = jest.fn();
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

## 2. Test File Organization

### Directory Structure

```
apps/web/src/
├── test/
│   ├── setup.ts
│   ├── mocks/
│   │   ├── api.ts
│   │   └── handlers.ts
│   └── utils/
│       ├── test-utils.tsx
│       └── render-with-providers.tsx
├── __tests__/
│   ├── components/
│   │   ├── Header.test.tsx
│   │   ├── Wizard.test.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── useBlueprintStream.test.ts
│   ├── lib/
│   │   ├── api.test.ts
│   │   └── export.test.ts
│   └── store/
│       ├── wizard.test.ts
│       └── editor.test.ts
└── e2e/
    ├── complete-user-flow.spec.ts
    └── critical-journeys.spec.ts
```

### Test File Naming Conventions

- **Unit Tests**: `ComponentName.test.tsx` or `functionName.test.ts`
- **Integration Tests**: `ComponentName.integration.test.tsx`
- **E2E Tests**: `user-flow.spec.ts` or `journey-name.spec.ts`

## 3. Testing Utilities

#### `src/test/utils/test-utils.tsx`

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

#### `src/test/mocks/api.ts`

```typescript
import { vi } from "vitest";

export const mockApiResponses = {
  generateBlueprint: {
    success: {
      status: 200,
      json: vi.fn().mockResolvedValue({
        content: "Generated blueprint content",
        metadata: { version: "1.0.0", timestamp: "2024-01-01" },
      }),
    },
    error: {
      status: 500,
      json: vi.fn().mockResolvedValue({
        error: "Internal server error",
        message: "Failed to generate blueprint",
      }),
    },
  },

  getTemplates: {
    success: {
      status: 200,
      json: vi.fn().mockResolvedValue({
        templates: [
          { id: "1", name: "React App", description: "React starter template" },
          {
            id: "2",
            name: "Next.js App",
            description: "Next.js starter template",
          },
        ],
      }),
    },
  },
};
```

## 4. Environment Variables

#### `.env.test`

```env
# Test environment variables
VITE_API_BASE_URL=http://localhost:8787
VITE_OPENAI_API_KEY=test-key
VITE_ENVIRONMENT=test
```

## 5. VS Code Integration

#### `.vscode/settings.json`

```json
{
  "vitest.enable": true,
  "vitest.rootPath": "./apps/web",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.test.ts": "typescript",
    "*.test.tsx": "typescriptreact"
  }
}
```

## 6. Pre-commit Hooks

#### `package.json` (husky + lint-staged setup)

```json
{
  "devDependencies": {
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "vitest related --run"]
  }
}
```

## 7. Development Workflow

### Running Tests

```bash
# Watch mode for development
npm run test:watch

# Single run for CI
npm run test:run

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

### Writing Tests

1. **Start with the user perspective**: What should the user see or do?
2. **Test behavior, not implementation**: Focus on what the component does, not how
3. **Use meaningful assertions**: Test user-visible outcomes
4. **Mock external dependencies**: API calls, browser APIs, etc.

### Debugging Tests

```bash
# Debug specific test
npm run test -- --reporter=verbose --no-coverage ComponentName.test.tsx

# Debug with Node inspector
npm run test -- --inspect-brk --no-coverage ComponentName.test.tsx
```

## 8. Performance Considerations

### Test Performance Tips

1. **Use `vi.hoisted()`** for mock setup that runs before imports
2. **Avoid unnecessary DOM operations** in test setup
3. **Reuse test utilities** to reduce boilerplate
4. **Parallel test execution** with proper isolation
5. **Mock expensive operations** like network requests

### Memory Management

```typescript
// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
```

## 9. Next Steps

1. **Implement component tests** for all 7 critical components
2. **Add integration tests** for user flows
3. **Set up E2E tests** with Playwright
4. **Configure CI/CD pipeline** integration
5. **Establish coverage thresholds** and quality gates

This setup provides a solid foundation for comprehensive frontend testing that will catch bugs early and ensure code quality as the project grows.
