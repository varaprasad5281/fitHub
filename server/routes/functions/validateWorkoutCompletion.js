/**
 * Replaces: validateWorkoutCompletion + awardWorkoutPoints
 */
const Workout = require('../../models/Workout');
const WorkoutCompletion = require('../../models/WorkoutCompletion');
const Points = require('../../models/Points');
const PointsTransaction = require('../../models/PointsTransaction');
const UserActivityEvent = require('../../models/UserActivityEvent');
const { POINTS } = require('../../utils/constants');

module.exports = async (req, res) => {
  const user = req.user;
  const { workout_id, notes, duration_minutes } = req.body;

  if (!workout_id) return res.status(400).json({ error: 'workout_id is required' });

  const workout = await Workout.findOne({ _id: workout_id, created_by: user.email });
  if (!workout) return res.status(404).json({ error: 'Workout not found' });

  const today = new Date().toISOString().split('T')[0];

  // Check duplicate completion today
  const existing = await WorkoutCompletion.findOne({ created_by: user.email, workout_id, completed_date: today });
  if (existing) return res.json({ success: true, message: 'Workout already completed today', points_awarded: 0 });

  const completion = await WorkoutCompletion.create({
    created_by: user.email,
    workout_id,
    completed_date: today,
    duration_minutes: duration_minutes || workout.estimated_duration,
    notes,
    calories_burned: workout.calories_burned,
  });

  // Award points
  const pointsToAward = POINTS.WORKOUT_COMPLETION;
  await Points.findOneAndUpdate(
    { created_by: user.email },
    { $inc: { total_points: pointsToAward, weekly_points: pointsToAward } },
    { upsert: true }
  );
  await PointsTransaction.create({
    created_by: user.email,
    points_awarded: pointsToAward,
    source: `workout_${workout_id}`,
    transaction_date: today,
  });

  // Activity feed
  UserActivityEvent.create({
    created_by: user.email,
    actor_email: user.email,
    event_type: 'workout_completed',
    description: `${user.full_name} completed "${workout.workout_name}"`,
    metadata: { workout_id, workout_name: workout.workout_name },
    visibility: 'friends_only',
  }).catch(() => {});

  res.json({ success: true, completion, points_awarded: pointsToAward });
};
