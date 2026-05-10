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
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1TPxvUDnPcosh0zXWaxTeACG',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_1TPxyPDnPcosh0zXVsW0oeJT',
  elite_monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY || 'price_1TPxzADnPcosh0zXSEK45dWU',
  elite_yearly: process.env.STRIPE_PRICE_ELITE_YEARLY || 'price_1TPxzYDnPcosh0zXe3xIhFES',
};

const LEVEL_THRESHOLDS = {
  1: 0, 2: 100, 3: 300, 4: 700, 5: 1500,
  6: 3000, 7: 6000, 8: 11000, 9: 19000, 10: 30000,
};

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
  PLANS, PRICE_MAP, LEVEL_THRESHOLDS,
  isPremiumPlan, isElitePlan, getWeekStart,
};
