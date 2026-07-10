import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MUSCLES = {
  squat:    ['Quads', 'Glutes', 'Hamstrings'],
  deadlift: ['Hamstrings', 'Glutes', 'Lower Back'],
  pushup:   ['Chest', 'Triceps', 'Shoulders'],
  pullup:   ['Lats', 'Biceps', 'Upper Back'],
  curl:     ['Biceps', 'Forearms'],
  shoulder: ['Shoulders', 'Traps'],
  plank:    ['Core', 'Shoulders', 'Glutes'],
  jump:     ['Quads', 'Calves', 'Glutes'],
  run:      ['Quads', 'Hamstrings', 'Calves'],
  tricep:   ['Triceps', 'Shoulders'],
  generic:  ['Full Body'],
};

/** @param {string} name */
const classify = (name) => {
  const n = name.toLowerCase();
  if (n.includes('squat') || n.includes('lunge') || n.includes('leg press') || n.includes('goblet') || n.includes('bulgarian')) return 'squat';
  if (n.includes('deadlift') || n.includes('rdl') || n.includes('hip thrust') || n.includes('glute bridge') || n.includes('kettlebell swing')) return 'deadlift';
  if (n.includes('push up') || n.includes('pushup') || n.includes('push-up') || n.includes('bench press') || n.includes('chest press') || n.includes('dip')) return 'pushup';
  if (n.includes('pull up') || n.includes('pullup') || n.includes('pull-up') || n.includes('chin up') || n.includes('row') || n.includes('lat pulldown')) return 'pullup';
  if (n.includes('shoulder press') || n.includes('overhead press') || n.includes('lateral raise') || n.includes('military press')) return 'shoulder';
  if (n.includes('curl') || n.includes('bicep') || n.includes('hammer curl')) return 'curl';
  if (n.includes('tricep') || n.includes('skull crusher') || n.includes('pushdown') || n.includes('overhead extension')) return 'tricep';
  if (n.includes('plank') || n.includes('crunch') || n.includes('sit up') || n.includes('ab ') || n.includes('leg raise')) return 'plank';
  if (n.includes('burpee') || n.includes('jump') || n.includes('box jump') || n.includes('plyom')) return 'jump';
  if (n.includes('run') || n.includes('sprint') || n.includes('mountain climber') || n.includes('high knee')) return 'run';
  return 'generic';
};


/**
 * @param {{ exercise: any, onClose: () => void }} props
 */
export default function ExerciseDemoModal({ exercise, onClose }) {
  const type = classify(exercise.name);
  const muscles = MUSCLES[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-xl max-h-[85vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-0.5">How to</p>
              <h3 className="text-white text-xl font-bold leading-tight">{exercise.name}</h3>
              <p className="text-zinc-500 text-sm mt-0.5">{exercise.sets} sets × {exercise.reps}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* Muscle tags */}
          <div className="flex gap-1.5 flex-wrap px-4 pt-3">
            {muscles.map(m => (
              <span key={m} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">{m}</span>
            ))}
          </div>

          {/* Instructions */}
          {exercise.instructions && (
            <div className="mx-4 mt-2 mb-5 rounded-xl bg-zinc-900 border border-zinc-800 p-3">
              <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-1.5">Cues</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{exercise.instructions}</p>
            </div>
          )}

          {!exercise.instructions && <div className="h-3" />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
