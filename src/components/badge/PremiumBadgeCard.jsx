/**
 * Premium Badge Card (Earned)
 * High-quality badge presentation with rarity styling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RARITY_STYLES, getSizeStyles, TRANSITIONS } from './badgeDesignTokens';

const PremiumBadgeCard = ({ badge, userBadge, onFeature, size = 'medium', featured = false }) => {
  if (!badge) return null;

  const rarityStyle = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
  const sizeStyle = getSizeStyles(size);
  const isLegendary = badge.rarity === 'legendary';

  const containerClasses = `
    relative rounded-2xl p-4 text-center
    ${rarityStyle.background} ${rarityStyle.border} ${rarityStyle.shadow}
    ${TRANSITIONS.normal}
    hover:shadow-lg
    flex flex-col items-center justify-center
    ${sizeStyle.container}
    cursor-pointer
    group
  `;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: parseFloat(rarityStyle.hoverScale) }}
      className={containerClasses}
    >
      {/* Premium glow for legendary badges */}
      {isLegendary && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-transparent opacity-50"
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className="text-4xl mb-3 group-hover:scale-110 transition-transform"
          whileHover={{ rotate: 5 }}
        >
          {badge.icon}
        </motion.div>

        {/* Badge Name */}
        <h3 className={`font-bold text-sm mb-1 text-white line-clamp-2`}>
          {badge.name}
        </h3>

        {/* Rarity & Category */}
        <div className="flex items-center justify-center gap-1 mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${rarityStyle.text}`}>
            {badge.rarity}
          </span>
          {featured && <Sparkles className="w-3 h-3 text-amber-400" />}
        </div>

        {/* Earned Date */}
        {userBadge?.earned_at && (
          <p className="text-xs text-zinc-500 mb-3">
            {new Date(userBadge.earned_at).toLocaleDateString('en-GB', {
              day: 'short',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}

        {/* Points Reward */}
        {badge.points_reward > 0 && (
          <div className="mb-3 inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs font-bold text-amber-400">+{badge.points_reward} pts</p>
          </div>
        )}

        {/* Feature Button */}
        {onFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={() => onFeature.mutate({ badgeId: userBadge.id, featured: !featured })}
              disabled={onFeature.isPending}
              variant="outline"
              size="sm"
              className={`w-full text-xs transition-all rounded-lg ${
                featured
                  ? `${rarityStyle.border} bg-amber-500/10 text-amber-400`
                  : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <Star className={`w-3 h-3 mr-1 ${featured ? 'fill-current' : ''}`} />
              {featured ? 'Featured' : 'Feature'}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PremiumBadgeCard;