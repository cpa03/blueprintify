# Code Style Guidelines

This document defines the coding standards and style guidelines for the Blueprintify project. All contributors must follow these guidelines to ensure code consistency and maintainability.

## 🎯 Philosophy

Our code style guidelines are based on the following principles:

- **Readability First**: Code should be self-documenting and easy to understand
- **Consistency**: Follow established patterns throughout the codebase
- **Type Safety**: Leverage TypeScript's type system to prevent errors
- **Performance**: Write efficient code without premature optimization
- **Maintainability**: Make future changes easy and safe

## TypeScript Standards

### Strict Mode Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Types vs Interfaces

#### Use `interface` for object shapes and class implementation:

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UserService {
  getUser(id: string): Promise<User>;
  createUser(data: CreateUserDto): Promise<User>;
}
```

#### Use `type` for unions, intersections, and computed types:

```typescript
// ✅ Good
type UserRole = "admin" | "user" | "moderator";
type ApiResponse<T> = {
  data: T;
  status: "success" | "error";
  message?: string;
};
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### Return Types

Always include explicit return types on public functions and methods:

```typescript
// ✅ Good
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

async function fetchUser(id: string): Promise<User | null> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

// ❌ Bad
function calculateTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

### Type Safety Rules

#### No `any` Type

```typescript
// ✅ Good
function processValue(value: unknown): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toString();
  }
  throw new Error("Unsupported value type");
}

// ❌ Bad
function processValue(value: any): string {
  return value.toUpperCase();
}
```

#### Use Type Guards

```typescript
// ✅ Good
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "id" in obj && "name" in obj && "email" in obj;
}

// ❌ Bad
function isUser(obj: any): boolean {
  return obj.id && obj.name && obj.email;
}
```

## React Component Standards

### Functional Components

```typescript
// ✅ Good
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpdate,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  }, [formData, onUpdate]);

  const memoizedDisplayName = useMemo(() => {
    return `${user.firstName} ${user.lastName}`;
  }, [user.firstName, user.lastName]);

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className={className}>
        {/* Edit form */}
      </form>
    );
  }

  return (
    <div className={className}>
      <h2>{memoizedDisplayName}</h2>
      {/* Display view */}
    </div>
  );
};
```

### Performance Optimization

#### Use React.memo for expensive renders:

```typescript
// ✅ Good
export const ExpensiveComponent = React.memo<ExpensiveComponentProps>(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);

  return <div>{/* Render processed data */}</div>;
});

// With custom comparison
export const MemoizedComponent = React.memo<ComponentProps>(
  ({ data, options }) => {
    return <div>{/* Component content */}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id &&
           JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options);
  }
);
```

#### Use useCallback for event handlers:

```typescript
// ✅ Good
const ButtonComponent: React.FC<ButtonProps> = ({ onClick, children }) => {
  const handleClick = useCallback((event: React.MouseEvent) => {
    onClick(event);
  }, [onClick]);

  return <button onClick={handleClick}>{children}</button>;
};
```

### Component Structure

```typescript
// ✅ Good - Logical order
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks (useState, useEffect, etc.)
  const [state, setState] = useState(initialState);

  // 2. Derived state
  const derivedValue = useMemo(() => computeValue(state), [state]);

  // 3. Event handlers
  const handleClick = useCallback(() => {
    // handler logic
  }, [state]);

  // 4. Effects
  useEffect(() => {
    // effect logic
  }, [state]);

  // 5. Conditional rendering
  if (shouldNotRender) {
    return null;
  }

  // 6. Main render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};
```

## Cloudflare Workers (API) Standards

### Hono Framework Patterns

```typescript
// ✅ Good
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

// Schema validation
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["user", "admin"]).optional(),
});

// Route definition
app.post("/users", zValidator("json", createUserSchema), async (c) => {
  try {
    const validatedData = c.req.valid("json");

    const user = await userService.createUser(validatedData);

    return c.json(
      {
        data: user,
        status: "success",
        message: "User created successfully",
      },
      201,
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json(
      {
        status: "error",
        message: "Internal server error",
      },
      500,
    );
  }
});
```

### Error Handling

```typescript
// ✅ Good
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const errorHandler = (error: Error, c: Context) => {
  if (error instanceof ApiError) {
    return c.json(
      {
        status: "error",
        message: error.message,
        code: error.code,
      },
      error.statusCode,
    );
  }

  console.error("Unexpected error:", error);
  return c.json(
    {
      status: "error",
      message: "Internal server error",
    },
    500,
  );
};

app.onError(errorHandler);
```

## General Code Style

### Naming Conventions

#### Variables and Functions

```typescript
// ✅ Good - camelCase, descriptive
const userProfile = getUserProfile(id);
const isLoadingData = true;
const handleSubmit = (event: FormEvent) => {
  /* ... */
};

// ❌ Bad - unclear naming
const data = getUser(id);
const flag = true;
const func = (e) => {
  /* ... */
};
```

#### Constants

```typescript
// ✅ Good - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const API_ENDPOINTS = {
  USERS: "/api/users",
  BLUEPRINTS: "/api/blueprints",
} as const;

// ❌ Bad
const maxRetry = 3;
const timeout = 5000;
```

#### Interfaces and Types

```typescript
// ✅ Good - PascalCase, descriptive
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

type ApiResponse<T> = {
  data: T;
  status: "success" | "error";
};

// ❌ Bad
interface User {
  id: string;
  n: string;
  e: string;
}
```

### Comments and Documentation

#### When to Add Comments

```typescript
// ✅ Good - Complex business logic
function calculateComplexityScore(data: ComplexData): number {
  // Weight factors based on business requirements
  const complexityFactors = {
    structuralComplexity: 0.4, // Impact on system architecture
    dependencyComplexity: 0.3, // External service dependencies
    dataComplexity: 0.2, // Data volume and variety
    securityComplexity: 0.1, // Security implications
  };

  // Calculate weighted sum
  return Object.entries(complexityFactors).reduce((score, [key, weight]) => {
    const factor = getComplexityFactor(data, key);
    return score + factor * weight;
  }, 0);
}

// ❌ Bad - Obvious comments
function add(a: number, b: number): number {
  return a + b; // Add two numbers
}
```

#### JSDoc for Public APIs

````typescript
// ✅ Good
/**
 * Generates a comprehensive blueprint for the given project configuration.
 *
 * @param config - The project configuration including name, description, and features
 * @param options - Optional parameters for generation customization
 * @returns Promise resolving to the generated blueprint data
 * @throws {ValidationError} When config is invalid
 * @throws {GenerationError} When blueprint generation fails
 *
 * @example
 * ```typescript
 * const blueprint = await generateBlueprint({
 *   name: 'My Project',
 *   description: 'A sample project',
 *   features: ['auth', 'database']
 * });
 * ```
 */
async function generateBlueprint(config: ProjectConfig, options: GenerationOptions = {}): Promise<BlueprintData> {
  // Implementation
}
````

## ESLint Configuration

Our ESLint configuration enforces these standards automatically:

```typescript
// .eslintrc.js equivalent
export default {
  rules: {
    // TypeScript
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-non-null-assertion": "error",

    // React
    "react/prop-types": "off", // Using TypeScript for prop validation
    "react/react-in-jsx-scope": "off", // Not needed with React 17+
    "react-hooks/exhaustive-deps": "warn",

    // General
    "no-console": "warn",
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
  },
};
```

## File Organization

### Directory Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
└── __tests__/          # Test files
```

### Import Order

```typescript
// ✅ Good - Organized imports
// 1. External dependencies
import React from "react";
import { useState, useCallback } from "react";
import { z } from "zod";

// 2. Internal dependencies (shared packages)
import { User, ApiResponse } from "@blueprint/shared";

// 3. Local dependencies
import { Button } from "@/components/common";
import { useApi } from "@/hooks";
import { userService } from "@/services";

// 4. Type imports
import type { UserProps } from "./types";
```

## Performance Guidelines

### React Performance

```typescript
// ✅ Good - Optimize expensive operations
const ExpensiveList: React.FC<{ items: Item[] }> = ({ items }) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.isActive && item.score > threshold);
  }, [items]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => b.score - a.score);
  }, [filteredItems]);

  return (
    <div>
      {sortedItems.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
```

### API Performance

```typescript
// ✅ Good - Efficient data fetching
async function getBlueprints(filters: BlueprintFilters): Promise<Blueprint[]> {
  // Validate filters early
  const validatedFilters = blueprintFiltersSchema.parse(filters);

  // Build efficient query
  const query = buildQuery(validatedFilters);

  // Use pagination for large datasets
  const result = await database.blueprints.findMany({
    where: query,
    take: validatedFilters.limit || 50,
    skip: validatedFilters.offset || 0,
    select: {
      id: true,
      name: true,
      description: true,
      // Only select needed fields
    },
  });

  return result;
}
```

## Security Guidelines

### Input Validation

```typescript
// ✅ Good - Strict validation
const userRegistrationSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/),
});

// Sanitize outputs
function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong"],
    ALLOWED_ATTR: [],
  });
}
```

### API Security

```typescript
// ✅ Good - Security headers and validation
app.use("*", async (c, next) => {
  // Set security headers
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");

  await next();
});

// Rate limiting
app.use(
  "/api/*",
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
```

---

_These guidelines are continuously evolving. Last updated: 2026-02-19_
