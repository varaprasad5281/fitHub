/**
 * Handles: getSubscriptionHistory, getPortalUrl
 */

const Subscription = require('../../models/Subscription');
const stripe = require('../../services/stripe');

// ── getSubscriptionHistory ─────────────────────────────────────────────────────
async function getSubscriptionHistory(req, res) {
  const userEmail = req.user.email;
  const sub = await Subscription.findOne({ created_by: userEmail });

  const subscriptionHistory = [];
  if (!sub) {
    return res.json({ subscriptionHistory, invoices: [], subscription: null });
  }

  if (sub.start_date) {
    subscriptionHistory.push({
      date: sub.start_date,
      event: 'Subscription started',
      plan: sub.plan,
      status: sub.status,
    });
  }
  if (sub.end_date && sub.status === 'cancelled') {
    subscriptionHistory.push({
      date: sub.end_date,
      event: 'Subscription cancelled',
      plan: sub.plan,
      status: 'cancelled',
    });
  }

  let invoices = [];
  if (sub.stripe_customer_id) {
    try {
      const stripeInvoices = await stripe.invoices.list({
        customer: sub.stripe_customer_id,
        limit: 10,
        expand: ['data.payment_intent'],
      });

      invoices = stripeInvoices.data.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.number || invoice.id,
        amount: invoice.amount_paid || invoice.amount_remaining || invoice.amount,
        status: invoice.status,
        paidDate: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : null,
        pdfUrl: invoice.hosted_invoice_url || invoice.invoice_pdf || null,
        startDate: invoice.lines?.data?.[0]?.period?.start ? new Date(invoice.lines[0].period.start * 1000).toISOString() : null,
        endDate: invoice.lines?.data?.[0]?.period?.end ? new Date(invoice.lines[0].period.end * 1000).toISOString() : null,
      }));
    } catch (err) {
      console.error('[getSubscriptionHistory] Stripe invoice fetch failed', err.message);
      invoices = [];
    }
  }

  res.json({ subscriptionHistory, invoices, subscription: sub });
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
