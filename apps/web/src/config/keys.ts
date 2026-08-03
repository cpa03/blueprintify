/**
 * Storage Keys Module
 * All localStorage/sessionStorage keys centralized
 * Flexy says: No hardcoded "blueprint" namespace!
 */

import { SHARED_DEFAULTS, STORAGE_KEY_PREFIXES } from "@blueprint/shared/config";

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
  SHORTCUTS_DISCOVERED: createKey("shortcuts-discovered"),
} as const;

export const TEST_KEYS = {
  STORAGE_TEST: STORAGE_KEY_PREFIXES.STORAGE_TEST,
  PRIVACY_TEST: STORAGE_KEY_PREFIXES.PRIVACY_TEST,
} as const;

export const BACKUP_KEY_PREFIX = STORAGE_KEY_PREFIXES.BACKUP;
