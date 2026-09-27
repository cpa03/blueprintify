/**
 * Shared debounce utilities
 */

export function createDebouncedSaver<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): { debounced: T; flush: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: unknown[] | null = null;

  const debounced = ((...args: unknown[]) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      const argsToCall = lastArgs;
      lastArgs = null;
      fn(...(argsToCall ?? []));
    }, delay);
  }) as T;

  const flush = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      const argsToCall = lastArgs;
      lastArgs = null;
      if (argsToCall) {
        fn(...argsToCall);
      }
    }
  };

  const cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  return { debounced, flush, cancel };
}
