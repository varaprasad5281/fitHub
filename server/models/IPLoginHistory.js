const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  ip_address: String,
  user_email: String,
  login_timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

schema.index({ ip_address: 1 });
schema.index({ user_email: 1 });

module.exports = mongoose.model('IPLoginHistory', schema);
