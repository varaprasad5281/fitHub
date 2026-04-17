const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  streak_type: { type: String, default: 'workout' },
  current_count: { type: Number, default: 0 },
  longest_count: { type: Number, default: 0 },
  last_activity_date: String, // YYYY-MM-DD
}, { timestamps: true });

schema.index({ created_by: 1, streak_type: 1 }, { unique: true });

module.exports = mongoose.model('Streak', schema);
