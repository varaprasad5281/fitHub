const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  actor_email: String,
  event_type: String,
  description: String,
  metadata: { type: mongoose.Schema.Types.Mixed },
  visibility: { type: String, enum: ['public', 'friends_only', 'private'], default: 'friends_only' },
}, { timestamps: true });

schema.index({ actor_email: 1, createdAt: -1 });

module.exports = mongoose.model('UserActivityEvent', schema);
