/**
 * Badge Icons Guide Component
 * Visual reference for all badge icons in the design system
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BADGE_ICONS } from './badgeDesignTokens';

const IconCategory = ({ title, icons }) => (
  <div className="mb-8">
    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-zinc-700">
      {title}
    </h3>
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
      {Object.entries(icons).map(([key, icon]) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          className="flex flex-col items-center p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-colors"
        >
          <div className="text-4xl mb-2">{icon}</div>
          <p className="text-xs text-zinc-500 text-center line-clamp-2 break-words">
            {key.replace(/_/g, ' ')}
          </p>
        </motion.div>
      ))}
    </div>
  </div>
);

export default function BadgeIconsGuide() {
  const streakIcons = Object.entries(BADGE_ICONS)
    .filter(([key]) => key.startsWith('streak_'))
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  const workoutIcons = Object.entries(BADGE_ICONS)
    .filter(([key]) => key.startsWith('workout_'))
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  const nutritionIcons = Object.entries(BADGE_ICONS)
    .filter(([key]) => key.startsWith('nutrition_'))
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  const leaderboardIcons = Object.entries(BADGE_ICONS)
    .filter(([key]) => key.startsWith('leaderboard_'))
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  const membershipIcons = Object.entries(BADGE_ICONS)
    .filter(([key]) => key.startsWith('membership_'))
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  const identityIcons = Object.entries(BADGE_ICONS)
    .filter(([key]) => key.startsWith('identity_'))
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  const seasonalIcons = Object.entries(BADGE_ICONS)
    .filter(([key]) => key.startsWith('seasonal_'))
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Badge Icons Guide</h1>
          <p className="text-zinc-400">
            Complete icon library for the 7% badge system. Consistent, minimal, modern design.
          </p>
        </div>

        <IconCategory title="🔥 Streak & Discipline" icons={streakIcons} />
        <IconCategory title="💪 Workout" icons={workoutIcons} />
        <IconCategory title="🍽️ Nutrition" icons={nutritionIcons} />
        <IconCategory title="🏆 Leaderboard" icons={leaderboardIcons} />
        <IconCategory title="⭐ Membership" icons={membershipIcons} />
        <IconCategory title="✦ Identity" icons={identityIcons} />
        <IconCategory title="❄️ Seasonal" icons={seasonalIcons} />

        {/* Design Rules */}
        <div className="mt-12 p-6 rounded-2xl bg-amber-950/30 border border-amber-500/20">
          <h2 className="text-xl font-bold text-amber-200 mb-4">Design Rules</h2>
          <ul className="space-y-2 text-amber-100/80 text-sm">
            <li>✓ All icons are minimal and modern</li>
            <li>✓ Strong silhouette clarity at 16px–80px</li>
            <li>✓ No cartoon style, flat with subtle depth</li>
            <li>✓ Work in monochrome and rarity colors</li>
            <li>✓ Consistent stroke weight (2–3px)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}