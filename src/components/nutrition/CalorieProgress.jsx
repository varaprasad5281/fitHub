import React from 'react';
import { motion } from "framer-motion";

export default function CalorieProgress({ consumed, target }) {
  const percentage = Math.min((consumed / target) * 100, 100);
  const remaining = Math.max(target - consumed, 0);
  const isOver = consumed > target;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Calories Today</p>
          <p className="text-3xl font-black text-white">
            {consumed.toLocaleString()}
            <span className="text-zinc-600 text-lg ml-1">/ {target.toLocaleString()}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
            {isOver ? 'Over' : 'Remaining'}
          </p>
          <p className={`text-2xl font-bold ${isOver ? 'text-red-400' : 'text-amber-400'}`}>
            {Math.abs(remaining).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-y-0 left-0 rounded-full ${
            isOver
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : 'bg-gradient-to-r from-amber-400 to-amber-500'
          }`}
        />
      </div>
    </div>
  );
}