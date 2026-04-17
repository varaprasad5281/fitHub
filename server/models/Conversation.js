const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  participant_emails: [{ type: String }],
  last_message_at: { type: Date, default: Date.now },
  last_message_preview: String,
}, { timestamps: true });

schema.index({ participant_emails: 1 });

module.exports = mongoose.model('Conversation', schema);
