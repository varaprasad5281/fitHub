/**
 * awardFounderBadge
 *
 * Admin-only endpoint to award the Beta Founder badge.
 *
 * Modes:
 *   action: 'award_list'   - award to a specific array of emails provided in the request
 *   action: 'award_first'  - auto-detect the first N registered users by account creation date
 *   action: 'status'       - return who currently holds the badge + how many slots remain
 *
 * Security: restricted to ADMIN_EMAIL env variable (or a hardcoded set of admin emails).
 * Never expose this endpoint publicly.
 */

const User    = require('../../models/User');
const Badge   = require('../../models/Badge');
const UserBadge = require('../../models/UserBadge');

const BADGE_CODE = 'FOUNDER';
const DEFAULT_FOUNDER_LIMIT = 100;

// Simple admin guard - set ADMIN_EMAIL in your .env (comma-separated for multiple)
function isAdmin(userEmail) {
  const admins = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(userEmail.toLowerCase());
}

async function grantFounderBadge(email, badge, notes = 'Manual Founder award') {
  try {
    await UserBadge.create({
      created_by: email,
      badge_id: badge._id,
      badge_code: BADGE_CODE,
      achievement_notes: notes,
    });
    return { email, status: 'awarded' };
  } catch (err) {
    if (err.code === 11000) return { email, status: 'already_had_it' };
    return { email, status: 'error', detail: err.message };
  }
}

module.exports = async (req, res) => {
  const callerEmail = req.user?.email;
  console.log('[awardFounderBadge] caller:', callerEmail, '| ADMIN_EMAIL env:', process.env.ADMIN_EMAIL);

  if (!isAdmin(callerEmail)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { action = 'status', emails = [], limit = DEFAULT_FOUNDER_LIMIT } = req.body;

  const badge = await Badge.findOne({ badge_code: BADGE_CODE }).lean();
  if (!badge) {
    return res.status(500).json({
      error: 'Founder badge not found in DB. Run: node server/scripts/seedBadges.js',
    });
  }

  // ── action: 'status' ─────────────────────────────────────────────────────
  if (action === 'status') {
    const holders = await UserBadge.find({ badge_code: BADGE_CODE }, { created_by: 1 }).lean();
    return res.json({
      success: true,
      total_awarded: holders.length,
      remaining_slots: Math.max(0, DEFAULT_FOUNDER_LIMIT - holders.length),
      holders: holders.map(h => h.created_by),
    });
  }

  // ── action: 'award_list' ─────────────────────────────────────────────────
  if (action === 'award_list') {
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'emails array is required' });
    }

    const results = await Promise.all(
      emails.map(email => grantFounderBadge(email, badge, 'Awarded via award_list'))
    );

    return res.json({ success: true, results });
  }

  // ── action: 'award_first' ────────────────────────────────────────────────
  if (action === 'award_first') {
    const n = Math.min(Number(limit) || DEFAULT_FOUNDER_LIMIT, 500); // cap at 500

    // Get the N earliest registered users
    const users = await User.find({})
      .sort({ createdAt: 1 })
      .limit(n)
      .select('email')
      .lean();

    const results = await Promise.all(
      users.map(u => grantFounderBadge(u.email, badge, `First-${n} auto-award`))
    );

    const awarded = results.filter(r => r.status === 'awarded').length;
    const skipped = results.filter(r => r.status === 'already_had_it').length;

    return res.json({ success: true, awarded, skipped, results });
  }

  res.status(400).json({ error: `Unknown action: ${action}` });
};
