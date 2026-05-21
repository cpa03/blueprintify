import { vi } from "vitest";
import { SSE_HEADERS } from "@blueprint/shared";

export interface TestBlueprint {
  projectName: string;
  description: string;
  blueprint: string;
  tasks: string;
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface TestProjectData {
  projectName: string;
  description: string;
  blueprint: string;
  tasks: string;
  metadata: {
    version: string;
    createdAt: string;
  };
}

export function createTestBlueprint(overrides?: Partial<TestBlueprint>): TestBlueprint {
  const now = new Date().toISOString();
  return {
    projectName: "Test Project",
    description: "A comprehensive test project for integration testing",
    blueprint: `# Test Project\n\n## Overview\nThis is a test blueprint for integration testing.\n\n## Architecture\n- Frontend: React + Vite\n- Backend: Cloudflare Workers\n\n## Features\n- Feature 1\n- Feature 2\n`,
    tasks: `## Implementation Tasks\n\n### Phase 1\n- [ ] Setup project structure\n- [ ] Configure build tools\n- [ ] Initialize repository\n\n### Phase 2\n- [ ] Implement core features\n- [ ] Add authentication\n- [ ] Setup database\n`,
    metadata: {
      version: "1.0.0",
      createdAt: now,
      updatedAt: now,
    },
    ...overrides,
  };
}

export function createTestProjectData(overrides?: Partial<TestProjectData>): TestProjectData {
  return {
    projectName: "Integration Test Project",
    description: "Testing import/export functionality",
    blueprint: "# Integration Test\n\n## Purpose\nTest data for integration testing.\n",
    tasks: "## Tasks\n- [ ] Test import\n- [ ] Test export\n",
    metadata: {
      version: "1.0.0",
      createdAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function createInvalidBlueprint(): Record<string, unknown> {
  return {
    projectName: "",
    description: 123,
    blueprint: null,
  };
}

export function createLargeBlueprint(sizeInKB: number): TestBlueprint {
  const largeContent = "x".repeat(sizeInKB * 1024);
  return createTestBlueprint({
    projectName: "Large Test Project",
    description: largeContent,
  });
}

export function createMalformedData(): unknown {
  return "invalid json structure {{{{";
}

export const mockStorageData = {
  session: {
    projectName: "Stored Project",
    description: "From storage",
    blueprint: "# Stored\n",
    tasks: "## Tasks\n",
    currentStep: 3,
  },
  metadata: {
    lastSaved: new Date().toISOString(),
    version: "1.0.0",
  },
};

export function setupFetchMock(response: Response | Promise<Response>) {
  const mockFetch = vi.fn().mockResolvedValue(response);
  global.fetch = mockFetch;
  return mockFetch;
}

export function createMockResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function createMockStreamResponse(chunks: string[]) {
  const stream = new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => {
        controller.enqueue(new TextEncoder().encode(chunk));
      });
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": SSE_HEADERS.CONTENT_TYPE,
      "Cache-Control": SSE_HEADERS.CACHE_CONTROL,
    },
  });
}

export const testScenarios = {
  validGeneration: {
    projectName: "E-commerce Platform",
    description: "A full-stack e-commerce platform with React frontend and Node.js backend",
  },
  emptyProjectName: {
    projectName: "",
    description: "Valid description",
  },
  emptyDescription: {
    projectName: "Test Project",
    description: "",
  },
  specialCharacters: {
    projectName: "Project!@#$%^&*()",
    description: "Description with <script>alert('xss')</script>",
  },
  unicodeContent: {
    projectName: "プロジェクト 项目 프로젝트",
    description: "Testing unicode support: 你好世界 🌍 مرحبا",
  },
  veryLongDescription: {
    projectName: "Long Description Test",
    description: "x".repeat(10000),
  },
};
