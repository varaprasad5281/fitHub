import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Apple, Utensils, ArrowRight, Zap, Target, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MOCK_MEALS = [
  { type: 'breakfast', name: 'Greek Yoghurt & Berries', calories: 320, protein: 24, carbs: 38, fats: 6 },
  { type: 'lunch',     name: 'Grilled Chicken Salad',  calories: 480, protein: 42, carbs: 28, fats: 14 },
  { type: 'dinner',    name: 'Salmon & Roasted Veg',   calories: 540, protein: 38, carbs: 32, fats: 22 },
];

const MOCK_PLAN = [
  { icon: '🌅', label: 'Breakfast', name: 'Oatmeal with banana & honey', calories: 410 },
  { icon: '☀️', label: 'Lunch',     name: 'Turkey wrap with avocado',    calories: 520 },
  { icon: '🌙', label: 'Dinner',    name: 'Beef stir-fry with rice',      calories: 610 },
];

const mealTypeColors = {
  breakfast: 'text-amber-400 bg-amber-400/10',
  lunch:     'text-blue-400  bg-blue-400/10',
  dinner:    'text-purple-400 bg-purple-400/10',
};

export default function NutritionPreview() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pro Feature Preview</p>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Your Nutrition</h3>
        <p className="text-sm text-zinc-500">Upgrade to Pro or Elite to unlock nutrition tracking and AI meal plans</p>
      </div>

      {/* Mock calorie progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-4"
      >
        <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center cursor-not-allowed">
          <div className="flex flex-col items-center gap-1">
            <Lock className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Unlock with Pro</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 opacity-50 blur-[2px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-white">Calories Today</span>
            <span className="text-sm text-zinc-400">1,340 / 2,100 kcal</span>
          </div>
          <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: '64%' }} />
          </div>
          <div className="flex justify-between mt-3">
            {[{ label: 'Protein', val: '104g', color: 'text-blue-400' }, { label: 'Carbs', val: '98g', color: 'text-green-400' }, { label: 'Fats', val: '42g', color: 'text-orange-400' }].map(m => (
              <div key={m.label} className="text-center">
                <p className={`text-sm font-bold ${m.color}`}>{m.val}</p>
                <p className="text-xs text-zinc-500">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Mock meal log */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Meal Log</p>
        <div className="space-y-2">
          {MOCK_MEALS.map((meal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center cursor-not-allowed">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 opacity-50 blur-[2px]">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${mealTypeColors[meal.type]}`}>{meal.type}</span>
                  <p className="text-sm text-white font-medium">{meal.name}</p>
                </div>
                <div className="flex gap-3 text-xs text-zinc-500">
                  <span>{meal.calories} cal</span>
                  <span>P:{meal.protein}g</span>
                  <span>C:{meal.carbs}g</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mock AI meal plan */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">AI Meal Plan</p>
        <div className="space-y-2">
          {MOCK_PLAN.map((meal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.06 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center cursor-not-allowed">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 opacity-50 blur-[2px]">
                <span className="text-xl">{meal.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500 font-semibold">{meal.label}</p>
                  <p className="text-sm text-white truncate">{meal.name}</p>
                </div>
                <span className="text-xs text-amber-400 font-semibold shrink-0">{meal.calories} kcal</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why upgrade */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <Apple className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Daily meal logging</p>
            <p className="text-xs text-zinc-500">Track calories, protein, carbs and fats for every meal</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">AI-generated meal plans</p>
            <p className="text-xs text-zinc-500">Personalised to your calorie target and dietary preference</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Calorie & macro targets</p>
            <p className="text-xs text-zinc-500">Auto-calculated from your profile, goal and activity level</p>
          </div>
        </div>
        <div className="flex gap-3">
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">7-day meal history</p>
            <p className="text-xs text-zinc-500">Review your intake trends and stay consistent</p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => navigate(createPageUrl('Subscription'))}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold py-3 h-auto rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/30 transition-all"
        >
          Unlock Nutrition
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      <p className="text-xs text-center text-zinc-500 mt-4">Cancel anytime. No hidden fees.</p>
    </div>
  );
}
