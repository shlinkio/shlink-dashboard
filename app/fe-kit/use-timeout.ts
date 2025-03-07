import { useCallback, useEffect, useMemo, useRef } from 'react';

export type Callback = () => unknown;

export type UseTimeoutResult = {
  /**
   * Clears any in-progress timeout, and schedules a new callback.
   * It optionally allows a delay to be provided, or falls back to the default delay otherwise.
   */
  setTimeout: (callback: Callback, delay?: number) => void;

  /** Clears any in-progress timeout */
  clearCurrentTimeout: () => void;
};

export function useTimeout(
  defaultDelay: number,

  /** Test seam. Defaults to global setTimeout */
  setTimeout_ = globalThis.setTimeout.bind(globalThis),
  /** Test seam. Defaults to global clearTimeout */
  clearTimeout_ = globalThis.clearTimeout.bind(globalThis),
): UseTimeoutResult {
  const timeoutRef = useRef<ReturnType<typeof setTimeout_> | null>(null);

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout_(timeoutRef.current);
    }
  }, [clearTimeout_]);

  const setTimeout = useCallback((callback: Callback, delay?: number) => {
    clearCurrentTimeout();
    timeoutRef.current = setTimeout_(() => {
      callback();
      timeoutRef.current = null;
    }, delay ?? defaultDelay);
  }, [clearCurrentTimeout, defaultDelay, setTimeout_]);

  // When unmounted, clear the last timeout, if any
  useEffect(() => clearCurrentTimeout, [clearCurrentTimeout]);

  return useMemo(
    () => ({ setTimeout, clearCurrentTimeout }),
    [clearCurrentTimeout, setTimeout],
  );
}
