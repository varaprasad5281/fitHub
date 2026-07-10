/**
 * Single source of truth for "does this subscription doc currently grant paid access".
 * Mirrors src/lib/subscriptionUtils.js on the frontend - keep both in sync.
 */

const PRO_PLANS = ['pro_monthly', 'pro_yearly', 'elite_monthly', 'elite_yearly'];
const ELITE_PLANS = ['elite_monthly', 'elite_yearly'];

function isStatusActive(subscription) {
  return (
    subscription?.status === 'active' ||
    subscription?.status === 'trial' ||
    (subscription?.status === 'cancelled' && subscription?.end_date && new Date(subscription.end_date) > new Date())
  );
}

function hasProAccess(subscription) {
  return !!subscription?.plan && PRO_PLANS.includes(subscription.plan) && isStatusActive(subscription);
}

function hasEliteAccess(subscription) {
  return !!subscription?.plan && ELITE_PLANS.includes(subscription.plan) && isStatusActive(subscription);
}

module.exports = { hasProAccess, hasEliteAccess, isStatusActive };
