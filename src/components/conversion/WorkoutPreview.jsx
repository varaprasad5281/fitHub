import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Dumbbell, Flame, Clock, CheckCircle, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MOCK_EXERCISES = [
  { name: 'Barbell Back Squat', sets: 4, reps: '8-10', weight: '70% 1RM' },
  { name: 'Romanian Deadlift',  sets: 3, reps: '10-12', weight: '60% 1RM' },
  { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', weight: 'Moderate' },
];

const MOCK_HISTORY = [
  { name: 'Full Body Strength', date: 'Yesterday',   difficulty: 'intermediate', duration: 45, calories: 380 },
  { name: 'Upper Body Power',   date: '3 days ago',  difficulty: 'advanced',     duration: 52, calories: 420 },
];

const difficultyColors = {
  beginner:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  intermediate: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
  advanced:     'text-red-400    bg-red-400/10    border-red-400/20',
};

export default function WorkoutPreview() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pro Feature Preview</p>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Your Training Plan</h3>
        <p className="text-sm text-zinc-500">Upgrade to Pro or Elite to unlock AI-generated personalised workouts</p>
      </div>

      {/* Mock current workout card */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Today's Workout</p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Lock overlay */}
          <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center cursor-not-allowed">
            <div className="flex flex-col items-center gap-1">
              <Lock className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">Unlock with Pro</span>
            </div>
          </div>

          {/* Card content behind overlay */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 opacity-50 blur-[2px]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-white font-bold text-base mb-1">Lower Body Strength</h4>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="px-2 py-0.5 rounded-full border text-amber-400 bg-amber-400/10 border-amber-400/20 font-semibold">intermediate</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400/50" />48 min</span>
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400/50" />~340 cal</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {MOCK_EXERCISES.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
                  <div className="w-9 h-9 rounded-lg bg-zinc-700/50 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-amber-400/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{ex.name}</p>
                    <p className="text-zinc-500 text-xs">{ex.sets} sets · {ex.reps} reps · {ex.weight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mock history */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Workout History</p>
        <div className="space-y-2">
          {MOCK_HISTORY.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.06 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center cursor-not-allowed">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 opacity-50 blur-[2px]">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{item.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-zinc-500 text-xs">{item.date}</span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500"><Clock className="w-3 h-3 text-amber-400/50" />{item.duration} min</span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500"><Flame className="w-3 h-3 text-orange-400/50" />~{item.calories} cal</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${difficultyColors[item.difficulty]}`}>
                  {item.difficulty}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why upgrade */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">AI-generated workout plans</p>
            <p className="text-xs text-zinc-500">Built around your goals, fitness level, and preferences</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Regenerate anytime</p>
            <p className="text-xs text-zinc-500">Refresh your plan whenever you want a new challenge</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Dumbbell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Exercise demos & instructions</p>
            <p className="text-xs text-zinc-500">Step-by-step guidance with images for every exercise</p>
          </div>
        </div>
        <div className="flex gap-3">
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Completion history</p>
            <p className="text-xs text-zinc-500">Track every session and earn points for staying consistent</p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Button
          onClick={() => navigate(createPageUrl('Subscription'))}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold py-3 h-auto rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          Unlock Workouts
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      <p className="text-xs text-center text-zinc-500 mt-4">Cancel anytime. No hidden fees.</p>
    </div>
  );
}
