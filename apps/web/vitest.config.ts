import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const reactPlugin = react() as unknown as import("vite").Plugin[];

export default defineConfig({
  plugins: [reactPlugin],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    isolate: true,
    pool: "forks",
    exclude: ["node_modules/", "e2e/"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ["node_modules/", "src/test/", "e2e/", "**/*.d.ts", "**/*.config.*"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
