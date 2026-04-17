/**
 * Personal Progress Identity Display
 * Shows user's discipline identity and progress narrative
 * Reinforces "You are disciplined" psychological frame
 */

import React from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const identityLabels = {
  beginner: { title: 'Committed Beginner', subtitle: 'Building momentum' },
  emerging: { title: 'Emerging Performer', subtitle: 'Finding your rhythm' },
  consistent: { title: 'Consistent Performer', subtitle: 'Built steady habits' },
  dedicated: { title: 'Dedicated Athlete', subtitle: 'Discipline is your strength' },
  elite: { title: 'Elite Performer', subtitle: 'Exceptional commitment' },
  prestige: { title: 'Prestige Level', subtitle: 'Rare distinction earned' }
};

const getIdentityTier = (level, prestige, streak) => {
  if (prestige > 0) return 'prestige';
  if (level >= 30) return 'elite';
  if (level >= 20 && streak >= 30) return 'dedicated';
  if (level >= 10 && streak >= 14) return 'consistent';
  if (level >= 5) return 'emerging';
  return 'beginner';
};

export default function PersonalIdentity() {
  const { data: level, isLoading: levelLoading } = useQuery({
    queryKey: ['userLevel'],
    queryFn: async () => {
      const levels = await api.entities.UserLevel.list();
      return levels[0];
    }
  });

  const { data: streak, isLoading: streakLoading } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const streaks = await api.entities.Streak.list();
      return streaks[0];
    }
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profiles = await api.entities.Profile.list();
      return profiles[0];
    }
  });

  if (levelLoading || streakLoading || profileLoading) {
    return <Skeleton className="h-24 rounded-2xl" />;
  }

  const currentLevel = level?.current_level || 1;
  const prestige = level?.prestige_level || 0;
  const currentStreak = streak?.current_streak || 0;
  const identity = getIdentityTier(currentLevel, prestige, currentStreak);
  const labels = identityLabels[identity];

  // Calculate progress % to next level
  const progressPercent = level?.progress_in_level ? 
    Math.round((level.progress_in_level / level.progress_needed_for_next) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
            Your Progress Identity
          </p>
          <h2 className="text-2xl font-bold text-white">{labels.title}</h2>
          <p className="text-sm text-zinc-400 mt-0.5">{labels.subtitle}</p>
        </div>
        {prestige > 0 && (
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs font-semibold text-amber-400">Prestige {prestige}</p>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Level */}
        <div className="rounded-lg bg-zinc-800/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-zinc-500" />
            <p className="text-xs text-zinc-500 font-semibold">Level</p>
          </div>
          <p className="text-xl font-bold text-white">{currentLevel}</p>
          <p className="text-xs text-zinc-600 mt-0.5">{progressPercent}% to next</p>
        </div>

        {/* Streak */}
        <div className="rounded-lg bg-zinc-800/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-4 h-4 text-zinc-500" />
            <p className="text-xs text-zinc-500 font-semibold">Streak</p>
          </div>
          <p className="text-xl font-bold text-white">{currentStreak}d</p>
          <p className="text-xs text-zinc-600 mt-0.5">Days consistent</p>
        </div>

        {/* Total Progress */}
        <div className="rounded-lg bg-zinc-800/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-4 h-4 text-zinc-500" />
            <p className="text-xs text-zinc-500 font-semibold">Total</p>
          </div>
          <p className="text-xl font-bold text-white">{level?.total_progress || 0}</p>
          <p className="text-xs text-zinc-600 mt-0.5">Progress score</p>
        </div>
      </div>

      {/* Progress Statement */}
      <div className="rounded-lg bg-zinc-800/30 p-3 border border-zinc-700/50">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Your Progress Narrative</p>
            <p className="text-xs text-zinc-400 mt-1">
              {currentStreak >= 90
                ? "You've built exceptional consistency. Your discipline is unmatched."
                : currentStreak >= 30
                ? `${currentStreak} days of dedication. You're building real identity.`
                : currentStreak >= 7
                ? `${currentStreak}-day streak. Momentum is building.`
                : currentLevel >= 20
                ? "Early levels show commitment. Keep building."
                : "You're starting your journey toward discipline."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}