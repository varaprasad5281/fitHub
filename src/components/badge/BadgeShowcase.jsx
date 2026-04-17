/**
 * Badge Showcase Component
 * Displays badges grouped by tier or category
 */

import React from 'react';
import { motion } from 'framer-motion';
import BadgeCard from './BadgeCard';
import { TIER_COLORS, CATEGORY_ICONS } from './badgeDefinitions';

const TIER_LABELS = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  elite: 'Elite',
  legendary: 'Legendary',
};

export default function BadgeShowcase({ badges, groupBy = 'tier', maxDisplay = null }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p>No badges earned yet. Keep grinding! 💪</p>
      </div>
    );
  }

  // Group badges
  const grouped = badges.reduce((acc, badge) => {
    const key = groupBy === 'tier' ? badge.tier : badge.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(badge);
    return acc;
  }, {});

  // Sort by tier if grouping by tier
  const tier_order = ['legendary', 'elite', 'rare', 'uncommon', 'common'];
  const sorted = groupBy === 'tier'
    ? Object.keys(grouped).sort((a, b) => tier_order.indexOf(a) - tier_order.indexOf(b))
    : Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {sorted.map((groupKey) => {
        const groupBadges = grouped[groupKey];
        const displayCount = maxDisplay ? Math.min(groupBadges.length, maxDisplay) : groupBadges.length;
        const label = groupBy === 'tier' ? TIER_LABELS[groupKey] : groupKey;
        const colors = groupBy === 'tier' ? TIER_COLORS[groupKey] : TIER_COLORS.uncommon;

        return (
          <motion.div
            key={groupKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-3">
              <h3 className={`text-sm font-semibold ${colors.text} uppercase tracking-wider`}>
                {groupBy === 'category' && CATEGORY_ICONS[groupKey]}{' '}
                {label} ({groupBadges.length})
              </h3>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {groupBadges.slice(0, displayCount).map((badge) => (
                <BadgeCard key={badge.badge_id} badge={badge} size="md" />
              ))}
              {displayCount < groupBadges.length && (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-xs text-zinc-500 font-semibold">
                  +{groupBadges.length - displayCount}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}