/**
 * Badge Card Component
 * Displays single badge with tier styling, tooltip, and unlock info
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TIER_COLORS } from './badgeDefinitions';
import { format } from 'date-fns';

export default function BadgeCard({ badge, size = 'md', showTooltip = true }) {
  const [showInfo, setShowInfo] = React.useState(false);
  const colors = TIER_COLORS[badge.tier] || TIER_COLORS.common;

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="relative"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      {/* Badge */}
      <div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-bold cursor-pointer transition-all ${colors.bg} border ${colors.border} ${
          badge.tier === 'legendary' ? 'animate-pulse-glow shadow-lg' : ''
        }`}
        title={badge.name}
      >
        {badge.icon_emoji}
      </div>

      {/* Info Tooltip */}
      {showTooltip && showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-3 whitespace-nowrap shadow-lg"
        >
          <div className={`text-sm font-bold ${colors.text}`}>{badge.name}</div>
          <div className="text-xs text-zinc-400 mt-1">{badge.description}</div>
          {badge.earned_date && (
            <div className="text-xs text-zinc-500 mt-1">
              {format(new Date(badge.earned_date), 'MMM d, yyyy')}
            </div>
          )}
          {badge.points_awarded > 0 && (
            <div className="text-xs text-amber-400 mt-1 font-semibold">
              +{badge.points_awarded} pts
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}