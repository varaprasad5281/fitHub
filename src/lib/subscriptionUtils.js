/**
 * Pick the best (most privileged, active) subscription from a list.
 * Prefers active/trial records over expired/cancelled ones so that
 * subscriptions[0] (which may be an empty seed record from registration)
 * never incorrectly shows a paid user as locked.
 *
 * @param {any[]} list
 * @returns {any | undefined}
 */
export function activeSub(list = []) {
  if (!list.length) return undefined;
  return (
    list.find(s => s.status === 'active' || s.status === 'trial') ||
    list.find(s => s.status === 'cancelled' && s.end_date && new Date(s.end_date) > new Date()) ||
    list[0]
  );
}

/**
 * Returns true if the given subscription grants Pro-or-above access.
 * Elite users always pass this check too.
 * @param {any} sub
 */
export function hasProAccess(sub) {
  if (!sub?.plan) return false;
  const paid = sub.plan === 'pro_monthly' || sub.plan === 'pro_yearly' ||
               sub.plan === 'elite_monthly' || sub.plan === 'elite_yearly';
  const active = sub.status === 'active' || sub.status === 'trial' ||
                 (sub.status === 'cancelled' && sub.end_date && new Date(sub.end_date) > new Date());
  return paid && active;
}

/**
 * Returns true if the given subscription grants Elite-only access.
 * @param {any} sub
 */
export function hasEliteAccess(sub) {
  if (!sub?.plan) return false;
  const elite = sub.plan === 'elite_monthly' || sub.plan === 'elite_yearly';
  const active = sub.status === 'active' || sub.status === 'trial' ||
                 (sub.status === 'cancelled' && sub.end_date && new Date(sub.end_date) > new Date());
  return elite && active;
}
