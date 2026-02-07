import { useState, useEffect, useRef } from "react";
import { TIMEOUTS } from "../config/constants";

export type SaveStatus = "idle" | "saving" | "saved";

export function useSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "blueprint-wizard") {
        setStatus("saving");

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setStatus("saved");

          timeoutRef.current = setTimeout(() => {
            setStatus("idle");
          }, TIMEOUTS.SAVE_INDICATOR_DISPLAY);
        }, TIMEOUTS.SAVE_TRANSITION_DELAY);
      }
    };

    const handleManualSave = () => {
      setStatus("saving");

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setStatus("saved");

        timeoutRef.current = setTimeout(() => {
          setStatus("idle");
        }, TIMEOUTS.SAVE_INDICATOR_DISPLAY);
      }, TIMEOUTS.SAVE_TRANSITION_DELAY);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "blueprint-save",
      handleManualSave as EventListener,
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "blueprint-save",
        handleManualSave as EventListener,
      );
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const triggerSave = () => {
    window.dispatchEvent(new CustomEvent("blueprint-save"));
  };

  return { status, triggerSave };
}
