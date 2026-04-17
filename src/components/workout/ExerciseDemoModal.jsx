import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, RefreshCw } from 'lucide-react';

const MUSCLES = {
  squat: ['Quads', 'Glutes', 'Hamstrings'],
  deadlift: ['Hamstrings', 'Glutes', 'Lower Back'],
  pushup: ['Chest', 'Triceps', 'Shoulders'],
  pullup: ['Lats', 'Biceps', 'Upper Back'],
  curl: ['Biceps', 'Forearms'],
  shoulder: ['Shoulders', 'Traps'],
  plank: ['Core', 'Shoulders', 'Glutes'],
  jump: ['Quads', 'Calves', 'Glutes'],
  run: ['Quads', 'Hamstrings', 'Calves'],
  tricep: ['Triceps', 'Shoulders'],
  generic: ['Full Body'],
};

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

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' style='background:%2318181b'><g fill='%23f59e0b' opacity='0.7'><rect x='10' y='44' width='80' height='12' rx='6'/><rect x='8' y='36' width='14' height='28' rx='5'/><rect x='78' y='36' width='14' height='28' rx='5'/><rect x='2' y='40' width='12' height='20' rx='4'/><rect x='86' y='40' width='12' height='20' rx='4'/></g></svg>`;

function buildPollinationsUrl(name) {
  const seed = name.toLowerCase().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const prompt = encodeURIComponent(`person doing ${name} exercise gym photorealistic`);
  return `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&seed=${seed}&nologo=true`;
}

export default function ExerciseDemoModal({ exercise, onClose }) {
  const type = classify(exercise.name);
  const muscles = MUSCLES[type];

  // Use stored image_url if available, otherwise generate Pollinations URL
  const initialSrc = exercise.image_url || buildPollinationsUrl(exercise.name);
  const [src, setSrc] = useState(initialSrc);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);

  const startLoad = (newSrc) => {
    clearTimeout(timerRef.current);
    setLoaded(false);
    setTimedOut(false);
    setSrc(newSrc);
    timerRef.current = setTimeout(() => {
      setTimedOut(true);
      setSrc(FALLBACK_SVG);
    }, 12000);
  };

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!loaded) {
        setTimedOut(true);
        setSrc(FALLBACK_SVG);
      }
    }, 12000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleLoad = () => {
    clearTimeout(timerRef.current);
    setLoaded(true);
    setTimedOut(false);
  };

  const handleError = () => {
    clearTimeout(timerRef.current);
    setSrc(FALLBACK_SVG);
  };

  const regenerate = () => {
    startLoad(buildPollinationsUrl(exercise.name) + `&t=${Date.now()}`);
  };

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

          {/* Image */}
          <div className="mx-4 my-3 rounded-2xl bg-zinc-900 border border-zinc-800/60 overflow-hidden relative flex-1 min-h-[300px] sm:min-h-[400px]">
            {!loaded && !timedOut && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-zinc-500 text-xs">Loading demo…</p>
              </div>
            )}

            <img
              key={src}
              src={src}
              alt={exercise.name}
              className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={handleLoad}
              onError={handleError}
            />

            {/* Regenerate button */}
            {loaded && (
              <button
                onClick={regenerate}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors backdrop-blur-sm"
                title="Reload image"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white" />
              </button>
            )}
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
