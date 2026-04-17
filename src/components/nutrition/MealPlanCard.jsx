import React from 'react';
import { motion } from "framer-motion";
import { Flame, Plus, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MealPlanCard({ meal, icon, delay = 0, onAddMeal, isLoading = false, onViewDetails }) {
  if (!meal) return null;

  const handleAdd = () => {
    if (onAddMeal) {
      onAddMeal({
        meal_name: meal.name,
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fats: meal.fats || 0,
        description: meal.description
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/70 transition-all group"
    >
      <div className="flex items-start gap-3" onClick={() => onViewDetails?.(meal)}>
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1 group-hover:text-amber-400 transition-colors">{meal.name}</h4>
              <p className="text-zinc-400 text-sm mb-2">{meal.description}</p>
            </div>
            {onViewDetails && (
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              <Flame className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 font-medium">{meal.calories} cal</span>
            </div>
            {onAddMeal && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd();
                }}
                disabled={isLoading}
                size="sm"
                className="bg-amber-400 text-black hover:bg-amber-500 rounded-md ml-auto font-medium"
              >
                {isLoading ? (
                   <Loader2 className="w-3 h-3 animate-spin mr-1" />
                 ) : (
                   <Plus className="w-3 h-3 mr-1" />
                 )}
                 Add to Meal Log
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}