/**
 * Locked Badge Card
 * Shows badges user hasn't earned yet with progress indicator
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { RARITY_STYLES, getSizeStyles, TRANSITIONS } from './badgeDesignTokens';

const LockedBadgeCard = ({ badge, progress, size = 'medium' }) => {
  if (!badge) return null;

  const rarityStyle = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
  const sizeStyle = getSizeStyles(size);
  const progressPercent = progress
    ? Math.round((progress.current_value / progress.target_value) * 100)
    : 0;

  const containerClasses = `
    relative rounded-2xl p-4 text-center
    bg-zinc-900/40 border border-zinc-700/50
    ${TRANSITIONS.normal}
    flex flex-col items-center justify-center
    ${sizeStyle.container}
    opacity-60
  `;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={containerClasses}
      whileHover={{ scale: 1.02 }}
    >
      {/* Lock overlay */}
      <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
        <Lock className="w-3 h-3 text-zinc-500" />
      </div>

      {/* Content */}
      <div className="relative z-5">
        {/* Icon - Greyed out */}
        <div className="text-4xl mb-3 opacity-50 grayscale">{badge.icon}</div>

        {/* Badge Name */}
        <h3 className="font-bold text-sm mb-1 text-zinc-500 line-clamp-2">{badge.name}</h3>

        {/* Rarity */}
        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">
          {badge.rarity}
        </p>

        {/* Requirement */}
        <p className="text-xs text-zinc-600 mb-3 line-clamp-2">{badge.description}</p>

        {/* Progress bar (if applicable) */}
        {progress && progress.current_value < progress.target_value && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <div className="mb-2 h-2 bg-zinc-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-zinc-500 to-zinc-400"
              />
            </div>
            <p className="text-xs text-zinc-600 font-semibold">
              {progress.current_value} / {progress.target_value}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LockedBadgeCard;