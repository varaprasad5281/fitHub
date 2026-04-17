import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-amber-400 animate-spin`} />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function LoadingSkeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded-xl ${className}`} />
  );
}