/**
 * Premium Badge Unlock Modal
 * Shows when user earns a badge with prestige-driven animations
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RARITY_STYLES } from './badgeDesignTokens';
import RewardShowcase from './RewardShowcase';

const BadgePremiumUnlock = ({ badge, userBadge, rewards, onFeature, onClose }) => {
  const [isPulsing, setIsPulsing] = useState(true);

  // Auto pulse for 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => setIsPulsing(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  // Auto close after 6 seconds
  useEffect(() => {
    const timeout = setTimeout(() => onClose?.(), 6000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  const rarityStyle = RARITY_STYLES[badge?.rarity] || RARITY_STYLES.common;
  const isLegendary = badge?.rarity === 'legendary';

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
            duration: 0.4,
          }}
          onClick={(e) => e.stopPropagation()}
          className={`relative max-w-md w-full rounded-3xl overflow-hidden ${rarityStyle.background} ${rarityStyle.border} ${rarityStyle.shadow}`}
        >
          {/* Premium glow background */}
          {isLegendary && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-50" />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>

          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Badge earned label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              {isLegendary && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  ✨
                </motion.span>
              )}
              <span className={`text-xs font-bold uppercase tracking-widest ${rarityStyle.text}`}>
                🏆 Badge Unlocked
              </span>
              {isLegendary && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  ✨
                </motion.span>
              )}
            </motion.div>

            {/* Icon with animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6 inline-block relative"
            >
              {/* Glow effect */}
              <motion.div
                animate={isPulsing ? { scale: [1, 1.3, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.8, times: [0, 0.5, 1] }}
                className={`absolute inset-0 rounded-full ${
                  badge?.rarity === 'uncommon'
                    ? 'shadow-lg shadow-slate-600/30'
                    : badge?.rarity === 'rare'
                    ? 'shadow-lg shadow-purple-600/40'
                    : badge?.rarity === 'elite'
                    ? 'shadow-xl shadow-amber-600/50'
                    : badge?.rarity === 'legendary'
                    ? 'shadow-2xl shadow-amber-400/60'
                    : ''
                }`}
              />

              {/* Icon */}
              <motion.div
                animate={isPulsing ? { scale: [0.9, 1.1, 0.9], rotate: [0, 5, -5, 0] } : {}}
                transition={{ repeat: Infinity, duration: 0.8, times: [0, 0.25, 0.75, 1] }}
                className="relative text-8xl"
              >
                {badge?.icon}
              </motion.div>
            </motion.div>

            {/* Badge name */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {badge?.name}
            </motion.h2>

            {/* Rarity */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-xs font-semibold uppercase tracking-wider mb-4 ${rarityStyle.text}`}
            >
              {badge?.rarity} • {badge?.category}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-zinc-400 text-sm mb-6 leading-relaxed"
            >
              {badge?.description}
            </motion.p>

            {/* Points reward */}
            {badge?.points_reward > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-8 inline-block px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30"
              >
                <p className="text-amber-400 font-bold text-lg">
                  +{badge.points_reward} Points
                </p>
              </motion.div>
            )}

            {/* Rewards */}
            {rewards && rewards.length > 0 && (
              <RewardShowcase rewards={rewards} />
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-3"
            >
              <Button
                onClick={() => {
                  onFeature?.();
                  onClose?.();
                }}
                className={`flex-1 font-semibold rounded-xl h-11 transition-all ${
                  badge?.rarity === 'uncommon'
                    ? 'bg-slate-600 hover:bg-slate-700 text-white'
                    : badge?.rarity === 'rare'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : badge?.rarity === 'elite'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : badge?.rarity === 'legendary'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black'
                    : 'bg-zinc-600 hover:bg-zinc-700 text-white'
                }`}
              >
                <Star className="w-4 h-4 mr-2" />
                Feature Badge
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl h-11"
              >
                View All
              </Button>
            </motion.div>
          </div>

          {/* Bottom accent bar (Elite/Legendary) */}
          {(badge?.rarity === 'elite' || badge?.rarity === 'legendary') && (
            <div className={`h-1 w-full ${
              badge?.rarity === 'elite'
                ? 'bg-gradient-to-r from-amber-600/0 via-amber-500 to-amber-600/0'
                : 'bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0'
            }`} />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgePremiumUnlock;