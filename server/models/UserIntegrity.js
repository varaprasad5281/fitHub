const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true, unique: true },
  integrity_score: { type: Number, default: 100 },
  integrity_status: { type: String, enum: ['good', 'flagged', 'suspended'], default: 'good' },
  flags: [{ type: String }],
  suspicious_events: [{ type: mongoose.Schema.Types.Mixed }],
}, { timestamps: true });

module.exports = mongoose.model('UserIntegrity', schema);
