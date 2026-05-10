/**
 * Action Debugger - dev-only instrumentation for button/async actions.
 * Enable via: localStorage.setItem('7pct_debug', '1') in browser console.
 *
 * Usage:
 *   import { useActionDebug, withActionDebug } from '@/components/debug/ActionDebugger';
 *
 *   // Hook form:
 *   const debug = useActionDebug();
 *   const handleClick = debug.wrap('Generate Workout', async () => { ... });
 *
 *   // HOF form:
 *   const handler = withActionDebug('Subscribe', async () => { ... });
 */
import { useCallback } from 'react';
import { toast } from 'sonner';

const IS_DEBUG = () => {
  try {
    return localStorage.getItem('7pct_debug') === '1';
  } catch {
    return false;
  }
};

function log(action, event, extra) {
  if (!IS_DEBUG()) return;
  const ts = new Date().toISOString();
  console.log(`[7%Debug] [${ts}] ${action} - ${event}`, extra || '');
}

function debugToast(msg) {
  if (!IS_DEBUG()) return;
  toast.info(msg, { duration: 2500, position: 'bottom-right' });
}

/**
 * Wrap an async handler with:
 *  - debug logging
 *  - try/catch
 *  - 10-second timeout
 *  - guaranteed loading=false in finally
 */
export function withActionDebug(actionName, fn, { setLoading, onError } = {}) {
  return async (...args) => {
    log(actionName, 'started');
    debugToast(`Action started: ${actionName}`);

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timedOut = false;

    const timeoutId = setTimeout(() => {
      timedOut = true;
      if (controller) controller.abort();
      if (setLoading) setLoading(false);
      log(actionName, 'TIMEOUT after 10s');
      toast.error('Something went wrong. Please try again.');
    }, 10000);

    try {
      // Pass signal as last arg if fn accepts it (optional)
      const result = await fn(...args, controller ? controller.signal : undefined);
      if (!timedOut) {
        clearTimeout(timeoutId);
        log(actionName, 'completed');
        debugToast(`Action complete: ${actionName}`);
      }
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      if (timedOut) return; // already handled
      log(actionName, 'ERROR', err);
      if (onError) {
        onError(err);
      } else {
        toast.error(err.message || 'Something went wrong. Please try again.');
      }
      throw err;
    } finally {
      if (setLoading) setLoading(false);
    }
  };
}

/**
 * Hook that returns a .wrap(name, fn, opts) helper bound to component scope.
 */
export function useActionDebug() {
  const wrap = useCallback((actionName, fn, opts) => {
    return withActionDebug(actionName, fn, opts);
  }, []);
  return { wrap };
}

export default { withActionDebug, useActionDebug };