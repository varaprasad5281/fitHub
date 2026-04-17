import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Apple, Loader2, Calendar, Zap, Settings2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatePresence } from "framer-motion";
import MealLogForm from "@/components/nutrition/MealLogForm";
import CalorieProgress from "@/components/nutrition/CalorieProgress";
import MacroBreakdown from "@/components/nutrition/MacroBreakdown";
import MealPlanCard from "@/components/nutrition/MealPlanCard";
import MealDetailView from "@/components/nutrition/MealDetailView";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { initCSRFProtection } from "@/components/utils/csrfToken";
import ErrorBoundary from '@/components/ErrorBoundary';

// BMR calculation using Mifflin-St Jeor equation
const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

const activityMultipliers = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

const STORAGE_KEY = 'nutrition_temp_meals';
const STORAGE_DATE_KEY = 'nutrition_temp_meals_date';

export default function Nutrition() {
  const [showForm, setShowForm] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('log');
  const [tempMeals, setTempMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [savingDiet, setSavingDiet] = useState(false);
  // Track per-meal-type loading so only the clicked button shows a spinner
  const [addingMealType, setAddingMealType] = useState(null);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: profiles } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.entities.Profile.list(),
    initialData: [],
    staleTime: 1000 * 60 * 10,
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.entities.ProgressGoal.filter({ status: 'active' }),
    initialData: [],
  });

  const { data: meals, isLoading: mealsLoading, refetch: refetchMeals } = useQuery({
    queryKey: ['meals', today],
    queryFn: () => api.entities.MealLog.filter({ date: today }).catch(() => []),
    initialData: [],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });

  // ✅ FIX: Refetch meals on component mount to load existing meals
  useEffect(() => {
    refetchMeals();
  }, [today, refetchMeals]);

  const { data: mealPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['meal-plans', today],
    queryFn: () => api.entities.MealPlan.filter({ date: today }),
    initialData: [],
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });

  // Load temp meals from localStorage on mount
  useEffect(() => {
    const storedDate = localStorage.getItem(STORAGE_DATE_KEY);
    const storedMeals = localStorage.getItem(STORAGE_KEY);
    
    // ✅ SECURITY: Initialize CSRF protection
    initCSRFProtection();
    
    // Clear if it's a new day
    if (storedDate !== today) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_DATE_KEY);
      setTempMeals([]);
    } else if (storedMeals) {
      try {
        setTempMeals(JSON.parse(storedMeals));
      } catch {
        setTempMeals([]);
      }
    }
    
    api.analytics.track({
      eventName: 'nutrition_viewed',
      properties: { page: 'nutrition' }
    });
  }, [today]);



  useEffect(() => {
    if (profiles[0]) {
      const p = profiles[0];
      const weight = Number(p.weight_kg);
      const height = Number(p.height_cm);
      const age = Number(p.age);
      // Only calculate if we have all required values
      if (!weight || !height || !age) return;
      const bmr = calculateBMR(weight, height, age, p.gender);
      const tdee = bmr * (activityMultipliers[p.activity_level] || 1.2);

      // Adjust based on fitness goal
      let target = tdee;
      if (p.fitness_goal === 'lose_weight') target -= 500;
      if (p.fitness_goal === 'build_muscle') target += 300;

      const rounded = Math.round(target);
      if (rounded > 0) setCalorieTarget(rounded);
    }
  }, [profiles]);

  const createMeal = useMutation({
    mutationFn: async (data) => {
      let mealData = { ...data };

      // Fill missing macros with AI estimates (best-effort, never blocks save)
      if (!mealData.protein && !mealData.carbs && !mealData.fats) {
        try {
          const r = await api.integrations.Core.InvokeLLM({
            prompt: `Estimate macros for "${mealData.meal_name}" (${mealData.calories} cal). Return ONLY: {"protein":30,"carbs":40,"fats":15}`,
            response_json_schema: {
              type: 'object',
              properties: {
                protein: { type: 'number' },
                carbs:   { type: 'number' },
                fats:    { type: 'number' },
              },
            },
          });
          mealData.protein = Math.round(r.protein ?? r.protein_g ?? mealData.calories * 0.25 / 4);
          mealData.carbs   = Math.round(r.carbs   ?? r.carbs_g   ?? mealData.calories * 0.45 / 4);
          mealData.fats    = Math.round(r.fats    ?? r.fat_g     ?? mealData.calories * 0.3  / 9);
        } catch {
          mealData.protein = Math.round(mealData.calories * 0.25 / 4);
          mealData.carbs   = Math.round(mealData.calories * 0.45 / 4);
          mealData.fats    = Math.round(mealData.calories * 0.3  / 9);
        }
      }

      // Save to DB (must succeed — no silent localStorage fallback)
      const meal = await api.entities.MealLog.create(mealData);

      // Fire-and-forget: goal progress update (don't block or fail the save)
      api.functions.invoke('updateGoalProgress').catch(() => {});

      return meal;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meals', today] });
      refetchMeals();
      setShowForm(false);
      toast.success('Meal logged!');
      api.analytics.track({
        eventName: 'meal_logged',
        properties: { meal_type: variables.meal_type }
      });
    },
    onError: () => toast.error('Failed to save meal — please try again.'),
  });

  const deleteMeal = useMutation({
    mutationFn: async (id) => {
      // Check if it's a temp meal
      if (id.toString().startsWith('temp_')) {
        const updated = tempMeals.filter(m => m.id !== id);
        setTempMeals(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return { id };
      } else {
        return await api.entities.MealLog.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', today] });
      toast.success('Meal removed');
    },
    onError: () => toast.error('Failed to delete meal'),
  });

  // Per-card add handler — only the clicked card shows a spinner
  const addMealFromPlan = async (meal, mealType) => {
    setAddingMealType(mealType);
    try {
      await createMeal.mutateAsync({ ...meal, date: today, meal_type: mealType });
      // onSuccess already shows toast.success('Meal logged!')
    } catch {
      // onError already shows toast.error(...)
    } finally {
      setAddingMealType(null);
    }
  };

  const todayPlan = mealPlans[0];
  const profile = profiles[0]; // used for dietary preference editing

  const handleDietaryChange = async (value) => {
    if (!profile) return;
    setSavingDiet(true);
    await api.entities.Profile.update(profile.id, { dietary_preference: value });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast.success('Dietary preference updated');
    setSavingDiet(false);
  };

  const handleGenerateMealPlan = async () => {
    const isAuth = await api.auth.isAuthenticated();
    if (!isAuth) {
      toast.error('Please log in to generate meal plans');
      return;
    }

    if (todayPlan) {
      const confirmRegenerate = window.confirm('Regenerate meal plan for today? This will replace the current plan.');
      if (!confirmRegenerate) return;
    }

    setGenerating(true);

    try {
      const response = await api.functions.invoke('mealPlan', {
        calories: calorieTarget,
        dietary: profile?.dietary_preference || '',
        allergies: profile?.allergies || '',
        fitnessGoal: profile?.fitness_goal || ''
      });

      const mealData = response.data;

      if (!mealData?.breakfast) {
        throw new Error('Invalid meal plan format received');
      }

      if (todayPlan) {
        await api.entities.MealPlan.delete(todayPlan.id);
      }

      const createdPlan = await api.entities.MealPlan.create({
        date: today,
        ...mealData,
      });

      queryClient.invalidateQueries({ queryKey: ['meal-plans', today] });
      toast.success('Meal plan generated!');

      api.analytics.track({
        eventName: 'meal_plan_generated',
        properties: { calorie_target: calorieTarget }
      });
    } catch (error) {
      console.error('[Nutrition] Meal plan error:', error);
      toast.error('Failed to generate meal plan. Please try again.');

      api.analytics.track({
        eventName: 'meal_plan_failed',
        properties: { error_message: error.message }
      });
    } finally {
      setGenerating(false);
    }
  };

  // Memoize calculations for performance - combine DB meals and temp meals
  const { totalCalories, totalProtein, totalCarbs, totalFats, mealsByType } = React.useMemo(() => {
    const allMeals = [...meals, ...tempMeals];
    const calories = allMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
    const protein = allMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0);
    const carbs = allMeals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0);
    const fats = allMeals.reduce((sum, m) => sum + (Number(m.fats) || 0), 0);

    const byType = {
      breakfast: allMeals.filter(m => m.meal_type === 'breakfast'),
      lunch: allMeals.filter(m => m.meal_type === 'lunch'),
      dinner: allMeals.filter(m => m.meal_type === 'dinner'),
      snack: allMeals.filter(m => m.meal_type === 'snack'),
    };

    return {
      totalCalories: calories,
      totalProtein: protein,
      totalCarbs: carbs,
      totalFats: fats,
      mealsByType: byType,
    };
  }, [meals, tempMeals]);

  // Show skeleton while initial data loads
  if (mealsLoading && meals.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-zinc-800 rounded mb-8 animate-pulse" />
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="h-32 bg-zinc-900 rounded-xl animate-pulse" />
            <div className="h-32 bg-zinc-900 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Apple className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Your Nutrition</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Nutrition</h1>
          <p className="text-zinc-500 mt-1">Track your daily meals and generate AI-powered meal plans</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <CalorieProgress consumed={totalCalories} target={calorieTarget} />
          <MacroBreakdown protein={totalProtein} carbs={totalCarbs} fats={totalFats} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="log" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
              <Apple className="w-4 h-4 mr-2" /> Meal Log
            </TabsTrigger>
            <TabsTrigger value="plan" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
              <Calendar className="w-4 h-4 mr-2" /> Meal Plan
            </TabsTrigger>
            </TabsList>

          <TabsContent value="log" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-6 text-base h-12 sm:h-10 touch-target"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Log Meal
              </Button>
            </div>

            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
              <div key={type} className="mb-6">
                <h3 className="text-white font-semibold mb-3 capitalize flex items-center gap-2">
                  {type === 'breakfast' && '🌅'}
                  {type === 'lunch' && '☀️'}
                  {type === 'dinner' && '🌙'}
                  {type === 'snack' && '🍎'}
                  {type}
                </h3>
                <div className="space-y-2">
                  {mealsByType[type].length === 0 ? (
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 text-center text-zinc-600 text-sm">
                      No {type} logged yet
                    </div>
                  ) : (
                    mealsByType[type].map((meal) => (
                      <div
                        key={meal.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white font-medium">{meal.meal_name}</p>
                          <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                            <span>{meal.calories} cal</span>
                            {meal.protein > 0 && <span>P: {meal.protein}g</span>}
                            {meal.carbs > 0 && <span>C: {meal.carbs}g</span>}
                            {meal.fats > 0 && <span>F: {meal.fats}g</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMeal.mutate(meal.id)}
                          className="text-zinc-600 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="plan" className="mt-6">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20">
                   <Zap className="w-6 h-6 text-amber-400" />
                 </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white mb-2">Generate Meal Plan</h2>
                  <p className="text-zinc-400 text-sm mb-3">
                     Get a personalized 3-course meal plan (breakfast, lunch, dinner) tailored to your calorie target and dietary preferences.
                   </p>
                  {profile && (
                    <div className="flex items-center gap-3 mb-4">
                      <Settings2 className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <Select
                        value={profile.dietary_preference || 'no_preference'}
                        onValueChange={handleDietaryChange}
                        disabled={savingDiet}
                      >
                        <SelectTrigger className="w-48 bg-zinc-800/60 border-zinc-700 text-zinc-200 h-9 text-sm">
                          <SelectValue placeholder="Dietary preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200 [&_[role=option]]:text-zinc-200 [&_[role=option]:focus]:bg-amber-500/10 [&_[role=option]:focus]:text-amber-400">
                         <SelectItem value="no_preference">No Preference</SelectItem>
                         <SelectItem value="vegetarian">Vegetarian</SelectItem>
                         <SelectItem value="vegan">Vegan</SelectItem>
                         <SelectItem value="keto">Keto</SelectItem>
                         <SelectItem value="paleo">Paleo</SelectItem>
                         <SelectItem value="mediterranean">Mediterranean</SelectItem>
                         <SelectItem value="gluten_free">Gluten Free</SelectItem>
                        </SelectContent>
                      </Select>
                      {savingDiet && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
                    </div>
                  )}
                  <Button
                     onClick={handleGenerateMealPlan}
                     disabled={generating}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-6 h-12 sm:h-11 text-base touch-target"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                       <>
                         <Zap className="w-4 h-4 mr-2" /> {todayPlan ? 'Regenerate' : 'Generate'} Meal Plan
                       </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {!todayPlan ? (
              <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-12 text-center">
                <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">Your meal plan will appear here once generated</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-6">Today's Meal Plan</h3>

                <MealPlanCard
                   meal={todayPlan.breakfast}
                   icon="🌅"
                   delay={0}
                   onAddMeal={(meal) => addMealFromPlan(meal, 'breakfast')}
                   isLoading={addingMealType === 'breakfast'}
                   onViewDetails={setSelectedMeal}
                 />
                <MealPlanCard
                   meal={todayPlan.lunch}
                   icon="☀️"
                   delay={0.1}
                   onAddMeal={(meal) => addMealFromPlan(meal, 'lunch')}
                   isLoading={addingMealType === 'lunch'}
                   onViewDetails={setSelectedMeal}
                 />
                <MealPlanCard
                   meal={todayPlan.dinner}
                   icon="🌙"
                   delay={0.2}
                   onAddMeal={(meal) => addMealFromPlan(meal, 'dinner')}
                   isLoading={addingMealType === 'dinner'}
                   onViewDetails={setSelectedMeal}
                 />
                {todayPlan.snack && (
                   <MealPlanCard
                     meal={todayPlan.snack}
                     icon="🍎"
                     delay={0.3}
                     onAddMeal={(meal) => addMealFromPlan(meal, 'snack')}
                     isLoading={addingMealType === 'snack'}
                     onViewDetails={setSelectedMeal}
                   />
                 )}

                 {todayPlan.cheat_meal && (
                   <div className="mt-6">
                     <h4 className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-3">
                       Weekly Cheat Meal Option
                     </h4>
                     <MealPlanCard
                       meal={todayPlan.cheat_meal}
                       icon="🍕"
                       delay={0.4}
                       onAddMeal={(meal) => addMealFromPlan(meal, 'snack')}
                       isLoading={addingMealType === 'cheat_meal'}
                       onViewDetails={setSelectedMeal}
                     />
                   </div>
                 )}
              </div>
            )}
            </TabsContent>

            </Tabs>

            <AnimatePresence>
             {showForm && (
               <MealLogForm
                 initialMeal={showForm?.initialData}
                 onSave={(data) => createMeal.mutate(data)}
                 onCancel={() => setShowForm(false)}
               />
             )}
            </AnimatePresence>

            <AnimatePresence>
             {selectedMeal && (
               <MealDetailView
                 meal={selectedMeal}
                 onBack={() => setSelectedMeal(null)}
                 onAddMeal={(meal) => createMeal.mutate({ ...meal, date: today, meal_type: 'breakfast' })}
               />
             )}
            </AnimatePresence>
            </div>
            </div>
            </ErrorBoundary>
            );
            }