/**
 * Next Badge Widget
 * Displays the badge user is closest to unlocking with progress and CTA
 */

import React from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Zap, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { RARITY_STYLES } from './badgeDesignTokens';

export default function NextBadgeWidget() {
  const navigate = useNavigate();

  const { data: badgeProgress, isLoading } = useQuery({
    queryKey: ['badgeProgress'],
    queryFn: async () => {
      const { data } = await api.functions.invoke('getBadgeProgress');
      return data;
    },
    initialData: { next_badge: null, all_progress: {} },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 sm:p-6"
      >
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
        </div>
      </motion.div>
    );
  }

  const { next_badge, user_data } = badgeProgress;

  if (!next_badge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-amber-950/50 to-zinc-900/50 border border-amber-500/20 p-4 sm:p-6"
      >
        <div className="text-center">
          <p className="text-sm text-zinc-500 mb-2">All badges earned!</p>
          <p className="text-2xl">🏆</p>
          <p className="text-amber-400 font-semibold text-sm mt-2">You're a true 7%er</p>
        </div>
      </motion.div>
    );
  }

  const progressPercent = next_badge.progress_percent;
  const isClose = progressPercent >= 75;
  const rarityStyle = RARITY_STYLES[next_badge.rarity] || RARITY_STYLES.common;

  // Determine CTA based on badge action
  const handleCTA = () => {
    const action = next_badge.action?.toLowerCase() || '';

    if (action.includes('workout')) {
      navigate(createPageUrl('WorkoutBuilder'));
    } else if (action.includes('meal') || action.includes('log')) {
      navigate(createPageUrl('Nutrition'));
    } else if (action.includes('leaderboard')) {
      navigate(createPageUrl('Leaderboard'));
    } else if (action.includes('upgrade') || action.includes('pro')) {
      navigate(createPageUrl('Subscription'));
    } else if (action.includes('close')) {
      // Profile or dashboard action
      navigate(createPageUrl('Profile'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-2xl overflow-hidden p-4 sm:p-6 border transition-all ${
        isClose
          ? `${rarityStyle.background} ${rarityStyle.border} ${rarityStyle.shadow}`
          : 'bg-zinc-900/50 border-zinc-800'
      }`}
    >
      {/* Background accent */}
      {isClose && (
        <div className={`absolute inset-0 ${
          next_badge.rarity === 'elite'
            ? 'bg-gradient-to-br from-amber-500/10 to-transparent'
            : 'bg-gradient-to-br from-purple-500/10 to-transparent'
        }`} />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              {progressPercent >= 75 ? '⚡ Almost there' : 'Next Milestone'}
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              {next_badge.icon}
              <span>{next_badge.badge}</span>
            </h3>
          </div>
          <Lock className="w-5 h-5 text-zinc-600" />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-zinc-400">Progress</p>
            <p className={`text-xs font-bold ${
              isClose ? 'text-amber-400' : 'text-zinc-500'
            }`}>
              {next_badge.current} / {next_badge.target}
            </p>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className={`h-2 rounded-full bg-gradient-to-r ${
              isClose
                ? 'from-amber-500 to-amber-400'
                : 'from-zinc-600 to-zinc-500'
            }`}
          />
        </div>

        {/* Action Text */}
        <p className="text-sm text-zinc-400 mb-4">{next_badge.action}</p>

        {/* CTA Button */}
        <Button
          onClick={handleCTA}
          className={`w-full h-11 font-semibold rounded-xl transition-all ${
            isClose
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white'
              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
          }`}
        >
          <Zap className="w-4 h-4 mr-2" />
          {progressPercent >= 75 ? 'Complete Now' : 'Make Progress'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}