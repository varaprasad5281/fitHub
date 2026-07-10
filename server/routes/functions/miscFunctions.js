/**
 * Miscellaneous lightweight functions:
 * smartUpgradePrompt, trackBehaviorMetric, activatePrestige
 */

const Subscription = require('../../models/Subscription');
const Points = require('../../models/Points');
const { hasProAccess } = require('../../utils/subscriptionAccess');

// ── smartUpgradePrompt ─────────────────────────────────────────────────────────
async function smartUpgradePrompt(req, res) {
  const userEmail = req.user.email;
  const sub = await Subscription.findOne({ created_by: userEmail });

  const isPro = hasProAccess(sub);
  res.json({
    data: {
      show_prompt: !isPro,
      current_plan: sub?.plan || 'starter',
      message: isPro ? null : 'Upgrade to Pro to unlock all features!',
    },
  });
}

// ── trackBehaviorMetric ────────────────────────────────────────────────────────
async function trackBehaviorMetric(req, res) {
  // No-op - analytics hook; can be wired to a real analytics service later
  res.json({ success: true });
}

// ── activatePrestige ───────────────────────────────────────────────────────────
async function activatePrestige(req, res) {
  const userEmail = req.user.email;
  const points = await Points.findOne({ created_by: userEmail });

  if (!points || (points.total_points || 0) < 10000) {
    return res.status(400).json({ error: 'You need at least 10,000 points to activate Prestige.' });
  }

  // Reset points, increment prestige level
  const prestigeLevel = (points.prestige_level || 0) + 1;
  points.prestige_level = prestigeLevel;
  points.total_points = 0;
  points.weekly_points = 0;
  await points.save();

  res.json({ data: { prestige_level: prestigeLevel, message: `Prestige Level ${prestigeLevel} activated!` } });
}

module.exports = { smartUpgradePrompt, trackBehaviorMetric, activatePrestige };
