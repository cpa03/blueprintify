import { useState, useEffect, useCallback } from "react";

interface UseLocalStorageOptions<T> {
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
}

/**
 * Custom hook for persisting state in localStorage
 * Handles JSON serialization, errors, and SSR compatibility
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if nothing is stored
 * @param options - Optional serializer configuration
 * @returns A tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Use custom serializer or default JSON serializer
  const serializer = options?.serializer || {
    read: (v: string) => {
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as unknown as T;
      }
    },
    write: (v: T) => JSON.stringify(v),
  };

  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? serializer.read(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, serializer.write(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue],
  );

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(serializer.read(event.newValue));
        } catch (error) {
          console.warn(
            `Error handling storage change for key "${key}":`,
            error,
          );
        }
      }
    };

    // Listen for changes
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [key, serializer]);

  return [storedValue, setValue];
}

/**
 * Custom hook for managing session persistence with automatic cleanup
 * Useful for temporary data that should be cleared on tab close
 *
 * @param key - The sessionStorage key
 * @param initialValue - The initial value if nothing is stored
 * @returns A tuple of [value, setValue] similar to useState
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const serializer = {
    read: (v: string) => {
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as unknown as T;
      }
    },
    write: (v: T) => JSON.stringify(v),
  };

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? serializer.read(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(key, serializer.write(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue],
  );

  return [storedValue, setValue];
}
