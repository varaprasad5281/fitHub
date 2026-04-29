const stripe = require('../../services/stripe');
const Subscription = require('../../models/Subscription');

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

  // Must be complete and belong to this user
  if (session.status !== 'complete' && session.payment_status !== 'paid') {
    return res.json({ success: false, message: 'Payment not completed' });
  }
  if (session.customer_email && session.customer_email !== userEmail) {
    return res.status(403).json({ error: 'Session does not belong to this user' });
  }

  const billingPeriod = session.metadata?.billing_period;
  if (!billingPeriod) return res.status(400).json({ error: 'Missing billing_period metadata' });

  const isPro = billingPeriod.startsWith('pro_');
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const stripeSubId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  await Subscription.findOneAndUpdate(
    { created_by: userEmail },
    {
      plan: billingPeriod,
      status: isPro ? 'trial' : 'active',
      stripe_subscription_id: stripeSubId,
      stripe_customer_id: session.customer,
      start_date: new Date().toISOString().split('T')[0],
      subscription_active: true,
      trial_start: isPro ? new Date().toISOString() : undefined,
      trial_end: isPro ? trialEnd.toISOString() : undefined,
      had_trial: isPro ? true : undefined,
    },
    { upsert: true, new: true }
  );

  console.log(`[verifyCheckout] Subscription activated: ${userEmail} → ${billingPeriod}`);
  return res.json({ success: true, plan: billingPeriod, status: isPro ? 'trial' : 'active' });
};
