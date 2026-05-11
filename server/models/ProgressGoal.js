const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  goal_type:    String,
  goal_name:    String,
  target_value: Number,
  current_value: { type: Number, default: 0 },
  unit:         String,
  target_date:  String, // YYYY-MM-DD
  start_date:   String, // YYYY-MM-DD
  status:       { type: String, default: 'active' }, // 'active' | 'completed'
}, { timestamps: true });

schema.index({ created_by: 1, status: 1 });

module.exports = mongoose.model('ProgressGoal', schema);
