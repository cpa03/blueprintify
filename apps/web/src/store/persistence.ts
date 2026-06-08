import { STORAGE_ERROR_MESSAGES } from "../config/constants";
import type { StoreApi } from "zustand";

/**
 * Generic storage interface that the persistence utilities expect.
 * The type T represents the data shape being persisted (a subset of store state).
 */
export interface PersistedStorage<T> {
  get: () => Promise<T | null>;
  set: (data: T) => Promise<void>;
  remove?: () => Promise<void>;
}

/**
 * Configuration options for createPersistedStore
 * @template T - The type of data being persisted
 * @template S - The full store type
 */
export interface CreatePersistedStoreOptions<T, S> {
  /** The storage adapter for persisting data */
  storage: PersistedStorage<T>;
  /** Debounce delay in milliseconds */
  debounceDelay: number;
  /** Function to extract persistable data from store state */
  getPersistData: (state: S) => T;
}

/**
 * Creates persistence utilities for a Zustand store.
 * This encapsulates the common pattern of:
 * - Loading state from storage on init
 * - Saving state to storage with debouncing
 * - Providing flush/cancel actions
 *
 * @param options - Configuration for persistence behavior
 * @returns Object with loadState, saveState, debouncedSave, flushSave, cancelSave
 *
 * @example
 * ```typescript
 * type PersistedWizardData = Pick<WizardStore, 'projectName' | 'description' | 'techStack' | 'features' | 'targetAudience' | 'constraints'>;
 *
 * export const useWizardStore = create<WizardStore>()((set, get) => {
 *   const { loadState, saveState, debouncedSave, flushSave, cancelSave } =
 *     createPersistedStore<PersistedWizardData, WizardStore>({
 *       storage: wizardStorage as PersistedStorage<PersistedWizardData>,
 *       debounceDelay: DEBOUNCE_CONFIG.WIZARD,
 *       getPersistData: (state) => ({
 *         projectName: state.projectName,
 *         description: state.description,
 *         techStack: state.techStack,
 *         features: state.features,
 *         targetAudience: state.targetAudience,
 *         constraints: state.constraints,
 *       }),
 *     });
 *
 *   void loadState(set);
 *
 *   return {
 *     setProjectName: (projectName) => {
 *       set({ projectName });
 *       debouncedSave(get);
 *     },
 *     // ...
 *   };
 * });
 * ```
 */
export function createPersistedStore<T, S>(
  options: CreatePersistedStoreOptions<T, S>
): {
  loadState: (
    set:
      | ((partial: Partial<S> | ((state: S) => Partial<S>) | S, replace?: false) => void)
      | ((state: S | ((state: S) => S), replace: true) => void)
  ) => Promise<void>;
  saveState: (get: () => S) => Promise<void>;
  debouncedSave: (get: () => S) => void;
  flushSave: () => void;
  cancelSave: () => void;
} {
  const { storage, debounceDelay, getPersistData } = options;

  const loadState = async (set: StoreApi<S>["setState"]): Promise<void> => {
    try {
      const stored = await storage.get();
      if (stored !== null) {
        // Use merge (default) to preserve action functions that Zustand sets up
        // in the store creator. Using `replace=true` would nuke all action functions
        // (setProjectName, nextStep, etc.) since persisted data only contains fields.
        set(stored as Partial<S>);
      }
    } catch {
      console.warn(STORAGE_ERROR_MESSAGES.LOAD_FAILED);
    }
  };

  const saveState = async (get: () => S): Promise<void> => {
    try {
      const dataToSave = getPersistData(get());
      await storage.set(dataToSave);
    } catch {
      console.warn(STORAGE_ERROR_MESSAGES.SAVE_FAILED);
    }
  };

  // Debounce implementation - avoids complex type constraints from shared utility
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedSave = (get: () => S): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      saveState(get);
      timeoutId = null;
    }, debounceDelay);
  };

  const flushSave = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const cancelSave = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return {
    loadState,
    saveState,
    debouncedSave,
    flushSave,
    cancelSave,
  };
}
