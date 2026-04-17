const Stripe = require('stripe');

let _stripe = null;

function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Proxy so existing code can do `stripe.checkout.sessions.create(...)` without change
module.exports = new Proxy({}, {
  get(_, prop) {
    return getStripe()[prop];
  },
});
