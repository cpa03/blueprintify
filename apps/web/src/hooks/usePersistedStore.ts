/**
 * @fileoverview Reusable persistence utilities for Zustand stores
 *
 * This module provides a standardized pattern for persisting Zustand store
 * state to localStorage with debounced auto-save functionality.
 *
 * Features:
 * - Automatic state loading from storage on initialization
 * - Debounced saves to prevent excessive localStorage writes
 * - Manual flush and cancel controls
 * - Reset functionality to clear storage
 *
 * @module hooks/usePersistedStore
 */

import { createDebouncedSaver } from "@blueprint/shared";
import type { StorageService } from "../lib/storage";

export interface PersistedStoreConfig<T> {
  /** Storage service instance for persistence */
  storage: StorageService<T>;
  /** Debounce delay in milliseconds */
  debounceMs: number;
  /** Optional callback when load fails */
  onLoadError?: (error: unknown) => void;
  /** Optional callback when save fails */
  onSaveError?: (error: unknown) => void;
}

/**
 * Return type for createPersistedStore
 */
export interface PersistedStoreMethods {
  /** Load state from storage - call with set from zustand */
  loadState: <TSet>(set: TSet) => Promise<void>;
  /** Cancel any pending saves */
  cancelSave: () => void;
  /** Flush any pending save immediately */
  flushSave: () => void;
  /** Reset: clear storage */
  reset: () => Promise<void>;
  /**
   * Create the save trigger for a specific state getter
   * @param get - Function to get current state
   * @param getPersistedData - Function to extract persistable data
   */
  createSaveTrigger: <TState>(
    get: () => TState,
    getPersistedData: (state: TState) => Partial<TState>
  ) => () => void;
}

/**
 * Creates persistence methods for a Zustand store
 *
 * This factory function returns methods that handle the common pattern of:
 * - Loading state from storage on initialization
 * - Saving state to storage with debouncing
 * - Canceling/flushing pending saves
 * - Resetting (clearing) storage
 *
 * @param config - Configuration for the persistence methods
 * @returns Methods to use in the Zustand store creator
 *
 * @example
 * ```typescript
 * const { loadState, createSaveTrigger, cancelSave, reset } = createPersistedStore({
 *   storage: wizardStorage,
 *   debounceMs: 1000,
 *   getPersistedData: (state) => ({
 *     projectName: state.projectName,
 *     description: state.description,
 *     // ... other fields
 *   }),
 * });
 *
 * export const useWizardStore = create<WizardStore>()((set, get) => {
 *   // Load state on init
 *   void loadState(set);
 *
 *   return {
 *     ...initialState,
 *     setProjectName: (projectName) => {
 *       set({ projectName });
 *       createSaveTrigger(get, (s) => ({ projectName: s.projectName }))();
 *     },
 *     // ...
 *     reset: () => {
 *       cancelSave();
 *       set(initialState);
 *       void reset();
 *     },
 *   };
 * });
 * ```
 */
export function createPersistedStore<T>(config: PersistedStoreConfig<T>): PersistedStoreMethods {
  const { storage, debounceMs, onLoadError, onSaveError } = config;

  let cancelFn: (() => void) | null = null;
  let flushFn: (() => void) | null = null;

  const loadState = async <TSet>(set: TSet): Promise<void> => {
    // Use type assertion for Zustand's set function
    const zustandSet = set as <U>(state: U, replace?: boolean) => void;

    try {
      const stored = await storage.get();
      if (stored !== null) {
        const persistedState = stored as Partial<T>;
        zustandSet((state: T) => ({ ...state, ...persistedState }), true);
      }
    } catch (error) {
      console.warn("Failed to load state from storage:", error);
      onLoadError?.(error);
    }
  };

  const createSaveTrigger = <TState>(
    get: () => TState,
    getPersistedDataFn: (state: TState) => Partial<TState>
  ): (() => void) => {
    const saveState = async (): Promise<void> => {
      try {
        const current = get();
        const dataToSave = getPersistedDataFn(current);
        await storage.set(dataToSave as T);
      } catch (error) {
        console.warn("Failed to save state to storage:", error);
        onSaveError?.(error);
      }
    };

    const { debounced, cancel, flush } = createDebouncedSaver(saveState, debounceMs);
    cancelFn = cancel;
    flushFn = flush;

    return debounced;
  };

  const cancelSave = (): void => {
    if (cancelFn) {
      cancelFn();
    }
  };

  const flushSave = (): void => {
    if (flushFn) {
      flushFn();
    }
  };

  const reset = async (): Promise<void> => {
    cancelSave();
    try {
      await storage.remove();
    } catch (error) {
      console.warn("Failed to clear storage:", error);
    }
  };

  return {
    loadState,
    cancelSave,
    flushSave,
    reset,
    createSaveTrigger,
  };
}
