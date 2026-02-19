/**
 * Web Environment Configuration
 * Type-safe environment variable handling for Vite
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  return value ?? defaultValue ?? "";
};

const getNumericEnvVar = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const ENV = {
  // API Configuration
  get API_BASE_URL(): string {
    return getEnvVar("VITE_API_BASE_URL", "/api");
  },

  // Feature Flags
  get ENABLE_ANALYTICS(): boolean {
    return getEnvVar("VITE_ENABLE_ANALYTICS", "false") === "true";
  },

  // External URLs
  get PROJECT_HOMEPAGE_URL(): string {
    return getEnvVar(
      "VITE_PROJECT_HOMEPAGE_URL",
      "https://blueprint-generator.pages.dev",
    );
  },

  get GITHUB_URL(): string {
    return getEnvVar(
      "VITE_GITHUB_URL",
      "https://github.com/cpa03/blueprintify",
    );
  },

  // Storage Configuration
  get STORAGE_QUOTA_MB(): number {
    return getNumericEnvVar("VITE_STORAGE_QUOTA_MB", 5);
  },

  // UI Configuration
  get APP_NAME(): string {
    return getEnvVar("VITE_APP_NAME", "Blueprintify");
  },

  // Default Project Name
  get DEFAULT_PROJECT_NAME(): string {
    return getEnvVar("VITE_DEFAULT_PROJECT_NAME", "my-project");
  },
} as const;
