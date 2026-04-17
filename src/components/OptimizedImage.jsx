import React, { useState } from 'react';
import { cn } from "@/lib/utils";

/**
 * Optimized image component with:
 * - Lazy loading
 * - Blur placeholder
 * - Error fallback
 * - Responsive sizing
 */
export default function OptimizedImage({ 
  src, 
  alt, 
  className,
  fallback,
  size = 'medium' // 'small' | 'medium' | 'large'
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Size classes for responsive optimization
  const sizeClasses = {
    small: 'max-w-[100px] max-h-[100px]',
    medium: 'max-w-[400px] max-h-[400px]',
    large: 'max-w-[800px] max-h-[800px]'
  };

  if (error || !src) {
    return (
      <div className={cn('bg-zinc-800 flex items-center justify-center', className)}>
        {fallback || <span className="text-zinc-400 text-sm">?</span>}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'transition-opacity duration-300',
          sizeClasses[size],
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}