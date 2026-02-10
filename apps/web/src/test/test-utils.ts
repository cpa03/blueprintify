import { vi } from "vitest";
import type { TechStackItemType } from "@blueprint/shared";

class LocalStorageMock {
  private store: Record<string, string> = {};
  private quota: number;
  private used: number = 0;

  constructor(quota: number = 5 * 1024 * 1024) {
    this.quota = quota;
  }

  clear(): void {
    this.store = {};
    this.used = 0;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    if (this.store[key]) {
      this.used -= this.store[key].length;
      delete this.store[key];
    }
  }

  setItem(key: string, value: string): void {
    const size = value.length;
    const existingSize = this.store[key]?.length || 0;
    const sizeDiff = size - existingSize;

    if (this.used + sizeDiff > this.quota) {
      const error = new Error("QuotaExceededError");
      error.name = "QuotaExceededError";
      throw error;
    }

    this.store[key] = value;
    this.used += sizeDiff;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  simulateCorruption(): void {
    this.store = {
      corrupted: "{invalid json data",
    };
  }

  getQuotaUsage(): { used: number; quota: number; percentage: number } {
    return {
      used: this.used,
      quota: this.quota,
      percentage: (this.used / this.quota) * 100,
    };
  }
}

class DownloadMock {
  private downloads: Array<{ filename: string; content: string }> = [];

  download(filename: string, content: string): void {
    this.downloads.push({ filename, content });
  }

  getLastDownload(): { filename: string; content: string } | null {
    return this.downloads[this.downloads.length - 1] || null;
  }

  getDownloadCount(): number {
    return this.downloads.length;
  }

  clear(): void {
    this.downloads = [];
  }

  findDownloadByFilename(
    filename: string,
  ): { filename: string; content: string } | null {
    return this.downloads.find((d) => d.filename === filename) || null;
  }
}

class ClipboardMock {
  private clipboard: string = "";

  async writeText(text: string): Promise<void> {
    this.clipboard = text;
  }

  async readText(): Promise<string> {
    return this.clipboard;
  }

  clear(): void {
    this.clipboard = "";
  }

  hasContent(): boolean {
    return this.clipboard.length > 0;
  }
}

class TestDataFactory {
  static createMockTechStack(): TechStackItemType[] {
    return [
      { name: "React", category: "frontend" },
      { name: "TypeScript", category: "other" },
      { name: "Tailwind CSS", category: "styling" },
      { name: "Node.js", category: "backend" },
    ];
  }

  static createMockProjectData() {
    return {
      projectName: "Test Project",
      description: "A test project for unit testing",
      techStack: this.createMockTechStack(),
      features: ["Feature 1", "Feature 2", "Feature 3"],
      targetAudience: "Developers",
      constraints: "Must be production-ready",
    };
  }

  static createMockEditorContent() {
    return {
      blueprint: "# Test Blueprint\n\nThis is a test blueprint document.",
      tasks: "# Test Tasks\n\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3",
    };
  }

  static createLargeContent(size: number = 100000): string {
    const lines = [];
    const baseContent =
      "This is a line of test content for performance testing. ";

    for (let i = 0; i < size; i++) {
      lines.push(`${baseContent} Line ${i + 1}`);
    }

    return lines.join("\n");
  }

  static createCorruptedJSON(): string {
    return '{"invalid": json content, "missing": "quotes}';
  }

  static createValidBlueprint(): string {
    return `# Test Blueprint

## Project Overview
This is a comprehensive test blueprint.

## Architecture
### Frontend
- React 18
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- PostgreSQL

## Features
- User authentication
- Real-time updates
- Data visualization

## API Endpoints
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

## Database Schema
Users table with id, name, email, created_at fields.
`;
  }

  static createValidTasks(): string {
    return `# Project Tasks

## Phase 1: Setup (Week 1)
- [ ] Initialize project repository
- [ ] Set up development environment
- [ ] Configure CI/CD pipeline
- [ ] Create database schema

## Phase 2: Backend Development (Week 2-3)
- [ ] Implement user authentication
- [ ] Create API endpoints
- [ ] Add data validation
- [ ] Write unit tests

## Phase 3: Frontend Development (Week 3-4)
- [ ] Build user interface
- [ ] Implement state management
- [ ] Add form validation
- [ ] Integrate with API

## Phase 4: Testing & Deployment (Week 5)
- [ ] Write integration tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deploy to production
`;
  }
}

class PerformanceUtils {
  static async measureTime<T>(
    fn: () => T | Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return { result, duration: end - start };
  }

  static measureMemory(): number {
    if (typeof performance !== "undefined" && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  static async measureRenderTime(
    component: () => void,
    iterations: number = 10,
  ): Promise<{ averageTime: number; minTime: number; maxTime: number }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureTime(component);
      times.push(duration);
    }

    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
    };
  }
}

class StreamUtils {
  static async *createMockStream(chunks: string[]): AsyncGenerator<string> {
    for (const chunk of chunks) {
      yield chunk;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  static async collectStream(stream: AsyncGenerator<string>): Promise<string> {
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return chunks.join("");
  }

  static createMockSSEChunks(content: string): string[] {
    const chunks = [];
    const chunkSize = 100;

    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      chunks.push(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    return chunks;
  }
}

class ErrorUtils {
  static simulateNetworkError(): Error {
    const error = new Error("Network request failed");
    error.name = "NetworkError";
    return error;
  }

  static simulateTimeoutError(): Error {
    const error = new Error("Request timeout");
    error.name = "TimeoutError";
    return error;
  }

  static simulateValidationError(field: string): Error {
    const error = new Error(`Validation failed for field: ${field}`);
    error.name = "ValidationError";
    return error;
  }

  static simulateAuthError(): Error {
    const error = new Error("Authentication failed");
    error.name = "AuthError";
    return error;
  }
}

function setupEnhancedMocks(): void {
  const localStorageMock = new LocalStorageMock();
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  const downloadMock = new DownloadMock();
  (global as any).downloadMock = downloadMock;

  global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
  global.URL.revokeObjectURL = vi.fn();

  const mockCreateElement = vi.fn((tagName: string) => {
    if (tagName === "a") {
      const element = document.createElement("a");
      element.href = "";
      element.download = "";
      element.click = vi.fn();
      return element;
    }
    return document.createElement(tagName);
  });
  Object.defineProperty(document, "createElement", {
    value: mockCreateElement,
    writable: true,
  });

  const clipboardMock = new ClipboardMock();
  Object.defineProperty(navigator, "clipboard", {
    value: clipboardMock,
    writable: true,
  });
}

export {
  LocalStorageMock,
  DownloadMock,
  ClipboardMock,
  TestDataFactory,
  PerformanceUtils,
  StreamUtils,
  ErrorUtils,
  setupEnhancedMocks,
};
