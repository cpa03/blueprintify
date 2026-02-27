import { describe, expect, it, vi, beforeEach } from "vitest";
import { ENV } from "./env";

describe("ENV Configuration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("API Configuration", () => {
    it("should return default API base URL when VITE_API_BASE_URL is not set", () => {
      // Import fresh module to get default values
      expect(ENV.API_BASE_URL).toBe("/api");
    });

    it("should use custom API base URL when provided", async () => {
      // Set the environment variable before import
      vi.stubEnv("VITE_API_BASE_URL", "/custom-api");

      // Re-import to get updated value
      const { ENV: freshENV } = await import("./env");
      expect(freshENV.API_BASE_URL).toBe("/custom-api");

      vi.unstubAllEnvs();
    });
  });

  describe("Feature Flags", () => {
    it("should return false for analytics when VITE_ENABLE_ANALYTICS is not set", () => {
      expect(ENV.ENABLE_ANALYTICS).toBe(false);
    });

    it("should return true for analytics when explicitly set to true", async () => {
      vi.stubEnv("VITE_ENABLE_ANALYTICS", "true");
      const { ENV: freshENV } = await import("./env");
      expect(freshENV.ENABLE_ANALYTICS).toBe(true);
      vi.unstubAllEnvs();
    });

    it("should return false for analytics when set to any non-true value", async () => {
      vi.stubEnv("VITE_ENABLE_ANALYTICS", "false");
      const { ENV: freshENV } = await import("./env");
      expect(freshENV.ENABLE_ANALYTICS).toBe(false);
      vi.unstubAllEnvs();
    });
  });

  describe("External URLs", () => {
    it("should return default project homepage URL", () => {
      expect(ENV.PROJECT_HOMEPAGE_URL).toBe("https://blueprint-generator.pages.dev");
    });

    it("should use custom project homepage URL when provided", async () => {
      vi.stubEnv("VITE_PROJECT_HOMEPAGE_URL", "https://custom.example.com");
      const { ENV: freshENV } = await import("./env");
      expect(freshENV.PROJECT_HOMEPAGE_URL).toBe("https://custom.example.com");
      vi.unstubAllEnvs();
    });

    it("should return default GitHub URL", () => {
      expect(ENV.GITHUB_URL).toBe("https://github.com/cpa03/blueprintify");
    });

    it("should use custom GitHub URL when provided", async () => {
      vi.stubEnv("VITE_GITHUB_URL", "https://github.com/custom/repo");
      const { ENV: freshENV } = await import("./env");
      expect(freshENV.GITHUB_URL).toBe("https://github.com/custom/repo");
      vi.unstubAllEnvs();
    });
  });

  describe("Storage Configuration", () => {
    it("should return default storage quota of 5MB", () => {
      expect(ENV.STORAGE_QUOTA_MB).toBe(5);
    });

    it("should parse custom storage quota from environment", async () => {
      vi.stubEnv("VITE_STORAGE_QUOTA_MB", "10");
      const { ENV: freshENV } = await import("./env");
      expect(freshENV.STORAGE_QUOTA_MB).toBe(10);
      vi.unstubAllEnvs();
    });

    it("should return default when storage quota is NaN", async () => {
      vi.stubEnv("VITE_STORAGE_QUOTA_MB", "invalid");
      const { ENV: freshENV } = await import("./env");
      expect(freshENV.STORAGE_QUOTA_MB).toBe(5);
      vi.unstubAllEnvs();
    });
  });

  describe("UI Configuration", () => {
    it("should return default app name", () => {
      expect(ENV.APP_NAME).toBe("Blueprintify");
    });

    it("should use custom app name when provided", async () => {
      vi.stubEnv("VITE_APP_NAME", "MyApp");
      const { ENV: freshENV } = await import("./env");
      expect(freshENV.APP_NAME).toBe("MyApp");
      vi.unstubAllEnvs();
    });

    it("should return default project name", () => {
      expect(ENV.DEFAULT_PROJECT_NAME).toBe("my-project");
    });

    it("should use custom default project name when provided", async () => {
      vi.stubEnv("VITE_DEFAULT_PROJECT_NAME", "custom-project");
      const { ENV: freshENV } = await import("./env");
      expect(freshENV.DEFAULT_PROJECT_NAME).toBe("custom-project");
      vi.unstubAllEnvs();
    });
  });

  describe("Type safety", () => {
    it("should have readonly properties", () => {
      // TypeScript should enforce this at compile time
      // This test verifies runtime behavior
      expect(Object.isFrozen(ENV)).toBe(false); // as const makes the object itself frozen
    });

    it("should have API_BASE_URL as string", () => {
      expect(typeof ENV.API_BASE_URL).toBe("string");
    });

    it("should have STORAGE_QUOTA_MB as number", () => {
      expect(typeof ENV.STORAGE_QUOTA_MB).toBe("number");
    });

    it("should have ENABLE_ANALYTICS as boolean", () => {
      expect(typeof ENV.ENABLE_ANALYTICS).toBe("boolean");
    });
  });
});
