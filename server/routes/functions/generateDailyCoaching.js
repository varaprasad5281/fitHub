/**
 * Replaces: generateDailyCoaching
 *
 * If today's daily session already has a 'helpful' rating → generate a candidate
 * session (daily_candidate) so the user can compare and decide.
 * Otherwise, upsert the active daily session as normal.
 */
const Profile = require("../../models/Profile");
const Points = require("../../models/Points");
const Subscription = require("../../models/Subscription");
const CoachingSession = require("../../models/CoachingSession");
const { invokeLLM } = require("../../services/ai");
const { notify } = require("../../utils/notify");

module.exports = async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toISOString().split("T")[0];

    const [profile, pointsRecord, subscription] = await Promise.all([
      Profile.findOne({ created_by: user.email }),
      Points.findOne({ created_by: user.email }),
      Subscription.findOne({ created_by: user.email }),
    ]);

    const plan = subscription?.plan || "starter";
    const proPlans = ['pro_monthly', 'pro_yearly', 'elite_monthly', 'elite_yearly'];
    const isActiveStatus = subscription?.status === 'active' || subscription?.status === 'trial' || (subscription?.status === 'cancelled' && subscription?.end_date && new Date(subscription.end_date) > new Date());
    if (!proPlans.includes(plan) || !isActiveStatus) {
      return res.status(403).json({ error: 'Coaching requires a Pro or Elite subscription' });
    }

    const context = `User: ${user.full_name}
Fitness Goal: ${profile?.fitness_goal || "general fitness"}
Experience Level: ${profile?.experience_level || "beginner"}
Activity Level: ${profile?.activity_level || "moderately_active"}
Level: ${pointsRecord?.level || 1}
Today's Date: ${new Date().toDateString()}`;

    const parsed = await invokeLLM({
      prompt: `${context}\n\nGenerate a personalized daily coaching session. Return ONLY compact JSON:\n{"category":"workout","advice":"2-3 sentence motivating message specific to their goal","actionable_items":["item1","item2","item3"],"instructions":"how to execute today","blueprint":"brief 24-hour plan"}`,
      response_json_schema: {
        type: "object",
        properties: {
          category: { type: "string" },
          advice: { type: "string" },
          actionable_items: { type: "array", items: { type: "string" } },
          instructions: { type: "string" },
          blueprint: { type: "string" },
        },
      },
    });

    // If today's active session was already liked, create a candidate for review
    // instead of overwriting the liked plan directly.
    const existingDaily = await CoachingSession.findOne({
      created_by: user.email,
      session_type: "daily",
      session_date: today,
    });
    const sessionType = existingDaily?.feedback === "helpful" ? "daily_candidate" : "daily";

    const session = await CoachingSession.findOneAndUpdate(
      { created_by: user.email, session_type: sessionType, session_date: today },
      {
        $set: {
          category: parsed.category || "general",
          advice: parsed.advice,
          actionable_items: parsed.actionable_items || [],
          instructions: parsed.instructions,
          blueprint: parsed.blueprint,
          updated_date: new Date(),
        },
        $unset: { feedback: "" },
      },
      { upsert: true, new: true },
    );

    // Keep only the 7 most recent daily sessions (candidates don't count toward limit)
    const allDaily = await CoachingSession.find(
      { created_by: user.email, session_type: "daily" },
      { _id: 1 },
    ).sort({ session_date: -1 });

    if (allDaily.length > 7) {
      const toDelete = allDaily.slice(7).map((s) => s._id);
      await CoachingSession.deleteMany({ _id: { $in: toDelete } });
    }

    if (sessionType === 'daily_candidate') {
      notify(user.email,
        '💡 A new coaching plan is ready for you to review. Like it to replace your current one.',
        'coaching_ready'
      );
    } else {
      notify(user.email,
        '💡 Your daily coaching plan has been updated. Check it out for today\'s advice!',
        'coaching_ready'
      );
    }

    res.json({ success: true, session, is_candidate: sessionType === "daily_candidate" });
  } catch (err) {
    console.error("[generateDailyCoaching]", err.message);
    res.status(500).json({ error: "Failed to generate coaching", message: err.message });
  }
};
