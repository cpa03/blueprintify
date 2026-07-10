import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { CONTEXT_HOOK_ERRORS } from "@blueprint/shared";
import { STORAGE_KEYS } from "../config/keys";

interface ReducedMotionContextType {
  prefersReducedMotion: boolean;
  isLoading: boolean;
  userOverride: boolean | null;
  setUserOverride: (value: boolean | null) => void;
  resetToSystemPreference: () => void;
  getDuration: (normalDuration: number) => number;
  shouldAnimate: boolean;
}

const ReducedMotionContext = createContext<ReducedMotionContextType | undefined>(undefined);

interface ReducedMotionProviderProps {
  children: ReactNode;
  defaultReducedMotion?: boolean;
}

function getInitialOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION);
  return stored !== null ? stored === "true" : null;
}

function subscribeToMediaQuery(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  } else {
    mediaQuery.addListener(callback);
    return () => mediaQuery.removeListener(callback);
  }
}

function getMediaQuerySnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot(defaultValue: boolean): boolean {
  return defaultValue;
}

export function ReducedMotionProvider({
  children,
  defaultReducedMotion = false,
}: ReducedMotionProviderProps): JSX.Element {
  const [userOverride, setUserOverrideState] = useState<boolean | null>(() => getInitialOverride());

  const systemPreference = useSyncExternalStore(subscribeToMediaQuery, getMediaQuerySnapshot, () =>
    getServerSnapshot(defaultReducedMotion)
  );

  const prefersReducedMotion = userOverride !== null ? userOverride : systemPreference;

  const setUserOverride = useCallback((value: boolean | null): void => {
    setUserOverrideState(value);
    if (value !== null && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, String(value));
    } else if (value === null && typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.REDUCED_MOTION);
    }
  }, []);

  const resetToSystemPreference = useCallback((): void => {
    setUserOverrideState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.REDUCED_MOTION);
    }
  }, []);

  const getDuration = useCallback(
    (normalDuration: number): number => {
      return prefersReducedMotion ? 0 : normalDuration;
    },
    [prefersReducedMotion]
  );

  const shouldAnimate = !prefersReducedMotion;

  const value: ReducedMotionContextType = {
    prefersReducedMotion,
    isLoading: false,
    userOverride,
    setUserOverride,
    resetToSystemPreference,
    getDuration,
    shouldAnimate,
  };

  return <ReducedMotionContext.Provider value={value}>{children}</ReducedMotionContext.Provider>;
}

export function useReducedMotionContext(): ReducedMotionContextType {
  const context = useContext(ReducedMotionContext);

  if (context === undefined) {
    throw new Error(CONTEXT_HOOK_ERRORS.REDUCED_MOTION_CONTEXT);
  }

  return context;
}

export { ReducedMotionContext };
export type { ReducedMotionContextType, ReducedMotionProviderProps };
