const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: String,
  weight_recommendation: String,
  instructions: String,
  rest_seconds: Number,
  image_url: String,
}, { _id: false });

const workoutSchema = new mongoose.Schema({
  created_by: { type: String, required: true },
  workout_name: { type: String, required: true },
  exercises: [exerciseSchema],
  estimated_duration: Number,
  calories_burned: Number,
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  workout_type: String,
  equipment: String,
  personalization_notes: String,
  image_url: String,
  day_of_week: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
  is_completed: { type: Boolean, default: false },
  completed_date: { type: String }, // YYYY-MM-DD
}, { timestamps: true });

workoutSchema.index({ created_by: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
