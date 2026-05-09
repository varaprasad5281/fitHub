/**
 * WeeklyRank
 * Stores a snapshot of each user's leaderboard position for a given week.
 * Used to compute consecutive-week streaks for leaderboard badge awards.
 *
 * week_start: ISO string of the Monday this record covers (e.g. "2025-01-06")
 * rank: 1-based position on the weekly points leaderboard
 * weekly_points: snapshot of points earned that week (for audit)
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  created_by:    { type: String, required: true },  // user email
  week_start:    { type: String, required: true },  // "YYYY-MM-DD" Monday date
  rank:          { type: Number, required: true },  // 1-based position
  weekly_points: { type: Number, default: 0 },
}, { timestamps: true });

// One record per user per week
schema.index({ created_by: 1, week_start: 1 }, { unique: true });
// Quick lookup of all users for a given week
schema.index({ week_start: 1, rank: 1 });

module.exports = mongoose.model('WeeklyRank', schema);
