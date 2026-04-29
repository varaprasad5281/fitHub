/**
 * Leaderboard — supports timeframe (weekly | alltime) and category (points | workouts | nutrition | streaks)
 */
const Points = require('../../models/Points');
const Profile = require('../../models/Profile');
const WorkoutCompletion = require('../../models/WorkoutCompletion');
const MealLog = require('../../models/MealLog');
const Streak = require('../../models/Streak');
const { LEADERBOARD, getWeekStart } = require('../../utils/constants');

// Cache keyed by "timeframe:category" so each combination is cached independently
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60s

async function buildLeaderboard(timeframe, category, userEmail) {
  const weekStart = getWeekStart();

  // Always fetch all Points + Profiles (base dataset)
  const [allPoints, allProfiles] = await Promise.all([
    Points.find().lean(),
    Profile.find({}, { created_by: 1, username: 1, profile_picture_url: 1, level: 1 }).lean(),
  ]);

  const profileMap = {};
  allProfiles.forEach(p => { profileMap[p.created_by] = p; });

  const pointsMap = {};
  allPoints.forEach(p => { pointsMap[p.created_by] = p; });

  const baseUser = email => ({
    email,
    username: profileMap[email]?.username || 'Anonymous',
    avatar_url: profileMap[email]?.profile_picture_url || null,
    weekly_points: pointsMap[email]?.weekly_points || 0,
    total_points: pointsMap[email]?.total_points || 0,
    level: pointsMap[email]?.level || 1,
  });

  let entries = [];

  if (category === 'points') {
    const sorted = allPoints
      .sort((a, b) =>
        timeframe === 'weekly'
          ? (b.weekly_points || 0) - (a.weekly_points || 0)
          : (b.total_points || 0) - (a.total_points || 0)
      )
      .slice(0, LEADERBOARD.MAX_DISPLAY);

    entries = sorted.map((p, i) => ({
      ...baseUser(p.created_by),
      rank: i + 1,
    }));

  } else if (category === 'workouts') {
    const dateFilter = timeframe === 'weekly' ? { completed_date: { $gte: weekStart } } : {};
    const completions = await WorkoutCompletion.find(dateFilter, { created_by: 1 }).lean();

    const countMap = {};
    completions.forEach(c => { countMap[c.created_by] = (countMap[c.created_by] || 0) + 1; });

    const allEmails = [...new Set([...Object.keys(pointsMap), ...Object.keys(countMap)])];
    entries = allEmails
      .map(email => ({ ...baseUser(email), workouts_count: countMap[email] || 0 }))
      .filter(e => e.workouts_count > 0)
      .sort((a, b) => b.workouts_count - a.workouts_count)
      .slice(0, LEADERBOARD.MAX_DISPLAY)
      .map((e, i) => ({ ...e, rank: i + 1 }));

  } else if (category === 'nutrition') {
    const dateFilter = timeframe === 'weekly' ? { date: { $gte: weekStart } } : {};
    const meals = await MealLog.find(dateFilter, { created_by: 1 }).lean();

    const countMap = {};
    meals.forEach(m => { countMap[m.created_by] = (countMap[m.created_by] || 0) + 1; });

    const allEmails = [...new Set([...Object.keys(pointsMap), ...Object.keys(countMap)])];
    entries = allEmails
      .map(email => ({ ...baseUser(email), meals_logged: countMap[email] || 0 }))
      .filter(e => e.meals_logged > 0)
      .sort((a, b) => b.meals_logged - a.meals_logged)
      .slice(0, LEADERBOARD.MAX_DISPLAY)
      .map((e, i) => ({ ...e, rank: i + 1 }));

  } else if (category === 'streaks') {
    const streaks = await Streak.find({ streak_type: 'workout' }).lean();

    const streakMap = {};
    streaks.forEach(s => { streakMap[s.created_by] = s; });

    const allEmails = [...new Set([...Object.keys(pointsMap), ...Object.keys(streakMap)])];
    entries = allEmails
      .map(email => ({
        ...baseUser(email),
        current_streak: streakMap[email]?.current_count || 0,
        longest_streak: streakMap[email]?.longest_count || 0,
      }))
      .filter(e => e.current_streak > 0 || e.longest_streak > 0)
      .sort((a, b) =>
        timeframe === 'weekly'
          ? b.current_streak - a.current_streak
          : b.longest_streak - a.longest_streak
      )
      .slice(0, LEADERBOARD.MAX_DISPLAY)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }

  const user_rank = entries.findIndex(e => e.email === userEmail) + 1;
  return { leaderboard: entries, user_rank: user_rank || 0 };
}

module.exports = async (req, res) => {
  const timeframe = req.body?.timeframe || 'weekly';
  const category  = req.body?.category  || 'points';
  const userEmail = req.user?.email;
  const cacheKey  = `${timeframe}:${category}`;
  const now = Date.now();

  // Serve from cache if fresh (user_rank is personalised so always recompute it)
  if (cache.has(cacheKey)) {
    const { leaderboard, expiry } = cache.get(cacheKey);
    if (now < expiry) {
      const user_rank = leaderboard.findIndex(e => e.email === userEmail) + 1;
      return res.json({ success: true, leaderboard, user_rank: user_rank || 0, cached: true });
    }
  }

  const result = await buildLeaderboard(timeframe, category, userEmail);
  cache.set(cacheKey, { leaderboard: result.leaderboard, expiry: now + CACHE_TTL });

  res.json({ success: true, ...result });
};
