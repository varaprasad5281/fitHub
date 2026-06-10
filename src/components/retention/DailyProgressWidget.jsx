/**
 * Daily Progress Widget
 * Shows today's progress and next milestone
 * Core of retention loop: daily visibility + next milestone clarity
 */

import React from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Target, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function DailyProgressWidget() {
  const today = new Date().toISOString().split('T')[0];

  const { data: todayActions, isLoading: actionsLoading } = useQuery({
    queryKey: ['todayActions', today],
    queryFn: async () => {
      const actions = await api.entities.ActivityFeed.list();
      return actions.filter(a => a.created_date?.split('T')[0] === today);
    },
    staleTime: 1000 * 60 * 5
  });

  const { data: streak, isLoading: streakLoading } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const streaks = await api.entities.Streak.list();
      return streaks[0];
    }
  });

  const { data: level } = useQuery({
    queryKey: ['userLevel'],
    queryFn: async () => {
      const levels = await api.entities.UserLevel.list();
      return levels[0];
    }
  });

  if (actionsLoading || streakLoading) {
    return <Skeleton className="h-32 rounded-2xl" />;
  }

  const workoutsDone = todayActions?.filter(a => a.activity_type === 'workout_completed').length || 0;
  const mealsDone = todayActions?.filter(a => a.activity_type?.includes('meal')).length || 0;
  const currentStreak = streak?.current_streak || 0;
  const progressToNextLevel = level?.progress_in_level || 0;
  const progressNeeded = level?.progress_needed_for_next || 100;

  // Calculate completion percentage
  const tasksCompleted = [workoutsDone > 0, mealsDone > 0].filter(Boolean).length;
  const tasksTotal = 2;
  const completionPercent = Math.round((tasksCompleted / tasksTotal) * 100);

  // Next milestone logic
  const nextMilestoneStreak = Math.ceil((currentStreak + 1) / 7) * 7;
  const nextMilestoneLevel = level?.current_level + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Today's Progress</h3>
        <p className="text-xs text-zinc-500">{today}</p>
      </div>

      {/* Daily Completion */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-400">Completion</p>
          <p className="text-sm font-bold text-white">{completionPercent}%</p>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-zinc-600 to-zinc-500"
          />
        </div>
      </div>

      {/* Today's Activities */}
      <div className="space-y-2 mb-4">
        {/* Workouts */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
          <div className={workoutsDone > 0 ? 'text-green-600' : 'text-zinc-600'}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs text-zinc-400 flex-1">Workout</p>
          <p className="text-xs font-semibold text-white">{workoutsDone > 0 ? '✓ Done' : 'Not yet'}</p>
        </div>

        {/* Meals */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
          <div className={mealsDone > 0 ? 'text-green-600' : 'text-zinc-600'}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs text-zinc-400 flex-1">Meals Logged</p>
          <p className="text-xs font-semibold text-white">{mealsDone > 0 ? '✓ Done' : 'Not yet'}</p>
        </div>
      </div>

      {/* Next Milestone */}
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-500" />
            <p className="text-xs font-semibold text-white">Next Milestone</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
        </div>

        {currentStreak + 1 === nextMilestoneStreak ? (
          <p className="text-xs text-zinc-400">
            <span className="font-semibold text-amber-400">{nextMilestoneStreak}-day streak</span> in {nextMilestoneStreak - currentStreak} day{nextMilestoneStreak - currentStreak > 1 ? 's' : ''}
          </p>
        ) : (
          <p className="text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Level {nextMilestoneLevel}</span> ({progressNeeded - progressToNextLevel} progress remaining)
          </p>
        )}
      </div>

      {/* Action */}
      {completionPercent < 100 && (
        <Link to={createPageUrl('Profile')} className="block mt-3">
          <Button className="w-full h-9 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold">
            Continue Today
          </Button>
        </Link>
      )}

      {completionPercent === 100 && (
        <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
          <p className="text-xs font-semibold text-green-400">✓ Today Complete</p>
          <p className="text-xs text-green-500/70">Streak continues tomorrow</p>
        </div>
      )}
    </motion.div>
  );
}