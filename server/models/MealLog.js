const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  date: { type: String }, // YYYY-MM-DD
  meal_type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  food_name: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  fiber: Number,
  portion_size: String,
  notes: String,
}, { timestamps: true });

schema.index({ created_by: 1, date: -1 });

module.exports = mongoose.model('MealLog', schema);
