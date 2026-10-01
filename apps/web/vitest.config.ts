import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const reactPlugin = react() as unknown as import("vite").Plugin[];

export default defineConfig({
  plugins: [reactPlugin],
  test: {
    environment: "jsdom",
    globals: true,
    unstubGlobals: true,
    setupFiles: ["./src/test/setup.ts"],
    isolate: true,
    pool: "forks",
    exclude: ["node_modules/", "e2e/", "dist/"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ["node_modules/", "src/test/", "e2e/", "**/*.d.ts", "**/*.config.*"],
      // Coverage gate: floors set below 2026-08-03 baselines (statements 78.5%,
      // branches 67.4%, functions 78.4%, lines 79.8%) to avoid flaky CI.
      thresholds: {
        statements: 75,
        branches: 60,
        functions: 75,
        lines: 75,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
