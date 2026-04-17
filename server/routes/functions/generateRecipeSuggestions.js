/**
 * generateRecipeSuggestions — AI-powered recipe suggestions based on ingredients or goal.
 */

const { invokeLLM } = require('../../services/ai');

module.exports = async (req, res) => {
  const { ingredients = [], dietary_preference = 'balanced', calorie_limit, meal_type = 'any' } = req.body;

  let recipes;
  try {
    const ingredientHint = ingredients.length
      ? `Using some of these ingredients: ${ingredients.join(', ')}.`
      : '';

    recipes = await invokeLLM({
      prompt: `Suggest 3 healthy ${meal_type} recipes. ${ingredientHint} Dietary preference: ${dietary_preference}. ${calorie_limit ? `Under ${calorie_limit} kcal.` : ''}
Return JSON array: [{ "name": "", "ingredients": [], "instructions": "", "calories": 0, "protein_g": 0, "prep_time_min": 0 }]`,
      response_json_schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            ingredients: { type: 'array', items: { type: 'string' } },
            instructions: { type: 'string' },
            calories: { type: 'number' },
            protein_g: { type: 'number' },
            prep_time_min: { type: 'number' },
          },
        },
      },
    });
  } catch {
    recipes = [
      { name: 'Grilled Chicken & Veggies', ingredients: ['chicken breast', 'broccoli', 'olive oil'], instructions: 'Season and grill chicken 6 min each side. Steam broccoli. Serve together.', calories: 380, protein_g: 42, prep_time_min: 20 },
      { name: 'Greek Yogurt Parfait', ingredients: ['greek yogurt', 'berries', 'granola'], instructions: 'Layer yogurt, berries, and granola in a glass.', calories: 280, protein_g: 18, prep_time_min: 5 },
      { name: 'Egg White Omelette', ingredients: ['egg whites', 'spinach', 'feta cheese'], instructions: 'Whisk egg whites, pour into pan, add fillings, fold.', calories: 220, protein_g: 28, prep_time_min: 10 },
    ];
  }

  res.json({ data: recipes });
};
