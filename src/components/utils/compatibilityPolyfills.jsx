/**
 * Compatibility Polyfills for older browsers (iOS Safari < 12, Android Chrome < 51)
 * These are loaded early to prevent runtime errors
 */

// Promise polyfill (for very old browsers)
if (typeof Promise === 'undefined') {
  window.Promise = function(executor) {
    let state = 'pending';
    let value;
    let handlers = [];

    const settle = (newState, newValue) => {
      if (state === 'pending') {
        state = newState;
        value = newValue;
        handlers.forEach(h => handle(h));
        handlers = [];
      }
    };

    const handle = (handler) => {
      if (state === 'pending') {
        handlers.push(handler);
      } else {
        setTimeout(() => {
          handler(state, value);
        }, 0);
      }
    };

    this.then = function(onResolved, onRejected) {
      return new Promise((resolve, reject) => {
        handle((state, value) => {
          if (state === 'resolved') {
            try {
              resolve(onResolved ? onResolved(value) : value);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(onRejected ? onRejected(value) : value);
          }
        });
      });
    };

    try {
      executor(
        value => settle('resolved', value),
        reason => settle('rejected', reason)
      );
    } catch (e) {
      settle('rejected', e);
    }
  };
}

// fetch polyfill (for older Android)
if (typeof fetch === 'undefined') {
  window.fetch = function(url, options = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open(options.method || 'GET', url);
      
      Object.keys(options.headers || {}).forEach(key => {
        xhr.setRequestHeader(key, options.headers[key]);
      });

      xhr.onload = () => {
        resolve(new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
        }));
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Request timeout'));

      if (options.body) {
        xhr.send(options.body);
      } else {
        xhr.send();
      }
    });
  };

  // Response constructor
  window.Response = function(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.ok = this.status >= 200 && this.status < 300;

    this.json = () => Promise.resolve(JSON.parse(body));
    this.text = () => Promise.resolve(body);
  };
}

// URLSearchParams polyfill (for older iOS Safari)
if (typeof URLSearchParams === 'undefined') {
  window.URLSearchParams = function(init) {
    this.params = new Map();
    
    if (typeof init === 'string') {
      init.split('&').forEach(pair => {
        const [key, val] = pair.split('=');
        this.params.set(decodeURIComponent(key), decodeURIComponent(val || ''));
      });
    }
  };

  URLSearchParams.prototype.get = function(key) {
    return this.params.get(key);
  };

  URLSearchParams.prototype.set = function(key, val) {
    this.params.set(key, val);
  };

  URLSearchParams.prototype.toString = function() {
    const pairs = [];
    this.params.forEach((val, key) => {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    });
    return pairs.join('&');
  };
}

// AbortController polyfill (for older iOS Safari)
if (typeof AbortController === 'undefined') {
  window.AbortController = function() {
    this.signal = {};
    this.abort = () => {
      this.signal.aborted = true;
    };
  };

  window.AbortSignal = function() {
    this.aborted = false;
  };
}

// Object.fromEntries polyfill (iOS Safari < 12.1)
if (!Object.fromEntries) {
  Object.fromEntries = function(iterable) {
    const obj = {};
    for (const [key, value] of iterable) {
      obj[key] = value;
    }
    return obj;
  };
}

// Array.prototype.at() polyfill (older browsers)
if (!Array.prototype.at) {
  Array.prototype.at = function(index) {
    if (index < 0) {
      return this[this.length + index];
    }
    return this[index];
  };
}

// String.prototype.replaceAll polyfill
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(search, replace) {
    return this.split(search).join(replace);
  };
}

// IntersectionObserver polyfill (basic, for older Android)
if (typeof IntersectionObserver === 'undefined') {
  window.IntersectionObserver = function(callback) {
    this.callback = callback;
    this.observe = () => {};
    this.unobserve = () => {};
    this.disconnect = () => {};
  };
}

// ResizeObserver polyfill
if (typeof ResizeObserver === 'undefined') {
  window.ResizeObserver = function(callback) {
    this.callback = callback;
    this.observe = () => {};
    this.unobserve = () => {};
    this.disconnect = () => {};
  };
}

// Global error handler for compatibility issues
window.addEventListener('error', (event) => {
  if (window.__compatDebugger) {
    window.__compatDebugger.addLog(
      `JS Error: ${event.message.slice(0, 50)}`,
      'error',
      {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (window.__compatDebugger) {
    window.__compatDebugger.addLog(
      'Unhandled Promise Rejection',
      'error',
      {
        reason: event.reason?.message || String(event.reason),
      }
    );
  }
});

console.log('[7% Compat] Polyfills loaded');