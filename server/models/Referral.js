const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  referrer_email: { type: String, required: true, lowercase: true, trim: true },
  referred_email:  { type: String, required: true, lowercase: true, trim: true, unique: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  completed_at: { type: Date, default: null },
}, { timestamps: true });

schema.index({ referrer_email: 1, status: 1 });

module.exports = mongoose.model('Referral', schema);
