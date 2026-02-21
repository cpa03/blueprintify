/**
 * @fileoverview Toast notification state management
 *
 * Provides a global toast notification system for displaying transient messages
 * to users. Supports multiple toast types (success, info, warning, error) with
 * auto-dismiss functionality.
 *
 * @module store/toast
 * @see {@link useToast} for the primary consumer hook
 * @see {@link TOAST_CONFIG} for configuration options
 */

import { create } from "zustand";
import { TOAST_CONFIG } from "../config/constants";
import { ID_GENERATION_CONFIG } from "@blueprint/shared";

const { RANDOM_STRING_START_INDEX, RANDOM_STRING_LENGTH, ALPHANUMERIC_RADIX } =
  ID_GENERATION_CONFIG;
const END_INDEX = RANDOM_STRING_START_INDEX + RANDOM_STRING_LENGTH;

/** Available toast notification types */
export type ToastType = "success" | "info" | "warning" | "error";

/**
 * Represents a single toast notification
 *
 * @property id - Unique identifier for the toast
 * @property message - The message to display
 * @property type - Visual style of the toast
 * @property duration - Time in ms before auto-dismiss (optional, uses default if not provided)
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/** Internal state containing the array of active toasts */
interface ToastState {
  toasts: Toast[];
}

/**
 * Toast store interface with actions for managing toast lifecycle
 *
 * @extends ToastState
 * @property addToast - Add a new toast notification
 * @property removeToast - Remove a toast by ID
 * @property clearAll - Remove all active toasts
 */
interface ToastStore extends ToastState {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

/**
 * Zustand store for managing toast notifications
 *
 * Handles the lifecycle of toast notifications including:
 * - Adding new toasts with unique IDs
 * - Auto-dismissing toasts after their duration expires
 * - Manual removal and clearing
 */
export const useToastStore = create<ToastStore>()((set, get) => ({
  toasts: [],

  addToast: (
    message: string,
    type: ToastType,
    duration = TOAST_CONFIG.DEFAULT_DURATION,
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(ALPHANUMERIC_RADIX).substring(RANDOM_STRING_START_INDEX, END_INDEX)}`;
    const toast: Toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

/**
 * Convenience hook for displaying toast notifications
 *
 * Provides a semantic API for showing toasts by type:
 * - `success(message)` - Green success toast
 * - `info(message)` - Blue info toast
 * - `warning(message)` - Yellow warning toast
 * - `error(message)` - Red error toast
 *
 * @returns Object with typed toast methods
 *
 * @example
 * ```tsx
 * const toast = useToast();
 * toast.success("Changes saved!");
 * toast.error("Failed to save", 5000); // Custom duration
 * ```
 */
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);

  return {
    success: (message: string, duration?: number) =>
      addToast(message, "success", duration),
    info: (message: string, duration?: number) =>
      addToast(message, "info", duration),
    warning: (message: string, duration?: number) =>
      addToast(message, "warning", duration),
    error: (message: string, duration?: number) =>
      addToast(message, "error", duration),
  };
};
