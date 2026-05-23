/**
 * processReferralMilestones(referrerEmail)
 *
 * Called after a referral is marked completed (referred user subscribes).
 * Counts the referrer's total completed referrals and awards any milestone
 * rewards not yet granted. Safe to call multiple times — idempotent.
 */

const Referral = require('../models/Referral');
const User = require('../models/User');
const Points = require('../models/Points');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Subscription = require('../models/Subscription');
const { notify } = require('./notify');

// Milestone definitions in ascending order
const MILESTONES = [
  { count: 5,   type: 'badge',        badge_code: 'REFERRAL_5',  points: 100 },
  { count: 10,  type: 'subscription', plan: 'pro_monthly' },
  { count: 15,  type: 'badge',        badge_code: 'REFERRAL_15', points: 250 },
  { count: 20,  type: 'subscription', plan: 'elite_monthly' },
  { count: 25,  type: 'badge',        badge_code: 'REFERRAL_25', points: 500 },
  { count: 50,  type: 'subscription', plan: 'elite_monthly',     months: 3, points: 1000 },
  { count: 100, type: 'affiliate' },
];

async function processReferralMilestones(referrerEmail) {
  try {
    const completedCount = await Referral.countDocuments({
      referrer_email: referrerEmail,
      status: 'completed',
    });

    const user = await User.findOne({ email: referrerEmail });
    if (!user) return;

    const alreadyGranted = new Set(user.referral_rewards_granted || []);

    for (const milestone of MILESTONES) {
      if (completedCount < milestone.count) continue;
      if (alreadyGranted.has(milestone.count)) continue;

      if (milestone.type === 'badge') {
        const badge = await Badge.findOne({ badge_code: milestone.badge_code }).lean();
        if (badge) {
          try {
            await UserBadge.create({
              created_by: referrerEmail,
              badge_id: badge._id,
              badge_code: milestone.badge_code,
              achievement_notes: `Referral milestone: ${milestone.count} successful referrals`,
            });
          } catch (err) {
            if (err.code !== 11000) throw err;
          }
        }
        if (milestone.points) {
          await Points.findOneAndUpdate(
            { created_by: referrerEmail },
            { $inc: { total_points: milestone.points, weekly_points: milestone.points } }
          );
        }
        const rarityEmoji = { rare: '🥈', epic: '🥇', legendary: '🌟' };
        const emoji = badge ? (rarityEmoji[badge.rarity_level] || '🏅') : '🏅';
        notify(
          referrerEmail,
          `${emoji} Referral milestone! ${milestone.count} referrals — you earned "${badge?.name || milestone.badge_code}"${milestone.points ? ` + ${milestone.points} points` : ''}.`,
          'badge_earned'
        );
      }

      if (milestone.type === 'subscription') {
        const sub = await Subscription.findOne({ created_by: referrerEmail });
        const isElitePlan = milestone.plan === 'elite_monthly';
        const alreadyOnElite = sub?.plan?.includes('elite') &&
          (sub.status === 'active' || sub.status === 'trial');
        const durationMonths = milestone.months || 1;
        const durationDays = durationMonths * 30;

        if (!isElitePlan && alreadyOnElite) {
          notify(
            referrerEmail,
            `🎉 ${milestone.count} referrals! You earned ${durationMonths} month${durationMonths > 1 ? 's' : ''} free Pro — you're already on Elite, so you're all set.`,
            'general'
          );
        } else {
          const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
          await Subscription.findOneAndUpdate(
            { created_by: referrerEmail },
            {
              plan: milestone.plan,
              status: 'active',
              subscription_active: true,
              start_date: new Date().toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
            }
          );
          const planLabel = isElitePlan ? 'Elite' : 'Pro';
          notify(
            referrerEmail,
            `🎉 ${milestone.count} referrals! You've earned ${durationMonths} month${durationMonths > 1 ? 's' : ''} free ${planLabel} access. Enjoy!`,
            'general'
          );
        }
        if (milestone.points) {
          await Points.findOneAndUpdate(
            { created_by: referrerEmail },
            { $inc: { total_points: milestone.points, weekly_points: milestone.points } }
          );
        }
      }

      if (milestone.type === 'affiliate') {
        notify(
          referrerEmail,
          `🤝 Incredible — ${milestone.count} referrals! You've qualified for the 7% Affiliate Partner program. Our team will reach out to you soon.`,
          'general'
        );
      }

      // Mark this milestone as granted
      await User.updateOne(
        { email: referrerEmail },
        { $addToSet: { referral_rewards_granted: milestone.count } }
      );
    }
  } catch (err) {
    console.error('[processReferralMilestones]', err.message);
  }
}

module.exports = processReferralMilestones;
