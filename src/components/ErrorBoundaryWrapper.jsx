/**
 * Error Boundary Wrapper for Critical Pages
 * Wraps pages with error boundaries and provides recovery UI
 */

import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

export function withErrorBoundary(Component, options = {}) {
  const {
    name = Component.name || 'Component',
    onError = null,
    resetKeys = []
  } = options;

  return function ErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary key={resetKeys.join('-')} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default withErrorBoundary;