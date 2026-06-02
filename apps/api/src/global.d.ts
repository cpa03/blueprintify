/**
 * Type declarations for test environments (Vitest).
 * The API tsconfig uses @cloudflare/workers-types which doesn't include
 * Node.js globals like `process` and `global`. These declarations bridge
 * the gap for test files that run under Vitest's Node-like environment.
 */

declare const process: {
  env: Record<string, string | undefined>;
  on(event: string, listener: (...args: unknown[]) => void): void;
};
