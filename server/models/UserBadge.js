const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  badge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
  badge_code: String,
  earned_date: { type: Date, default: Date.now },
  achievement_notes: String,
}, { timestamps: true });

schema.index({ created_by: 1, badge_code: 1 }, { unique: true });

module.exports = mongoose.model('UserBadge', schema);
