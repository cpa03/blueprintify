/**
 * Shared debounce utilities
 */

export function createDebouncedSaver<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  delay: number
): { debounced: (...args: TArgs) => TReturn; flush: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const debounced = ((...args: TArgs) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      const argsToCall = lastArgs;
      lastArgs = null;
      if (argsToCall) {
        fn(...argsToCall);
      }
    }, delay);
  }) as (...args: TArgs) => TReturn;

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
