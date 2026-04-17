const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  week_start: { type: String, required: true }, // YYYY-MM-DD (Monday)
  rank: Number,
  weekly_points: { type: Number, default: 0 },
  ranking_bonus_points: { type: Number, default: 0 },
  user_name: String,
  avatar_url: String,
}, { timestamps: true });

schema.index({ week_start: 1, weekly_points: -1 });
schema.index({ created_by: 1, week_start: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyLeaderboard', schema);
