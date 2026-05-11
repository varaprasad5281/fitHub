/**
 * Replaces: cancelSubscription
 */
const stripe = require('../../services/stripe');
const Subscription = require('../../models/Subscription');

module.exports = async (req, res) => {
  const user = req.user;

  const sub = await Subscription.findOne({ created_by: user.email });
  if (!sub || !sub.stripe_subscription_id) {
    return res.status(404).json({ error: 'No active subscription found' });
  }
  if (!['active', 'trial'].includes(sub.status)) {
    return res.status(400).json({ error: 'Subscription is not active' });
  }

  // Cancel at period end - user keeps access until the billing period ends
  await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });

  await sub.updateOne({ status: 'cancelled' });

  console.log('[cancelSubscription] Scheduled cancellation for:', user.email);
  res.json({ success: true, message: 'Subscription will be cancelled at the end of the billing period' });
};
