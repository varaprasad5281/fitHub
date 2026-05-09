/**
 * syncSubscription
 *
 * Retrieves the user's Stripe subscription, maps the price ID back to
 * the billing period, and updates the local DB record to match.
 * Called from the Subscription page on every load to self-heal any
 * mismatch between Stripe and the local database.
 */
const stripe = require('../../services/stripe');
const Subscription = require('../../models/Subscription');
const { PRICE_MAP } = require('../../utils/constants');

// Reverse map: Stripe price_id → billing_period key
function buildPriceToplan() {
  const map = {};
  for (const [plan, priceId] of Object.entries(PRICE_MAP)) {
    if (priceId) map[priceId] = plan;
  }
  return map;
}

const STRIPE_STATUS_MAP = {
  trialing: 'trial',
  active:   'active',
  canceled: 'cancelled',
  past_due: 'past_due',
  unpaid:   'past_due',
  incomplete: 'past_due',
  incomplete_expired: 'expired',
};

module.exports = async (req, res) => {
  const userEmail = req.user.email;

  const sub = await Subscription.findOne({ created_by: userEmail });
  if (!sub?.stripe_subscription_id) {
    return res.json({ success: false, message: 'No Stripe subscription linked' });
  }

  let stripeSub;
  try {
    stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id, {
      expand: ['items.data.price'],
    });
  } catch (err) {
    console.error('[syncSubscription] Stripe lookup failed:', err.message);
    return res.json({ success: false, message: 'Stripe lookup failed' });
  }

  const priceId = stripeSub.items?.data?.[0]?.price?.id;
  const PRICE_TO_PLAN = buildPriceToplan();
  const billingPeriod = PRICE_TO_PLAN[priceId];

  if (!billingPeriod) {
    console.warn('[syncSubscription] Unknown price ID:', priceId, '— cannot map to plan');
    return res.json({ success: false, message: `Unknown price ID: ${priceId}` });
  }

  const newStatus = STRIPE_STATUS_MAP[stripeSub.status] || 'expired';
  const isActive  = newStatus === 'active' || newStatus === 'trial';

  const updateFields = {
    plan: billingPeriod,
    status: newStatus,
    subscription_active: isActive,
  };

  // Preserve trial dates if Stripe says trialing
  if (stripeSub.status === 'trialing' && stripeSub.trial_end) {
    updateFields.trial_end = new Date(stripeSub.trial_end * 1000).toISOString();
  }

  // Preserve period end for active subscriptions
  if (stripeSub.current_period_end) {
    updateFields.subscription_current_period_end = new Date(stripeSub.current_period_end * 1000);
  }

  await Subscription.findOneAndUpdate(
    { created_by: userEmail },
    { $set: updateFields },
    { new: true }
  );

  console.log(`[syncSubscription] ${userEmail} → plan=${billingPeriod} status=${newStatus} (was plan=${sub.plan} status=${sub.status})`);
  return res.json({ success: true, plan: billingPeriod, status: newStatus });
};
