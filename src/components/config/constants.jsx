/**
 * Frontend configuration and constants
 * Shared across all React components
 */

export const APP_CONFIG = {
  name: '7%',
  tagline: 'Most people quit. The 7% stay disciplined.',
  supportEmail: 'support@7percent.app'
};

export const ROUTES = {
  HOME: 'Home',
  PRICING: 'Pricing',
  ONBOARDING: 'Onboarding',
  DASHBOARD: 'Dashboard',
  NUTRITION: 'Nutrition',
  WORKOUTS: 'Workouts',
  PROGRESS: 'Progress',
  LEADERBOARD: 'Leaderboard',
  SUBSCRIPTION: 'Subscription',
  PROFILE: 'Profile',
  PRIVACY: 'Privacy',
  TERMS: 'Terms'
};

export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    features: ['Basic tracking', 'Workout library', 'Meal logging']
  },
  pro: {
    name: '7% Pro',
    features: ['Leaderboard access', 'Weekly challenges', 'Streak multipliers', 'Badge system'],
    monthlyPrice: '£12.99',
    yearlyPrice: '£99'
  },
  elite: {
    name: '7% Elite',
    features: ['Elite leaderboard', 'Private chat', 'Advanced AI coaching', 'Profile highlights'],
    monthlyPrice: '£24.99',
    yearlyPrice: '£199'
  }
};

// Reusable gold shine class names (defined in globals.css)
export const GOLD = {
  shine: 'gold-shine',        // light-sweep — buttons, cards, badges
  textShine: 'gold-text-shine', // glow-pulse  — amber text, headings
};

export const ANIMATION_DELAYS = {
  stagger: 0.1,
  card: 0.2,
  long: 0.4
};

export const QUERY_KEYS = {
  profile: ['profile'],
  streak: ['streak'],
  points: ['points'],
  workouts: ['workouts'],
  meals: ['meals'],
  subscription: ['subscription'],
  leaderboard: ['leaderboard'],
  notifications: ['notifications']
};