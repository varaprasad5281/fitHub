const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  read: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

schema.index({ created_by: 1, read: 1 });

module.exports = mongoose.model('Notification', schema);
