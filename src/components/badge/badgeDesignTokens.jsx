/**
 * Badge Design System Tokens
 * Centralized styling constants for premium badge presentation
 */

export const BADGE_RARITY = {
  common: 'common',
  uncommon: 'uncommon',
  rare: 'rare',
  elite: 'elite',
  legendary: 'legendary',
};

export const RARITY_STYLES = {
  common: {
    background: 'bg-zinc-900/60',
    border: 'border border-zinc-600/40',
    text: 'text-zinc-400',
    shadow: 'shadow-none',
    glow: 'none',
    accent: 'none',
    hoverScale: '1.02',
  },
  uncommon: {
    background: 'bg-slate-900/70',
    border: 'border-1.5 border-slate-600/50',
    text: 'text-slate-300',
    shadow: 'shadow-md shadow-slate-600/15',
    glow: 'shadow-slate-600/20',
    accent: 'from-slate-600/20',
    hoverScale: '1.03',
  },
  rare: {
    background: 'bg-purple-950/80',
    border: 'border-1.5 border-purple-600/40',
    text: 'text-purple-300',
    shadow: 'shadow-lg shadow-purple-600/20',
    glow: 'shadow-purple-600/30',
    accent: 'from-purple-600/20',
    hoverScale: '1.04',
  },
  elite: {
    background: 'bg-amber-950/90',
    border: 'border-2 border-amber-600/60',
    text: 'text-amber-300',
    shadow: 'shadow-xl shadow-amber-600/25',
    glow: 'shadow-amber-500/40',
    accent: 'from-amber-500/30',
    hoverScale: '1.05',
  },
  legendary: {
    background: 'bg-amber-950',
    border: 'border-2 border-amber-400/70',
    text: 'text-amber-200',
    shadow: 'shadow-2xl shadow-amber-400/30',
    glow: 'shadow-amber-400/50',
    accent: 'from-amber-400/40',
    hoverScale: '1.06',
  },
};

export const BADGE_SIZES = {
  small: {
    container: 'w-10 h-10',
    icon: 'w-4 h-4',
    borderRadius: 'rounded-lg',
    padding: 'p-2',
    fontSize: 'text-xs',
  },
  medium: {
    container: 'w-24 h-32',
    icon: 'w-8 h-8',
    borderRadius: 'rounded-2xl',
    padding: 'p-4',
    fontSize: 'text-sm',
  },
  large: {
    container: 'w-32 h-44',
    icon: 'w-12 h-12',
    borderRadius: 'rounded-3xl',
    padding: 'p-6',
    fontSize: 'text-base',
  },
  xl: {
    container: 'w-48 h-56',
    icon: 'w-20 h-20',
    borderRadius: 'rounded-3xl',
    padding: 'p-8',
    fontSize: 'text-lg',
  },
};

export const BADGE_ANIMATIONS = {
  unlock: {
    duration: 400,
    easing: 'ease-out',
    initialScale: 0.8,
    finalScale: 1.0,
  },
  hoverGlow: {
    duration: 200,
    easing: 'ease-in-out',
  },
  shimmer: {
    duration: 2000,
    easing: 'ease-in-out',
    opacityMin: 0.8,
    opacityMax: 1.0,
  },
  pulse: {
    duration: 800,
    easing: 'ease-in-out',
    scaleMin: 0.9,
    scaleMax: 1.1,
  },
};

export const BADGE_ICONS = {
  // Streak / Discipline
  streak_flame: '🔥',
  streak_chain: '⛓️',
  streak_shield: '🛡️',
  streak_lightning: '⚡',
  streak_crown: '👑',

  // Workout
  workout_dumbbell: '💪',
  workout_barbell: '🏋️',
  workout_stopwatch: '⏱️',
  workout_runner: '🏃',

  // Nutrition
  nutrition_plate: '🍽️',
  nutrition_target: '🎯',
  nutrition_chart: '📊',
  nutrition_egg: '🥚',

  // Leaderboard
  leaderboard_medal: '🏅',
  leaderboard_trophy: '🏆',
  leaderboard_first: '🥇',
  leaderboard_champion: '👑',

  // Membership
  membership_star: '⭐',
  membership_gem: '💎',
  membership_founder: '🏗️',

  // Identity
  identity_seven: '7️⃣',
  identity_discipline: '🎖️',
  identity_mark: '✦',

  // Seasonal
  seasonal_snowflake: '❄️',
  seasonal_sprout: '🌱',
  seasonal_sun: '☀️',

  // Utility
  lock: '🔒',
  checkmark: '✓',
};

// Shadow definitions for different elevations
export const SHADOWS = {
  uncommon: 'shadow-md',
  rare: 'shadow-lg',
  elite: 'shadow-xl',
  legendary: 'shadow-2xl',
};

// Glow filters for premium feel
export const GLOW_FILTERS = {
  uncommon: 'drop-shadow-lg drop-shadow-slate-600/15',
  rare: 'drop-shadow-lg drop-shadow-purple-600/20',
  elite: 'drop-shadow-lg drop-shadow-amber-600/30',
  legendary: 'drop-shadow-lg drop-shadow-amber-400/40',
};

// Transition timings
export const TRANSITIONS = {
  fast: 'transition-all duration-200 ease-in-out',
  normal: 'transition-all duration-300 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
};

export const getRarityStyles = (rarity) => {
  return RARITY_STYLES[rarity] || RARITY_STYLES.common;
};

export const getSizeStyles = (size) => {
  return BADGE_SIZES[size] || BADGE_SIZES.medium;
};

export const getIcon = (iconKey) => {
  return BADGE_ICONS[iconKey] || '⭐';
};