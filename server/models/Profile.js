const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  created_by: { type: String, required: true, unique: true }, // user email
  username: String,
  email: String,
  fitness_goal: String,
  workout_preference: String,
  age: Number,
  experience_level: String,
  activity_level: String,
  available_equipment: String,
  workout_duration: Number,
  avatar_url: String,
  profile_picture_url: String,
  country: String,
  bio: String,
  weight_kg: Number,
  height_cm: Number,
  target_calories: Number,
  target_protein: Number,
  training_motivation: String,
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
