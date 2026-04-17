import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';

export default function WorkoutHistory({ workouts = [], totalPoints = 0 }) {
  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'beginner') return 'text-blue-400 bg-blue-500/10';
    if (difficulty === 'intermediate') return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-400" />
          <h3 className="text-white font-semibold text-lg">Recent Workouts</h3>
        </div>
        <p className="text-amber-400 text-sm font-semibold">+{totalPoints} pts</p>
      </div>

      {workouts.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-6">No workouts completed yet</p>
      ) : (
        <div className="space-y-2">
          {workouts.slice(0, 5).map((workout, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-medium text-sm">{workout.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${getDifficultyColor(workout.difficulty)}`}>
                    {workout.difficulty}
                  </span>
                  <span className="text-zinc-500 text-xs">{workout.duration} min</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-semibold flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {workout.pointsEarned}
                </p>
                <p className="text-zinc-500 text-xs">{new Date(workout.completedDate).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}