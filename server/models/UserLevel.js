const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true, unique: true },
  current_level: { type: Number, default: 1 },
  total_progress: { type: Number, default: 0 },
  progress_in_level: { type: Number, default: 0 },
  prestige_level: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('UserLevel', schema);
