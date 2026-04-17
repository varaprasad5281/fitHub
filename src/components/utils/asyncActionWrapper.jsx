/**
 * Comprehensive async action wrapper for all backend/API operations
 * Ensures:
 * - 10s timeout on all requests
 * - Try/catch/finally with guaranteed loading state reset
 * - Clear error messages to user
 * - Debug logging
 */

import { toast } from 'sonner';

const DEBUG = () => {
  try {
    return localStorage.getItem('7pct_debug') === '1';
  } catch {
    return false;
  }
};

const log = (action, event, extra) => {
  if (!DEBUG()) return;
  const ts = new Date().toISOString();
  console.log(`[7%Action] [${ts}] ${action} — ${event}`, extra || '');
  if (window.__7pctCompat) {
    window.__7pctCompat.actions.push({ ts, action, event, extra });
  }
};

/**
 * Master wrapper for all async operations
 * @param {string} actionName - Name of the action
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} opts - Options: { setLoading, timeout, onError, showToast }
 */
export async function wrapAsyncAction(actionName, asyncFn, opts = {}) {
  const { 
    setLoading, 
    timeout = 10000, 
    onError, 
    showToast = true 
  } = opts;

  log(actionName, 'started');
  if (setLoading) setLoading(true);

  const controller = typeof AbortController !== 'undefined' 
    ? new AbortController() 
    : { signal: { aborted: false }, abort: () => {} };

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
    log(actionName, 'TIMEOUT', `${timeout}ms exceeded`);
    if (setLoading) setLoading(false);
    if (showToast) {
      toast.error('Request timed out. Please try again.');
    }
  }, timeout);

  try {
    log(actionName, 'executing');
    const result = await asyncFn(controller.signal);
    if (!timedOut) {
      clearTimeout(timeoutId);
      log(actionName, 'completed', 'Success');
    }
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (timedOut) return null; // Already handled
    
    const errorMsg = error?.message || String(error);
    log(actionName, 'ERROR', errorMsg);
    
    if (onError) {
      onError(error);
    } else if (showToast) {
      toast.error(errorMsg || 'Something went wrong. Please try again.');
    }
    
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
}

/**
 * Specialized wrapper for React Query mutations
 * Use this in useMutation hooks
 */
export function createMutationWrapper(asyncFn, opts = {}) {
  return async (...args) => {
    return wrapAsyncAction(
      opts.actionName || 'Operation',
      () => asyncFn(...args),
      opts
    );
  };
}

/**
 * Wrapper for API calls with fetch
 */
export async function fetchWithTimeout(url, options = {}, actionName = 'API Call') {
  return wrapAsyncAction(
    actionName,
    async (signal) => {
      const response = await fetch(url, {
        ...options,
        signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP ${response.status}`
        }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
      }

      return response.json();
    },
    { timeout: options.timeout || 10000, ...options }
  );
}

/**
 * Safe localStorage access for older devices
 */
export function safeLocalStorage() {
  try {
    return window.localStorage;
  } catch (e) {
    console.warn('[7%] localStorage unavailable, using fallback');
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }
}

export default {
  wrapAsyncAction,
  createMutationWrapper,
  fetchWithTimeout,
  safeLocalStorage,
};