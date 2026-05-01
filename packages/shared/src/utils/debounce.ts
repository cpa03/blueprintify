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

  const flush = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      if (lastArgs) {
        fn(...lastArgs);
      } else {
        fn();
      }
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
