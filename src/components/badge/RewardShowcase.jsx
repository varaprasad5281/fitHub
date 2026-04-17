/**
 * Reward Showcase
 * Display rewards earned with badge unlock
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Zap, Shield, Star } from 'lucide-react';

const REWARD_ICONS = {
  points: '⭐',
  streak_shield: '🛡️',
  double_points: '2️⃣',
  recovery_boost: '🔄',
  profile_glow: '✨',
  leaderboard_frame: '👑',
  streak_bonus: '🔥',
  points_multiplier: '📈',
};

const REWARD_LABELS = {
  points: 'Bonus Points',
  streak_shield: 'Streak Shield',
  double_points: '2x Points Day',
  recovery_boost: 'Recovery Boost',
  profile_glow: 'Profile Glow',
  leaderboard_frame: 'Leaderboard Frame',
  streak_bonus: 'Streak Bonus',
  points_multiplier: 'Point Multiplier',
};

export default function RewardShowcase({ rewards }) {
  if (!rewards || rewards.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-6 pt-6 border-t border-amber-500/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Rewards</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {rewards.map((reward, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <span className="text-2xl">{REWARD_ICONS[reward.type]}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                {REWARD_LABELS[reward.type]}
              </p>
              <p className="text-xs text-amber-200">{reward.description}</p>
            </div>
            {reward.type === 'points' && (
              <span className="text-lg font-bold text-amber-400">+{reward.value}</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}