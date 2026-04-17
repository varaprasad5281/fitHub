import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

/**
 * Enhanced ProUpsellModal with psychology-driven messaging
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - triggerType: 'workout_complete' | 'streak_milestone' | 'engagement' | 'leaderboard' | 'default'
 * - contextData: { streak?: number, workoutsCompleted?: number, daysActive?: number, estimatedRank?: number }
 */
export default function ProUpsellModalEnhanced({ isOpen, onClose, triggerType = 'default', contextData = {} }) {
  const navigate = useNavigate();

  // Psychology-driven messaging based on trigger type
  const getMessageContent = () => {
    const baseMessageProps = {
      title: '',
      subtitle: '',
      highlights: [],
      cta: 'Upgrade to Pro',
      icon: Crown,
    };

    switch (triggerType) {
      case 'workout_complete':
        return {
          ...baseMessageProps,
          title: "You're in the 7%",
          subtitle: "You just completed your first workout. Only the disciplined few show up consistently.",
          highlights: [
            { icon: Users, text: 'Compete with the committed 7% on the leaderboard' },
            { icon: TrendingUp, text: 'Track your exact rank and progress against others' },
            { icon: Zap, text: 'Unlock advanced analytics and insights' },
          ],
          context: "You're exactly the type to take this seriously. Upgrade now to compete.",
        };

      case 'streak_milestone':
        return {
          ...baseMessageProps,
          title: `${contextData.streak}-Day Streak! 🔥`,
          subtitle: 'You\'ve shown consistency. Time to compete with others who do the same.',
          highlights: [
            { icon: Crown, text: 'Protect your streak with Pro community insights' },
            { icon: Users, text: `See where you rank against ${contextData.streak}-day streakers` },
            { icon: TrendingUp, text: 'Unlock streak bonuses and milestone rewards' },
          ],
          context: 'You\'re invested now. Make it count. Compete in Pro.',
        };

      case 'engagement':
        return {
          ...baseMessageProps,
          title: `You're ${contextData.daysActive} Days Strong 💪`,
          subtitle: 'Consistent engagement reveals the 7%. Time to compete with them.',
          highlights: [
            { icon: TrendingUp, text: 'Leaderboard access - see where you rank' },
            { icon: Zap, text: 'Advanced analytics reveal your performance gaps' },
            { icon: Users, text: 'Join a community of committed athletes' },
          ],
          context: 'You\'ve proven you\'ll stick with this. Upgrade to compete seriously.',
        };

      case 'leaderboard':
        return {
          ...baseMessageProps,
          title: 'You\'d Rank #' + (contextData.estimatedRank || '47'),
          subtitle: 'With Pro, you could compete for the podium. Your discipline deserves an audience.',
          highlights: [
            { icon: Crown, text: 'Compete for weekly rankings and podium positions' },
            { icon: Users, text: 'See exactly where you stand in real-time' },
            { icon: Zap, text: 'Unlock comparison tools and performance insights' },
          ],
          context: 'You\'re close. Upgrade and claim your rank.',
        };

      default:
        return {
          ...baseMessageProps,
          title: 'Unlock Your Full Potential',
          subtitle: 'The free version shows what\'s possible. Pro reveals the truth.',
          highlights: [
            { icon: Users, text: 'Compete on the leaderboard with the committed 7%' },
            { icon: TrendingUp, text: 'Advanced analytics reveal your real progress' },
            { icon: Zap, text: 'Exclusive Pro features for serious athletes' },
          ],
          context: 'Stop wondering. Start competing.',
        };
    }
  };

  const content = getMessageContent();
  const Icon = content.icon;

  const handleUpgrade = () => {
    navigate(createPageUrl('Pricing'));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl"
          >
            {/* Header with gradient accent */}
            <div className="relative p-6 pb-0 overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent" />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors flex items-center justify-center z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon and title */}
              <div className="relative z-10 text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30"
                >
                  <Icon className="w-8 h-8 text-black" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                  {content.title}
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {content.subtitle}
                </p>
              </div>
            </div>

            {/* Highlights */}
            <div className="px-6 py-6 space-y-3">
              {content.highlights.map((highlight, idx) => {
                const HighlightIcon = highlight.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    className="flex gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                      <HighlightIcon className="w-3 h-3 text-amber-400" />
                    </div>
                    <p className="text-sm text-zinc-300 leading-snug">
                      {highlight.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Context/Social proof */}
            {content.context && (
              <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-800/50">
                <p className="text-xs text-zinc-500 italic">
                  "{content.context}"
                </p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="p-6 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgrade}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-amber-500/30"
              >
                Upgrade to Pro
              </motion.button>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium transition-colors duration-200"
              >
                Maybe Later
              </button>

              {/* Trust signal */}
              <p className="text-xs text-center text-zinc-500 pt-2">
                Cancel anytime. No commitment.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}