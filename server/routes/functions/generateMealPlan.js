/**
 * Handles: generateMealPlan, mealPlan
 * Returns: { data: { breakfast, lunch, dinner, snack } }
 * Each meal: { name, description, calories, protein, carbs, fats }
 */

const Profile = require('../../models/Profile');
const { invokeLLM } = require('../../services/ai');

module.exports = async (req, res) => {
  const userEmail = req.user.email;
  const body = req.body || {};

  // Accept all the naming variants the frontend might send
  const calories =
    body.calories || body.calorieTarget || body.calorie_target || 2000;
  const diet =
    body.dietary || body.dietaryPreference || body.dietary_preference || 'balanced';
  const allergies = body.allergies || '';
  const fitnessGoal = body.fitnessGoal || body.fitness_goal || '';

  // Augment with profile data
  const profile = await Profile.findOne({ created_by: userEmail }).catch(() => null);
  const goal = fitnessGoal || profile?.fitness_goal || 'general_fitness';

  const allergyLine = allergies ? `- Allergies / avoid: ${allergies}` : '';

  const fallback = {
    breakfast: { name: 'Oatmeal with berries & honey',    description: 'Rolled oats topped with mixed berries and a drizzle of honey', calories: 350, protein: 12, carbs: 60, fats: 6 },
    lunch:     { name: 'Grilled chicken salad',           description: 'Grilled chicken breast over mixed greens with olive oil dressing', calories: 420, protein: 40, carbs: 18, fats: 14 },
    dinner:    { name: 'Salmon with roasted vegetables',  description: 'Baked salmon fillet with broccoli and sweet potato', calories: 520, protein: 42, carbs: 38, fats: 18 },
    snack:     { name: 'Greek yogurt with almonds',       description: 'Plain Greek yogurt topped with a handful of almonds', calories: 180, protein: 14, carbs: 10, fats: 8 },
  };

  let mealPlan;
  try {
    mealPlan = await invokeLLM({
      prompt: `Create a single-day meal plan for:
- Calorie target: ${calories} kcal
- Diet: ${diet}
- Fitness goal: ${goal}
${allergyLine}

Return ONLY compact JSON with exactly these keys (no extra whitespace):
{"breakfast":{"name":"...","description":"...","calories":0,"protein":0,"carbs":0,"fats":0},"lunch":{"name":"...","description":"...","calories":0,"protein":0,"carbs":0,"fats":0},"dinner":{"name":"...","description":"...","calories":0,"protein":0,"carbs":0,"fats":0},"snack":{"name":"...","description":"...","calories":0,"protein":0,"carbs":0,"fats":0}}`,
      response_json_schema: {
        type: 'object',
        properties: {
          breakfast: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, calories: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' }, fats: { type: 'number' } } },
          lunch:     { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, calories: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' }, fats: { type: 'number' } } },
          dinner:    { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, calories: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' }, fats: { type: 'number' } } },
          snack:     { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, calories: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' }, fats: { type: 'number' } } },
        },
      },
    });

    // Ensure all four keys exist
    if (!mealPlan?.breakfast || !mealPlan?.lunch || !mealPlan?.dinner) {
      throw new Error('Incomplete meal plan from AI');
    }
  } catch (err) {
    console.error('[generateMealPlan] AI error, using fallback:', err.message);
    mealPlan = fallback;
  }

  res.json({ data: mealPlan });
};
