import { useEffect, useRef } from "react";
import { useToast } from "../store";

export function useAutoSaveToast(
  deps: unknown[],
  message = "Changes saved",
  delay = 1000,
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
      toast.success(message, 2000);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
