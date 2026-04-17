/**
 * Discipline Level Display
 * Shows user's discipline level and progress score
 */

import React from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Award, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LEVEL_DESCRIPTIONS = {
  1: 'Beginning',
  10: 'Consistent',
  20: 'Disciplined',
  30: 'Dedicated',
  40: 'Elite Performer',
  50: 'Exceptional',
};

export default function LevelProgressBar() {
  const { data: userLevel, isLoading } = useQuery({
    queryKey: ['userLevel'],
    queryFn: async () => {
      const levels = await api.entities.UserLevel.list();
      return levels[0];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <Skeleton className="h-20" />;
  }

  if (!userLevel) {
    return null;
  }

  const progressPercentage = (userLevel.progress_in_level / userLevel.progress_needed_for_next) * 100;
  const levelDescription = LEVEL_DESCRIPTIONS[userLevel.current_level] || 'Disciplined';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {userLevel.prestige_level > 0 ? (
            <>
              <Crown className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Prestige {userLevel.prestige_level}
                </p>
                <p className="text-sm font-bold text-white">Elite Performer</p>
              </div>
            </>
          ) : (
            <>
              <Award className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Level {userLevel.current_level}
                </p>
                <p className="text-sm font-bold text-white">{levelDescription}</p>
              </div>
            </>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 mb-0.5">Progress Score</p>
          <p className="text-sm font-bold text-amber-400">{userLevel.total_progress.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-black/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
        />
      </div>

      {/* Progress to next level */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-zinc-500">Progress to Level {userLevel.current_level + 1}</span>
          <span className="text-xs font-semibold text-zinc-400">
            {userLevel.progress_in_level} / {userLevel.progress_needed_for_next}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-zinc-500 to-zinc-400"
          />
        </div>
      </div>
    </motion.div>
  );
}