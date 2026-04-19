/**
 * Replaces: base44/functions/createCheckout/entry.ts
 */
const stripe = require('../../services/stripe');
const { PRICE_MAP } = require('../../utils/constants');
const Subscription = require('../../models/Subscription');

const VALID_BILLING_PERIODS = Object.keys(PRICE_MAP);
const idempotencyStore = new Map();

module.exports = async (req, res) => {
  const { billingPeriod, userEmail, idempotencyKey, successUrl, cancelUrl } = req.body;

  if (!billingPeriod || !VALID_BILLING_PERIODS.includes(billingPeriod)) {
    return res.status(400).json({ error: 'Invalid billing period' });
  }
  if (!userEmail || !userEmail.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.length < 20) {
    return res.status(400).json({ error: 'Invalid idempotency key' });
  }

  if (idempotencyStore.has(idempotencyKey)) {
    const cached = idempotencyStore.get(idempotencyKey);
    if (cached.status === 'success') return res.json(cached);
    if (cached.status === 'processing') return res.status(409).json({ error: 'Checkout already in progress' });
  }

  idempotencyStore.set(idempotencyKey, { status: 'processing' });

  const priceId = PRICE_MAP[billingPeriod];
  const isPro = billingPeriod.startsWith('pro_');
  const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/') || '';

  // Block second free trials for Pro plans
  if (isPro) {
    const sub = await Subscription.findOne({ created_by: userEmail });
    if (sub?.had_trial) {
      idempotencyStore.delete(idempotencyKey);
      return res.status(400).json({ error: 'You have already used your free trial. Please subscribe directly.' });
    }
  }

  const sessionConfig = {
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl || `${origin}/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${origin}/subscription?checkout=cancelled`,
    customer_email: userEmail,
    metadata: {
      user_email: userEmail,
      billing_period: billingPeriod,
      idempotency_key: idempotencyKey,
      timestamp: new Date().toISOString(),
    },
  };

  if (isPro) {
    sessionConfig.subscription_data = {
      trial_period_days: 7,
      metadata: { user_email: userEmail, billing_period: billingPeriod },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);
  const successResponse = { status: 'success', sessionId: session.id, url: session.url };
  idempotencyStore.set(idempotencyKey, successResponse);
  setTimeout(() => idempotencyStore.delete(idempotencyKey), 60 * 60 * 1000);

  console.log(`[CHECKOUT] Session ${session.id} for ${userEmail} (${billingPeriod})`);
  res.json({ sessionId: session.id, url: session.url });
};
