/**
 * CompatibilityInit - loads polyfills on app boot
 * Import this in your main.jsx or AppWrapper to ensure polyfills load early
 */

import '@/components/utils/compatibilityPolyfills.js';

export function initCompatibility() {
  console.log('[7% Compat] Initialization complete');
}

export default { initCompatibility };