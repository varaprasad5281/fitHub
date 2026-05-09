/**
 * Replaces: base44/functions/stripeWebhook/entry.ts
 * NOTE: Registered with express.raw() in index.js so body is a Buffer.
 */
const stripe = require('../../services/stripe');
const Subscription = require('../../models/Subscription');
const Notification = require('../../models/Notification');
const { sendEmail } = require('../../services/email');
const { buildEmail } = require('../../utils/emailTemplate');
const { PRICE_MAP } = require('../../utils/constants');

const PLAN_NAMES = {
  pro_monthly: '7% Pro',
  pro_yearly: '7% Pro',
  elite_monthly: '7% Elite',
  elite_yearly: '7% Elite',
};

// Reverse map: Stripe price_id → billing_period key
const PRICE_TO_PLAN = Object.fromEntries(
  Object.entries(PRICE_MAP).filter(([, v]) => v).map(([k, v]) => [v, k])
);

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
      $set: {
        plan: billingPeriod,
        status: isPro ? 'trial' : 'active',
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        start_date: new Date().toISOString().split('T')[0],
        subscription_active: true,
        ...(isPro ? {
          trial_start: new Date().toISOString(),
          trial_end: trialEnd.toISOString(),
          had_trial: true,        // permanently mark this email as trial-used
        } : {}),
      },
    });

    const emailSubject = isPro
      ? `Your 7-day free trial has started — welcome to ${planName}!`
      : `Welcome to ${planName}!`;

    const emailPlain = isPro
      ? `Your 7-day free trial is now active. No payment has been charged yet.\nTrial ends: ${trialEnd.toLocaleDateString('en-GB')}\nCancel anytime before your trial ends.\n— The 7% Team`
      : `Your ${planName} subscription is now active. Let's stay disciplined.\n— The 7% Team`;

    const emailHtml = isPro
      ? buildEmail({
          title: `Welcome to ${planName}! 🎉`,
          preheader: 'Your 7-day free trial is now active.',
          body: `
            <p style="margin:0 0 16px 0;color:#ffffff;font-weight:600;font-size:16px;">Your free trial is live!</p>
            <p style="margin:0 0 16px 0;">Your <strong style="color:#f59e0b;">7-day free trial</strong> is now active. No payment has been charged yet.</p>
            <div style="background:#1c1c1e;border:1px solid #27272a;border-radius:12px;padding:16px 20px;margin:20px 0;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;">Trial Details</p>
              <p style="margin:0 0 6px 0;color:#ffffff;">Plan: <strong>${planName}</strong></p>
              <p style="margin:0;color:#ffffff;">Trial ends: <strong>${trialEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
            </div>
            <p style="margin:0;font-size:13px;color:#71717a;">Cancel anytime before your trial ends and you won't be charged a penny.</p>
          `,
          footer: 'Manage your subscription anytime from the Subscription page in the app.',
        })
      : buildEmail({
          title: `Welcome to ${planName}! 👑`,
          preheader: `Your ${planName} subscription is now active.`,
          body: `
            <p style="margin:0 0 16px 0;color:#ffffff;font-weight:600;font-size:16px;">You're in the top 7%.</p>
            <p style="margin:0 0 16px 0;">Your <strong style="color:#f59e0b;">${planName}</strong> subscription is now active. All premium features are unlocked.</p>
            <p style="margin:0;font-size:13px;color:#71717a;">Stay consistent. Most people quit — you didn't.</p>
          `,
          footer: 'Manage your subscription anytime from the Subscription page in the app.',
        });

    sendEmail({ to: userEmail, subject: emailSubject, body: emailPlain, html: emailHtml }).catch(() => {});
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

    // Also sync the plan from the Stripe price ID so the DB never drifts
    const priceId = stripeSub.items?.data?.[0]?.price?.id;
    const billingPeriod = PRICE_TO_PLAN[priceId];
    if (billingPeriod) updateData.plan = billingPeriod;

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

    // A $0 invoice fired at trial start should NOT flip status to 'active' —
    // the subscription is still in its trial period.
    if (invoice.amount_paid === 0 && invoice.billing_reason === 'subscription_create') {
        return res.json({ received: true });
    }

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
