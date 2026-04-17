/**
 * Badge Progress Component
 * Shows locked badges and progress toward next unlock
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { TIER_COLORS } from './badgeDefinitions';

export default function BadgeProgress({ lockedBadges, progress }) {
  if (!lockedBadges || lockedBadges.length === 0) {
    return null;
  }

  const nextBadge = lockedBadges[0];
  const nextProgress = progress[nextBadge.badge_id] || {};
  const percentComplete = nextProgress.percentComplete || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-700 bg-zinc-900/30 p-4"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Next Badge</h3>

      <div className="flex items-start gap-4">
        {/* Locked badge */}
        <div className="relative">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${TIER_COLORS[nextBadge.tier].bg} border ${TIER_COLORS[nextBadge.tier].border} opacity-50`}>
            {nextBadge.icon_emoji}
          </div>
          <Lock className="absolute bottom-1 right-1 w-4 h-4 text-zinc-500" />
        </div>

        {/* Progress info */}
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white mb-1">{nextBadge.name}</h4>
          <p className="text-xs text-zinc-400 mb-3">{nextBadge.description}</p>

          {/* Progress bar */}
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentComplete, 100)}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full ${TIER_COLORS[nextBadge.tier].bg}`}
            />
          </div>

          <p className="text-xs text-zinc-400">
            {nextProgress.current}/{nextProgress.target} {nextProgress.label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}