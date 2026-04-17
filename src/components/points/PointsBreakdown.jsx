import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Apple, Trophy, Target, Zap } from 'lucide-react';

const sources = [
  { id: 'workouts', label: 'Workouts', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'goals', label: 'Goals', icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'calories', label: 'Calorie Bonus', icon: Apple, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'streaks', label: 'Streaks', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export default function PointsBreakdown({ breakdown = {}, todayPoints = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <div className="mb-4">
        <p className="text-white font-semibold text-lg">Today's Points</p>
        <p className="text-amber-400 text-sm">+{todayPoints} points earned</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sources.map((source, idx) => {
          const Icon = source.icon;
          const points = breakdown[source.id] || 0;
          const percentage = todayPoints > 0 ? Math.round((points / todayPoints) * 100) : 0;

          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl p-4 border border-zinc-700 ${source.bg}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${source.color}`} />
                  <p className="text-white font-medium text-sm">{source.label}</p>
                </div>
                <p className={`font-bold text-sm ${source.color}`}>+{points}</p>
              </div>
              
              {points > 0 && (
                <div className="text-xs text-zinc-400">{percentage}% of today</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {todayPoints === 0 && (
        <div className="mt-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30 text-center">
          <p className="text-zinc-500 text-sm">No points earned yet today. Complete workouts and goals to earn points!</p>
        </div>
      )}
    </motion.div>
  );
}