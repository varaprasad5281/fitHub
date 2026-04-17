/**
 * Loading Card Component
 * Consistent loading skeleton
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingCard({ count = 1, lines = 3 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
          <Skeleton className="h-4 w-1/3 rounded" />
          {[...Array(lines)].map((_, j) => (
            <Skeleton key={j} className="h-3 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}