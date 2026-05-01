/**
 * @fileoverview Generic Persistence Logic for Zustand Stores
 *
 * Provides a standardized way to persist Zustand store data to a
 * storage backend (like localStorage) with debouncing.
 *
 * @module store/persistence
 */

import { createDebouncedSaver } from "@blueprint/shared";

/** Generic interface for storage backends */
export interface PersistedStorage<T> {
  get: () => Promise<T | null>;
  set: (data: T) => Promise<void>;
  remove: () => Promise<void>;
}

export interface PersistedStoreConfig<TData, TState> {
  storage: PersistedStorage<TData>;
  debounceDelay: number;
  getPersistData: (state: TState) => TData;
  onLoad?: (data: TData) => void;
}

export function createPersistedStore<TData, TState>(
  config: PersistedStoreConfig<TData, TState>,
) {
  const { storage, debounceDelay, getPersistData, onLoad } = config;

  let cancelFn: (() => void) | null = null;
  let flushFn: (() => void) | null = null;

  const loadState = async (
    set: (state: Partial<TState>, replace?: boolean) => void,
  ) => {
    try {
      const stored = await storage.get();
      if (stored) {
        set(stored as unknown as Partial<TState>, true);
        onLoad?.(stored);
      }
    } catch {
      // Silently fail to maintain UX
    }
  };

  const saveState = async (get: () => TState) => {
    try {
      const data = getPersistData(get());
      await storage.set(data);
    } catch {
      // Silently fail to maintain UX
    }
  };

  const { debounced, cancel, flush } = createDebouncedSaver(
    saveState as any,
    debounceDelay,
  );

  cancelFn = cancel;
  flushFn = flush;

  return {
    loadState,
    saveState,
    debouncedSave: debounced as unknown as (get: () => TState) => void,
    cancelSave: () => cancelFn?.(),
    flushSave: () => flushFn?.(),
  };
}
