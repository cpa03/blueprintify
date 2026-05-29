import { DEFAULT_URLS, SHARED_DEFAULTS } from "@blueprint/shared";

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

  // External URLs (defaults from @blueprint/shared)
  get PROJECT_HOMEPAGE_URL(): string {
    return getEnvVar("VITE_PROJECT_HOMEPAGE_URL", DEFAULT_URLS.PROJECT_HOMEPAGE);
  },

  get GITHUB_URL(): string {
    return getEnvVar("VITE_GITHUB_URL", DEFAULT_URLS.GITHUB);
  },

  // Storage Configuration
  get STORAGE_QUOTA_MB(): number {
    return getNumericEnvVar("VITE_STORAGE_QUOTA_MB", SHARED_DEFAULTS.STORAGE_QUOTA_MB);
  },

  // UI Configuration
  get APP_NAME(): string {
    return getEnvVar("VITE_APP_NAME", SHARED_DEFAULTS.APP_NAME);
  },

  // Default Project Name
  get DEFAULT_PROJECT_NAME(): string {
    return getEnvVar("VITE_DEFAULT_PROJECT_NAME", SHARED_DEFAULTS.DEFAULT_PROJECT_NAME);
  },
} as const;

/**
 * Check if running in development mode
 * Centralizes import.meta.env.DEV checks across the codebase
 * Flexy says: No scattered import.meta.env.DEV - one single source of truth!
 */
export const isDev = (): boolean => import.meta.env.DEV;
