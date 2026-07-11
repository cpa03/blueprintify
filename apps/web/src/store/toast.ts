/**
 * Toast Notification State Management Store
 *
 * Manages toast notifications for user feedback throughout the application.
 * Provides a centralized system for displaying success, error, warning, and info messages.
 *
 * Features:
 * - Multiple toast types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Unique ID generation for each toast
 * - Clear API for adding, removing, and clearing toasts
 * - Convenient hook for type-specific toast methods
 *
 * @see apps/web/src/components/Toast.tsx - Toast UI component
 * @see docs/user-guide.md - User feedback documentation
 */

import { create } from "zustand";
import { TOAST_CONFIG } from "../config/constants";
import { ID_GENERATION_CONFIG, TOAST_TYPES } from "@blueprint/shared/config";

const { RANDOM_STRING_START_INDEX, RANDOM_STRING_LENGTH, ALPHANUMERIC_RADIX } =
  ID_GENERATION_CONFIG;
const END_INDEX = RANDOM_STRING_START_INDEX + RANDOM_STRING_LENGTH;

/**
 * Available toast notification types.
 *
 * - `success` - Indicates successful operations (green styling)
 * - `error` - Indicates errors or failures (red styling)
 * - `warning` - Indicates caution or potential issues (yellow styling)
 * - `info` - Provides informational messages (blue styling)
 */
export type ToastType = (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES];

/**
 * Represents a single toast notification.
 *
 * @property id - Unique identifier for the toast
 * @property message - The display message content
 * @property type - The toast type determining styling and icon
 * @property duration - Optional custom duration in milliseconds (defaults to TOAST_CONFIG.DEFAULT_DURATION)
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Internal toast state shape.
 */
interface ToastState {
  toasts: Toast[];
}

/**
 * Toast store interface with actions for state manipulation.
 *
 * @extends ToastState - Base state containing the toast array
 * @property addToast - Display a new toast notification with automatic dismissal
 * @property removeToast - Remove a specific toast by ID
 * @property clearAll - Remove all active toasts immediately
 */
interface ToastStore extends ToastState {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>()((set, get) => ({
  toasts: [],

  /**
   * Adds a new toast notification to the queue.
   * Automatically schedules removal after the specified duration.
   *
   * @param message - The notification message to display
   * @param type - The toast type (success, info, warning, error)
   * @param duration - Optional duration in milliseconds (defaults to TOAST_CONFIG.DEFAULT_DURATION)
   */
  addToast: (message: string, type: ToastType, duration = TOAST_CONFIG.DEFAULT_DURATION) => {
    const id = `toast-${Date.now()}-${Math.random().toString(ALPHANUMERIC_RADIX).substring(RANDOM_STRING_START_INDEX, END_INDEX)}`;
    const toast: Toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  /**
   * Removes a specific toast from the queue by ID.
   *
   * @param id - The unique identifier of the toast to remove
   */
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
 * Convenience hook for displaying toast notifications.
 * Provides type-specific methods for common use cases.
 *
 * @returns Object with success, info, warning, and error methods
 *
 * @example
 * const toast = useToast();
 * toast.success("Operation completed!");
 * toast.error("Something went wrong");
 */
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);

  return {
    success: (message: string, duration?: number) =>
      addToast(message, TOAST_TYPES.SUCCESS, duration),
    info: (message: string, duration?: number) => addToast(message, TOAST_TYPES.INFO, duration),
    warning: (message: string, duration?: number) =>
      addToast(message, TOAST_TYPES.WARNING, duration),
    error: (message: string, duration?: number) => addToast(message, TOAST_TYPES.ERROR, duration),
  };
};
