const Stripe = require('stripe');

let _stripe = null;

function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    _stripe = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return _stripe;
}

// Proxy so existing code can do `stripe.checkout.sessions.create(...)` without change
module.exports = new Proxy({}, {
  get(_, prop) {
    return getStripe()[prop];
  },
});
