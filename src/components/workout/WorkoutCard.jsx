import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, Dumbbell, Clock, Flame, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import WorkoutDetailModal from './WorkoutDetailModal';

const difficultyColors = {
  beginner:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  intermediate: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  advanced:     'text-red-400    bg-red-400/10    border-red-400/20',
};

export default function WorkoutCard({ workout, onComplete, isCompleted }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        onClick={() => setModalOpen(true)}
        className={`rounded-2xl border transition-all duration-200 cursor-pointer group ${
          isCompleted
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
        }`}
      >
        <div className="p-5">
          {/* ── Header ────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-lg font-bold text-white leading-snug mb-2">
                {workout.workout_name}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${difficultyColors[workout.difficulty] || difficultyColors.beginner}`}>
                  {workout.difficulty}
                </span>
                {workout.estimated_duration && (
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3 text-amber-400/70" />
                    {workout.estimated_duration} min
                  </span>
                )}
                {workout.calories_burned && (
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Flame className="w-3 h-3 text-orange-400/70" />
                    ~{workout.calories_burned} cal
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {isCompleted && (
                <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 rounded-full px-2.5 py-1">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Done</span>
                </div>
              )}
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
          </div>

          {/* ── Exercise preview ───────────────────────────────── */}
          <div className="space-y-2 mb-4">
            {workout.exercises?.slice(0, 4).map((ex, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-zinc-800/60 last:border-0">
                <span className="w-5 h-5 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 text-[10px] font-bold">{i + 1}</span>
                </span>
                <span className="text-sm text-zinc-300 truncate flex-1">{ex.name}</span>
                <span className="text-xs text-zinc-600 flex-shrink-0">{ex.sets}×{ex.reps}</span>
              </div>
            ))}
            {(workout.exercises?.length || 0) > 4 && (
              <p className="text-xs text-zinc-600 pl-8">
                +{workout.exercises.length - 4} more · tap to see all
              </p>
            )}
          </div>

          {/* ── CTA ───────────────────────────────────────────── */}
          {!isCompleted && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={(e) => { e.stopPropagation(); onComplete?.(); }}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-xl h-10 text-sm shadow-lg hover:shadow-amber-500/20 transition-all"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Mark as Complete
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {modalOpen && (
        <WorkoutDetailModal
          workout={workout}
          onClose={() => setModalOpen(false)}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      )}
    </>
  );
}
