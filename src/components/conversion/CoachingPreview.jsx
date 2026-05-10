import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Sparkles, Lightbulb, Star, History, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MOCK_COACHING = [
  {
    category: 'workout',
    advice: 'Based on your recent activity, your body is primed for a high-intensity session today. Push your limits and focus on progressive overload.',
    actionable_items: ['Complete 4 sets of compound lifts', 'Hit 10,000 steps minimum', 'Prioritise 8h sleep tonight'],
  },
  {
    category: 'nutrition',
    advice: 'Your calorie intake has been below target this week. Fuel your performance with whole foods and ensure adequate protein to support muscle recovery.',
    actionable_items: ['Eat 30g protein within 30 min of waking', 'Prep meals in advance', 'Hit your calorie target by 8pm'],
  },
];

const MOCK_HISTORY = [
  { date: 'Yesterday', category: 'mindset', preview: 'Consistency beats intensity. You\'ve shown up 6 out of 7 days this week…' },
  { date: '2 days ago',  category: 'recovery', preview: 'Your streak is strong but rest is part of the plan. Today, focus on…' },
];

export default function CoachingPreview() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pro Feature Preview</p>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Your Personal Coach</h3>
        <p className="text-sm text-zinc-500">Upgrade to Pro or Elite to unlock personalised daily coaching</p>
      </div>

      {/* Daily coaching card preview */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Daily Coaching</p>
        <div className="space-y-3">
          {MOCK_COACHING.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
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
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 capitalize">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-3">{item.advice}</p>
                <ul className="space-y-1.5">
                  {item.actionable_items.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                      <Zap className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* History preview */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Coaching History</p>
        <div className="space-y-2">
          {MOCK_HISTORY.map((item, idx) => (
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
              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-start gap-3 opacity-50 blur-[2px]">
                <History className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">{item.date} · {item.category}</p>
                  <p className="text-sm text-zinc-300">{item.preview}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why upgrade section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Personalised daily coaching</p>
            <p className="text-xs text-zinc-500">AI advice tailored to your goals, workouts and meals</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Actionable daily plans</p>
            <p className="text-xs text-zinc-500">Exact steps to follow - not generic advice</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Weekly strategic review</p>
            <p className="text-xs text-zinc-500">Long-term insights based on your progress data</p>
          </div>
        </div>
        <div className="flex gap-3">
          <History className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Full coaching history</p>
            <p className="text-xs text-zinc-500">Review past sessions and track your growth over time</p>
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
          Unlock Coaching
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      <p className="text-xs text-center text-zinc-500 mt-4">Cancel anytime. No hidden fees.</p>
    </div>
  );
}
