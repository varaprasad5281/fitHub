/**
 * Badge Progress Hint
 * Subtle contextual hint shown on action pages (workouts, meals, etc.)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function BadgeProgressHint({ badgeProgress, context = 'workout' }) {
  if (!badgeProgress || badgeProgress.progress_percent >= 100) {
    return null;
  }

  const { badge, current, target, progress_percent } = badgeProgress;
  const isClose = progress_percent >= 75;

  const messages = {
    workout: `${current}/${target} for ${badge}`,
    meal: `${current}/${target} meals logged for ${badge}`,
    streak: `${current}/${target} days for ${badge}`,
    leaderboard: `Top ${target - current} spots to ${badge}`,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className={`rounded-lg p-3 text-sm flex items-center gap-2 mb-4 ${
          isClose
            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
            : 'bg-zinc-900/50 border border-zinc-800 text-zinc-400'
        }`}
      >
        <Sparkles className="w-4 h-4 flex-shrink-0" />
        <span>{messages[context] || messages.workout}</span>
        {isClose && <span className="ml-auto text-xs font-bold">Almost!</span>}
      </motion.div>
    </AnimatePresence>
  );
}