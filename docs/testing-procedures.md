# Testing Procedures and Guidelines

This document outlines the testing standards, procedures, and guidelines for the Blueprintify project to ensure code quality, reliability, and maintainability.

## 🎯 Testing Philosophy

Our testing approach is based on these principles:

- **Coverage**: Maintain high test coverage across all critical paths
- **Quality over Quantity**: Write meaningful tests that provide real value
- **Automated First**: All tests must run automatically in CI/CD
- **Fast Feedback**: Keep test suites fast for rapid iteration
- **Clear Intent**: Tests should be self-documenting and easy to understand

## 📋 Test Coverage Requirements

### Coverage Targets

- **Overall Coverage**: Minimum 80%
- **Critical Path Coverage**: Minimum 95%
- **API Endpoints**: 100% coverage required
- **Security Functions**: 100% coverage required
- **Business Logic**: Minimum 90% coverage

### Coverage Exclusions

- Configuration files and type definitions
- Test files themselves
- Build and deployment scripts
- Development-only utilities

## 🧪 Test Types and Categories

### 1. Unit Tests

Unit tests focus on individual functions, components, or modules in isolation.

#### When to Write Unit Tests

- Pure functions and utilities
- React component behavior
- API route handlers
- Data validation logic
- Business logic functions

#### Unit Test Structure

```typescript
// ✅ Good unit test structure
import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateBlueprint, ProjectConfig } from "../blueprint-generator";

describe("generateBlueprint", () => {
  // Arrange - Setup test data
  const validConfig: ProjectConfig = {
    name: "Test Project",
    description: "A test project",
    features: ["auth", "database"],
  };

  beforeEach(() => {
    // Reset mocks and setup fresh state
    vi.clearAllMocks();
  });

  describe("when given valid configuration", () => {
    it("should generate a complete blueprint", async () => {
      // Act - Execute the function
      const result = await generateBlueprint(validConfig);

      // Assert - Verify the result
      expect(result).toBeDefined();
      expect(result.name).toBe(validConfig.name);
      expect(result.sections).toContain("architecture");
      expect(result.sections).toContain("development");
    });

    it("should include all requested features", async () => {
      const configWithFeatures: ProjectConfig = {
        ...validConfig,
        features: ["auth", "database", "testing"],
      };

      const result = await generateBlueprint(configWithFeatures);

      expect(result.features).toHaveLength(3);
      expect(result.features.map((f) => f.name)).toContain("auth");
      expect(result.features.map((f) => f.name)).toContain("database");
      expect(result.features.map((f) => f.name)).toContain("testing");
    });
  });

  describe("when given invalid configuration", () => {
    it("should throw ValidationError for missing name", async () => {
      const invalidConfig = { ...validConfig, name: "" };

      await expect(generateBlueprint(invalidConfig)).rejects.toThrow("Project name is required");
    });

    it("should throw ValidationError for invalid features", async () => {
      const invalidConfig = {
        ...validConfig,
        features: ["invalid-feature"] as any,
      };

      await expect(generateBlueprint(invalidConfig)).rejects.toThrow("Invalid feature: invalid-feature");
    });
  });
});
```

### 2. Integration Tests

Integration tests verify that multiple components work together correctly.

#### Integration Test Examples

```typescript
// API integration test
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../app";
import { getTestClient } from "./test-helpers";

describe("Blueprint API Integration", () => {
  const client = getTestClient(app);

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase();
  });

  it("should create and retrieve a blueprint", async () => {
    // Create blueprint
    const createResponse = await client.post("/api/blueprints", {
      name: "Integration Test Blueprint",
      description: "Testing blueprint creation and retrieval",
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.id).toBeDefined();

    const blueprintId = createResponse.body.data.id;

    // Retrieve blueprint
    const getResponse = await client.get(`/api/blueprints/${blueprintId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.name).toBe("Integration Test Blueprint");
    expect(getResponse.body.data.id).toBe(blueprintId);
  });
});
```

### 3. Component Tests

React component tests focus on user interactions and rendering behavior.

```typescript
// Component test example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlueprintWizard } from '../BlueprintWizard';
import { BlueprintProvider } from '../context/BlueprintContext';

describe('BlueprintWizard', () => {
  const renderComponent = (props = {}) => {
    return render(
      <BlueprintProvider>
        <BlueprintWizard {...props} />
      </BlueprintProvider>
    );
  };

  it('should render the initial step', () => {
    renderComponent();

    expect(screen.getByText('Create Your Blueprint')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Try to proceed without filling required fields
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    expect(screen.getByText('Project name is required')).toBeInTheDocument();
  });

  it('should navigate through wizard steps', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Fill first step
    await user.type(screen.getByLabelText('Project Name'), 'Test Project');
    await user.type(screen.getByLabelText('Description'), 'Test description');

    // Go to next step
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(screen.getByText('Select Features')).toBeInTheDocument();
    });
  });
});
```

### 4. End-to-End Tests

E2E tests verify complete user workflows through the application.

```typescript
// E2E test example (using Playwright)
import { test, expect } from "@playwright/test";

test.describe("Blueprint Generation Workflow", () => {
  test("should generate and download a blueprint", async ({ page }) => {
    await page.goto("/");

    // Start blueprint creation
    await page.click('[data-testid="create-blueprint-button"]');

    // Fill project information
    await page.fill('[data-testid="project-name"]', "E2E Test Project");
    await page.fill('[data-testid="project-description"]', "End-to-end test project");

    // Select features
    await page.click('[data-testid="feature-auth"]');
    await page.click('[data-testid="feature-database"]');

    // Generate blueprint
    await page.click('[data-testid="generate-button"]');

    // Wait for generation to complete
    await expect(page.locator('[data-testid="generation-complete"]')).toBeVisible();

    // Download blueprint
    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="download-button"]');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/blueprint.*\.zip$/);
  });
});
```

## 🔧 Testing Tools and Configuration

### Test Framework

We use **Vitest** as our primary testing framework for its speed and TypeScript support.

#### Configuration

```typescript
// vitest.config.ts
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
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "**/dist/**"],
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

### Testing Libraries

- **Vitest**: Test runner and assertion library
- **Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing
- **MSW**: API mocking for tests

### Mock and Stub Patterns

#### API Mocking

```typescript
// test/mocks/api.ts
import { rest } from "msw";
import { setupServer } from "msw/node";

export const server = setupServer(
  rest.get("/api/blueprints/:id", (req, res, ctx) => {
    const { id } = req.params;

    if (id === "not-found") {
      return res(ctx.status(404), ctx.json({ error: "Blueprint not found" }));
    }

    return res(
      ctx.status(200),
      ctx.json({
        data: {
          id,
          name: "Test Blueprint",
          description: "A test blueprint",
        },
      }),
    );
  }),

  rest.post("/api/blueprints", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          id: "new-blueprint-id",
          ...req.body,
        },
      }),
    );
  }),
);
```

#### Component Mocks

```typescript
// test/mocks/components.ts
import { vi } from 'vitest';

export const MockButton = vi.fn(({ children, ...props }) => (
  <button data-testid="mock-button" {...props}>
    {children}
  </button>
));

export const MockInput = vi.fn((props) => (
  <input data-testid="mock-input" {...props} />
));

// Mock external libraries
vi.mock('@radix-ui/react-dialog', () => ({
  Dialog: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));
```

## 📝 Test Organization

### File Structure

```
src/
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.test.tsx
│   │   ├── ComponentName.stories.tsx
│   │   └── index.ts
├── services/
│   ├── serviceName/
│   │   ├── service.ts
│   │   ├── service.test.ts
│   │   └── types.ts
├── test/
│   ├── setup.ts
│   ├── helpers/
│   ├── mocks/
│   └── fixtures/
├── e2e/
│   ├── basic-workflow.spec.ts
│   ├── blueprint-generation.spec.ts
│   └── auth.spec.ts
```

### Test Naming Conventions

```typescript
// ✅ Good - Descriptive test names
describe("UserService.createUser", () => {
  it("should create a user with valid data", async () => {
    /* ... */
  });
  it("should throw error for duplicate email", async () => {
    /* ... */
  });
  it("should hash password before saving", async () => {
    /* ... */
  });
});

// ❌ Bad - Generic test names
describe("UserService", () => {
  it("should work", async () => {
    /* ... */
  });
  it("should handle error", async () => {
    /* ... */
  });
});
```

## 🚀 Running Tests

### Development Testing

```bash
# Run frontend tests
npm run test

# Run API tests
npm run test:api

# Run all tests (frontend + API)
npm run test:all

# Run tests for specific file
npm run test -- path/to/test.ts
```

### CI/CD Testing

```bash
# Full test suite
npm run test:all

# Type checking
npm run typecheck

# Linting
npm run lint

# All quality checks (typecheck + lint + test)
npm run check
```

## 🔍 Test Best Practices

### DO's

1. **Test Behavior, Not Implementation**

   ```typescript
   // ✅ Good - Test behavior
   it("should add item to cart", () => {
     const { result } = renderHook(() => useCart());
     act(() => {
       result.current.addItem(item);
     });
     expect(result.current.items).toContain(item);
   });

   // ❌ Bad - Test implementation
   it("should call setItems with new array", () => {
     const setItems = vi.fn();
     useCart({ setItems });
     // This tests implementation detail, not behavior
   });
   ```

2. **Use Descriptive Test Names**

   ```typescript
   // ✅ Good
   it("should show validation error when email is invalid", () => {
     // Test implementation
   });

   // ❌ Bad
   it("should handle form validation", () => {
     // Vague - what validation? what should happen?
   });
   ```

3. **Arrange-Act-Assert Pattern**

   ```typescript
   // ✅ Good - Clear pattern
   it("should calculate total with tax", () => {
     // Arrange
     const items = [{ price: 100, quantity: 2 }];
     const taxRate = 0.1;

     // Act
     const total = calculateTotal(items, taxRate);

     // Assert
     expect(total).toBe(220);
   });
   ```

4. **Use Factory Functions for Test Data**

   ```typescript
   // ✅ Good - Test factory
   const createTestUser = (overrides = {}) => ({
     id: "test-id",
     name: "Test User",
     email: "test@example.com",
     role: "user",
     ...overrides,
   });

   it("should update user role", () => {
     const user = createTestUser();
     const updatedUser = updateUserRole(user, "admin");
     expect(updatedUser.role).toBe("admin");
   });
   ```

### DON'Ts

1. **Don't Test External Libraries**

   ```typescript
   // ❌ Bad - Testing React itself
   it("should call useEffect on mount", () => {
     // Don't test React internals
   });
   ```

2. **Don't Test Multiple Behaviors in One Test**

   ```typescript
   // ❌ Bad - Multiple behaviors
   it("should create user and send welcome email", async () => {
     const user = await userService.create(userData);
     expect(user.id).toBeDefined();
     expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
   });

   // ✅ Good - Separate tests
   it("should create user with valid data", async () => {
     const user = await userService.create(userData);
     expect(user.id).toBeDefined();
   });

   it("should send welcome email when user is created", async () => {
     await userService.create(userData);
     expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(userData.email);
   });
   ```

3. **Don't Use Magic Numbers**

   ```typescript
   // ❌ Bad
   it("should validate name length", () => {
     expect(() => validateName("a".repeat(101))).toThrow();
   });

   // ✅ Good
   it("should reject names longer than MAX_NAME_LENGTH", () => {
     const longName = "a".repeat(MAX_NAME_LENGTH + 1);
     expect(() => validateName(longName)).toThrow();
   });
   ```

## 📊 Test Metrics and Reporting

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Console**: Quick overview during development
- **HTML**: Detailed interactive report
- **JSON**: Machine-readable for CI integration
- **LCOV**: Compatible with coverage services

### Performance Metrics

Track test performance to maintain fast feedback:

- **Test Duration**: Keep individual tests under 100ms
- **Suite Duration**: Keep total suite under 30 seconds
- **Memory Usage**: Monitor for memory leaks in tests

### Quality Gates

Automated quality checks prevent regressions:

```typescript
// Quality gate configuration
const qualityGates = {
  coverage: {
    minimum: 80,
    critical: 70, // Block PR if below this
  },
  performance: {
    maxTestDuration: 5000, // 5 seconds per test
    maxSuiteDuration: 30000, // 30 seconds total
  },
  reliability: {
    flakyTestThreshold: 0.1, // Max 10% flaky tests
  },
};
```

## 🐛 Testing Common Issues

### Flaky Tests

Flaky tests are unreliable and should be fixed immediately:

```typescript
// ❌ Bad - Race condition
it("should show loading state", () => {
  renderComponent();
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

// ✅ Good - Wait for state
it("should show loading state", async () => {
  renderComponent();
  await waitFor(() => {
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```

### Async Testing

Always handle async operations properly:

```typescript
// ✅ Good - Proper async handling
it("should load data from API", async () => {
  renderComponent();

  // Wait for loading to complete
  await waitForElementToBeRemoved(() => screen.getByText("Loading..."));

  // Assert on loaded content
  expect(screen.getByText("Data loaded")).toBeInTheDocument();
});
```

---

_Testing procedures are continuously evolving. Last updated: 2026-02-23_
