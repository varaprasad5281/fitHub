/**
 * Wraps async actions with timeout, error handling, and compatibility debugging
 */

export function withCompatibilityWrapper(actionName, asyncFn, { debugger: dbg, timeout = 10000 } = {}) {
  return async (...args) => {
    dbg?.addLog(actionName, 'started');

    let timeoutId;
    let completed = false;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        dbg?.addLog(actionName, 'timeout', `Exceeded ${timeout}ms`);
        reject(new Error(`${actionName} timed out after ${timeout}ms`));
      }, timeout);
    });

    try {
      const result = await Promise.race([asyncFn(...args), timeoutPromise]);
      completed = true;
      clearTimeout(timeoutId);
      dbg?.addLog(actionName, 'completed');
      return result;
    } catch (error) {
      completed = true;
      clearTimeout(timeoutId);
      const errorMsg = error?.message || String(error);
      dbg?.addLog(actionName, 'failed', errorMsg);
      throw error;
    }
  };
}

/**
 * Wraps fetch calls with compatibility handling and debugging
 */
export async function compatibleFetch(url, options = {}, debugger_ = null) {
  const actionName = `Fetch: ${url.split('/').pop()}`;
  
  debugger_?.addLog(actionName, 'started');

  try {
    // Ensure we have required headers for older browsers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      timeout: options.timeout || 10000,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      debugger_?.addLog(actionName, 'failed', `HTTP ${response.status}: ${errorText.slice(0, 100)}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    debugger_?.addLog(actionName, 'completed');
    return response;
  } catch (error) {
    debugger_?.addLog(actionName, 'error', error.message);
    throw error;
  }
}

/**
 * Safely navigate to a new URL with fallback
 */
export function compatibleNavigate(url, debugger_ = null) {
  debugger_?.addLog(`Navigate: ${url}`, 'started');

  try {
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = url;
      debugger_?.addLog(`Navigate: ${url}`, 'completed');
    }
  } catch (error) {
    debugger_?.addLog(`Navigate: ${url}`, 'failed', error.message);
    throw error;
  }
}

/**
 * Safely parse JSON with fallback
 */
export function compatibleJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    console.warn('[7% Compat] JSON parse failed, returning empty object');
    return {};
  }
}

/**
 * Safely access nested properties
 */
export function safeGet(obj, path, defaultValue = null) {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current;
}

export default {
  withCompatibilityWrapper,
  compatibleFetch,
  compatibleNavigate,
  compatibleJsonParse,
  safeGet,
};