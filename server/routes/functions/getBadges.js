/**
 * getBadges   — action: 'all' | 'me' | 'progress'
 * getBadgeProgress — badge progress for the current user
 */

const Badge = require('../../models/Badge');
const UserBadge = require('../../models/UserBadge');
const Points = require('../../models/Points');

module.exports = async (req, res) => {
  const userEmail = req.user.email;
  const { action = 'all' } = req.body;

  if (action === 'me') {
    // Return badges earned by this user (with badge details)
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

  if (action === 'progress') {
    // Return all badges with earned status and progress
    const [allBadges, userBadges, pointsDoc] = await Promise.all([
      Badge.find().sort({ requirement_value: 1 }),
      UserBadge.find({ created_by: userEmail }),
      Points.findOne({ created_by: userEmail }),
    ]);

    const earnedCodes = new Set(userBadges.map(ub => ub.badge_code));
    const totalPoints = pointsDoc?.total_points || 0;

    const badgesWithProgress = allBadges.map(badge => {
      const earned = earnedCodes.has(badge.badge_code);
      let progress = 0;
      if (badge.requirement_type === 'points' && badge.requirement_value) {
        progress = Math.min(100, Math.floor((totalPoints / badge.requirement_value) * 100));
      }
      return { ...badge.toObject(), earned, progress };
    });

    return res.json({ data: badgesWithProgress });
  }

  // action === 'all' — return all badges with earned flag
  const [allBadges, userBadges] = await Promise.all([
    Badge.find().sort({ rarity_level: 1, name: 1 }),
    UserBadge.find({ created_by: userEmail }),
  ]);

  const earnedCodes = new Set(userBadges.map(ub => ub.badge_code));
  const badges = allBadges.map(b => ({ ...b.toObject(), earned: earnedCodes.has(b.badge_code) }));

  res.json({ data: badges });
};
