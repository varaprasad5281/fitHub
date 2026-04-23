const MealLog = require('../../models/MealLog');
const NutritionHistory = require('../../models/NutritionHistory');

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

module.exports = async (req, res) => {
  const userEmail = req.user.email;
  const { date } = req.body;

  // Single-date update (called after create/delete)
  if (date) {
    const logs = await MealLog.find({ created_by: userEmail, date }).lean();
    const record = await upsertDate(userEmail, date, logs);
    return res.json({ data: record, success: true });
  }

  // Sync all: group every meal log by date and upsert NutritionHistory for each
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

  const history = await NutritionHistory.find({ created_by: userEmail })
    .sort({ date: -1 })
    .limit(7)
    .lean();

  res.json({ data: history, success: true });
};
