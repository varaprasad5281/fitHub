import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy } from 'lucide-react';

const LEVEL_COLORS = [
  'from-zinc-500 to-zinc-400',       // 1
  'from-blue-500 to-cyan-500',       // 2
  'from-purple-500 to-pink-500',     // 3
  'from-orange-500 to-red-500',      // 4
  'from-blue-500 to-indigo-500',     // 5  ← milestone
  'from-pink-500 to-purple-500',     // 6
  'from-indigo-500 to-violet-500',   // 7
  'from-cyan-500 to-teal-500',       // 8
  'from-green-500 to-emerald-500',   // 9
  'from-yellow-500 to-amber-500',    // 10 ← milestone
  'from-amber-500 to-orange-500',    // 11
  'from-red-500 to-rose-500',        // 12
  'from-fuchsia-500 to-pink-500',    // 13
  'from-violet-500 to-purple-500',   // 14
  'from-purple-600 to-indigo-500',   // 15 ← milestone
  'from-sky-500 to-blue-600',        // 16
  'from-emerald-500 to-green-600',   // 17
  'from-rose-500 to-pink-600',       // 18
  'from-amber-400 to-yellow-500',    // 19
  'from-red-600 to-orange-500',      // 20 ← milestone
  'from-indigo-600 to-purple-600',   // 21
  'from-cyan-600 to-blue-600',       // 22
  'from-teal-500 to-cyan-600',       // 23
  'from-pink-600 to-rose-600',       // 24
  'from-amber-500 to-amber-300',     // 25 ← milestone
  'from-violet-600 to-fuchsia-600',  // 26
  'from-blue-700 to-indigo-600',     // 27
  'from-emerald-600 to-teal-600',    // 28
  'from-orange-600 to-red-600',      // 29
  'from-yellow-400 to-amber-400',    // 30 ← milestone
];

const MILESTONE_LEVELS = [5, 10, 15, 20, 25, 30];

export default function PointsProgressCard({
  totalPoints,
  currentLevel,
  nextLevelPoints,
  pointsInLevel,
  pointsNeededForNextLevel,
  progressPercentage
}) {
  const gradient = LEVEL_COLORS[(currentLevel - 1) % LEVEL_COLORS.length] || LEVEL_COLORS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Points & Level</p>
          </div>
          <p className="text-white font-bold text-4xl sm:text-5xl">{totalPoints.toLocaleString()}</p>
        </div>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center border-2 border-white/20`}
        >
          <div className="text-center">
            <Trophy className="w-8 h-8 text-white mx-auto mb-1" />
            <p className="text-white font-bold text-2xl">L{currentLevel}</p>
          </div>
        </motion.div>
      </div>

      {/* Progress bar to next level */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <p className="text-zinc-400 text-sm">Progress to Level {currentLevel + 1}{currentLevel >= 30 ? ' (Max)' : ''}</p>
          <p className="text-zinc-500 text-xs">
            {pointsInLevel.toLocaleString()} / {pointsNeededForNextLevel.toLocaleString()}
          </p>
        </div>

        <div className="w-full h-3 rounded-full bg-zinc-800/50 border border-zinc-700/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
          />
        </div>

        <p className="text-zinc-500 text-xs text-right">{progressPercentage}%</p>
      </div>

      {/* Level milestone badges */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Level Milestones</p>
        <div className="grid grid-cols-6 gap-1.5">
          {MILESTONE_LEVELS.map(level => {
            const reached = currentLevel >= level;
            const isCurrent = currentLevel >= level && currentLevel < (MILESTONE_LEVELS[MILESTONE_LEVELS.indexOf(level) + 1] ?? Infinity);
            const g = LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length];
            return (
              <motion.div
                key={level}
                animate={{ y: reached ? -2 : 0 }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  reached
                    ? `bg-gradient-to-br ${g} border border-white/20 shadow-sm`
                    : 'bg-zinc-800/50 border border-zinc-700/50'
                }`}
              >
                <p className={`font-black text-sm leading-none ${reached ? 'text-white' : 'text-zinc-600'}`}>
                  {level}
                </p>
                {isCurrent && (
                  <span className="text-[8px] font-bold text-white/80 leading-none">NOW</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}