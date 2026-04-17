const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by:       { type: String, required: true },
  session_type:     { type: String, enum: ['daily', 'weekly', 'goal', 'motivational'] },
  session_date:     { type: String },          // YYYY-MM-DD
  content:          String,                    // raw AI text (fallback)
  category:         String,                    // workout | nutrition | recovery | general
  advice:           String,                    // main coaching message
  actionable_items: [String],                  // bullet-point action items
  instructions:     String,                    // how to execute
  blueprint:        String,                    // 24-hour plan
  feedback:         String,                    // 'helpful' | 'not_helpful'
  favourited:       { type: Boolean, default: false },
  updated_date:     Date,
}, { timestamps: true });

schema.index({ created_by: 1, createdAt: -1 });

module.exports = mongoose.model('CoachingSession', schema);
