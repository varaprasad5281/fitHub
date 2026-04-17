/**
 * Badge Unlock Notification
 * Celebratory popup when badge is earned
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TIER_COLORS } from './badgeDefinitions';
import { Sparkles } from 'lucide-react';

export default function BadgeNotification({ badge, isOpen, onClose }) {
  const colors = TIER_COLORS[badge?.tier] || TIER_COLORS.common;

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-xl p-6 shadow-2xl max-w-sm`}>
            <div className="flex items-start gap-4">
              {/* Badge */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className={`w-20 h-20 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 ${colors.bg} border ${colors.border}`}
              >
                {badge.icon_emoji}
              </motion.div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className={`w-4 h-4 ${colors.text}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${colors.text}`}>
                    Badge Unlocked
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{badge.name}</h3>
                <p className="text-sm text-zinc-400 mb-3">{badge.description}</p>

                {badge.points_awarded > 0 && (
                  <div className="text-sm font-bold text-amber-400">
                    +{badge.points_awarded} Points
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar (fill animation) */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-b-2xl"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}