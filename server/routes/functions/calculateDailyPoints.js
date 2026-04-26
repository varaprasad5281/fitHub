/**
 * Replaces: calculateDailyPoints
 */
const Points = require('../../models/Points');
const PointsTransaction = require('../../models/PointsTransaction');
const MealLog = require('../../models/MealLog');
const WorkoutCompletion = require('../../models/WorkoutCompletion');
const Profile = require('../../models/Profile');
const { POINTS, NUTRITION } = require('../../utils/constants');

module.exports = async (req, res) => {
  const user = req.user;
  const today = new Date().toISOString().split('T')[0];

  // Idempotency: check if already calculated today
  const existing = await PointsTransaction.findOne({ created_by: user.email, source: 'daily_calc', transaction_date: today });
  if (existing) return res.json({ success: true, message: 'Already calculated today', points_awarded: 0 });

  const profile = await Profile.findOne({ created_by: user.email });
  const todayMeals = await MealLog.find({ created_by: user.email, date: today });
  const todayWorkout = await WorkoutCompletion.findOne({ created_by: user.email, completed_date: today });

  let pointsAwarded = 0;
  const sources = [];

  // Workout completion bonus
  if (todayWorkout) {
    pointsAwarded += POINTS.WORKOUT_COMPLETION;
    sources.push({ source: 'workout_completion', points: POINTS.WORKOUT_COMPLETION });
  }

  // 3 meals logged
  if (todayMeals.length >= 3) {
    pointsAwarded += POINTS.THREE_MEALS_LOGGED;
    sources.push({ source: 'meals_logged', points: POINTS.THREE_MEALS_LOGGED });
  }

  // Calorie target met
  if (profile?.target_calories && todayMeals.length > 0) {
    const totalCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
    const targetCalories = profile.target_calories;
    const tolerance = NUTRITION.CALORIE_TOLERANCE;
    if (Math.abs(totalCalories - targetCalories) / targetCalories <= tolerance) {
      pointsAwarded += POINTS.CALORIE_TARGET_MET;
      sources.push({ source: 'calorie_adherence', points: POINTS.CALORIE_TARGET_MET });
    }
  }

  // Cap daily points
  pointsAwarded = Math.min(pointsAwarded, POINTS.DAILY_MAX);

  // Always write the idempotency marker (0 pts) so subsequent calls skip recalculation
  await PointsTransaction.create({
    created_by: user.email,
    points_awarded: 0,
    source: 'daily_calc',
    transaction_date: today,
  });

  if (pointsAwarded > 0) {
    // Create one transaction per source so the breakdown in getUserPointsAndLevel works correctly
    await Promise.all(
      sources.map(src =>
        PointsTransaction.create({
          created_by: user.email,
          points_awarded: src.points,
          source: src.source,          // e.g. 'workout_completion', 'calorie_adherence'
          transaction_date: today,
        })
      )
    );

    // Update running totals
    await Points.findOneAndUpdate(
      { created_by: user.email },
      { $inc: { total_points: pointsAwarded, weekly_points: pointsAwarded } },
      { upsert: true }
    );
  }

  res.json({ success: true, points_awarded: pointsAwarded, sources });
};
