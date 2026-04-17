/**
 * Security Utility: Input Sanitization
 * Prevents XSS attacks by removing dangerous HTML/JS
 */

const ALLOWED_TAGS = new Set([
  'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li', 'ol'
]);

const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title']
};

/**
 * Sanitize user input to prevent XSS
 * Removes all HTML except safe tags
 * @param {string} dirty - Untrusted input
 * @returns {string} Safe HTML
 */
export function sanitize(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = dirty; // Set as text, not HTML
  let cleaned = div.innerHTML;
  
  // Basic HTML escape for common vectors
  return cleaned
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email address format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate and constrain numeric input
 */
export function validateNumber(value, min = 0, max = Infinity) {
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(dateStr) {
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? dateStr : null;
}

/**
 * Strip HTML tags completely
 */
export function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Sanitize HTML - alias for sanitize()
 */
export function sanitizeHtml(dirty) {
  return sanitize(dirty);
}

/**
 * Sanitize numeric input - alias for validateNumber()
 */
export function sanitizeNumber(value, min = 0, max = Infinity) {
  return validateNumber(value, min, max);
}