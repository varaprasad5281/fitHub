const Streak = require('../../models/Streak');
const Points = require('../../models/Points');
const PointsTransaction = require('../../models/PointsTransaction');
const { notify } = require('../../utils/notify');

const MILESTONE_DAYS = [7, 14, 30, 60, 100, 200, 365];

// Points awarded at each milestone (indexed by milestone value)
const MILESTONE_BONUS = { 7: 20, 14: 35, 30: 75, 60: 120, 100: 200, 200: 400, 365: 750 };

module.exports = async (req, res) => {
  const userEmail = req.user.email;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = await Streak.findOne({ created_by: userEmail, streak_type: 'workout' });

  if (!streak) {
    streak = await Streak.create({
      created_by: userEmail,
      streak_type: 'workout',
      current_count: 1,
      longest_count: 1,
      last_activity_date: today,
    });
    return res.json({ success: true, current_count: 1, longest_count: 1, bonus_points: 0 });
  }

  // Already counted today — return current values
  if (streak.last_activity_date === today) {
    return res.json({
      success: true,
      current_count: streak.current_count,
      longest_count: streak.longest_count,
      bonus_points: 0,
      already_counted: true,
    });
  }

  // Extend or reset streak
  const newCount = streak.last_activity_date === yesterday
    ? (streak.current_count || 0) + 1
    : 1;

  const newLongest = Math.max(newCount, streak.longest_count || 0);

  await Streak.findOneAndUpdate(
    { created_by: userEmail, streak_type: 'workout' },
    { current_count: newCount, longest_count: newLongest, last_activity_date: today }
  );

  // Award milestone bonus points
  let bonusPoints = 0;
  if (MILESTONE_DAYS.includes(newCount)) {
    bonusPoints = MILESTONE_BONUS[newCount] || 0;
    await PointsTransaction.create({
      created_by: userEmail,
      points_awarded: bonusPoints,
      source: 'streak_bonus',
      transaction_date: today,
    });
    await Points.findOneAndUpdate(
      { created_by: userEmail },
      { $inc: { total_points: bonusPoints, weekly_points: bonusPoints } },
      { upsert: true }
    );
    notify(userEmail,
      `🔥 ${newCount}-day streak milestone! You're on fire — +${bonusPoints} bonus points awarded.`,
      'streak_milestone'
    );
  }

  return res.json({
    success: true,
    current_count: newCount,
    longest_count: newLongest,
    bonus_points: bonusPoints,
  });
};
