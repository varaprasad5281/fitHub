const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  name:        { type: String },
  description: { type: String },
  calories:    { type: Number },
  protein:     { type: Number },
  carbs:       { type: Number },
  fats:        { type: Number },
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  created_by: { type: String, required: true },
  date:       { type: String, required: true },   // YYYY-MM-DD
  breakfast:  { type: mealItemSchema },
  lunch:      { type: mealItemSchema },
  dinner:     { type: mealItemSchema },
  snack:      { type: mealItemSchema },
  cheat_meal: { type: mealItemSchema },
}, { timestamps: true });

mealPlanSchema.index({ created_by: 1, date: 1 });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
