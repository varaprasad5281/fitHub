const stripe = require('../../services/stripe');
const Subscription = require('../../models/Subscription');
const { notify } = require('../../utils/notify');

const PLAN_NAMES = {
  pro_monthly:    '7% Pro',
  pro_yearly:     '7% Pro',
  elite_monthly:  '7% Elite',
  elite_yearly:   '7% Elite',
};

module.exports = async (req, res) => {
  const { session_id } = req.body;
  const userEmail = req.user.email;

  if (!session_id) return res.status(400).json({ error: 'session_id is required' });

  // Retrieve the session from Stripe to verify payment
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid session ID', detail: err.message });
  }

  if (session.status !== 'complete' && session.payment_status !== 'paid') {
    return res.json({ success: false, message: 'Payment not completed' });
  }
  if (session.customer_email && session.customer_email !== userEmail) {
    return res.status(403).json({ error: 'Session does not belong to this user' });
  }

  const billingPeriod = session.metadata?.billing_period;
  if (!billingPeriod) return res.status(400).json({ error: 'Missing billing_period metadata' });

  const isPro = billingPeriod.startsWith('pro_');
  const stripeSubId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  // Idempotency - if we already processed this exact Stripe subscription and
  // the subscription is live, return success without re-writing.
  const existing = await Subscription.findOne({ created_by: userEmail });
  if (
    existing?.stripe_subscription_id === stripeSubId &&
    (existing.status === 'active' || existing.status === 'trial')
  ) {
    console.log(`[verifyCheckout] Already processed for ${userEmail} - returning cached result`);
    return res.json({ success: true, plan: existing.plan, status: existing.status });
  }

  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newStatus = isPro ? 'trial' : 'active';

  // Use explicit $set so undefined values don't accidentally unset existing fields
  const updateFields = {
    plan: billingPeriod,
    status: newStatus,
    stripe_subscription_id: stripeSubId,
    stripe_customer_id: session.customer,
    start_date: new Date().toISOString().split('T')[0],
    subscription_active: true,
  };

  if (isPro) {
    updateFields.trial_start = new Date().toISOString();
    updateFields.trial_end = trialEnd.toISOString();
    updateFields.had_trial = true;
  }

  await Subscription.findOneAndUpdate(
    { created_by: userEmail },
    { $set: updateFields },
    { upsert: true, new: true }
  );

  const planLabel = PLAN_NAMES[billingPeriod] || billingPeriod;
  if (isPro) {
    notify(userEmail,
      `🎉 Welcome to ${planLabel}! Your 7-day free trial has started. Enjoy full access to workouts, nutrition tracking, and coaching.`,
      'subscription'
    );
  } else {
    notify(userEmail,
      `👑 You're now on ${planLabel}! Leaderboards, social features, and elite coaching are all unlocked.`,
      'subscription'
    );
  }

  console.log(`[verifyCheckout] Subscription activated: ${userEmail} → ${billingPeriod} (${newStatus})`);
  return res.json({ success: true, plan: billingPeriod, status: newStatus });
};
