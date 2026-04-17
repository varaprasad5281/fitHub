const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String }, // null = system challenge
  name: { type: String, required: true },
  description: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  points_reward: { type: Number, default: 0 },
  requirement: String,
  requirement_value: Number,
  challenge_type: String,
  metric: String,               // active_days | total_points | workouts_completed | calories_logged
  duration: String,             // weekly | monthly
  prize_description: String,
  start_date: String,           // YYYY-MM-DD
  end_date: String,             // YYYY-MM-DD
  is_active: { type: Boolean, default: true },
  participants: [{ type: String }], // array of emails
}, { timestamps: true });

module.exports = mongoose.model('Challenge', schema);
