import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, Target, Trophy, Apple } from 'lucide-react';

export default function PointsSummary({ points = {} }) {
  const sources = [
    { label: 'Workouts', value: points.breakdown?.workouts || 0, icon: Flame, color: 'text-red-400' },
    { label: 'Goals', value: points.breakdown?.goals || 0, icon: Target, color: 'text-cyan-400' },
    { label: 'Leaderboard', value: points.breakdown?.leaderboard || 0, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Calories', value: points.breakdown?.calories || 0, icon: Apple, color: 'text-green-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-amber-400" />
        <h3 className="text-white font-semibold text-lg">Points Summary</h3>
      </div>

      <div className="mb-6">
        <p className="text-zinc-500 text-sm mb-2">Total Points</p>
        <p className="text-5xl font-bold text-white">{(points.totalPoints || 0).toLocaleString()}</p>
      </div>

      <div className="space-y-2">
        {sources.map((source) => (
          <div key={source.label} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
            <div className="flex items-center gap-2">
              <source.icon className={`w-4 h-4 ${source.color}`} />
              <span className="text-zinc-400 text-sm">{source.label}</span>
            </div>
            <span className={`font-semibold ${source.color}`}>{source.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}