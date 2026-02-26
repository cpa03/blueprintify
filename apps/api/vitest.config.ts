import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    env: {
      NODE_ENV: "test",
    },
    poolOptions: {
      workers: {
        wrangler: {
          configPath: "./wrangler.test.toml",
        },
      },
    },
  },
});
