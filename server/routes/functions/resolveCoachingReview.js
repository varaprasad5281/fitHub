/**
 * resolveCoachingReview
 *
 * Handles three actions:
 *  accept  – promote daily_candidate to daily, award coaching points once per day
 *  reject  – delete daily_candidate, keep current daily unchanged
 *  feedback – record like/dislike on the active daily session, award points once per day on like
 */
const CoachingSession = require("../../models/CoachingSession");
const Points = require("../../models/Points");
const PointsTransaction = require("../../models/PointsTransaction");
const { POINTS } = require("../../utils/constants");

async function awardCoachingPoints(email, today) {
  const already = await PointsTransaction.findOne({
    created_by: email,
    source: "coaching_feedback",
    transaction_date: today,
  });
  if (already) return;

  await PointsTransaction.create({
    created_by: email,
    points_awarded: POINTS.COACHING_FEEDBACK,
    source: "coaching_feedback",
    transaction_date: today,
  });

  await Points.findOneAndUpdate(
    { created_by: email },
    { $inc: { total_points: POINTS.COACHING_FEEDBACK, weekly_points: POINTS.COACHING_FEEDBACK } },
    { upsert: true }
  );
}

module.exports = async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toISOString().split("T")[0];
    const { action, session_id, feedback } = req.body;

    // ── Accept: promote candidate, delete old daily ───────────────────────
    if (action === "accept") {
      const candidate = await CoachingSession.findOne({
        created_by: user.email,
        session_type: "daily_candidate",
        session_date: today,
      });
      if (!candidate) {
        return res.status(404).json({ error: "No pending coaching plan to review" });
      }

      // Delete the old daily session for today
      await CoachingSession.deleteOne({
        created_by: user.email,
        session_type: "daily",
        session_date: today,
      });

      // Promote candidate → active daily with helpful feedback
      await CoachingSession.updateOne(
        { _id: candidate._id },
        { $set: { session_type: "daily", feedback: "helpful" } }
      );

      await awardCoachingPoints(user.email, today);
      return res.json({ success: true, action: "accepted" });
    }

    // ── Reject: delete candidate, keep old daily unchanged ────────────────
    if (action === "reject") {
      await CoachingSession.deleteOne({
        created_by: user.email,
        session_type: "daily_candidate",
        session_date: today,
      });
      return res.json({ success: true, action: "rejected" });
    }

    // ── Feedback: rate the active daily session ───────────────────────────
    if (action === "feedback") {
      if (!session_id || !feedback) {
        return res.status(400).json({ error: "session_id and feedback are required" });
      }
      await CoachingSession.findByIdAndUpdate(session_id, { $set: { feedback } });
      if (feedback === "helpful") {
        await awardCoachingPoints(user.email, today);
      }
      return res.json({ success: true, action: "feedback_recorded" });
    }

    res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error("[resolveCoachingReview]", err.message);
    res.status(500).json({ error: "Could not process your coaching review. Please try again." });
  }
};
