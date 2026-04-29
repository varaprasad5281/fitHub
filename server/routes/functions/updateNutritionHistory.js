const MealLog = require('../../models/MealLog');
const NutritionHistory = require('../../models/NutritionHistory');

const MAX_DAYS = 7;

/** Upsert one day's aggregated totals — one record per (user, date) */
async function upsertDate(userEmail, date, logs) {
  const total_calories = logs.reduce((s, m) => s + (Number(m.calories) || 0), 0);
  const total_protein  = logs.reduce((s, m) => s + (Number(m.protein)  || 0), 0);
  const total_carbs    = logs.reduce((s, m) => s + (Number(m.carbs)    || 0), 0);
  const total_fats     = logs.reduce((s, m) => s + (Number(m.fats)     || 0), 0);
  const meal_types     = [...new Set(logs.map(m => m.meal_type).filter(Boolean))];

  return NutritionHistory.findOneAndUpdate(
    { created_by: userEmail, date },
    { total_calories, total_protein, total_carbs, total_fats, meal_count: logs.length, meal_types },
    { upsert: true, new: true, runValidators: true }
  );
}

/** Delete any records beyond the most recent MAX_DAYS per user */
async function pruneOldRecords(userEmail) {
  const recent = await NutritionHistory.find({ created_by: userEmail })
    .sort({ date: -1 })
    .limit(MAX_DAYS)
    .select('_id')
    .lean();

  if (recent.length < MAX_DAYS) return; // nothing to prune yet

  const keepIds = recent.map(r => r._id);
  await NutritionHistory.deleteMany({
    created_by: userEmail,
    _id: { $nin: keepIds },
  });
}

module.exports = async (req, res) => {
  const userEmail = req.user.email;
  const { date } = req.body;

  // Single-date update (called after a meal is created / deleted)
  if (date) {
    const logs = await MealLog.find({ created_by: userEmail, date }).lean();
    const record = await upsertDate(userEmail, date, logs);
    await pruneOldRecords(userEmail);
    return res.json({ data: record, success: true });
  }

  // Sync-all: group every meal log by date, upsert one record per day
  const allLogs = await MealLog.find({ created_by: userEmail }).lean();
  const byDate = {};
  for (const log of allLogs) {
    const d = log.date || log.createdAt?.toISOString?.().slice(0, 10);
    if (!d) continue;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(log);
  }

  await Promise.all(
    Object.entries(byDate).map(([d, logs]) => upsertDate(userEmail, d, logs))
  );

  // Enforce 7-record cap
  await pruneOldRecords(userEmail);

  const history = await NutritionHistory.find({ created_by: userEmail })
    .sort({ date: -1 })
    .limit(MAX_DAYS)
    .lean();

  res.json({ data: history, success: true });
};
