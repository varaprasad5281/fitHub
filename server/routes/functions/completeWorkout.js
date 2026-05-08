const Workout = require('../../models/Workout');
const WorkoutCompletion = require('../../models/WorkoutCompletion');
const Points = require('../../models/Points');
const PointsTransaction = require('../../models/PointsTransaction');
const { notify } = require('../../utils/notify');
const checkAndAwardBadges = require('../../utils/checkAndAwardBadges');

const MAX_HISTORY = 7;
const DIFFICULTY_POINTS = { beginner: 25, intermediate: 50, advanced: 100 };

module.exports = async (req, res) => {
  const userEmail = req.user.email;
  const { workout_id } = req.body;

  if (!workout_id) return res.status(400).json({ error: 'workout_id is required' });

  const workout = await Workout.findOne({ _id: workout_id, created_by: userEmail });
  if (!workout) return res.status(404).json({ error: 'Workout not found' });

  const today = new Date().toISOString().split('T')[0];
  const pointsEarned = DIFFICULTY_POINTS[workout.difficulty] || 50;

  // One per day — delete any existing completed workout for today before marking this one
  await Workout.deleteMany({
    created_by: userEmail,
    is_completed: true,
    completed_date: today,
    _id: { $ne: workout._id },
  });

  // Mark as completed
  await Workout.findOneAndUpdate(
    { _id: workout_id, created_by: userEmail },
    { is_completed: true, completed_date: today }
  );

  // Log completion record
  await WorkoutCompletion.create({
    created_by: userEmail,
    workout_id,
    completed_date: today,
  });

  // Award points
  await Points.findOneAndUpdate(
    { created_by: userEmail },
    { $inc: { total_points: pointsEarned, weekly_points: pointsEarned } },
    { upsert: true }
  );

  await PointsTransaction.create({
    created_by: userEmail,
    points_awarded: pointsEarned,
    source: `workout_completion_${workout.difficulty || 'intermediate'}`,
    transaction_date: today,
  });

  // Prune — keep only the 7 most recent completed workouts
  const allCompleted = await Workout.find({ created_by: userEmail, is_completed: true }, { _id: 1, completed_date: 1 })
    .sort({ completed_date: -1 })
    .lean();

  if (allCompleted.length > MAX_HISTORY) {
    const toDelete = allCompleted.slice(MAX_HISTORY).map(w => w._id);
    await Workout.deleteMany({ _id: { $in: toDelete } });
  }

  notify(userEmail,
    `💪 Workout complete — "${workout.workout_name || 'Session'}"! You earned +${pointsEarned} points.`,
    'workout_completed'
  );

  // Check and award any newly-unlocked badges (awaited so errors appear in server logs)
  const newBadges = await checkAndAwardBadges(userEmail);

  return res.json({ success: true, points_earned: pointsEarned, new_badges: newBadges });
};
