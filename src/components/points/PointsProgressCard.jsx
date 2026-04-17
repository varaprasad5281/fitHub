import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy } from 'lucide-react';

export default function PointsProgressCard({ 
  totalPoints, 
  currentLevel, 
  nextLevelPoints, 
  pointsInLevel, 
  pointsNeededForNextLevel,
  progressPercentage 
}) {
  const levelColors = {
    1: 'from-blue-500 to-cyan-500',
    2: 'from-purple-500 to-pink-500',
    3: 'from-orange-500 to-red-500',
    4: 'from-red-500 to-pink-500',
    5: 'from-pink-500 to-purple-500',
    6: 'from-purple-500 to-indigo-500',
    7: 'from-indigo-500 to-blue-500',
    8: 'from-blue-500 to-cyan-500',
    9: 'from-cyan-500 to-teal-500',
    10: 'from-yellow-500 to-amber-500',
  };

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
          className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${levelColors[currentLevel] || levelColors[5]} flex items-center justify-center border-2 border-white/20`}
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
          <p className="text-zinc-400 text-sm">Progress to Level {currentLevel + 1}</p>
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

      {/* Level badges */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Level Milestones</p>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(level => {
            const isReached = currentLevel >= level;
            return (
              <motion.div
                key={level}
                animate={{ y: isReached ? -2 : 0 }}
                className={`p-2 rounded-lg text-center transition-all ${
                  isReached
                    ? 'bg-amber-500/20 border border-amber-500/50'
                    : 'bg-zinc-800/50 border border-zinc-700/50'
                }`}
              >
                <p className={`font-bold text-sm ${isReached ? 'text-amber-400' : 'text-zinc-600'}`}>
                  {level}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}