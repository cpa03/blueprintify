import { StateCreator } from "zustand";
import type { z } from "zod";
import { reliableStorage, type StorageOptions } from "./reliable-storage";

export interface ReliablePersistOptions<T> {
  name: string;
  partialize?: (state: T) => Partial<T>;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => T | Promise<T>;
  onRehydrateStorage?: (
    state: T,
  ) => ((persistedState?: T, error?: Error) => void) | void;
  storage?: StorageOptions;
  schema?: z.ZodSchema<T>;
}

export function reliablePersist<T>(
  config: ReliablePersistOptions<T>,
): (f: StateCreator<T>) => StateCreator<T> {
  return (create) => {
    return (set, get, api) => {
      const store = create(set, get, api) as T & { setState: any };

      let hydrationPromise: Promise<void> | null = null;

      const hydrate = async () => {
        try {
          const result = await reliableStorage.retrieve<T>(
            config.name,
            "localStorage",
            {
              enableBackups: true,
              enableValidation: !!config.schema,
              maxBackups: 3,
              schema: config.schema,
              fallbackStorage: ["sessionStorage", "memory"],
              ...config.storage,
            },
          );

          if (result.success && result.data !== null) {
            let hydratedState: T = result.data;

            if (config.version && config.migrate) {
              const storedVersion = result.metadata?.version
                ? parseInt(result.metadata.version)
                : 0;

              if (storedVersion < config.version) {
                hydratedState = await config.migrate(
                  hydratedState,
                  storedVersion,
                );
              }
            }

            if (config.partialize) {
              const partialized = config.partialize(hydratedState);
              set({ ...store, ...partialized });
            } else {
              set(hydratedState);
            }

            config.onRehydrateStorage?.(get())?.(get());
          } else {
            const error = result.error as Error | undefined;
            config.onRehydrateStorage?.(get())?.(get(), error);
          }
        } catch (error) {
          console.error(`Failed to hydrate store ${config.name}:`, error);
          config.onRehydrateStorage?.(get())?.(get(), error as Error);
        }
      };

      const originalSetState = store.setState;
      store.setState = (partial: any, replace?: any) => {
        const newState =
          typeof partial === "function" ? partial(get()) : partial;

        originalSetState(partial, replace);

        const currentState = get();
        const stateToPersist = config.partialize
          ? config.partialize(currentState)
          : currentState;

        reliableStorage
          .store(config.name, stateToPersist, "localStorage", {
            enableBackups: true,
            enableValidation: !!config.schema,
            maxBackups: 3,
            schema: config.schema,
            fallbackStorage: ["sessionStorage", "memory"],
            ...config.storage,
          })
          .catch((error) => {
            console.error(`Failed to persist store ${config.name}:`, error);
          });
      };

      (store as any).hydrate = () => {
        if (!hydrationPromise) {
          hydrationPromise = hydrate();
        }
        return hydrationPromise;
      };

      (store as any).getStorageHealth = () => {
        return reliableStorage.getHealth("localStorage");
      };

      (store as any).cleanup = async (maxAge?: number) => {
        return reliableStorage.cleanup("localStorage", maxAge);
      };

      hydrationPromise = hydrate();

      return store;
    };
  };
}

export function createReliablePersist<T>(
  name: string,
  schema?: z.ZodSchema<T>,
): (
  config: ReliablePersistOptions<T>,
) => ReturnType<typeof reliablePersist<T>> {
  return (config) => reliablePersist({ ...config, name, schema });
}
