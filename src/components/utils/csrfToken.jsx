/**
 * Frontend CSRF Token Management
 * Generates and stores CSRF tokens for state-changing requests
 */

const CSRF_TOKEN_KEY = 'csrf_token';

/**
 * Generate CSRF token for this session
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Store in sessionStorage (not localStorage - session-specific)
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  return token;
}

/**
 * Get CSRF token from session storage
 * Generate new one if doesn't exist
 * @returns {string} CSRF token
 */
export function getCSRFToken() {
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (!token) {
    token = generateCSRFToken();
  }
  return token;
}

/**
 * Clear CSRF token (on logout)
 */
export function clearCSRFToken() {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
}

/**
 * Add CSRF token to request headers
 * @param {object} config - Axios config or fetch options
 * @returns {object} Updated config with CSRF token
 */
export function addCSRFTokenToRequest(config) {
  const token = getCSRFToken();
  
  if (config.headers) {
    config.headers['X-CSRF-Token'] = token;
  } else {
    config.headers = { 'X-CSRF-Token': token };
  }
  
  return config;
}

/**
 * Initialize CSRF protection on page load
 */
export function initCSRFProtection() {
  // Generate token if session is new
  if (!sessionStorage.getItem(CSRF_TOKEN_KEY)) {
    generateCSRFToken();
  }
  
  // Clean up on logout
  const logoutButton = document.querySelector('[data-logout]');
  if (logoutButton) {
    logoutButton.addEventListener('click', clearCSRFToken);
  }
}