/**
 * Initializes compatibility features at app startup
 * - Loads polyfills
 * - Sets up error tracking
 * - Initializes debug mode
 * Run this in App.jsx or Layout before any other components
 */

import { useEffect } from 'react';

export default function CompatibilityInitializer() {
  useEffect(() => {
    // 1. Load polyfills (should already be in HTML but ensure)
    initializePolyfills();
    
    // 2. Setup global error handlers
    setupErrorHandlers();
    
    // 3. Setup iOS Safari specific fixes
    setupIOSSafariFixes();
    
    // 4. Setup session persistence
    setupSessionPersistence();
    
    console.log('[7%] Compatibility initialized');
  }, []);

  return null;
}

function initializePolyfills() {
  // Promise
  if (typeof Promise === 'undefined') {
    console.warn('[7%] Polyfilling Promise');
  }
  
  // fetch
  if (typeof fetch === 'undefined') {
    console.warn('[7%] Polyfilling fetch');
  }
  
  // URLSearchParams
  if (typeof URLSearchParams === 'undefined') {
    console.warn('[7%] Polyfilling URLSearchParams');
  }
  
  // AbortController
  if (typeof AbortController === 'undefined') {
    console.warn('[7%] Polyfilling AbortController');
  }
  
  // Object.fromEntries
  if (!Object.fromEntries) {
    console.warn('[7%] Polyfilling Object.fromEntries');
  }
}

function setupErrorHandlers() {
  // Global error handler
  window.addEventListener('error', (event) => {
    const error = {
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString(),
    };
    
    if (window.__7pctCompat) {
      window.__7pctCompat.errors.push(error);
      // Keep only last 100 errors
      if (window.__7pctCompat.errors.length > 100) {
        window.__7pctCompat.errors.shift();
      }
    }
    
    console.error('[7%Error]', error);
  });

  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const error = {
      type: 'unhandledRejection',
      reason: event.reason?.message || String(event.reason),
      timestamp: new Date().toISOString(),
    };
    
    if (window.__7pctCompat) {
      window.__7pctCompat.errors.push(error);
      if (window.__7pctCompat.errors.length > 100) {
        window.__7pctCompat.errors.shift();
      }
    }
    
    console.error('[7%UnhandledRejection]', error);
  });
}

function setupIOSSafariFixes() {
  // Fix 100vh on iOS Safari
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
  
  // Prevent pinch zoom on inputs (iOS Safari)
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Force 16px font size on inputs to prevent zoom on iOS
  const style = document.createElement('style');
  style.textContent = `
    input[type="text"],
    input[type="email"],
    input[type="number"],
    input[type="tel"],
    input[type="password"],
    textarea,
    select {
      font-size: 16px !important;
    }
  `;
  document.head.appendChild(style);
}

function setupSessionPersistence() {
  // Ensure auth token is persisted properly on reload
  const persistAuthOnBeforeUnload = () => {
    try {
      const auth = localStorage.getItem('auth_token');
      if (auth) {
        sessionStorage.setItem('auth_token_backup', auth);
      }
    } catch (e) {
      console.warn('[7%] Could not persist auth token');
    }
  };

  window.addEventListener('beforeunload', persistAuthOnBeforeUnload);
  
  // On page load, restore auth if available
  try {
    const backed = sessionStorage.getItem('auth_token_backup');
    if (backed && !localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', backed);
    }
  } catch (e) {
    console.warn('[7%] Could not restore auth token');
  }
}