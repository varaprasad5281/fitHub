/**
 * Handles: updateGoalProgress, verifyGoalCompletion, generateGoalRecommendations
 */

const ProgressGoal = require('../../models/ProgressGoal');
const Points = require('../../models/Points');
const { invokeLLM } = require('../../services/ai');

// ── updateGoalProgress ─────────────────────────────────────────────────────────
async function updateGoalProgress(req, res) {
  const userEmail = req.user.email;
  const { goal_id, increment = 1, new_value } = req.body;

  let updated;
  if (goal_id) {
    const goal = await ProgressGoal.findOne({ _id: goal_id, created_by: userEmail });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    goal.current_value = new_value !== undefined ? new_value : (goal.current_value || 0) + increment;
    if (goal.target && goal.current_value >= goal.target && !goal.is_completed) {
      goal.is_completed = true;
      goal.completed_date = new Date().toISOString().split('T')[0];
    }
    await goal.save();
    updated = goal;
  } else {
    // Update all active goals generically (called after workouts/meals)
    const goals = await ProgressGoal.find({ created_by: userEmail, is_completed: false });
    updated = goals;
  }

  res.json({ data: updated, success: true });
}

// ── verifyGoalCompletion ───────────────────────────────────────────────────────
async function verifyGoalCompletion(req, res) {
  const userEmail = req.user.email;
  const { goal_id } = req.body;

  const goal = await ProgressGoal.findOne({ _id: goal_id, created_by: userEmail });
  if (!goal) return res.status(404).json({ error: 'Goal not found' });

  const completed = goal.target ? goal.current_value >= goal.target : goal.is_completed;
  if (completed && !goal.is_completed) {
    goal.is_completed = true;
    goal.completed_date = new Date().toISOString().split('T')[0];
    await goal.save();
  }

  res.json({ data: { completed, goal } });
}

// ── generateGoalRecommendations ────────────────────────────────────────────────
async function generateGoalRecommendations(req, res) {
  const userEmail = req.user.email;
  const { goal_type, current_value, target } = req.body;

  let recommendations;
  try {
    recommendations = await invokeLLM({
      prompt: `Give 3 actionable recommendations for someone working toward a ${goal_type} goal. Current: ${current_value}, Target: ${target}. Return JSON array of strings.`,
      response_json_schema: { type: 'array', items: { type: 'string' } },
    });
  } catch {
    recommendations = [
      'Track your progress daily to stay motivated.',
      'Break your goal into smaller weekly milestones.',
      'Celebrate each small win along the way.',
    ];
  }

  res.json({ data: recommendations });
}

module.exports = { updateGoalProgress, verifyGoalCompletion, generateGoalRecommendations };
