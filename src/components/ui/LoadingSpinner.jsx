import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Premium loading spinner - elegant, smooth, never jarring
 */
export function LoadingSpinner({ size = 'md', label = null }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size] || 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClass} text-amber-400 animate-spin`} />
      {label && <p className="text-zinc-500 text-sm">{label}</p>}
    </div>
  );
}

export function FullPageLoader({ label = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}