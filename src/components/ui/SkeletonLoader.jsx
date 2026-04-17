import React from 'react';

export function SkeletonLoader({ width = 'w-full', height = 'h-6', className = '' }) {
  return (
    <div className={`${width} ${height} bg-zinc-800/60 rounded-lg animate-pulse ${className}`} />
  );
}

export function WorkoutSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="w-1/2" height="h-6" />
          <SkeletonLoader width="w-3/4" height="h-4" />
        </div>
        <SkeletonLoader width="w-24" height="h-10" />
      </div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <SkeletonLoader key={i} height="h-12" />
        ))}
      </div>
    </div>
  );
}

export function MealSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex justify-between items-center">
      <div className="flex-1 space-y-2">
        <SkeletonLoader width="w-1/3" height="h-4" />
        <SkeletonLoader width="w-2/3" height="h-3" />
      </div>
      <SkeletonLoader width="w-8" height="h-8" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonLoader width="w-32" height="h-32" className="rounded-full mx-auto" />
      <SkeletonLoader width="w-1/2" height="h-6" className="mx-auto" />
      <SkeletonLoader width="w-3/4" height="h-4" className="mx-auto" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[...Array(3)].map((_, i) => (
          <SkeletonLoader key={i} height="h-16" />
        ))}
      </div>
    </div>
  );
}