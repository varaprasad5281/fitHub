/**
 * Badge Manager Component
 * Displays user's badges on profile
 * Updated to use new badge system
 */

import React from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import BadgeShowcase from '@/components/badge/BadgeShowcase';
import BadgeProgress from '@/components/badge/BadgeProgress';
import BadgeCard from '@/components/badge/BadgeCard';
import { getAllBadges } from '@/components/badge/badgeDefinitions';
import { Loader2 } from 'lucide-react';

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

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.entities.Badge.filter({ created_by: user?.email }),
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

  if (badges.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-zinc-500">No badges yet. Start your journey! 🚀</p>
      </div>
    );
  }

  // Get all available badges
  const allBadges = getAllBadges();
  const earnedBadgeIds = new Set(badges.map(b => b.badge_id));
  const lockedBadges = allBadges.filter(b => !earnedBadgeIds.has(b.badge_id));

  // Show earned badges
  return (
    <div className="space-y-4">
      {/* Earned badges */}
      {badges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Earned ({badges.length})</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {badges.slice(0, 12).map(badge => (
              <BadgeCard key={badge.id} badge={badge} size="sm" />
            ))}
            {badges.length > 12 && (
              <div className="w-12 h-12 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-xs text-zinc-500 font-semibold">
                +{badges.length - 12}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next badge progress */}
      {lockedBadges.length > 0 && (
        <BadgeProgress
          lockedBadges={lockedBadges}
          progress={{}}
        />
      )}
    </div>
  );
}