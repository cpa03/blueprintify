import {
  StorageService,
  wizardStorage,
  editorStorage,
  getStorageErrorMessage,
  withStorageRecovery,
} from "./storage";
import { STORAGE_OPERATION_NAMES } from "@blueprint/shared/config";
import { STORAGE_ERROR_MESSAGES } from "../config/constants";

export function createTypedStorage<T>(storageService: StorageService<T>): {
  getItem: (name: string) => Promise<T | null> | T | null;
  setItem: (name: string, value: T) => Promise<void> | void;
  removeItem: (name: string) => Promise<void> | void;
} {
  return {
    getItem: async (): Promise<T | null> => {
      try {
        return await storageService.get();
      } catch (error) {
        console.error(
          STORAGE_ERROR_MESSAGES.OPERATION_FAILED(STORAGE_OPERATION_NAMES.GET_ITEM),
          getStorageErrorMessage(error)
        );
        return null;
      }
    },

    setItem: async (_name: string, value: T): Promise<void> => {
      try {
        await storageService.set(value);
      } catch (error) {
        console.error(
          STORAGE_ERROR_MESSAGES.OPERATION_FAILED(STORAGE_OPERATION_NAMES.SET_ITEM),
          getStorageErrorMessage(error)
        );
        throw error;
      }
    },

    removeItem: async (): Promise<void> => {
      try {
        await storageService.remove();
      } catch (error) {
        console.error(
          STORAGE_ERROR_MESSAGES.OPERATION_FAILED(STORAGE_OPERATION_NAMES.REMOVE_ITEM),
          getStorageErrorMessage(error)
        );
        throw error;
      }
    },
  };
}

export const wizardZustandStorage = createTypedStorage(wizardStorage);
export const editorZustandStorage = createTypedStorage(editorStorage);

export async function checkStorageHealth(): Promise<{
  wizard: ReturnType<typeof wizardStorage.getHealth>;
  editor: ReturnType<typeof editorStorage.getHealth>;
  isHealthy: boolean;
}> {
  const wizardHealth = wizardStorage.checkHealth();
  const editorHealth = editorStorage.checkHealth();

  return {
    wizard: wizardHealth,
    editor: editorHealth,
    isHealthy: wizardHealth.isHealthy && editorHealth.isHealthy,
  };
}

export function getStorageMetrics(): {
  wizard: ReturnType<typeof wizardStorage.getMetrics>;
  editor: ReturnType<typeof editorStorage.getMetrics>;
} {
  return {
    wizard: wizardStorage.getMetrics(),
    editor: editorStorage.getMetrics(),
  };
}

export async function clearAllStorage(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await withStorageRecovery(async () => {
      await wizardStorage.remove();
    }, undefined);

    await withStorageRecovery(async () => {
      await editorStorage.remove();
    }, undefined);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getStorageErrorMessage(error),
    };
  }
}
