const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  reporter_email: { type: String, required: true },
  reported_email: { type: String, required: true },
  report_type: String,
  reason: String,
  status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('UserReport', schema);
