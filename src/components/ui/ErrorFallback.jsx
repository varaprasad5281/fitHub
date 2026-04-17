/**
 * Error Fallback Component
 * Consistent error state across app
 */

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorFallback({ error, title = 'Something went wrong', onRetry }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm mx-auto">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="gap-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg h-9"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}