/**
 * awardWeeklyLeaderboardBadges.js
 *
 * Run every Monday (before or as part of the weekly reset) to:
 *  1. Snapshot the top 3 users on the current weekly points leaderboard into WeeklyRank
 *  2. Compute each user's consecutive-week streak (top 3 or #1)
 *  3. Award leaderboard badges to newly qualified users
 *  4. Send in-app notifications for new badges
 *
 * Usage (standalone):
 *   node server/scripts/awardWeeklyLeaderboardBadges.js
 *
 * Usage (programmatic — call from a weekly reset function):
 *   const awardWeeklyLeaderboardBadges = require('./awardWeeklyLeaderboardBadges');
 *   await awardWeeklyLeaderboardBadges();
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Points    = require('../models/Points');
const Badge     = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const WeeklyRank = require('../models/WeeklyRank');

// Lazy-require notify — may not be available in standalone mode
let notify;
try { notify = require('../utils/notify').notify; } catch (_) { notify = null; }

/**
 * Returns the ISO date string (YYYY-MM-DD) for the most recent Monday.
 * This is the week_start key used in WeeklyRank records.
 */
function currentWeekStart() {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday …
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/**
 * Returns the ISO date string for the Monday N weeks before the given week_start.
 */
function weeksBefore(weekStartStr, n) {
  const d = new Date(weekStartStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 7 * n);
  return d.toISOString().slice(0, 10);
}

/**
 * Count how many consecutive weeks (ending at the given week) a user
 * appeared in the top 3 (or specifically at rank 1).
 */
async function consecutiveWeeksInTop(userEmail, weekStart, maxCheck = 10, rankLimit = 3) {
  let count = 0;
  for (let i = 0; i < maxCheck; i++) {
    const ws = weeksBefore(weekStart, i);
    const record = await WeeklyRank.findOne({ created_by: userEmail, week_start: ws }).lean();
    if (!record || record.rank > rankLimit) break;
    count++;
  }
  return count;
}

/**
 * Award a badge if the user doesn't already have it.
 */
async function grantBadge(userEmail, badgeCode, notes = '') {
  const badge = await Badge.findOne({ badge_code: badgeCode }).lean();
  if (!badge) {
    console.warn(`  [warn] Badge "${badgeCode}" not in DB — run seedBadges first.`);
    return false;
  }

  try {
    await UserBadge.create({
      created_by: userEmail,
      badge_id: badge._id,
      badge_code: badgeCode,
      achievement_notes: notes,
    });

    const rarityEmoji = { common: '🥉', rare: '🥈', epic: '🥇', legendary: '✨' };
    const msg = `${rarityEmoji[badge.rarity_level] || '🏅'} New badge unlocked: "${badge.name}" — ${badge.description}`;
    if (notify) notify(userEmail, msg, 'badge_earned');

    console.log(`  ✓ Awarded "${badge.name}" (${badgeCode}) → ${userEmail}`);
    return true;
  } catch (err) {
    if (err.code === 11000) return false; // already earned — no-op
    throw err;
  }
}

async function run() {
  const weekStart = currentWeekStart();
  console.log(`\n[awardWeeklyLeaderboardBadges] Week: ${weekStart}`);

  // ── 1. Get top 3 users by weekly_points ─────────────────────────────────
  const top3 = await Points.find({})
    .sort({ weekly_points: -1 })
    .limit(3)
    .lean();

  if (top3.length === 0) {
    console.log('  No points data found — skipping.');
    return;
  }

  console.log(`  Top ${top3.length} this week:`);
  top3.forEach((p, i) => console.log(`    #${i + 1} ${p.created_by} — ${p.weekly_points} pts`));

  // ── 2. Upsert WeeklyRank records ─────────────────────────────────────────
  for (let i = 0; i < top3.length; i++) {
    const p = top3[i];
    await WeeklyRank.findOneAndUpdate(
      { created_by: p.created_by, week_start: weekStart },
      { rank: i + 1, weekly_points: p.weekly_points },
      { upsert: true, new: true }
    );
  }

  // ── 3. Award badges ───────────────────────────────────────────────────────
  for (let i = 0; i < top3.length; i++) {
    const { created_by: email, weekly_points: pts } = top3[i];
    const rank = i + 1;
    const notes = `Week ${weekStart} — Rank #${rank} with ${pts} pts`;

    // Single-week badges
    if (rank <= 3) await grantBadge(email, 'LEADER_TOP3', notes);
    if (rank === 1) await grantBadge(email, 'LEADER_TOP1', notes);

    // Consecutive-week streaks — top 3
    const top3Streak = await consecutiveWeeksInTop(email, weekStart, 12, 3);
    console.log(`  ${email}: ${top3Streak} consecutive week(s) in top 3`);

    if (top3Streak >= 3)  await grantBadge(email, 'LEADER_TOP3_3W',  `${top3Streak} consecutive weeks in top 3`);
    if (top3Streak >= 5)  await grantBadge(email, 'LEADER_TOP3_5W',  `${top3Streak} consecutive weeks in top 3`);
    if (top3Streak >= 10) await grantBadge(email, 'LEADER_TOP3_10W', `${top3Streak} consecutive weeks in top 3`);

    // Consecutive-week streaks — #1 only
    if (rank === 1) {
      const top1Streak = await consecutiveWeeksInTop(email, weekStart, 6, 1);
      console.log(`  ${email}: ${top1Streak} consecutive week(s) at #1`);
      if (top1Streak >= 3) await grantBadge(email, 'LEADER_TOP1_3W', `${top1Streak} consecutive weeks at #1`);
      if (top1Streak >= 5) await grantBadge(email, 'LEADER_TOP1_5W', `${top1Streak} consecutive weeks at #1`);
    }
  }

  console.log('\n[awardWeeklyLeaderboardBadges] Done.\n');
}

// ── Standalone execution ─────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || '7percent',
  });
  console.log('Connected to MongoDB');
  await run();
  await mongoose.disconnect();
  process.exit(0);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}

// Export `run` for programmatic use (e.g. called from a weekly reset route)
module.exports = run;
