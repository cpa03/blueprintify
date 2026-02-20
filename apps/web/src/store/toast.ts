import { create } from "zustand";
import { TOAST_CONFIG } from "../config/constants";
import { ID_GENERATION_CONFIG } from "@blueprint/shared";

const { RANDOM_STRING_START_INDEX, RANDOM_STRING_LENGTH, ALPHANUMERIC_RADIX } =
  ID_GENERATION_CONFIG;
const END_INDEX = RANDOM_STRING_START_INDEX + RANDOM_STRING_LENGTH;

export type ToastType = "success" | "info" | "warning" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

interface ToastStore extends ToastState {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

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
