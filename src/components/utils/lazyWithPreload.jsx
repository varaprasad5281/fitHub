import { lazy } from 'react';

/**
 * Enhanced lazy loading with preload capability
 * Allows preloading components before they're needed
 */
export function lazyWithPreload(importFunc) {
  const Component = lazy(importFunc);
  Component.preload = importFunc;
  return Component;
}

// Export common preload patterns
export const preloadOnHover = (component) => {
  if (component.preload) {
    component.preload();
  }
};

export const preloadOnVisible = (component) => {
  if (component.preload) {
    setTimeout(() => component.preload(), 100);
  }
};