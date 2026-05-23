// Mirrors base44/functions/utils/constants/entry.ts

const POINTS = {
  WORKOUT_COMPLETION: 25,
  THREE_MEALS_LOGGED: 15,
  CALORIE_TARGET_MET: 10,
  PROTEIN_TARGET_MET: 10,
  COACHING_FEEDBACK: 10,
  WEEKLY_TARGET: 100,
  DAILY_MAX: 60,
};

const STREAKS = {
  MINIMUM_WORKOUTS_PER_WEEK: 3,
  DAYS_BEFORE_BREAK: 7,
  MILESTONE_WEEKS: [4, 8, 12, 26, 52],
};

const LEADERBOARD = {
  PODIUM_RANKS: [1, 2, 3],
  MAX_DISPLAY: 100,
  RESET_DAY: 1, // Monday
};

const NUTRITION = {
  CALORIE_TOLERANCE: 0.1,
  PROTEIN_PER_KG: {
    lose_weight: 2.0,
    build_muscle: 2.2,
    improve_endurance: 1.8,
    stay_active: 1.6,
    flexibility: 1.6,
  },
};

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

const PLANS = {
  STARTER: 'starter',
  PRO_MONTHLY: 'pro_monthly',
  PRO_YEARLY: 'pro_yearly',
  ELITE_MONTHLY: 'elite_monthly',
  ELITE_YEARLY: 'elite_yearly',
};

const PRICE_MAP = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1T0ArsDELQ2VxPfdUDBXE7AG',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_1T0BKHDELQ2VxPfdoiLuP8Zx',
  elite_monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY || 'price_1T0C7zDELQ2VxPfdd2wDQ7v9',
  elite_yearly: process.env.STRIPE_PRICE_ELITE_YEARLY || 'price_1T0C7zDELQ2VxPfdttBUeBuJ',
};

// Cumulative XP thresholds to REACH each level.
// Each level's XP gap = Math.floor(100 * 1.2^(n-1)), compounding 20% per level.
// Gap sequence: 100, 120, 144, 172, 207, 248, 298, 358, 429, 515, 619, 743, 891 ...
const LEVEL_THRESHOLDS = {
  1: 0,      2: 100,    3: 220,    4: 364,    5: 536,
  6: 743,    7: 991,    8: 1_289,  9: 1_647,  10: 2_076,
  11: 2_591, 12: 3_210, 13: 3_953, 14: 4_844, 15: 5_913,
  16: 7_196, 17: 8_736, 18: 10_584, 19: 12_802, 20: 15_464,
  21: 18_658, 22: 22_491, 23: 27_091, 24: 32_611, 25: 39_235,
  26: 47_184, 27: 56_723, 28: 68_170, 29: 81_907, 30: 98_391,
};

const MAX_LEVEL = Math.max(...Object.keys(LEVEL_THRESHOLDS).map(Number));

function isPremiumPlan(plan) {
  return [PLANS.PRO_MONTHLY, PLANS.PRO_YEARLY, PLANS.ELITE_MONTHLY, PLANS.ELITE_YEARLY].includes(plan);
}

function isElitePlan(plan) {
  return [PLANS.ELITE_MONTHLY, PLANS.ELITE_YEARLY].includes(plan);
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

module.exports = {
  POINTS, STREAKS, LEADERBOARD, NUTRITION, ACTIVITY_MULTIPLIERS,
  PLANS, PRICE_MAP, LEVEL_THRESHOLDS, MAX_LEVEL,
  isPremiumPlan, isElitePlan, getWeekStart,
};
