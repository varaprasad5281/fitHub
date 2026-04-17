import React from 'react';
import { Rocket } from 'lucide-react';

export default function BetaBadge({ size = 'md' }) {
  const sizes = {
    sm: { wrap: 'px-2 py-0.5 gap-1', icon: 'w-3 h-3', text: 'text-xs' },
    md: { wrap: 'px-3 py-1.5 gap-1.5', icon: 'w-3.5 h-3.5', text: 'text-xs' },
    lg: { wrap: 'px-4 py-2 gap-2', icon: 'w-4 h-4', text: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center ${s.wrap} rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 shrink-0`}>
      <Rocket className={`${s.icon} text-amber-400`} />
      <span className={`${s.text} text-amber-300 font-bold tracking-wide`}>Beta Founder</span>
    </span>
  );
}