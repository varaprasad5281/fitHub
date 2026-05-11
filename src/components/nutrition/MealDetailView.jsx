import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { api } from "@/api/client";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MealDetailView({ meal, mealType, onBack, onAddMeal }) {
  const [instructions, setInstructions] = useState(null);
  const [ingredients, setIngredients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const onBackRef = useRef(onBack);
  useEffect(() => { onBackRef.current = onBack; }, [onBack]);

  useEffect(() => {
    let alive = true;
    api.integrations.Core.InvokeLLM({
      prompt: `List the main ingredients and step-by-step cooking instructions for this meal: "${meal.name}" (${meal.calories || ''} calories). Keep it concise - 4-6 ingredients, 4-5 steps.`,
      response_json_schema: {
        type: 'object',
        properties: {
          ingredients: { type: 'array', items: { type: 'string' } },
          instructions: { type: 'array', items: { type: 'string' } },
        },
        required: ['ingredients', 'instructions'],
      },
    })
      .then(data => {
        if (!alive) return;
        const ing = Array.isArray(data?.ingredients) && data.ingredients.length ? data.ingredients : [`${meal.name} (main ingredients)`];
        const ins = Array.isArray(data?.instructions) && data.instructions.length ? data.instructions : [`Prepare ${meal.name} according to your preference.`];
        setIngredients(ing);
        setInstructions(ins);
      })
      .catch(() => {
        if (!alive) return;
        setIngredients([`${meal.name} ingredients`]);
        setInstructions([`Prepare ${meal.name} as desired.`]);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [meal.name]);

  const handleAddMeal = async () => {
    setAdding(true);
    try {
      await onAddMeal({
        meal_name: meal.name,
        calories: meal.calories || 0,
        description: meal.description || ''
      });
      toast.success('Meal added to log!');
      onBack();
    } catch (error) {
      toast.error('Failed to add meal');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      >
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-md w-full text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading meal details...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sm:p-8 max-w-2xl w-full my-8"
      >
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plan
          </button>
          <h2 className="text-2xl font-bold text-white">{meal.name}</h2>
          <p className="text-amber-400 font-semibold mt-1">{meal.calories} calories</p>
          {meal.description && (
            <p className="text-zinc-400 text-sm mt-2">{meal.description}</p>
          )}
        </div>

        {/* Ingredients */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🥘</span> Ingredients
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ingredients && ingredients.length > 0 ? (
              ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span className="text-zinc-300 text-sm">{ingredient}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No ingredients found</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">👨‍🍳</span> Instructions
          </h3>
          <div className="space-y-3">
            {instructions && instructions.length > 0 ? (
              instructions.map((instruction, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed pt-0.5">{instruction}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No instructions found</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div>
          <Button
            onClick={handleAddMeal}
            disabled={adding}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-lg h-11"
          >
            {adding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Add to Meal Log
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}