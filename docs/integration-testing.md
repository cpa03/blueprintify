# Integration Testing Documentation

This guide covers comprehensive integration testing strategies for the Blueprintify project, covering user flows, API integration, state management, and end-to-end testing scenarios.

## 1. Integration Testing Overview

### What is Integration Testing?

Integration testing verifies that multiple components, modules, or systems work together correctly. In our context, this means:

- **Component Integration**: Multiple React components working together
- **API Integration**: Frontend communicating with backend services
- **State Integration**: Different state stores and hooks interacting
- **User Flow Integration**: Complete user journeys across multiple steps

### Testing Pyramid Context

```
    E2E Tests (Critical user journeys)
   ↗               ↖
Integration Tests (Component interactions, API calls)
↗                       ↖
Unit Tests (Individual functions, components)
```

## 2. Component Integration Tests

### Pattern 1: Wizard Flow Integration

#### File: `src/__tests__/integration/wizard-flow.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Wizard } from '@/components/Wizard';

// Mock the API
vi.mock('@/lib/api', () => ({
  generateBlueprint: vi.fn().mockResolvedValue({
    content: '# Generated Blueprint',
    metadata: { version: '1.0.0' },
  }),
}));

describe('Wizard Complete Flow Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes full wizard flow from start to generation', async () => {
    render(<Wizard />);

    // Step 1: Project Information
    expect(screen.getByText(/project information/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/project name/i), 'My Test Project');
    await user.type(screen.getByLabelText(/project description/i), 'A comprehensive test project');
    await user.selectOptions(screen.getByLabelText(/project type/i), 'Web Application');

    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Tech Stack Selection
    await waitFor(() => {
      expect(screen.getByText(/select tech stack/i)).toBeInTheDocument();
    });

    // Select React and TypeScript
    await user.click(screen.getByRole('checkbox', { name: /react/i }));
    await user.click(screen.getByRole('checkbox', { name: /typescript/i }));

    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Features Selection
    await waitFor(() => {
      expect(screen.getByText(/select features/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: /authentication/i }));
    await user.click(screen.getByRole('checkbox', { name: /database/i }));

    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: Review & Generate
    await waitFor(() => {
      expect(screen.getByText(/review and generate/i)).toBeInTheDocument();
    });

    // Verify all selections are displayed in review
    expect(screen.getByText(/My Test Project/)).toBeInTheDocument();
    expect(screen.getByText(/React, TypeScript/)).toBeInTheDocument();
    expect(screen.getByText(/Authentication, Database/)).toBeInTheDocument();

    // Generate blueprint
    await user.click(screen.getByRole('button', { name: /generate blueprint/i }));

    // Verify generation process starts
    await waitFor(() => {
      expect(screen.getByText(/generating your blueprint/i)).toBeInTheDocument();
    });
  });

  it('maintains data consistency across all wizard steps', async () => {
    render(<Wizard />);

    // Fill out all steps with data
    const projectData = {
      name: 'Data Consistency Test',
      description: 'Testing data persistence',
      type: 'Mobile Application',
      techStack: ['React Native', 'TypeScript'],
      features: ['Push Notifications', 'Offline Support'],
    };

    // Step 1
    await user.type(screen.getByLabelText(/project name/i), projectData.name);
    await user.type(screen.getByLabelText(/project description/i), projectData.description);
    await user.selectOptions(screen.getByLabelText(/project type/i), projectData.type);

    // Navigate forward and backward to verify data persistence
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /previous/i }));

    // Verify Step 1 data is still present
    expect(screen.getByDisplayValue(projectData.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(projectData.description)).toBeInTheDocument();
    expect(screen.getByDisplayValue(projectData.type)).toBeInTheDocument();
  });
});
```

### Pattern 2: Editor Integration with API

#### File: `src/__tests__/integration/editor-api.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { Editor } from '@/components/Editor';
import { saveBlueprint, loadBlueprint } from '@/lib/api';

// Mock API functions
vi.mock('@/lib/api', () => ({
  saveBlueprint: vi.fn(),
  loadBlueprint: vi.fn(),
}));

describe('Editor API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves blueprint content to API', async () => {
    const mockSave = vi.mocked(saveBlueprint);
    mockSave.mockResolvedValue({ success: true });

    render(<Editor initialContent="# Initial Content" />);

    // Modify content
    const editor = screen.getByRole('textbox');
    fireEvent.change(editor, { target: { value: '# Updated Content\n\nThis is updated.' } });

    // Click save button
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        content: '# Updated Content\n\nThis is updated.',
        metadata: expect.any(Object),
      });
    });

    // Show success message
    expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
  });

  it('loads blueprint content from API', async () => {
    const mockLoad = vi.mocked(loadBlueprint);
    mockLoad.mockResolvedValue({
      content: '# Loaded Content\n\nThis was loaded from API.',
      metadata: { lastModified: '2024-01-01T00:00:00Z' },
    });

    render(<Editor blueprintId="test-blueprint" />);

    await waitFor(() => {
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveValue('# Loaded Content\n\nThis was loaded from API.');
    });
  });

  it('handles save errors gracefully', async () => {
    const mockSave = vi.mocked(saveBlueprint);
    mockSave.mockRejectedValue(new Error('Network error'));

    render(<Editor initialContent="# Test Content" />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
```

## 3. State Management Integration

### Pattern: Store Integration Testing

#### File: `src/__tests__/integration/store-integration.test.tsx`

```typescript
import { renderHook, act } from "@testing-library/react";
import { useWizardStore } from "@/store/wizard";
import { useEditorStore } from "@/store/editor";

describe("Store Integration", () => {
  beforeEach(() => {
    // Reset stores before each test
    useWizardStore.getState().reset();
    useEditorStore.getState().reset();
  });

  it("shares project data between wizard and editor stores", async () => {
    // Set project data in wizard store
    const { result: wizardResult } = renderHook(() => useWizardStore());

    act(() => {
      wizardResult.current.setProjectInfo({
        name: "Integration Test Project",
        description: "Testing store integration",
        type: "Web Application",
      });
    });

    // Verify wizard store state
    expect(wizardResult.current.projectInfo.name).toBe(
      "Integration Test Project",
    );

    // Generate blueprint and move to editor
    await act(async () => {
      await wizardResult.current.generateBlueprint();
    });

    // Check editor store has the generated content
    const { result: editorResult } = renderHook(() => useEditorStore());
    expect(editorResult.current.content).toContain(
      "# Integration Test Project",
    );
  });

  it("persists wizard state across page refreshes", () => {
    const { result: wizardResult } = renderHook(() => useWizardStore());

    // Set wizard progress
    act(() => {
      wizardResult.current.setCurrentStep(2);
      wizardResult.current.setTechStack(["React", "TypeScript"]);
      wizardResult.current.setFeatures(["Authentication"]);
    });

    // Simulate page refresh by clearing and recreating store
    const stateBefore = JSON.stringify(wizardResult.current);
    useWizardStore.getState().reset();

    // Rehydrate from localStorage (simulated)
    const persistedState = JSON.parse(stateBefore);
    act(() => {
      wizardResult.current.hydrate(persistedState);
    });

    // Verify state is restored
    expect(wizardResult.current.currentStep).toBe(2);
    expect(wizardResult.current.techStack).toEqual(["React", "TypeScript"]);
    expect(wizardResult.current.features).toEqual(["Authentication"]);
  });
});
```

## 4. API Integration Tests

### Mock Server Setup

#### File: `src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API handlers
export const handlers = [
  // Generate blueprint endpoint
  rest.post('/api/generate', (req, res, ctx) => {
    const { projectInfo, techStack, features } = req.body;

    // Simulate API delay
    return res(
      ctx.delay(1000),
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          content: `# ${projectInfo.name}\n\nGenerated blueprint for ${techStack.join(', ')} with ${features.join(', ')}.`,
          metadata: {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
          },
        },
      })
    );
  }),

  // Get templates endpoint
  rest.get('/api/templates', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          templates: [
            {
              id: '1',
              name: 'React App',
              description: 'React starter template',
              category: 'Frontend',
              techStack: ['React', 'TypeScript'],
            },
            {
              id: '2',
              name: 'Next.js App',
              description: 'Next.js full-stack template',
              category: 'Full-Stack',
              techStack: ['Next.js', 'TypeScript', 'Tailwind'],
            },
          ],
        },
      })
    );
  }),

  // Error handler for testing error scenarios
  rest.post('/api/generate-error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate blueprint',
      })
    );
  }),
]);

// Create mock server
export const server = setupServer(...handlers);
```

### API Integration Test

#### File: `src/__tests__/integration/api-integration.test.tsx`

```typescript
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { server } from '@/test/mocks/server';
import { rest } from 'msw';
import { Wizard } from '@/components/Wizard';

// Setup and teardown mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Integration', () => {
  it('successfully generates blueprint via API', async () => {
    render(<Wizard />);

    // Complete wizard steps (simplified for this test)
    await userEvent.type(screen.getByLabelText(/project name/i), 'API Test');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Generate blueprint
    await user.click(screen.getByRole('button', { name: /generate blueprint/i }));

    // Wait for API response
    await waitFor(() => {
      expect(screen.getByText(/blueprint generated successfully/i)).toBeInTheDocument();
    });

    // Verify generated content is displayed
    await waitFor(() => {
      expect(screen.getByText(/# API Test/)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Override handler to return error
    server.use(
      rest.post('/api/generate', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            success: false,
            error: 'Service Unavailable',
          })
        );
      })
    );

    render(<Wizard />);

    // Complete wizard and attempt generation
    await userEvent.type(screen.getByLabelText(/project name/i), 'Error Test');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(screen.getByRole('button', { name: /generate blueprint/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to generate blueprint/i)).toBeInTheDocument();
      expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
    });
  });
});
```

## 5. User Flow Integration Tests

### Complete User Journey

#### File: `src/__tests__/integration/user-journey.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';

// Mock API and local storage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Complete User Journey', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('completes full application workflow: create -> generate -> view -> export', async () => {
    render(<App />);

    // 1. Landing Page -> Start Wizard
    expect(screen.getByText(/create your project blueprint/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /get started/i }));

    // 2. Complete Wizard Steps
    // Step 1: Project Info
    await waitFor(() => {
      expect(screen.getByText(/project information/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/project name/i), 'Complete Journey Test');
    await user.type(screen.getByLabelText(/project description/i), 'A comprehensive full-stack application');
    await user.selectOptions(screen.getByLabelText(/project type/i), 'Web Application');

    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Tech Stack
    await waitFor(() => {
      expect(screen.getByText(/select tech stack/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: /react/i }));
    await user.click(screen.getByRole('checkbox', { name: /typescript/i }));
    await user.click(screen.getByRole('checkbox', { name: /node.js/i }));

    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Features
    await waitFor(() => {
      expect(screen.getByText(/select features/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('checkbox', { name: /authentication/i }));
    await user.click(screen.getByRole('checkbox', { name: /database/i }));
    await user.click(screen.getByRole('checkbox', { name: /api integration/i }));

    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 4: Review and Generate
    await waitFor(() => {
      expect(screen.getByText(/review and generate/i)).toBeInTheDocument();
    });

    // Verify review shows all selections
    expect(screen.getByText(/Complete Journey Test/)).toBeInTheDocument();
    expect(screen.getByText(/React, TypeScript, Node.js/)).toBeInTheDocument();
    expect(screen.getByText(/Authentication, Database, API Integration/)).toBeInTheDocument();

    // Generate Blueprint
    await user.click(screen.getByRole('button', { name: /generate blueprint/i }));

    // 3. Generation Process
    await waitFor(() => {
      expect(screen.getByText(/generating your blueprint/i)).toBeInTheDocument();
    });

    // Wait for generation to complete
    await waitFor(
      () => {
        expect(screen.getByText(/blueprint generated successfully/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // 4. View Generated Blueprint in Editor
    await user.click(screen.getByRole('button', { name: /view blueprint/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /complete journey test/i })).toBeInTheDocument();
      expect(screen.getByDisplayValue(/# Complete Journey Test/)).toBeInTheDocument();
    });

    // 5. Edit Blueprint
    const editor = screen.getByRole('textbox');
    await user.clear(editor);
    await user.type(editor, '# Complete Journey Test\n\n## Updated Content\n\nThis is updated content.');

    // 6. Save Changes
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
    });

    // Verify localStorage was updated
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'blueprint-content',
      expect.stringContaining('# Complete Journey Test')
    );

    // 7. Export Blueprint
    await user.click(screen.getByRole('button', { name: /export/i }));

    await waitFor(() => {
      expect(screen.getByText(/export blueprint/i)).toBeInTheDocument();
    });

    // Select export options
    await user.click(screen.getByRole('checkbox', { name: /include tasks/i }));
    await user.click(screen.getByRole('checkbox', { name: /include documentation/i }));

    // Download ZIP
    await user.click(screen.getByRole('button', { name: /download zip/i }));

    await waitFor(() => {
      expect(screen.getByText(/export completed successfully/i)).toBeInTheDocument();
    });
  });

  it('persists user progress and allows resuming', async () => {
    // Simulate returning user with saved progress
    const savedProgress = {
      currentStep: 2,
      projectInfo: {
        name: 'Saved Project',
        description: 'Previously saved project',
        type: 'Mobile Application',
      },
      techStack: ['React Native'],
      features: [],
    };

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'wizard-progress') return JSON.stringify(savedProgress);
      return null;
    });

    render(<App />);

    // Should resume wizard at saved step
    await waitFor(() => {
      expect(screen.getByText(/select tech stack/i)).toBeInTheDocument();
    });

    // Verify saved data is pre-filled
    expect(screen.getByDisplayValue(/Saved Project/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Previously saved project/)).toBeInTheDocument();

    // User can continue from where they left off
    await user.click(screen.getByRole('checkbox', { name: /typescript/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/select features/i)).toBeInTheDocument();
    });
  });
});
```

## 6. Performance Integration Tests

### Performance Monitoring

#### File: `src/__tests__/integration/performance.test.tsx`

```typescript
import { render, screen } from '@/test/utils/test-utils';
import { App } from '@/App';

describe('Performance Integration Tests', () => {
  it('meets performance benchmarks for critical user flows', async () => {
    const performanceMetrics = {
      initialLoad: 0,
      wizardStepTransition: 0,
      blueprintGeneration: 0,
      exportProcess: 0,
    };

    // Measure initial load time
    const loadStart = performance.now();
    render(<App />);
    performanceMetrics.initialLoad = performance.now() - loadStart;

    expect(performanceMetrics.initialLoad).toBeLessThan(2000); // 2 seconds

    // Measure wizard step transition time
    const transitionStart = performance.now();
    await userEvent.click(screen.getByRole('button', { name: /get started/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    performanceMetrics.wizardStepTransition = performance.now() - transitionStart;

    expect(performanceMetrics.wizardStepTransition).toBeLessThan(500); // 500ms

    // Measure blueprint generation time (simulated)
    const generationStart = performance.now();
    // Complete wizard and generate
    await userEvent.type(screen.getByLabelText(/project name/i), 'Perf Test');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /generate blueprint/i }));

    await waitFor(() => {
      expect(screen.getByText(/blueprint generated successfully/i)).toBeInTheDocument();
    });
    performanceMetrics.blueprintGeneration = performance.now() - generationStart;

    expect(performanceMetrics.blueprintGeneration).toBeLessThan(5000); // 5 seconds

    // Log metrics for performance monitoring
    console.log('Performance Metrics:', performanceMetrics);
  });
});
```

## 7. Accessibility Integration Tests

#### File: `src/__tests__/integration/accessibility.test.tsx`

```typescript
import { render, screen } from '@/test/utils/test-utils';
import { App } from '@/App';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Integration', () => {
  it('has no accessibility violations in complete user flow', async () => {
    const { container } = render(<App />);

    // Test landing page
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Navigate through wizard and test each step
    await userEvent.click(screen.getByRole('button', { name: /get started/i }));

    // Test wizard step
    const wizardResults = await axe(container);
    expect(wizardResults).toHaveNoViolations();

    // Test keyboard navigation
    await userEvent.tab();
    expect(screen.getByRole('button', { name: /next/i })).toHaveFocus();
  });

  it('supports screen reader announcements for state changes', async () => {
    render(<App />);

    // Test progress announcements
    await userEvent.click(screen.getByRole('button', { name: /get started/i }));

    // Should announce step change
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Test generation announcements
    await userEvent.type(screen.getByLabelText(/project name/i), 'A11y Test');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /generate blueprint/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
```

## 8. Error Boundary Integration

#### File: `src/__tests__/integration/error-boundary.test.tsx`

```typescript
import { render, screen } from '@/test/utils/test-utils';
import { App } from '@/App';

// Create a component that throws an error for testing
const ThrowErrorComponent = () => {
  throw new Error('Test error for error boundary');
};

describe('Error Boundary Integration', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('catches and displays errors gracefully', async () => {
    render(<App />);

    // Simulate an error scenario (e.g., API failure)
    // This would typically be done by mocking a failed API call
    // and verifying the error boundary catches the resulting error

    // Verify error boundary UI is shown
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('allows recovery from errors', async () => {
    render(<App />);

    // After an error occurs, user should be able to recover
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Should return to normal operation
    expect(screen.getByText(/create your project blueprint/i)).toBeInTheDocument();
  });
});
```

This comprehensive integration testing documentation ensures that all components, APIs, and user flows work together correctly, providing confidence in the system's reliability and user experience.
