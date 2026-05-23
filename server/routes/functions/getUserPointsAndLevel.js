/**
 * Replaces: base44/functions/getUserPointsAndLevel/entry.ts
 */
const Points = require('../../models/Points');
const PointsTransaction = require('../../models/PointsTransaction');
const UserActivityEvent = require('../../models/UserActivityEvent');
const { LEVEL_THRESHOLDS, MAX_LEVEL } = require('../../utils/constants');

module.exports = async (req, res) => {
  const user = req.user;

  let pointsRecord = await Points.findOne({ created_by: user.email });
  if (!pointsRecord) {
    pointsRecord = await Points.create({ created_by: user.email, total_points: 0, weekly_points: 0, level: 1, badges: [] });
  }

  const currentLevel = pointsRecord.level;
  const nextLevelPoints = LEVEL_THRESHOLDS[currentLevel + 1] || LEVEL_THRESHOLDS[MAX_LEVEL];
  const currentLevelPoints = LEVEL_THRESHOLDS[currentLevel] || 0;
  const pointsInLevel = pointsRecord.total_points - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;
  const progressPercentage = Math.min(Math.round((pointsInLevel / pointsNeededForNextLevel) * 100), 100);

  // Check level-up
  const thresholdEntries = Object.entries(LEVEL_THRESHOLDS).sort((a, b) => Number(a[0]) - Number(b[0]));
  const newLevelIdx = thresholdEntries.findIndex(([, t]) => pointsRecord.total_points < t);
  const actualLevel = newLevelIdx === -1 ? MAX_LEVEL : newLevelIdx;
  if (actualLevel > currentLevel) {
    await Points.findOneAndUpdate({ created_by: user.email }, { level: actualLevel });
    UserActivityEvent.create({
      created_by: user.email,
      actor_email: user.email,
      event_type: 'level_up',
      description: `${user.full_name} reached level ${actualLevel}!`,
      metadata: { old_level: currentLevel, new_level: actualLevel },
    }).catch(() => {});
  }

  const today = new Date().toISOString().split('T')[0];
  // Exclude the 0-pt idempotency marker ('daily_calc') so it doesn't inflate todayPoints
  const todayTransactions = await PointsTransaction.find({
    created_by: user.email,
    transaction_date: today,
    source: { $ne: 'daily_calc' },
  });
  const todayPoints = todayTransactions.reduce((s, t) => s + t.points_awarded, 0);

  const breakdown = { workouts: 0, goals: 0, leaderboard: 0, calories: 0, streaks: 0 };
  todayTransactions.forEach((t) => {
    if (t.source.startsWith('workout_')) breakdown.workouts += t.points_awarded;
    if (t.source === 'goal_completed') breakdown.goals += t.points_awarded;
    if (t.source.startsWith('leaderboard_')) breakdown.leaderboard += t.points_awarded;
    // Both calorie-target adherence and meals-logged bonus count as calorie/nutrition bonus
    if (t.source === 'calorie_adherence' || t.source === 'meals_logged') breakdown.calories += t.points_awarded;
    if (t.source === 'streak_bonus') breakdown.streaks += t.points_awarded;
  });

  res.json({
    success: true,
    totalPoints: pointsRecord.total_points,
    weeklyPoints: pointsRecord.weekly_points,
    currentLevel: actualLevel > currentLevel ? actualLevel : currentLevel,
    nextLevelPoints,
    pointsInLevel,
    pointsNeededForNextLevel,
    progressPercentage,
    todayPoints,
    breakdown,
    badges: pointsRecord.badges || [],
  });
};
