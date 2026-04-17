/**
 * Handles: getSubscriptionHistory, getPortalUrl
 */

const Subscription = require('../../models/Subscription');
const stripe = require('../../services/stripe');

// ── getSubscriptionHistory ─────────────────────────────────────────────────────
async function getSubscriptionHistory(req, res) {
  const userEmail = req.user.email;
  const sub = await Subscription.findOne({ created_by: userEmail });
  if (!sub) return res.json({ data: [] });

  // Build a simple history array from the subscription record
  const history = [];
  if (sub.start_date) {
    history.push({
      date: sub.start_date,
      event: 'Subscription started',
      plan: sub.plan,
      status: sub.status,
    });
  }
  if (sub.end_date && sub.status === 'cancelled') {
    history.push({
      date: sub.end_date,
      event: 'Subscription cancelled',
      plan: sub.plan,
      status: 'cancelled',
    });
  }

  res.json({ data: history, subscription: sub });
}

// ── getPortalUrl ───────────────────────────────────────────────────────────────
async function getPortalUrl(req, res) {
  const userEmail = req.user.email;
  const sub = await Subscription.findOne({ created_by: userEmail });

  if (!sub?.stripe_customer_id) {
    return res.status(400).json({ error: 'No active subscription found' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/Subscription`,
  });

  res.json({ data: { url: session.url } });
}

module.exports = { getSubscriptionHistory, getPortalUrl };
