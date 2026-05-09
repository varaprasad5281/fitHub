/**
 * getBadges   — action: 'all' | 'me' | 'progress'
 *
 * action: 'me'       → only earned badges (with badge details)
 * action: 'all'      → every badge with earned flag
 * action: 'progress' → every badge with earned flag + real progress % toward requirement
 */

const Badge = require('../../models/Badge');
const UserBadge = require('../../models/UserBadge');
const Points = require('../../models/Points');
const WorkoutCompletion = require('../../models/WorkoutCompletion');
const MealLog = require('../../models/MealLog');
const Streak = require('../../models/Streak');
const Friendship = require('../../models/Friendship');

/** Fetch all stats needed for progress calculation in one pass */
async function fetchUserStats(userEmail) {
  const [pointsDoc, workoutsCount, mealsCount, streakDoc, friendsCount] = await Promise.all([
    Points.findOne({ created_by: userEmail }).lean(),
    WorkoutCompletion.countDocuments({ created_by: userEmail }),
    MealLog.countDocuments({ created_by: userEmail }),
    Streak.findOne({ created_by: userEmail, streak_type: 'workout' }).lean(),
    Friendship.countDocuments({
      $or: [{ requester_email: userEmail }, { receiver_email: userEmail }],
      status: 'accepted',
    }),
  ]);

  return {
    total_points: pointsDoc?.total_points || 0,
    workouts_completed: workoutsCount,
    meals_logged: mealsCount,
    streak_days: streakDoc?.longest_count || 0,
    friends_count: friendsCount,
  };
}

/** Compute 0–100 progress toward a badge requirement */
function computeProgress(badge, stats) {
  const { requirement_type, requirement_value } = badge;
  if (!requirement_type || !requirement_value) return 0;
  const current = stats[requirement_type] ?? 0;
  return Math.min(100, Math.floor((current / requirement_value) * 100));
}

module.exports = async (req, res) => {
  const userEmail = req.user.email;
  const { action = 'all' } = req.body;


  // ── action: 'me' ─────────────────────────────────────────────────────────
  if (action === 'me') {
    const userBadges = await UserBadge.find({ created_by: userEmail })
      .populate('badge_id')
      .sort({ earned_date: -1 });

    return res.json({
      data: userBadges.map(ub => ({
        ...ub.toObject(),
        badge: ub.badge_id,
      })),
    });
  }

  // ── action: 'progress' ───────────────────────────────────────────────────
  if (action === 'progress') {
    const [allBadges, userBadges, stats] = await Promise.all([
      Badge.find().sort({ category: 1, requirement_value: 1 }),
      UserBadge.find({ created_by: userEmail }),
      fetchUserStats(userEmail),
    ]);

    const earnedCodes = new Set(userBadges.map(ub => ub.badge_code));

    const badgesWithProgress = allBadges.map(badge => {
      const plain = badge.toObject();
      const earned = earnedCodes.has(badge.badge_code);
      const progress = earned ? 100 : computeProgress(plain, stats);
      return { ...plain, earned, progress };
    });

    return res.json({ data: badgesWithProgress, stats });
  }

  // ── action: 'all' (default) ───────────────────────────────────────────────
  const [allBadges, userBadges] = await Promise.all([
    Badge.find().sort({ category: 1, rarity_level: 1, requirement_value: 1 }),
    UserBadge.find({ created_by: userEmail }),
  ]);

  const earnedCodes = new Set(userBadges.map(ub => ub.badge_code));
  const badges = allBadges.map(b => ({ ...b.toObject(), earned: earnedCodes.has(b.badge_code) }));

  res.json({ data: badges });
};
