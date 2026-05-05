/**
 * Subscription utilities — direct copy from web's src/lib/subscriptionUtils.js.
 * No changes needed; pure JS logic with no browser dependencies.
 */

export function activeSub(list = []) {
  if (!list.length) return undefined;
  return (
    list.find(s => s.status === 'active' || s.status === 'trial') ||
    list.find(s => s.status === 'cancelled' && s.end_date && new Date(s.end_date) > new Date()) ||
    list[0]
  );
}

export function hasProAccess(sub) {
  if (!sub?.plan) return false;
  const paid = sub.plan === 'pro_monthly' || sub.plan === 'pro_yearly' ||
               sub.plan === 'elite_monthly' || sub.plan === 'elite_yearly';
  const active = sub.status === 'active' || sub.status === 'trial' ||
                 (sub.status === 'cancelled' && sub.end_date && new Date(sub.end_date) > new Date());
  return paid && active;
}

export function hasEliteAccess(sub) {
  if (!sub?.plan) return false;
  const elite = sub.plan === 'elite_monthly' || sub.plan === 'elite_yearly';
  const active = sub.status === 'active' || sub.status === 'trial' ||
                 (sub.status === 'cancelled' && sub.end_date && new Date(sub.end_date) > new Date());
  return elite && active;
}
