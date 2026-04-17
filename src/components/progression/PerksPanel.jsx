/**
 * Subscription Benefits Panel
 * Shows active membership benefits
 */

import React from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Crown, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PERK_ICONS = {
  leaderboard_access: '📊',
  badge_frame: '🎖️',
  points_multiplier: '📈',
  profile_glow: '✨',
  advanced_stats: '📉',
  elite_frame: '👑',
  priority_ranking: '→',
};

const PERK_LABELS = {
  leaderboard_access: 'Leaderboard Access',
  badge_frame: 'Badge Display',
  points_multiplier: 'Performance Multiplier',
  profile_glow: 'Profile Recognition',
  advanced_stats: 'Performance Analytics',
  elite_frame: 'Elite Badge Frame',
  priority_ranking: 'Tie-Break Priority',
};

export default function PerksPanel() {
  const { data: subscription, isLoading: loadingSub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    initialData: [],
  });

  const { data: perks, isLoading: loadingPerks } = useQuery({
    queryKey: ['userPerks'],
    queryFn: async () => {
      const activeSub = subscription[0];
      if (!activeSub) return [];

      let tier = 'starter';
      if (activeSub.plan?.includes('elite')) tier = 'elite';
      else if (activeSub.plan?.includes('pro')) tier = 'pro';

      const allPerks = await api.entities.SubscriptionPerk.filter({ is_active: true });
      const tierHierarchy = { starter: 0, pro: 1, elite: 2 };
      const userTierLevel = tierHierarchy[tier];

      return allPerks.filter(p => tierHierarchy[p.subscription_tier] <= userTierLevel);
    },
    enabled: !!subscription[0],
  });

  if (loadingSub || loadingPerks) {
    return <Skeleton className="h-32" />;
  }

  const activeSub = subscription[0];

  if (!activeSub || activeSub.status !== 'active') {
    return null;
  }

  const tierDisplay = {
    pro_monthly: 'Pro',
    pro_yearly: 'Pro (Annual)',
    elite_monthly: 'Elite',
    elite_yearly: 'Elite (Annual)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-zinc-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
          {tierDisplay[activeSub.plan] || 'Subscriber'} Benefits
        </h3>
      </div>

      {/* Benefits list */}
      <div className="space-y-2">
        {perks && perks.length > 0 ? (
          perks.map(perk => (
            <motion.div
              key={perk.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700"
            >
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {PERK_LABELS[perk.perk_type]}
                </p>
                <p className="text-xs text-zinc-500">{perk.description}</p>
              </div>
              {perk.perk_type === 'points_multiplier' && (
                <span className="text-xs font-bold text-amber-400">+{perk.value}%</span>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-xs text-zinc-600">No additional benefits active</p>
        )}
      </div>
    </motion.div>
  );
}