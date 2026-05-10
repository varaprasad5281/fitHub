/**
 * seedBadges.js
 * Run once to populate the Badge collection with all badge definitions.
 * Usage: node server/scripts/seedBadges.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Badge = require('../models/Badge');

const BADGES = [
  // ─── WORKOUT ──────────────────────────────────────────────────────────────
  {
    badge_code: 'WORKOUT_FIRST',
    name: 'First Step',
    description: 'Complete your very first workout.',
    icon: '👟',
    rarity_level: 'common',
    category: 'workout',
    requirement_type: 'workouts_completed',
    requirement_value: 1,
  },
  {
    badge_code: 'WORKOUT_5',
    name: 'Warm Up',
    description: 'Complete 5 workouts.',
    icon: '🔥',
    rarity_level: 'common',
    category: 'workout',
    requirement_type: 'workouts_completed',
    requirement_value: 5,
  },
  {
    badge_code: 'WORKOUT_10',
    name: 'Getting Serious',
    description: 'Complete 10 workouts.',
    icon: '💪',
    rarity_level: 'common',
    category: 'workout',
    requirement_type: 'workouts_completed',
    requirement_value: 10,
  },
  {
    badge_code: 'WORKOUT_25',
    name: 'Committed',
    description: 'Complete 25 workouts. Consistency is building.',
    icon: '🏋️',
    rarity_level: 'rare',
    category: 'workout',
    requirement_type: 'workouts_completed',
    requirement_value: 25,
  },
  {
    badge_code: 'WORKOUT_50',
    name: 'Iron Will',
    description: 'Complete 50 workouts. Halfway to a century.',
    icon: '⚡',
    rarity_level: 'rare',
    category: 'workout',
    requirement_type: 'workouts_completed',
    requirement_value: 50,
  },
  {
    badge_code: 'WORKOUT_100',
    name: 'Century Club',
    description: 'Complete 100 workouts. You have earned your place.',
    icon: '💯',
    rarity_level: 'epic',
    category: 'workout',
    requirement_type: 'workouts_completed',
    requirement_value: 100,
  },
  {
    badge_code: 'WORKOUT_250',
    name: 'Elite Athlete',
    description: 'Complete 250 workouts. A true dedication to excellence.',
    icon: '🏆',
    rarity_level: 'legendary',
    category: 'workout',
    requirement_type: 'workouts_completed',
    requirement_value: 250,
  },

  // ─── STREAK ───────────────────────────────────────────────────────────────
  {
    badge_code: 'STREAK_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day workout streak.',
    icon: '📅',
    rarity_level: 'common',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 7,
  },
  {
    badge_code: 'STREAK_14',
    name: 'Two Weeks Strong',
    description: 'Maintain a 14-day workout streak.',
    icon: '🗓️',
    rarity_level: 'common',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 14,
  },
  {
    badge_code: 'STREAK_30',
    name: 'Monthly Grinder',
    description: 'Maintain a 30-day workout streak. A full month of dedication.',
    icon: '🌟',
    rarity_level: 'rare',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 30,
  },
  {
    badge_code: 'STREAK_60',
    name: 'Unstoppable',
    description: 'Maintain a 60-day workout streak.',
    icon: '🚀',
    rarity_level: 'rare',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 60,
  },
  {
    badge_code: 'STREAK_100',
    name: 'Triple Digits',
    description: 'Maintain a 100-day workout streak. Remarkable discipline.',
    icon: '💎',
    rarity_level: 'epic',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 100,
  },
  {
    badge_code: 'STREAK_200',
    name: 'Half Year Hustle',
    description: 'Maintain a 200-day workout streak.',
    icon: '👑',
    rarity_level: 'legendary',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 200,
  },
  {
    badge_code: 'STREAK_365',
    name: 'Year of Discipline',
    description: 'Maintain a 365-day workout streak. A full year of commitment.',
    icon: '🌠',
    rarity_level: 'legendary',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 365,
  },

  // ─── NUTRITION ────────────────────────────────────────────────────────────
  {
    badge_code: 'NUTRITION_FIRST',
    name: 'First Bite',
    description: 'Log your very first meal.',
    icon: '🥗',
    rarity_level: 'common',
    category: 'nutrition',
    requirement_type: 'meals_logged',
    requirement_value: 1,
  },
  {
    badge_code: 'NUTRITION_20',
    name: 'Meal Tracker',
    description: 'Log 20 meals. Building healthy habits.',
    icon: '🍎',
    rarity_level: 'common',
    category: 'nutrition',
    requirement_type: 'meals_logged',
    requirement_value: 20,
  },
  {
    badge_code: 'NUTRITION_50',
    name: 'Nutrition Novice',
    description: 'Log 50 meals. You know what you eat.',
    icon: '🥦',
    rarity_level: 'common',
    category: 'nutrition',
    requirement_type: 'meals_logged',
    requirement_value: 50,
  },
  {
    badge_code: 'NUTRITION_100',
    name: 'Diet Discipline',
    description: 'Log 100 meals. Nutrition is your superpower.',
    icon: '🍽️',
    rarity_level: 'rare',
    category: 'nutrition',
    requirement_type: 'meals_logged',
    requirement_value: 100,
  },
  {
    badge_code: 'NUTRITION_250',
    name: 'Macro Master',
    description: 'Log 250 meals. Complete nutritional mastery.',
    icon: '⚗️',
    rarity_level: 'epic',
    category: 'nutrition',
    requirement_type: 'meals_logged',
    requirement_value: 250,
  },

  // ─── POINTS / LEVEL ───────────────────────────────────────────────────────
  {
    badge_code: 'POINTS_100',
    name: 'Point Scorer',
    description: 'Earn 100 total points.',
    icon: '⭐',
    rarity_level: 'common',
    category: 'points',
    requirement_type: 'total_points',
    requirement_value: 100,
  },
  {
    badge_code: 'POINTS_500',
    name: 'Rising Star',
    description: 'Earn 500 total points.',
    icon: '🌙',
    rarity_level: 'common',
    category: 'points',
    requirement_type: 'total_points',
    requirement_value: 500,
  },
  {
    badge_code: 'POINTS_1000',
    name: 'Power Player',
    description: 'Earn 1,000 total points.',
    icon: '💥',
    rarity_level: 'rare',
    category: 'points',
    requirement_type: 'total_points',
    requirement_value: 1000,
  },
  {
    badge_code: 'POINTS_2500',
    name: 'Elite Performer',
    description: 'Earn 2,500 total points. You are among the best.',
    icon: '🎯',
    rarity_level: 'rare',
    category: 'points',
    requirement_type: 'total_points',
    requirement_value: 2500,
  },
  {
    badge_code: 'POINTS_5000',
    name: 'Champion',
    description: 'Earn 5,000 total points. A true champion.',
    icon: '🥇',
    rarity_level: 'epic',
    category: 'points',
    requirement_type: 'total_points',
    requirement_value: 5000,
  },
  {
    badge_code: 'POINTS_10000',
    name: 'Legend',
    description: 'Earn 10,000 total points. Legendary status achieved.',
    icon: '🌌',
    rarity_level: 'legendary',
    category: 'points',
    requirement_type: 'total_points',
    requirement_value: 10000,
  },

  // ─── SOCIAL ───────────────────────────────────────────────────────────────
  {
    badge_code: 'SOCIAL_FIRST',
    name: 'Social Butterfly',
    description: 'Add your first friend.',
    icon: '🦋',
    rarity_level: 'common',
    category: 'social',
    requirement_type: 'friends_count',
    requirement_value: 1,
  },
  {
    badge_code: 'SOCIAL_5',
    name: 'Friend Circle',
    description: 'Connect with 5 friends.',
    icon: '🤝',
    rarity_level: 'common',
    category: 'social',
    requirement_type: 'friends_count',
    requirement_value: 5,
  },
  {
    badge_code: 'SOCIAL_10',
    name: 'Squad Goals',
    description: 'Connect with 10 friends. The more, the merrier.',
    icon: '👥',
    rarity_level: 'rare',
    category: 'social',
    requirement_type: 'friends_count',
    requirement_value: 10,
  },

  // ─── EXCLUSIVE ────────────────────────────────────────────────────────────
  // These badges are awarded manually or by scheduled jobs - not via checkAndAwardBadges.
  // requirement_type is null so they never show a progress bar.
  {
    badge_code: 'FOUNDER',
    name: 'Beta Founder',
    description: 'Exclusive Beta Badge - you were here from day one. A permanent mark of founding membership.',
    icon: '🌐',
    rarity_level: 'legendary',
    category: 'exclusive',
    requirement_type: null,
    requirement_value: null,
  },

  // Weekly leaderboard - single occurrence
  {
    badge_code: 'LEADER_TOP3',
    name: 'Podium',
    description: 'Finished in the top 3 on a weekly leaderboard. Stay consistent.',
    icon: '🏅',
    rarity_level: 'rare',
    category: 'exclusive',
    requirement_type: null,
    requirement_value: null,
  },
  {
    badge_code: 'LEADER_TOP1',
    name: 'Weekly Champion',
    description: 'Finished #1 on a weekly leaderboard. The top belongs to you.',
    icon: '🥇',
    rarity_level: 'epic',
    category: 'exclusive',
    requirement_type: null,
    requirement_value: null,
  },

  // Weekly leaderboard - consecutive weeks in top 3
  {
    badge_code: 'LEADER_TOP3_3W',
    name: 'Hat Trick',
    description: 'Stayed in the top 3 for 3 consecutive weeks. Momentum is a weapon.',
    icon: '🎩',
    rarity_level: 'rare',
    category: 'exclusive',
    requirement_type: null,
    requirement_value: null,
  },
  {
    badge_code: 'LEADER_TOP3_5W',
    name: 'Podium Regular',
    description: 'Stayed in the top 3 for 5 consecutive weeks. The leaderboard knows your name.',
    icon: '🔱',
    rarity_level: 'epic',
    category: 'exclusive',
    requirement_type: null,
    requirement_value: null,
  },
  {
    badge_code: 'LEADER_TOP3_10W',
    name: 'Leaderboard Legend',
    description: 'Stayed in the top 3 for 10 consecutive weeks. An era of dominance.',
    icon: '🌌',
    rarity_level: 'legendary',
    category: 'exclusive',
    requirement_type: null,
    requirement_value: null,
  },

  // Weekly leaderboard - consecutive weeks at #1
  {
    badge_code: 'LEADER_TOP1_3W',
    name: 'Triple Crown',
    description: '#1 on the leaderboard for 3 consecutive weeks. A dynasty begins.',
    icon: '👑',
    rarity_level: 'epic',
    category: 'exclusive',
    requirement_type: null,
    requirement_value: null,
  },
  {
    badge_code: 'LEADER_TOP1_5W',
    name: 'Untouchable',
    description: '#1 on the leaderboard for 5 consecutive weeks. No one comes close.',
    icon: '⚡',
    rarity_level: 'legendary',
    category: 'exclusive',
    requirement_type: null,
    requirement_value: null,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || '7percent',
    });
    console.log('Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const badge of BADGES) {
      const exists = await Badge.findOne({ badge_code: badge.badge_code });
      if (exists) {
        skipped++;
        continue;
      }
      await Badge.create(badge);
      console.log(`  ✓ Created: ${badge.badge_code} - ${badge.name}`);
      created++;
    }

    console.log(`\nDone. Created ${created}, skipped ${skipped} (already existed).`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
