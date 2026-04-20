import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Apple, Loader2, Calendar, Zap, Settings2, History, TrendingUp, Utensils } from "lucide-react";
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

  const { data: mealLogHistory } = useQuery({
    queryKey: ['meal-log-history'],
    queryFn: async () => {
      const all = await api.entities.MealLog.list().catch(() => []);
      const byDate = {};
      for (const meal of all) {
        const d = meal.date || meal.createdAt?.slice(0, 10);
        if (!d) continue;
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(meal);
      }
      return Object.entries(byDate)
        .sort(([a], [b]) => new Date(b) - new Date(a))
        .slice(0, 7)
        .map(([date, meals]) => ({ date, meals }));
    },
    initialData: [],
    staleTime: 1000 * 60 * 2,
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
      queryClient.invalidateQueries({ queryKey: ['meal-log-history'] });
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
      queryClient.invalidateQueries({ queryKey: ['meal-log-history'] });
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
            <TabsTrigger value="history" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
              <History className="w-4 h-4 mr-2" /> History
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

          <TabsContent value="history" className="mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Meal Log History</h2>
                <p className="text-zinc-500 text-sm">Last 7 days with logged meals</p>
              </div>
            </div>

            {mealLogHistory.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-12 text-center">
                <Utensils className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No meal logs yet. Start logging meals to see history!</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/80">
                        <th className="text-left text-zinc-400 font-semibold px-4 py-3 uppercase tracking-wider text-xs">Date</th>
                        <th className="text-center text-zinc-400 font-semibold px-4 py-3 uppercase tracking-wider text-xs"># Meals</th>
                        <th className="text-right text-amber-400 font-semibold px-4 py-3 uppercase tracking-wider text-xs">Calories</th>
                        <th className="text-right text-blue-400 font-semibold px-4 py-3 uppercase tracking-wider text-xs">Protein</th>
                        <th className="text-right text-green-400 font-semibold px-4 py-3 uppercase tracking-wider text-xs">Carbs</th>
                        <th className="text-right text-orange-400 font-semibold px-4 py-3 uppercase tracking-wider text-xs">Fats</th>
                        <th className="text-center text-zinc-400 font-semibold px-4 py-3 uppercase tracking-wider text-xs">vs Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {mealLogHistory.map(({ date, meals: dayMeals }, idx) => {
                        const totalCal = dayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0);
                        const totalPro = dayMeals.reduce((s, m) => s + (Number(m.protein) || 0), 0);
                        const totalCarb = dayMeals.reduce((s, m) => s + (Number(m.carbs) || 0), 0);
                        const totalFat = dayMeals.reduce((s, m) => s + (Number(m.fats) || 0), 0);
                        const isToday = date === today;
                        const pct = Math.round((totalCal / calorieTarget) * 100);
                        const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric'
                        });
                        const types = new Set(dayMeals.map(m => m.meal_type));
                        return (
                          <tr
                            key={date}
                            className={`transition-colors hover:bg-zinc-800/30 ${isToday ? 'bg-amber-500/5' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{formattedDate}</span>
                                {isToday && (
                                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Today</span>
                                )}
                              </div>
                              <div className="flex gap-1 mt-1">
                                {types.has('breakfast') && <span title="Breakfast" className="text-xs">🌅</span>}
                                {types.has('lunch') && <span title="Lunch" className="text-xs">☀️</span>}
                                {types.has('dinner') && <span title="Dinner" className="text-xs">🌙</span>}
                                {types.has('snack') && <span title="Snack" className="text-xs">🍎</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 font-semibold text-xs">
                                {dayMeals.length}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-amber-400 font-bold">{totalCal.toLocaleString()}</span>
                              <span className="text-zinc-600 text-xs ml-1">kcal</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-blue-400 font-medium">{totalPro}g</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-green-400 font-medium">{totalCarb}g</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-orange-400 font-medium">{totalFat}g</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`text-xs font-semibold ${pct > 110 ? 'text-red-400' : pct >= 90 ? 'text-green-400' : 'text-zinc-400'}`}>
                                  {pct}%
                                </span>
                                <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${pct > 110 ? 'bg-red-500' : pct >= 90 ? 'bg-green-500' : 'bg-amber-500'}`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {mealLogHistory.length > 1 && (
                      <tfoot>
                        <tr className="border-t border-zinc-700 bg-zinc-900/80">
                          <td className="px-4 py-3 text-zinc-500 text-xs font-semibold uppercase tracking-wider">Avg / day</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-zinc-400 font-medium text-xs">
                              {Math.round(mealLogHistory.reduce((s, { meals: m }) => s + m.length, 0) / mealLogHistory.length)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-amber-400 font-bold">
                              {Math.round(mealLogHistory.reduce((s, { meals: m }) => s + m.reduce((ms, meal) => ms + (Number(meal.calories) || 0), 0), 0) / mealLogHistory.length).toLocaleString()}
                            </span>
                            <span className="text-zinc-600 text-xs ml-1">kcal</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-blue-400 font-medium">
                              {Math.round(mealLogHistory.reduce((s, { meals: m }) => s + m.reduce((ms, meal) => ms + (Number(meal.protein) || 0), 0), 0) / mealLogHistory.length)}g
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-green-400 font-medium">
                              {Math.round(mealLogHistory.reduce((s, { meals: m }) => s + m.reduce((ms, meal) => ms + (Number(meal.carbs) || 0), 0), 0) / mealLogHistory.length)}g
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-orange-400 font-medium">
                              {Math.round(mealLogHistory.reduce((s, { meals: m }) => s + m.reduce((ms, meal) => ms + (Number(meal.fats) || 0), 0), 0) / mealLogHistory.length)}g
                            </span>
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
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