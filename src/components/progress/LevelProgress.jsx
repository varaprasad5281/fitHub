import React from 'react';
import { motion } from 'framer-motion';

export default function LevelProgress({ currentLevel, nextLevelPoints, progressPercentage }) {
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
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Level Progress</h3>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${levelColors[currentLevel] || levelColors[5]} flex items-center justify-center border-2 border-white/20`}
        >
          <p className="text-white font-bold text-xl">L{currentLevel}</p>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-zinc-400 text-sm">Progress to Level {currentLevel + 1}</p>
            <p className="text-zinc-500 text-xs">{progressPercentage}%</p>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-800/50 border border-zinc-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
            />
          </div>
        </div>

        <p className="text-zinc-500 text-xs">
          {nextLevelPoints.toLocaleString()} points needed for next level
        </p>
      </div>
    </motion.div>
  );
}