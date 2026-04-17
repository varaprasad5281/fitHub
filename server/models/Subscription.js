const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by: { type: String, required: true, unique: true },
  plan: {
    type: String,
    enum: ['starter', 'pro_monthly', 'pro_yearly', 'elite_monthly', 'elite_yearly'],
    default: 'starter',
  },
  status: {
    type: String,
    enum: ['active', 'trial', 'cancelled', 'expired', 'past_due', 'inactive'],
    default: 'inactive',
  },
  subscription_active: { type: Boolean, default: false },
  stripe_subscription_id: String,
  stripe_customer_id: String,
  start_date: String,
  end_date: String,
  trial_start: String,
  trial_end: String,
  subscription_current_period_end: Date,
  payment_failures: { type: Number, default: 0 },
  last_payment_failed_date: String,
}, { timestamps: true });

module.exports = mongoose.model('Subscription', schema);
