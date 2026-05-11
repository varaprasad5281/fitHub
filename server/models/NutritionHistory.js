const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  total_calories: { type: Number, default: 0 },
  total_protein: { type: Number, default: 0 },
  total_carbs: { type: Number, default: 0 },
  total_fats: { type: Number, default: 0 },
  meal_count: { type: Number, default: 0 },
  meal_types: [{ type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] }],
}, { timestamps: true });

// Unique per user per day - enforces exactly one record per date
schema.index({ created_by: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('NutritionHistory', schema);
