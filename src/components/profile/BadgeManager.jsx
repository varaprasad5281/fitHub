/**
 * Badge Manager Component
 * Displays user's featured badges on profile
 */

import React from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const RARITY = {
  common:    { border: 'border-zinc-600', label: 'text-zinc-400',   bg: 'bg-zinc-800/60'   },
  rare:      { border: 'border-blue-500', label: 'text-blue-400',   bg: 'bg-blue-900/30'   },
  epic:      { border: 'border-purple-500', label: 'text-purple-400', bg: 'bg-purple-900/30' },
  legendary: { border: 'border-amber-400', label: 'text-amber-400',  bg: 'bg-amber-900/30'  },
};

export default function BadgeManager() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await api.auth.isAuthenticated();
        if (isAuth) {
          const userData = await api.auth.me();
          setUser(userData);
        }
      } catch {
        // Not auth
      }
    };
    checkAuth();
  }, []);

  const { data: featuredBadges = [], isLoading } = useQuery({
    queryKey: ['profile-featured-badges', user?.email],
    queryFn: async () => {
      const res = await api.functions.invoke('getBadges', { action: 'featured' });
      return res?.data || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (featuredBadges.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-zinc-500">No featured badges yet. Earn badges and feature up to 3! 🏅</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {featuredBadges.map((badge) => {
        const r = RARITY[badge.rarity_level] || RARITY.common;
        return (
          <div
            key={badge._id || badge.badge_code}
            className={`group relative rounded-xl border ${r.border} ${r.bg} p-3 flex flex-col items-center gap-1 text-center`}
          >
            <span className="text-2xl">{badge.icon || '🏅'}</span>
            <p className="text-white font-semibold text-[11px] leading-tight">{badge.name}</p>
            <p className={`text-[9px] font-semibold uppercase tracking-wide ${r.label}`}>
              {badge.rarity_level}
            </p>
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 z-50
              opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
              <div className={`rounded-xl border ${r.border} bg-zinc-950 shadow-2xl p-3 text-left`}>
                <p className="text-white font-semibold text-xs mb-1">{badge.name}</p>
                {badge.description && (
                  <p className="text-zinc-300 text-xs leading-snug">{badge.description}</p>
                )}
              </div>
              <div className="flex justify-center">
                <div className={`w-2 h-2 rotate-45 border-b border-r ${r.border} bg-zinc-950 -mt-px`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}