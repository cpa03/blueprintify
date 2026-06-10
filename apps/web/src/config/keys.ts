/**
 * Storage Keys Module
 * All localStorage/sessionStorage keys centralized
 * Flexy says: No hardcoded "blueprint" namespace!
 */

import { SHARED_DEFAULTS } from "@blueprint/shared";

const NAMESPACE = SHARED_DEFAULTS.STORAGE_NAMESPACE;

const createKey = (key: string): string => `${NAMESPACE}-${key}`;

export const STORAGE_KEYS = {
  WIZARD: createKey("wizard"),
  EDITOR: createKey("editor"),
  REDUCED_MOTION: createKey("reduced-motion"),
  THEME: createKey("theme"),
  PREFERENCES: createKey("preferences"),
  LAST_VISITED: createKey("last-visited"),
  ONBOARDING_COMPLETED: createKey("onboarding-completed"),
  RECENT_TEMPLATES: createKey("recent-templates"),
} as const;

export const SESSION_KEYS = {
  SESSION_ID: createKey("session-id"),
  GENERATION_PROGRESS: createKey("generation-progress"),
  TEMP_FORM_DATA: createKey("temp-form-data"),
} as const;

export const COOKIE_KEYS = {
  ANALYTICS_CONSENT: `${NAMESPACE}_analytics_consent`,
  COOKIE_CONSENT: `${NAMESPACE}_cookie_consent`,
} as const;

export const TEST_KEYS = {
  STORAGE_TEST: "__storage_test__",
  PRIVACY_TEST: "__privacy_test__",
} as const;

export const BACKUP_KEY_PREFIX = "__backup__";

export const createBackupKey = (key: string): string => `${BACKUP_KEY_PREFIX}${key}`;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
export type SessionKey = (typeof SESSION_KEYS)[keyof typeof SESSION_KEYS];
export type CookieKey = (typeof COOKIE_KEYS)[keyof typeof COOKIE_KEYS];

export const getAllStorageKeys = (): string[] => Object.values(STORAGE_KEYS);
export const getAllSessionKeys = (): string[] => Object.values(SESSION_KEYS);
export const isAppStorageKey = (key: string): boolean => key.startsWith(NAMESPACE);
