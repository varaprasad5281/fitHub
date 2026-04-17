/**
 * Empty State Component
 * Consistent empty state messaging
 */

import React from 'react';
import { MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ icon: Icon, title, description, cta, ctaLink }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
      {Icon && <Icon className="w-12 h-12 text-zinc-600 mx-auto mb-4" />}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm mx-auto">{description}</p>
      {cta && ctaLink && (
        <a href={ctaLink}>
          <Button className="gap-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg h-9">
            {cta}
            <MoveRight className="w-4 h-4" />
          </Button>
        </a>
      )}
    </div>
  );
}