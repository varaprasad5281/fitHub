/**
 * Replaces: getLeaderboard, getLeaderboardCachedSecure, getLeaderboardWithPoints
 */
const Points = require('../../models/Points');
const Profile = require('../../models/Profile');
const { LEADERBOARD } = require('../../utils/constants');

let leaderboardCache = null;
let cacheExpiry = 0;

module.exports = async (req, res) => {
  const now = Date.now();

  if (leaderboardCache && now < cacheExpiry) {
    return res.json({ success: true, leaderboard: leaderboardCache, cached: true });
  }

  const allPoints = await Points.find().sort({ weekly_points: -1 }).limit(LEADERBOARD.MAX_DISPLAY).lean();

  const emails = allPoints.map((p) => p.created_by);
  const profiles = await Profile.find({ created_by: { $in: emails } }).lean();
  const profileMap = {};
  profiles.forEach((p) => { profileMap[p.created_by] = p; });

  const leaderboard = allPoints.map((p, i) => ({
    rank: i + 1,
    email: p.created_by,
    username: profileMap[p.created_by]?.username || 'Anonymous',
    avatar_url: profileMap[p.created_by]?.avatar_url || null,
    weekly_points: p.weekly_points,
    total_points: p.total_points,
    level: p.level,
  }));

  leaderboardCache = leaderboard;
  cacheExpiry = now + 60 * 1000; // 60s TTL

  res.json({ success: true, leaderboard });
};
