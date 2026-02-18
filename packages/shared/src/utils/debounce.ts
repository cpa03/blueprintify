/**
 * Shared debounce utilities
 */

export function createDebouncedSaver<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): { debounced: T; flush: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: unknown[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T;

  const flush = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      fn();
      timeoutId = null;
    }
  };

  const cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { debounced, flush, cancel };
}
