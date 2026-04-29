/**
 * Replaces: base44/functions/stripeWebhook/entry.ts
 * NOTE: Registered with express.raw() in index.js so body is a Buffer.
 */
const stripe = require('../../services/stripe');
const Subscription = require('../../models/Subscription');
const Notification = require('../../models/Notification');
const { sendEmail } = require('../../services/email');

const PLAN_NAMES = {
  pro_monthly: '7% Pro',
  pro_yearly: '7% Pro',
  elite_monthly: '7% Elite',
  elite_yearly: '7% Elite',
};

module.exports = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return res.status(401).json({ error: 'Webhook authentication failed' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log('Webhook event:', event.type);

  // ── checkout.session.completed ──────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.metadata?.user_email;
    const billingPeriod = session.metadata?.billing_period;
    if (!userEmail || !billingPeriod) return res.json({ received: true });

    const sub = await Subscription.findOne({ created_by: userEmail });
    if (!sub) return res.json({ received: true });

    // Only skip if we've already processed THIS exact Stripe subscription
    // (prevents double-processing the same payment, but allows upgrades from starter/expired)
    if (
      sub.stripe_subscription_id === session.subscription &&
      (sub.status === 'active' || sub.status === 'trial')
    ) return res.json({ received: true });

    const isPro = billingPeriod.startsWith('pro_');
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const planName = PLAN_NAMES[billingPeriod] || billingPeriod;

    await Subscription.findOneAndUpdate({ created_by: userEmail }, {
      plan: billingPeriod,
      status: isPro ? 'trial' : 'active',
      stripe_subscription_id: session.subscription,
      stripe_customer_id: session.customer,
      start_date: new Date().toISOString().split('T')[0],
      subscription_active: true,
      trial_start: isPro ? new Date().toISOString() : null,
      trial_end: isPro ? trialEnd.toISOString() : null,
      ...(isPro ? { had_trial: true } : {}),
    });

    const emailSubject = isPro
      ? `Your 7-day free trial has started — welcome to ${planName}!`
      : `Welcome to ${planName}!`;
    const emailBody = isPro
      ? `Welcome to 7%!\n\nYour 7-day free trial is now active. No payment has been charged yet.\n\nTrial ends: ${trialEnd.toLocaleDateString('en-GB')}\n\nCancel anytime before your trial ends.\n\nThe 7% Team`
      : `Welcome to 7%!\n\nYour ${planName} subscription is now active.\n\nLet's stay disciplined.\n\nThe 7% Team`;

    sendEmail({ to: userEmail, subject: emailSubject, body: emailBody }).catch(() => {});
    console.log('Subscription activated for:', userEmail);
  }

  // ── customer.subscription.updated ──────────────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const stripeSub = event.data.object;
    const sub = await Subscription.findOne({ stripe_subscription_id: stripeSub.id });
    if (!sub) return res.json({ received: true });

    let status, isActive = false, endDate = null;
    if (stripeSub.status === 'trialing') { status = 'trial'; }
    else if (stripeSub.status === 'active' && stripeSub.cancel_at_period_end) {
      status = 'cancelled'; isActive = true;
      endDate = new Date(stripeSub.current_period_end * 1000).toISOString().split('T')[0];
    } else if (stripeSub.status === 'active') {
      status = 'active'; isActive = true;
    } else if (stripeSub.status === 'canceled') {
      status = 'cancelled'; endDate = new Date().toISOString().split('T')[0];
    } else {
      status = 'expired'; endDate = new Date().toISOString().split('T')[0];
    }

    const updateData = {
      status, subscription_active: isActive,
      subscription_current_period_end: new Date(stripeSub.current_period_end * 1000),
    };
    if (endDate) updateData.end_date = endDate;
    await sub.updateOne(updateData);
  }

  // ── customer.subscription.deleted ──────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const stripeSub = event.data.object;
    await Subscription.findOneAndUpdate({ stripe_subscription_id: stripeSub.id }, {
      status: 'expired', subscription_active: false, end_date: new Date().toISOString().split('T')[0],
    });
  }

  // ── invoice.paid ────────────────────────────────────────────────────────
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object;
    if (!invoice.subscription) return res.json({ received: true });
    const periodEnd = invoice.lines?.data[0]?.period?.end;
    await Subscription.findOneAndUpdate({ stripe_subscription_id: invoice.subscription }, {
      status: 'active', subscription_active: true, payment_failures: 0,
      ...(periodEnd ? { subscription_current_period_end: new Date(periodEnd * 1000) } : {}),
    });
  }

  // ── invoice.payment_failed ──────────────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    if (!invoice.subscription) return res.json({ received: true });

    const sub = await Subscription.findOne({ stripe_subscription_id: invoice.subscription });
    if (!sub) return res.json({ received: true });

    const failureCount = (sub.payment_failures || 0) + 1;
    const newStatus = failureCount >= 3 ? 'expired' : 'past_due';
    await sub.updateOne({ status: newStatus, subscription_active: false, payment_failures: failureCount, last_payment_failed_date: new Date().toISOString().split('T')[0] });

    const planLabel = sub.plan?.includes('elite') ? 'Elite' : 'Pro';
    const message = failureCount >= 3
      ? `Your ${planLabel} subscription has expired after 3 failed payments.`
      : `Payment failed (attempt ${failureCount}/3). Please update your payment method.`;
    Notification.create({ created_by: sub.created_by, message, type: 'general', read: false }).catch(() => {});
  }

  res.json({ received: true });
};
