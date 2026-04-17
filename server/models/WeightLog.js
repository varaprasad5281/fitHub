const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  log_date: { type: String }, // YYYY-MM-DD
  weight_kg: Number,
  weight_lbs: Number,
  notes: String,
}, { timestamps: true });

schema.index({ created_by: 1, log_date: -1 });

module.exports = mongoose.model('WeightLog', schema);
