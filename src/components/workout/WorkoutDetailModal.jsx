import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Flame, Dumbbell, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const difficultyColors = {
  beginner:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  intermediate: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  advanced:     'text-red-400    bg-red-400/10    border-red-400/20',
};

export default function WorkoutDetailModal({ workout, onClose, onComplete, isCompleted, initialExercise = null }) {
  const [selectedEx, setSelectedEx] = useState(initialExercise);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!workout) return null;

  const exercises = workout.exercises || [];
  const ex = selectedEx !== null ? exercises[selectedEx] : null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        key="panel"
        className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center pointer-events-none"
        style={{ paddingTop: '64px' }}
      >
        <motion.div
          className="pointer-events-auto w-full sm:max-w-2xl bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl flex flex-col overflow-auto"
          style={{ height: 'calc(100vh - 64px)', maxHeight: 'calc(100vh - 64px)' }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            {ex ? (
              <motion.div
                key={`ex-${selectedEx}`}
                className="flex flex-col flex-1 min-h-0"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              >
                <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-zinc-800">
                  <button
                    onClick={() => setSelectedEx(null)}
                    className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <p className="text-sm text-zinc-400 font-medium">
                    Exercise {selectedEx + 1} / {exercises.length}
                  </p>
                  <div className="flex gap-1 ml-auto">
                    <button
                      disabled={selectedEx === 0}
                      onClick={() => setSelectedEx(selectedEx - 1)}
                      className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      disabled={selectedEx === exercises.length - 1}
                      onClick={() => setSelectedEx(selectedEx + 1)}
                      className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 min-h-0 p-4 sm:p-5 overscroll-contain">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-xl font-bold text-white">{ex.name}</h2>
                    <span className="flex-shrink-0 text-sm font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                      {ex.sets} × {ex.reps}
                    </span>
                  </div>

                  {ex.weight_recommendation && (
                    <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40">
                      <Dumbbell className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                      <span className="text-sm text-zinc-300">{ex.weight_recommendation}</span>
                    </div>
                  )}

                  {ex.instructions && (
                    <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Instructions</p>
                      <p className="text-sm text-zinc-300 leading-relaxed">{ex.instructions}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="flex flex-col flex-1 min-h-0"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              >
                <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-zinc-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-white leading-snug mb-2">
                        {workout.workout_name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${difficultyColors[workout.difficulty] || difficultyColors.beginner}`}>
                          {workout.difficulty}
                        </span>
                        {workout.estimated_duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {workout.estimated_duration} min
                          </span>
                        )}
                        {workout.calories_burned && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            ~{workout.calories_burned} cal
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {workout.personalization_notes && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-400/5 border border-amber-400/15">
                      <p className="text-xs text-amber-300/70 leading-relaxed">{workout.personalization_notes}</p>
                    </div>
                  )}
                </div>

                <div className="overflow-y-auto flex-1 min-h-0 p-4 sm:p-5 overscroll-contain">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                    Tap an exercise to see details
                  </p>
                  <div className="space-y-3 pb-2">
                    {exercises.map((exercise, i) => (
                      <motion.div
                        key={i}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedEx(i)}
                        className="flex gap-4 p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/40 cursor-pointer hover:border-amber-400/30 hover:bg-zinc-800/80 transition-all group"
                      >
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-white font-semibold leading-snug group-hover:text-amber-400 transition-colors">
                              {exercise.name}
                            </p>
                            <span className="flex-shrink-0 text-xs font-semibold text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full">
                              {exercise.sets} × {exercise.reps}
                            </span>
                          </div>

                          {exercise.weight_recommendation && (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 mb-1">
                              <Dumbbell className="w-3 h-3 text-amber-400/50" />
                              {exercise.weight_recommendation}
                            </span>
                          )}

                          {exercise.instructions && (
                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                              {exercise.instructions}
                            </p>
                          )}
                        </div>

                        <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0 self-center group-hover:text-amber-400 transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900">
                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 font-semibold py-2">
                      <CheckCircle className="w-5 h-5" />
                      Workout Completed
                    </div>
                  ) : onComplete ? (
                    <Button
                      onClick={() => { onComplete(); onClose(); }}
                      className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold rounded-xl text-base shadow-lg hover:shadow-amber-500/25 transition-all"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Mark as Complete
                    </Button>
                  ) : (
                    <p className="text-center text-zinc-500 text-sm py-2">
                      Start the timer on the workout card to complete
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
