/**
 * User Rewards Panel
 * Shows active rewards on profile
 */

import React from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Gift, Clock, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const REWARD_DISPLAY = {
  streak_shield: { label: 'Streak Shield', icon: '🛡️', color: 'text-blue-400' },
  double_points: { label: '2x Points Day', icon: '2️⃣', color: 'text-amber-400' },
  recovery_boost: { label: 'Recovery Boost', icon: '🔄', color: 'text-green-400' },
  profile_glow: { label: 'Profile Glow', icon: '✨', color: 'text-purple-400' },
  leaderboard_frame: { label: 'Leaderboard Frame', icon: '👑', color: 'text-amber-400' },
  streak_bonus: { label: 'Streak Bonus', icon: '🔥', color: 'text-red-400' },
  points_multiplier: { label: 'Point Multiplier', icon: '📈', color: 'text-green-400' },
};

export default function UserRewardsPanel() {
  const { data: rewards, isLoading } = useQuery({
    queryKey: ['userRewards'],
    queryFn: async () => {
      const activeRewards = await api.entities.UserReward.filter({
        is_active: true,
      });
      return activeRewards;
    },
    initialData: [],
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  const activeRewards = rewards.filter(r => r.is_active);
  const consumableRewards = activeRewards.filter(r => r.quantity_remaining > 0);
  const permanentRewards = activeRewards.filter(r => r.expires_at === null);

  if (activeRewards.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center">
        <p className="text-sm text-zinc-500">Earn badges to unlock rewards</p>
      </div>
    );
  }

  return (
    <div>
      {/* Consumable Rewards */}
      {consumableRewards.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Active Boosts
          </h3>
          <div className="space-y-2">
            {consumableRewards.map(reward => {
              const display = REWARD_DISPLAY[reward.reward_type];
              const isExpiring = reward.expires_at && 
                new Date(reward.expires_at) - new Date() < 24 * 60 * 60 * 1000;

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    isExpiring
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-zinc-900/50 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{display.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{display.label}</p>
                      {reward.expires_at && (
                        <p className="text-xs text-zinc-500">
                          Expires {new Date(reward.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${display.color}`}>
                      {reward.quantity_remaining}x
                    </p>
                    <p className="text-xs text-zinc-600">remaining</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Permanent Rewards */}
      {permanentRewards.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-400" />
            Permanent Rewards
          </h3>
          <div className="space-y-2">
            {permanentRewards.map(reward => {
              const display = REWARD_DISPLAY[reward.reward_type];
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/10 flex items-center gap-3"
                >
                  <span className="text-xl">{display.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{display.label}</p>
                    <p className="text-xs text-purple-300">Always active</p>
                  </div>
                  <Check className="w-4 h-4 text-green-400 ml-auto" />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}