import { useEffect, useRef } from "react";
import { useToast } from "../store";
import { AUTO_SAVE_CONFIG, TOAST_CONFIG } from "../config/constants";

export function useAutoSaveToast(
  deps: unknown[],
  message: string = AUTO_SAVE_CONFIG.DEFAULT_MESSAGE,
  delay: number = AUTO_SAVE_CONFIG.DEFAULT_DELAY,
): void {
  const toast = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownInitial = useRef(false);

  useEffect(() => {
    if (!hasShownInitial.current) {
      hasShownInitial.current = true;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      toast.success(message, TOAST_CONFIG.AUTO_SAVE_DURATION);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
