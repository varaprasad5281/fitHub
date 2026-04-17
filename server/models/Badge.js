const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  badge_code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  icon: String,
  rarity_level: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] },
  category: String,
  requirement_type: String,
  requirement_value: Number,
}, { timestamps: true });

module.exports = mongoose.model('Badge', schema);
