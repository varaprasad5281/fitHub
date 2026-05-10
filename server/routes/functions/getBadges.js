/**
 * getBadges   — action: 'all' | 'me' | 'progress' | 'feature' | 'featured'
 *
 * action: 'me'       → only earned badges (with badge details)
 * action: 'all'      → every badge with earned flag
 * action: 'progress' → every badge with earned flag + real progress % + is_featured
 * action: 'feature'  → toggle is_featured on a UserBadge (max 3)
 * action: 'featured' → return up to 3 featured badges for any user (public profile)
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

  // ── action: 'feature' ────────────────────────────────────────────────────
  // Toggle is_featured for one of the current user's earned badges (max 3)
  if (action === 'feature') {
    const { badge_code, featured } = req.body;
    if (!badge_code) return res.status(400).json({ error: 'badge_code required' });

    if (featured) {
      const featuredCount = await UserBadge.countDocuments({ created_by: userEmail, is_featured: true });
      if (featuredCount >= 3) {
        return res.status(400).json({ error: 'You can only feature up to 3 badges. Unfeature one first.' });
      }
    }

    await UserBadge.findOneAndUpdate(
      { created_by: userEmail, badge_code },
      { is_featured: !!featured }
    );
    return res.json({ success: true });
  }

  // ── action: 'bulk_featured' ──────────────────────────────────────────────
  // Returns featured badges for multiple users in one query.
  // Body: { emails: ['a@b.com', 'c@d.com', ...] }
  // Response: { data: { 'a@b.com': [badge, ...], 'c@d.com': [...] } }
  if (action === 'bulk_featured') {
    const { emails = [] } = req.body;
    if (!emails.length) return res.json({ data: {} });

    const userBadges = await UserBadge.find({
      created_by: { $in: emails },
      is_featured: true,
    }).populate('badge_id').lean();

    const result = {};
    userBadges.forEach(ub => {
      if (!ub.badge_id) return; // guard orphaned refs
      if (!result[ub.created_by]) result[ub.created_by] = [];
      result[ub.created_by].push({
        ...ub.badge_id,
        earned_date: ub.earned_date,
      });
    });

    return res.json({ data: result });
  }

  // ── action: 'featured' ───────────────────────────────────────────────────
  // Returns up to 3 featured badges for any user email — used by PublicProfile
  if (action === 'featured') {
    const targetEmail = req.body.email || userEmail;
    const featuredUserBadges = await UserBadge.find({ created_by: targetEmail, is_featured: true })
      .populate('badge_id')
      .lean();

    const data = featuredUserBadges
      .filter(ub => ub.badge_id)   // guard against orphaned badge refs
      .map(ub => ({
        ...ub.badge_id,
        earned_date: ub.earned_date,
        is_featured: true,
      }));

    return res.json({ data });
  }

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

    // Build a map keyed by badge_code for O(1) lookup of earned + featured state
    const userBadgeMap = {};
    userBadges.forEach(ub => { userBadgeMap[ub.badge_code] = ub; });

    const badgesWithProgress = allBadges.map(badge => {
      const plain = badge.toObject();
      const ub = userBadgeMap[badge.badge_code];
      const earned = !!ub;
      const progress = earned ? 100 : computeProgress(plain, stats);
      const is_featured = ub?.is_featured || false;
      return { ...plain, earned, progress, is_featured };
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
