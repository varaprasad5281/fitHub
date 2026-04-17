const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  goal_type: String,
  name: String,
  target: Number,
  current_value: { type: Number, default: 0 },
  unit: String,
  deadline: String, // YYYY-MM-DD
  is_completed: { type: Boolean, default: false },
  completed_date: String,
}, { timestamps: true });

schema.index({ created_by: 1 });

module.exports = mongoose.model('ProgressGoal', schema);
