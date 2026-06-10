import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { sanitizeHtml, sanitizeNumber } from "@/components/utils/sanitize";
import { api } from "@/api/client";

export default function MealLogForm({ onSave, onCancel, initialMeal }) {
  const [meal, setMeal] = useState({
    date: new Date().toISOString().split('T')[0],
    meal_type: initialMeal?.meal_type || '',
    meal_name: initialMeal?.meal_name || '',
    calories: initialMeal?.calories || '',
    protein: initialMeal?.protein || '',
    carbs: initialMeal?.carbs || '',
    fats: initialMeal?.fats || '',
  });
  const [calculating, setCalculating] = useState(false);
  const [macrosGenerated, setMacrosGenerated] = useState(false);

  const handleCalculateMacros = async () => {
    if (!meal.meal_name?.trim()) {
      toast.error('Enter a meal name first');
      return;
    }

    setCalculating(true);
    try {
      const result = await api.integrations.Core.InvokeLLM({
        prompt: `Estimate nutrition for: "${meal.meal_name}". Return ONLY this compact JSON (numbers only, no units): {"calories":400,"protein":30,"carbs":40,"fats":15}`,
        response_json_schema: {
          type: "object",
          properties: {
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fats: { type: "number" }
          },
          required: ["calories", "protein", "carbs", "fats"]
        }
      });

      const calories = Math.round(result.calories ?? result.kcal ?? 0);
      const protein  = Math.round(result.protein  ?? result.protein_g ?? 0);
      const carbs    = Math.round(result.carbs    ?? result.carbs_g ?? result.total_carbohydrates_g ?? 0);
      const fats     = Math.round(result.fats     ?? result.fat_g   ?? result.total_fat_g ?? 0);

      if (!calories) throw new Error('AI returned no calorie data');

      setMeal(prev => ({ ...prev, calories, protein, carbs, fats }));
      setMacrosGenerated(true);
      toast.success('Macros calculated!');
    } catch (error) {
      console.error('Macro calculation failed:', error);
      toast.error('Could not calculate macros - please enter them manually.');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const trimmedName = meal.meal_name?.trim();
    if (!trimmedName) {
      toast.error('Please enter a meal name');
      return;
    }
    
    if (trimmedName.length > 100) {
      toast.error('Meal name must be less than 100 characters');
      return;
    }
    
    // Validate calories (must be positive, max 5000)
    const caloriesNum = Number(meal.calories);
    if (!meal.calories || caloriesNum <= 0 || caloriesNum > 5000) {
      toast.error('Calories must be between 1 and 5000');
      return;
    }
    
    // Sanitize and validate numeric inputs with strict ranges
    const calories = sanitizeNumber(meal.calories, 0, 5000);
    const protein = sanitizeNumber(meal.protein, 0, 500);
    const carbs = sanitizeNumber(meal.carbs, 0, 1000);
    const fats = sanitizeNumber(meal.fats, 0, 500);

    // Prevent negative values (double-check)
    if (calories < 0 || protein < 0 || carbs < 0 || fats < 0) {
      toast.error('Values cannot be negative');
      return;
    }
    
    onSave({
      date: meal.date,
      meal_type: meal.meal_type,
      meal_name: sanitizeHtml(trimmedName),
      calories,
      protein,
      carbs,
      fats,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Log Meal</h3>
          <button onClick={onCancel} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Meal Type</Label>
            <Select value={meal.meal_type} onValueChange={(v) => setMeal({ ...meal, meal_type: v })}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="breakfast" className="text-white">Breakfast</SelectItem>
                <SelectItem value="lunch" className="text-white">Lunch</SelectItem>
                <SelectItem value="dinner" className="text-white">Dinner</SelectItem>
                <SelectItem value="snack" className="text-white">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-zinc-400 text-sm mb-2 block">Meal Name</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Chicken Caesar Salad"
                value={meal.meal_name}
                onChange={(e) => { setMeal({ ...meal, meal_name: e.target.value }); setMacrosGenerated(false); }}
                maxLength={100}
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11 flex-1"
              />
              <Button
                type="button"
                onClick={handleCalculateMacros}
                disabled={calculating || !meal.meal_name?.trim() || macrosGenerated}
                className={`rounded-xl h-11 px-3 border ${macrosGenerated ? 'bg-green-500/20 border-green-500/50 text-green-400 cursor-default' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/50'}`}
              >
                {macrosGenerated ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-zinc-600 text-xs mt-1">
              {calculating ? 'Calculating macros...' : macrosGenerated ? '✓ Macros calculated' : 'Click sparkle to auto-calculate'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400 text-sm mb-2 block">Calories</Label>
              <Input
                type="number"
                placeholder="400"
                value={meal.calories}
                onChange={(e) => setMeal({ ...meal, calories: e.target.value })}
                min="1"
                max="5000"
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11"
              />
              <p className="text-zinc-600 text-xs mt-1">1-5000 cal</p>
            </div>
            <div>
              <Label className="text-zinc-400 text-sm mb-2 block">Protein (g)</Label>
              <Input
                type="number"
                placeholder="25"
                value={meal.protein}
                onChange={(e) => setMeal({ ...meal, protein: e.target.value })}
                min="0"
                max="500"
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11"
              />
              <p className="text-zinc-600 text-xs mt-1">0-500g</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400 text-sm mb-2 block">Carbs (g)</Label>
              <Input
                type="number"
                placeholder="30"
                value={meal.carbs}
                onChange={(e) => setMeal({ ...meal, carbs: e.target.value })}
                min="0"
                max="1000"
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11"
              />
              <p className="text-zinc-600 text-xs mt-1">0-1000g</p>
            </div>
            <div>
              <Label className="text-zinc-400 text-sm mb-2 block">Fats (g)</Label>
              <Input
                type="number"
                placeholder="15"
                value={meal.fats}
                onChange={(e) => setMeal({ ...meal, fats: e.target.value })}
                min="0"
                max="500"
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl h-11"
              />
              <p className="text-zinc-600 text-xs mt-1">0-500g</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 rounded-xl h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!meal.meal_type || !meal.meal_name || !meal.calories}
              className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-xl h-11"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Log Meal
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}