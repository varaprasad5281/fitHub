const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender_email: { type: String, required: true },
  body: { type: String, required: true },
  status: { type: String, enum: ['sent', 'read'], default: 'sent' },
  is_flagged: { type: Boolean, default: false },
}, { timestamps: true });

schema.index({ conversation_id: 1, createdAt: -1 });

module.exports = mongoose.model('Message', schema);
