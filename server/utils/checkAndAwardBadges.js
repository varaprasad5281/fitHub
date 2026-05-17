/**
 * checkAndAwardBadges(userEmail)
 *
 * Queries the user's current stats, checks every badge definition,
 * and awards any newly-unlocked badges via UserBadge.create().
 * Safe to call multiple times - duplicate awards are ignored via
 * the unique index on (created_by, badge_code).
 *
 * Returns: array of newly-awarded badge codes (may be empty).
 */

const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const WorkoutCompletion = require('../models/WorkoutCompletion');
const MealLog = require('../models/MealLog');
const Points = require('../models/Points');
const Streak = require('../models/Streak');
const Friendship = require('../models/Friendship');
const Referral = require('../models/Referral');
const { notify } = require('./notify');

// Map requirement_type → function that returns the user's current value
const STAT_FETCHERS = {
  workouts_completed: async (email) =>
    WorkoutCompletion.countDocuments({ created_by: email }),

  meals_logged: async (email) =>
    MealLog.countDocuments({ created_by: email }),

  total_points: async (email) => {
    const doc = await Points.findOne({ created_by: email }).lean();
    return doc?.total_points || 0;
  },

  streak_days: async (email) => {
    const doc = await Streak.findOne({ created_by: email, streak_type: 'workout' }).lean();
    // Use longest_count so the badge stays earned even if the streak resets
    return doc?.longest_count || 0;
  },

  friends_count: async (email) =>
    Friendship.countDocuments({
      $or: [{ requester_email: email }, { receiver_email: email }],
      status: 'accepted',
    }),

  referrals_count: async (email) =>
    Referral.countDocuments({ referrer_email: email, status: 'completed' }),
};

async function checkAndAwardBadges(userEmail) {
  const newlyAwarded = [];

  try {
    // Load all badge definitions
    const allBadges = await Badge.find({}).lean();
    if (allBadges.length === 0) return newlyAwarded; // nothing seeded yet

    // Load badges the user already has
    const existingUserBadges = await UserBadge.find({ created_by: userEmail }).lean();
    const earnedCodes = new Set(existingUserBadges.map(ub => ub.badge_code));

    // Group uneearned badges by requirement_type so we only fetch each stat once
    const unearnedBadges = allBadges.filter(b => !earnedCodes.has(b.badge_code));
    if (unearnedBadges.length === 0) return newlyAwarded;

    const typeGroups = {};
    for (const badge of unearnedBadges) {
      if (!badge.requirement_type || badge.requirement_value == null) continue;
      if (!typeGroups[badge.requirement_type]) typeGroups[badge.requirement_type] = [];
      typeGroups[badge.requirement_type].push(badge);
    }

    // Fetch each required stat once, then evaluate badges
    for (const [reqType, badges] of Object.entries(typeGroups)) {
      const fetcher = STAT_FETCHERS[reqType];
      if (!fetcher) continue; // unknown requirement type - skip

      const currentValue = await fetcher(userEmail);

      for (const badge of badges) {
        if (currentValue >= badge.requirement_value) {
          try {
            await UserBadge.create({
              created_by: userEmail,
              badge_id: badge._id,
              badge_code: badge.badge_code,
              achievement_notes: `Auto-awarded: ${reqType}=${currentValue} ≥ ${badge.requirement_value}`,
            });
            newlyAwarded.push(badge.badge_code);

            // Send in-app notification
            const rarityEmoji = { common: '🥉', rare: '🥈', epic: '🥇', legendary: '✨' };
            notify(
              userEmail,
              `${rarityEmoji[badge.rarity_level] || '🏅'} New badge unlocked: "${badge.name}" - ${badge.description}`,
              'badge_earned'
            );
          } catch (err) {
            // Ignore duplicate key errors (race conditions / double-calls)
            if (err.code !== 11000) {
              console.error(`[checkAndAwardBadges] Failed to award ${badge.badge_code}:`, err.message);
            }
          }
        }
      }
    }
  } catch (err) {
    // Never crash the caller - badge awarding is a background concern
    console.error('[checkAndAwardBadges] Error:', err.message);
  }

  return newlyAwarded;
}

module.exports = checkAndAwardBadges;
