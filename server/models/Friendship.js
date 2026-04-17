const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  requester_email: { type: String, required: true },
  receiver_email: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

schema.index({ requester_email: 1, receiver_email: 1 }, { unique: true });
schema.index({ receiver_email: 1 });

module.exports = mongoose.model('Friendship', schema);
