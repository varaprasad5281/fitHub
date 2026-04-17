/**
 * Handles: getChallenges, createChallenge, generateDailyChallenge, generateInitialChallenge
 * Routed by the function name in functions.js
 */

const Challenge = require('../../models/Challenge');
const { invokeLLM } = require('../../services/ai');

// ── getChallenges ──────────────────────────────────────────────────────────────
async function getChallenges(req, res) {
  const userEmail = req.user.email;
  const { status = 'active' } = req.body;
  const today = new Date().toISOString().split('T')[0];

  let query = {};
  if (status === 'active') {
    // Active = started on or before today AND ends on or after today
    // Also include challenges with no dates (treat as perpetually active)
    query = {
      is_active: true,
      $or: [
        { start_date: { $lte: today }, end_date: { $gte: today } },
        { start_date: { $in: [null, ''] }, end_date: { $in: [null, ''] } },
        { start_date: { $exists: false } },
      ],
    };
  } else if (status === 'upcoming') {
    // Upcoming = start_date is strictly in the future
    query = { is_active: true, start_date: { $gt: today } };
  } else if (status === 'completed') {
    // Completed = end_date has passed and is actually set
    query = {
      $and: [
        { end_date: { $lt: today } },
        { end_date: { $exists: true } },
        { end_date: { $nin: [null, ''] } },
      ],
    };
  } else if (status === 'my') {
    query = { participants: userEmail };
  } else {
    query = { is_active: true };
  }

  const challenges = await Challenge.find(query).sort({ createdAt: -1 });

  const result = challenges.map((c) => ({
    ...c.toObject(),
    id: c._id.toString(),
    user_participating: c.participants.includes(userEmail),
  }));

  res.json({ data: result });
}

// ── createChallenge ────────────────────────────────────────────────────────────
async function createChallenge(req, res) {
  const userEmail = req.user.email;
  const {
    name, description, difficulty, points_reward,
    requirement, requirement_value, challenge_type,
    metric, duration, prize_description, start_date, end_date,
  } = req.body;

  if (!name) return res.status(400).json({ error: 'name is required' });

  const challenge = await Challenge.create({
    created_by: userEmail,
    name, description, difficulty, points_reward,
    requirement, requirement_value, challenge_type,
    metric, duration, prize_description, start_date, end_date,
    is_active: true,
    participants: [userEmail],
  });

  const result = { ...challenge.toObject(), id: challenge._id.toString(), user_participating: true };
  res.json({ data: result });
}

// ── generateDailyChallenge ─────────────────────────────────────────────────────
async function generateDailyChallenge(req, res) {
  const userEmail = req.user.email;

  // Check if a daily challenge was already generated today
  const today = new Date().toISOString().split('T')[0];
  const existing = await Challenge.findOne({
    created_by: userEmail,
    challenge_type: 'daily',
    start_date: today,
  });
  if (existing) return res.json({ data: existing });

  let challenge;
  try {
    challenge = await invokeLLM({
      prompt: `Generate a daily fitness challenge for today. Return JSON with: name (string), description (string), difficulty (easy|medium|hard), points_reward (number 10-100), requirement (string), requirement_value (number).`,
      response_json_schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, difficulty: { type: 'string' }, points_reward: { type: 'number' }, requirement: { type: 'string' }, requirement_value: { type: 'number' } } },
    });
  } catch {
    challenge = { name: 'Daily Movement Challenge', description: 'Complete 30 minutes of any physical activity today.', difficulty: 'easy', points_reward: 25, requirement: 'minutes_activity', requirement_value: 30 };
  }

  const doc = await Challenge.create({
    created_by: userEmail,
    challenge_type: 'daily',
    start_date: today,
    end_date: today,
    participants: [userEmail],
    is_active: true,
    ...challenge,
  });

  res.json({ data: doc });
}

// ── generateInitialChallenge ───────────────────────────────────────────────────
async function generateInitialChallenge(req, res) {
  const userEmail = req.user.email;
  const { fitnessGoal = 'general_fitness' } = req.body;

  let challenge;
  try {
    challenge = await invokeLLM({
      prompt: `Generate a beginner-friendly starter fitness challenge for someone with goal: "${fitnessGoal}". Return JSON with: name, description, difficulty (easy), points_reward (25), requirement, requirement_value.`,
      response_json_schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, points_reward: { type: 'number' }, requirement: { type: 'string' }, requirement_value: { type: 'number' } } },
    });
  } catch {
    challenge = { name: 'First Step Challenge', description: 'Complete your first workout session this week.', difficulty: 'easy', points_reward: 50, requirement: 'workouts_completed', requirement_value: 1 };
  }

  const doc = await Challenge.create({
    created_by: userEmail,
    challenge_type: 'starter',
    participants: [userEmail],
    is_active: true,
    ...challenge,
    difficulty: 'easy',
  });

  res.json({ data: doc });
}

// ── joinChallenge ──────────────────────────────────────────────────────────────
async function joinChallenge(req, res) {
  const userEmail = req.user.email;
  const { challenge_id } = req.body;

  if (!challenge_id) return res.status(400).json({ error: 'challenge_id is required' });

  const challenge = await Challenge.findByIdAndUpdate(
    challenge_id,
    { $addToSet: { participants: userEmail } },
    { new: true }
  );

  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  res.json({
    data: {
      ...challenge.toObject(),
      id: challenge._id.toString(),
      user_participating: true,
    },
  });
}

// ── leaveChallenge ─────────────────────────────────────────────────────────────
async function leaveChallenge(req, res) {
  const userEmail = req.user.email;
  const { challenge_id } = req.body;

  if (!challenge_id) return res.status(400).json({ error: 'challenge_id is required' });

  const challenge = await Challenge.findByIdAndUpdate(
    challenge_id,
    { $pull: { participants: userEmail } },
    { new: true }
  );

  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  res.json({
    data: {
      ...challenge.toObject(),
      id: challenge._id.toString(),
      user_participating: false,
    },
  });
}

module.exports = { getChallenges, createChallenge, joinChallenge, leaveChallenge, generateDailyChallenge, generateInitialChallenge };
