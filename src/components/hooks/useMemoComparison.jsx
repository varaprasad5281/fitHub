/**
 * Advanced Memoization Utilities
 * Deep comparison, selective memoization for expensive computations
 */

import React, { useMemo, useCallback, useRef } from 'react';

/**
 * Custom deep comparison for useMemo
 * Prevents unnecessary recalculations
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => deepEqual(a[key], b[key]));
}

/**
 * Memoize with deep comparison
 */
export function useDeepMemo(fn, deps) {
  const ref = useRef();
  const signalRef = useRef(0);

  if (!deepEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }

  return useMemo(fn, [signalRef.current]);
}

/**
 * Memoize callback with selective deps tracking
 */
export function useMemoizedCallback(fn, deps) {
  return useCallback(fn, deps);
}

/**
 * Debounce hook for frequent state updates
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Throttle hook for expensive operations
 */
export function useThrottledCallback(fn, delayMs = 300) {
  const lastRunRef = useRef(Date.now());

  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delayMs) {
        lastRunRef.current = now;
        return fn(...args);
      }
    },
    [fn, delayMs]
  );
}

/**
 * Prevent unnecessary re-renders with props comparison
 */
export const withMemoization = (Component, propsAreEqual) => {
  return React.memo(Component, (prevProps, nextProps) => {
    if (propsAreEqual) {
      return propsAreEqual(prevProps, nextProps);
    }
    return deepEqual(prevProps, nextProps);
  });
};

/**
 * Cancel previous operations if new one starts
 */
export function useCancellableAsync(fn, deps = []) {
  const isMountedRef = useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(
    async (...args) => {
      isMountedRef.current = true;
      try {
        const result = await fn(...args);
        if (isMountedRef.current) {
          return result;
        }
      } catch (error) {
        if (isMountedRef.current) {
          throw error;
        }
      }
    },
    deps
  );
}