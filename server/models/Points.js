const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
  created_by: { type: String, required: true, unique: true },
  total_points: { type: Number, default: 0 },
  weekly_points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Points', pointsSchema);
