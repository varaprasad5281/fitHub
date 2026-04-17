const mongoose = require('mongoose');

const pointsTransactionSchema = new mongoose.Schema({
  created_by: { type: String, required: true },
  points_awarded: { type: Number, required: true },
  source: { type: String, required: true },
  transaction_date: { type: String }, // YYYY-MM-DD
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

pointsTransactionSchema.index({ created_by: 1, transaction_date: 1 });

module.exports = mongoose.model('PointsTransaction', pointsTransactionSchema);
