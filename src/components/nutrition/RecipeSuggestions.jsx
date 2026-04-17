import React, { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, ChefHat, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const COMMON_INGREDIENTS = [
  'Chicken', 'Beef', 'Fish', 'Eggs', 'Milk', 'Yogurt', 'Cheese',
  'Rice', 'Pasta', 'Bread', 'Oats', 'Beans', 'Lentils',
  'Broccoli', 'Spinach', 'Carrots', 'Tomatoes', 'Bell Peppers', 'Onions',
  'Apples', 'Bananas', 'Berries', 'Avocado', 'Olive Oil', 'Butter'
];

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Calorie'];

export default function RecipeSuggestions() {
  const [mode, setMode] = useState('list'); // 'list' or 'input'
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [customIngredient, setCustomIngredient] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);
  const [calorieTarget, setCalorieTarget] = useState('');
  const [mealType, setMealType] = useState('any');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddIngredient = (ingredient) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleAddCustom = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient)) {
      setSelectedIngredients([...selectedIngredients, customIngredient]);
      setCustomIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const toggleRestriction = (restriction) => {
    setSelectedRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleGenerateRecipes = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Add at least one ingredient');
      return;
    }

    setLoading(true);
    try {
      const response = await api.functions.invoke('generateRecipeSuggestions', {
        ingredients: selectedIngredients,
        dietaryRestrictions: selectedRestrictions,
        calorieTarget: calorieTarget ? parseInt(calorieTarget) : null,
        mealType
      });

      setRecipes(response.data.recipes || []);
      setMode('list');
      toast.success('Recipes generated!');
    } catch (error) {
      toast.error('Failed to generate recipes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-amber-400" />
          <h3 className="text-white font-semibold">Recipe Suggestions</h3>
        </div>
        <Button
          onClick={() => setMode(mode === 'list' ? 'input' : 'list')}
          variant="outline"
          className="border-zinc-700 text-zinc-400 hover:text-white rounded-full h-9"
        >
          {mode === 'list' ? 'New Recipe' : 'View Recipes'}
        </Button>
      </div>

      {mode === 'input' ? (
        <div className="space-y-6">
          {/* Ingredients Selection */}
          <div>
            <h4 className="text-zinc-300 font-medium mb-3">Available Ingredients</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_INGREDIENTS.map(ingredient => (
                <Badge
                  key={ingredient}
                  onClick={() => handleAddIngredient(ingredient)}
                  className={`cursor-pointer ${
                    selectedIngredients.includes(ingredient)
                      ? 'bg-amber-500/30 border-amber-500/50 text-amber-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                  }`}
                  variant="outline"
                >
                  {ingredient}
                </Badge>
              ))}
            </div>

            {/* Custom Ingredient */}
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Add custom ingredient"
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button
                onClick={handleAddCustom}
                size="sm"
                className="bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Ingredients */}
            {selectedIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                {selectedIngredients.map(ingredient => (
                  <Badge
                    key={ingredient}
                    className="bg-amber-500/30 border-amber-500/50 text-amber-300 cursor-pointer"
                    variant="outline"
                    onClick={() => handleRemoveIngredient(ingredient)}
                  >
                    {ingredient} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div>
            <h4 className="text-zinc-300 font-medium mb-3">Dietary Restrictions</h4>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(option => (
                <Badge
                  key={option}
                  onClick={() => toggleRestriction(option)}
                  className={`cursor-pointer ${
                    selectedRestrictions.includes(option)
                      ? 'bg-green-500/30 border-green-500/50 text-green-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                  }`}
                  variant="outline"
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Meal Type & Calorie Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2"
              >
                <option value="any">Any</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-2 block">Calorie Target (optional)</label>
              <Input
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                placeholder="e.g. 500"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateRecipes}
            disabled={loading || selectedIngredients.length === 0}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Recipes'
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <ChefHat className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
              <p>Generate recipes based on your available ingredients</p>
            </div>
          ) : (
            recipes.map((recipe, idx) => (
              <Card key={idx} className="border-zinc-800 bg-zinc-900/30 p-4">
                <div className="mb-3">
                  <h4 className="text-white font-semibold mb-1">{recipe.name}</h4>
                  <p className="text-zinc-400 text-sm mb-3">{recipe.benefit}</p>
                  
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    <div className="bg-zinc-800/50 p-2 rounded">
                      <p className="text-xs text-zinc-500">Calories</p>
                      <p className="text-amber-400 font-semibold">{recipe.calories}</p>
                    </div>
                    <div className="bg-zinc-800/50 p-2 rounded">
                      <p className="text-xs text-zinc-500">Protein</p>
                      <p className="text-red-400 font-semibold">{recipe.protein}g</p>
                    </div>
                    <div className="bg-zinc-800/50 p-2 rounded">
                      <p className="text-xs text-zinc-500">Carbs</p>
                      <p className="text-blue-400 font-semibold">{recipe.carbs}g</p>
                    </div>
                    <div className="bg-zinc-800/50 p-2 rounded">
                      <p className="text-xs text-zinc-500">Fats</p>
                      <p className="text-yellow-400 font-semibold">{recipe.fats}g</p>
                    </div>
                    <div className="bg-zinc-800/50 p-2 rounded">
                      <p className="text-xs text-zinc-500">Prep</p>
                      <p className="text-green-400 font-semibold">{recipe.prepTime}m</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3 text-sm">
                  <p className="text-zinc-300 font-medium mb-2">Ingredients:</p>
                  <ul className="text-zinc-400 space-y-1 ml-4 list-disc">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm">
                  <p className="text-zinc-300 font-medium mb-2">Instructions:</p>
                  <ol className="text-zinc-400 space-y-1 ml-4 list-decimal">
                    {recipe.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}