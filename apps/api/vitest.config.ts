import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.test.toml" },
    }),
  ],
  test: {
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    exclude: ["node_modules/", "dist/"],
    env: {
      NODE_ENV: "test",
    },
  },
});
