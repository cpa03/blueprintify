/**
 * A custom hook that syncs a value with localStorage
 *
 * @param key - The localStorage key to use
 * @param initialValue - The initial value to use if no value is stored
 * @returns A tuple of [value, setValue, removeValue]
 *
 * @example
 * ```tsx
 * const [name, setName, removeName] = useLocalStorage('name', 'Guest');
 * // name will be persisted to localStorage
 * ```
 */
export declare function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void];
/**
 * A variant of useLocalStorage that only reads from localStorage on mount
 * and doesn't write back automatically. Useful for read-only scenarios.
 */
export declare function useLocalStorageRead<T>(key: string, initialValue: T): T;
