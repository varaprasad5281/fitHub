const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  workout_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
  completed_date: { type: String }, // YYYY-MM-DD
  duration_minutes: Number,
  notes: String,
  calories_burned: Number,
}, { timestamps: true });

schema.index({ created_by: 1, completed_date: -1 });

module.exports = mongoose.model('WorkoutCompletion', schema);
