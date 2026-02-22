import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    poolOptions: {
      workers: {
        wrangler: {
          configPath: "./wrangler.test.toml",
        },
      },
    },
  },
});
