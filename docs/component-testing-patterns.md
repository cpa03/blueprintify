# Component Testing Patterns & Examples

This guide provides comprehensive patterns and examples for testing React components in the Blueprintify project using Vitest and React Testing Library.

## 1. Testing Philosophy

### Principles

1. **Test user behavior, not implementation details**
2. **Focus on accessibility and user interactions**
3. **Use meaningful assertions that reflect real user scenarios**
4. **Mock external dependencies while keeping tests realistic**
5. **Maintain test readability and maintainability**

### The Testing Pyramid

```
    E2E Tests (Few)
   ↗               ↖
Integration Tests (Some)
↗                       ↖
Unit Tests (Many)
```

## 2. Component Testing Patterns

### Pattern 1: Rendering Tests

**When to use**: Verify component renders correctly with different props
**What to test**: Element existence, text content, conditional rendering

#### Example: Header Component

```typescript
// src/__tests__/components/Header.test.tsx
import { render, screen } from '@/test/utils/test-utils';
import { Header } from '@/components/Header';

describe('Header', () => {
  it('renders the application title', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { name: /blueprintify/i })).toBeInTheDocument();
  });

  it('displays navigation menu items', () => {
    render(<Header />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /features/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /templates/i })).toBeInTheDocument();
  });

  it('shows dark mode toggle button', () => {
    render(<Header />);
    const toggleButton = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(toggleButton).toBeInTheDocument();
  });
});
```

### Pattern 2: User Interaction Tests

**When to use**: Test user interactions like clicks, form inputs, keyboard events
**What to test**: Event handlers, state changes, side effects

#### Example: Wizard Component

```typescript
// src/__tests__/components/Wizard.test.tsx
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { Wizard } from '@/components/Wizard';

describe('Wizard', () => {
  it('navigates between steps', async () => {
    render(<Wizard />);

    // Initially on first step
    expect(screen.getByText(/project information/i)).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Should be on tech stack step
    await waitFor(() => {
      expect(screen.getByText(/select tech stack/i)).toBeInTheDocument();
    });
  });

  it('validates form before proceeding to next step', async () => {
    render(<Wizard />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
    });
  });

  it('disables next button on last step and enables generate button', async () => {
    render(<Wizard />);

    // Navigate to last step
    for (let i = 0; i < 4; i++) {
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate blueprint/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });
  });
});
```

### Pattern 3: Conditional Rendering Tests

**When to use**: Test components that render different content based on props or state
**What to test**: Different rendering states, loading/error states

#### Example: StepGenerating Component

```typescript
// src/__tests__/components/wizard/StepGenerating.test.tsx
import { render, screen } from '@/test/utils/test-utils';
import { StepGenerating } from '@/components/wizard/StepGenerating';

describe('StepGenerating', () => {
  it('shows loading state during generation', () => {
    render(<StepGenerating isGenerating={true} progress={50} />);

    expect(screen.getByText(/generating your blueprint/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/50%/i)).toBeInTheDocument();
  });

  it('shows completion state when generation is finished', () => {
    render(<StepGenerating isGenerating={false} progress={100} />);

    expect(screen.getByText(/blueprint generated successfully/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view blueprint/i })).toBeInTheDocument();
  });

  it('shows error state when generation fails', () => {
    render(<StepGenerating isGenerating={false} progress={0} error="Network error" />);

    expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
```

### Pattern 4: Form Input Tests

**When to use**: Test form components and user input handling
**What to test**: Input validation, value changes, form submission

#### Example: StepInfo Component

```typescript
// src/__tests__/components/wizard/StepInfo.test.tsx
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { StepInfo } from '@/components/wizard/StepInfo';

describe('StepInfo', () => {
  const mockOnDataChange = vi.fn();

  beforeEach(() => {
    mockOnDataChange.mockClear();
  });

  it('captures project name input', async () => {
    const user = userEvent.setup();
    render(<StepInfo onDataChange={mockOnDataChange} />);

    const nameInput = screen.getByLabelText(/project name/i);
    await user.type(nameInput, 'My Awesome Project');

    expect(nameInput).toHaveValue('My Awesome Project');
    expect(mockOnDataChange).toHaveBeenCalledWith(
      expect.objectContaining({ projectName: 'My Awesome Project' })
    );
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<StepInfo onDataChange={mockOnDataChange} />);

    const submitButton = screen.getByRole('button', { name: /next/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/project name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/project description is required/i)).toBeInTheDocument();
    });
  });

  it('accepts valid form data', async () => {
    const user = userEvent.setup();
    render(<StepInfo onDataChange={mockOnDataChange} />);

    await user.type(screen.getByLabelText(/project name/i), 'Test Project');
    await user.type(screen.getByLabelText(/project description/i), 'A test project description');
    await user.selectOptions(screen.getByLabelText(/project type/i), 'Web Application');

    const submitButton = screen.getByRole('button', { name: /next/i });
    await user.click(submitButton);

    expect(mockOnDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        projectName: 'Test Project',
        projectDescription: 'A test project description',
        projectType: 'Web Application',
      })
    );
  });
});
```

### Pattern 5: Component Integration Tests

**When to use**: Test component interactions and data flow
**What to test**: Component communication, shared state, side effects

#### Example: Editor with EditorToolbar Integration

```typescript
// src/__tests__/components/editor/Editor.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { Editor } from '@/components/Editor';
import { EditorToolbar } from '@/components/editor/EditorToolbar';

describe('Editor Integration', () => {
  it('updates editor content when toolbar buttons are clicked', async () => {
    render(
      <div>
        <EditorToolbar />
        <Editor />
      </div>
    );

    // Initial content
    expect(screen.getByDisplayValue('# Project Blueprint')).toBeInTheDocument();

    // Click bold button in toolbar
    const boldButton = screen.getByRole('button', { name: /bold/i });
    fireEvent.click(boldButton);

    // Editor should include bold markdown
    await waitFor(() => {
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveValue('**bold text**');
    });
  });

  it('saves content to localStorage when save button is clicked', async () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    render(<Editor />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'blueprint-content',
      expect.any(String)
    );
  });
});
```

## 3. Mocking Patterns

### Mocking API Calls

```typescript
// src/__tests__/hooks/useBlueprintStream.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useBlueprintStream } from "@/hooks/useBlueprintStream";
import { mockApiResponses } from "@/test/mocks/api";

// Mock the fetch API
global.fetch = vi.fn();

describe("useBlueprintStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully streams blueprint content", async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('data: {"content": "# Title"}\n\n'),
        );
        controller.close();
      },
    });

    (fetch as any).mockResolvedValue({
      ok: true,
      body: mockStream,
    });

    const { result } = renderHook(() => useBlueprintStream("test-project"));

    await waitFor(() => {
      expect(result.current.content).toBe("# Title");
      expect(result.current.isStreaming).toBe(false);
    });
  });

  it("handles streaming errors", async () => {
    (fetch as any).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useBlueprintStream("test-project"));

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
      expect(result.current.isStreaming).toBe(false);
    });
  });
});
```

### Mocking Browser APIs

```typescript
// src/__tests__/lib/export.test.ts
import { exportToZip } from "@/lib/export";

// Mock JSZip
const mockZip = {
  file: vi.fn(),
  generateAsync: vi.fn().mockResolvedValue(new Blob()),
};

vi.mock("jszip", () => ({
  default: vi.fn(() => mockZip),
}));

describe("exportToZip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates ZIP file with blueprint and task files", async () => {
    const blueprint = "# Test Blueprint";
    const tasks = "- Task 1\n- Task 2";

    await exportToZip(blueprint, tasks);

    expect(mockZip.file).toHaveBeenCalledWith("blueprint.md", blueprint);
    expect(mockZip.file).toHaveBeenCalledWith("tasks.md", tasks);
    expect(mockZip.generateAsync).toHaveBeenCalledWith({ type: "blob" });
  });
});
```

## 4. Test Organization Patterns

### Test File Structure

```typescript
// src/__tests__/components/StepIndicator.test.tsx
import { render, screen } from "@/test/utils/test-utils";
import { StepIndicator } from "@/components/StepIndicator";

describe("StepIndicator", () => {
  // Basic rendering tests
  describe("Rendering", () => {
    it("renders correct number of steps");
    it("highlights current step");
    it("shows completed steps");
  });

  // Interaction tests
  describe("User Interactions", () => {
    it("allows navigation to previous steps");
    it("prevents navigation to future steps");
    it("updates when step is clicked");
  });

  // Accessibility tests
  describe("Accessibility", () => {
    it("has proper ARIA labels");
    it("supports keyboard navigation");
    it("announces step changes to screen readers");
  });

  // Edge cases
  describe("Edge Cases", () => {
    it("handles single step");
    it("handles zero steps");
    it("handles invalid current step");
  });
});
```

### Custom Matchers

```typescript
// src/test/utils/custom-matchers.ts
import { expect } from "vitest";

expect.extend({
  toHaveAccessibleLabel(received, expectedLabel) {
    const label =
      received.getAttribute("aria-label") ||
      received.getAttribute("aria-labelledby") ||
      received.textContent;

    const pass = label === expectedLabel;

    if (pass) {
      return {
        message: () =>
          `expected element not to have accessible label "${expectedLabel}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have accessible label "${expectedLabel}" but got "${label}"`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace Vi {
    interface Assertion {
      toHaveAccessibleLabel(expectedLabel: string): any;
    }
  }
}
```

## 5. Performance Testing Patterns

### Component Performance Tests

```typescript
// src/__tests__/performance/TemplateGrid.performance.test.tsx
import { render, screen } from '@/test/utils/test-utils';
import { TemplateGrid } from '@/components/TemplateGrid';

describe('TemplateGrid Performance', () => {
  it('renders large list efficiently', () => {
    const largeTemplateList = Array.from({ length: 1000 }, (_, i) => ({
      id: i.toString(),
      name: `Template ${i}`,
      description: `Description ${i}`,
    }));

    const startTime = performance.now();
    render(<TemplateGrid templates={largeTemplateList} />);
    const endTime = performance.now();

    // Should render within 100ms
    expect(endTime - startTime).toBeLessThan(100);
    expect(screen.getAllByRole('article')).toHaveLength(1000);
  });
});
```

## 6. Best Practices & Guidelines

### Do's

- **Test from user's perspective**: What users see and do
- **Use accessible queries**: `getByRole`, `getByLabelText`, `getByPlaceholderText`
- **Test happy paths and error cases**: Cover all scenarios
- **Keep tests focused**: One behavior per test
- **Use descriptive test names**: Should describe the behavior being tested

### Don'ts

- **Don't test implementation details**: Internal state, component structure
- **Don't test library functionality**: Trust that React, Vitest work correctly
- **Don't over-mock**: Mock only external dependencies
- **Don't test CSS**: Focus on functionality, not styling
- **Don't create brittle tests**: Tests that break on refactoring

### Test Data Management

```typescript
// src/test/utils/test-data.ts
export const createMockProject = (overrides = {}) => ({
  name: "Test Project",
  description: "A test project",
  type: "Web Application",
  techStack: ["React", "TypeScript"],
  features: ["Authentication", "Database"],
  ...overrides,
});

export const createMockTemplate = (overrides = {}) => ({
  id: "1",
  name: "React Template",
  description: "React starter template",
  category: "Frontend",
  popularity: 4.5,
  ...overrides,
});
```

This comprehensive testing guide provides patterns and examples that will help ensure high-quality, maintainable tests for all components in the Blueprintify project.
