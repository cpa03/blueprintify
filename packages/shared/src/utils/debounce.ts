/**
 * Shared debounce utilities
 */

export function createDebouncedSaver<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): { debounced: T; flush: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;

  const debounced = ((...args: any[]) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T;

  const flush = (): any => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      let result;
      if (lastArgs) {
        result = fn(...lastArgs);
      } else {
        result = fn();
      }
      timeoutId = null;
      return result;
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
