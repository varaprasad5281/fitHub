import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Dumbbell, Settings2, CheckCircle2, Zap, Play } from "lucide-react";
import { toast } from "sonner";
import ExerciseDemoModal from "@/components/workout/ExerciseDemoModal";
import { withActionDebug } from '@/components/debug/ActionDebugger';
import ProUpsellModalEnhanced from '@/components/conversion/ProUpsellModalEnhanced';
import { activeSub, hasProAccess as checkProAccess } from '@/lib/subscriptionUtils';

const pointsPerDifficulty = {
  beginner: 10,
  intermediate: 25,
  advanced: 50
};

const calculateWorkoutPoints = (workout) => {
  return (pointsPerDifficulty[workout.difficulty] || 10) * (workout.exercises?.length || 0);
};

const WORKOUTS_CACHE_KEY = 'fitness_workouts_cache';

export default function WorkoutBuilder() {
  const queryClient = useQueryClient();
  const [showCustomize, setShowCustomize] = useState(false);
  const [demoExercise, setDemoExercise] = useState(null);
  const [planType, setPlanType] = useState('single'); // 'single' or 'weekly'
  const [cachedWorkouts, setCachedWorkouts] = useState([]);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellTrigger, setUpsellTrigger] = useState(null);
  const [workoutParams, setWorkoutParams] = useState({
    focus: '',
    duration: '',
    difficulty: '',
    equipment: '',
    days_per_week: '4',
    target_muscles: ''
  });

  // Load cached workouts on mount
  useEffect(() => {
    const cached = localStorage.getItem(WORKOUTS_CACHE_KEY);
    if (cached) {
      try {
        setCachedWorkouts(JSON.parse(cached));
      } catch {
        setCachedWorkouts([]);
      }
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me(),
  });

  const { data: profiles } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.entities.Profile.list(),
    enabled: !!user,
    initialData: [],
    staleTime: 1000 * 60 * 10,
  });

  const profile = profiles[0];

  const { data: workouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const all = await api.entities.Workout.list('-created_date', 50);
      const currentWeek = Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000);
      const filtered = all.filter(w => !w.week_number || w.week_number === currentWeek);
      // Update cache whenever workouts are fetched
      if (filtered.length > 0) {
        localStorage.setItem(WORKOUTS_CACHE_KEY, JSON.stringify(filtered));
        setCachedWorkouts(filtered);
      }
      return filtered;
    },
    enabled: !!user,
    initialData: cachedWorkouts,
    staleTime: 1000 * 60 * 5,
  });

  const { data: completions } = useQuery({
    queryKey: ['workout-completions'],
    queryFn: () => api.entities.WorkoutCompletion.list('-completed_date', 50),
    enabled: !!user,
    initialData: [],
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.entities.ProgressGoal.filter({ status: 'active' }),
    enabled: !!user,
    initialData: [],
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    enabled: !!user,
    initialData: [],
  });

  const subscription = activeSub(subscriptions);
  const hasProAccess = checkProAccess(subscription);

  const generateMutation = useMutation({
    mutationFn: async ({ params, type }) => {
      return withActionDebug('Generate ' + (type === 'weekly' ? 'Weekly' : 'Single') + ' Workout', async () => {
        if (!user) {
          api.auth.redirectToLogin();
          throw new Error('Please log in to generate workouts');
        }
        
        // Delete existing workouts first
        if (workouts && workouts.length > 0) {
          await Promise.all(workouts.map(function(w) { return api.entities.Workout.delete(w.id); }));
        }
        
        const goalData = goals && goals.length > 0 ? {
          goals: goals.map(function(g) { return { type: g.goal_type, name: g.goal_name, target: g.target_value, unit: g.unit }; })
        } : {};
        
        if (type === 'weekly') {
          return api.functions.invoke('generateWeeklyWorkout', Object.assign({}, params, goalData));
        } else {
          return api.functions.invoke('generatePersonalizedWorkout', Object.assign({}, params, goalData));
        }
      }, {
        onError: (error) => {
          if (error.message !== 'Please log in to generate workouts') {
            toast.error('Could not generate workout. Try again later.');
          }
        }
      })();
    },
    onSuccess: (_, variables) => {
      localStorage.removeItem(WORKOUTS_CACHE_KEY);
      setCachedWorkouts([]);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success(variables.type === 'weekly' ? 'Weekly workout plan generated!' : 'Workout generated!');
      setWorkoutParams({ focus: '', duration: '', difficulty: '', equipment: '', days_per_week: '4', target_muscles: '' });
      setShowCustomize(false);
    },
    onError: () => {
      // Errors already handled inside mutationFn via withActionDebug
    }
  });

  const completeWorkout = useMutation({
    mutationFn: async (workoutId) => {
      return withActionDebug('Complete Workout', async () => {
        const today = new Date().toISOString().split('T')[0];
        await api.entities.WorkoutCompletion.create({
          workout_id: workoutId,
          completed_date: today,
        });
        await api.functions.invoke('updateGoalProgress');
      }, {
        onError: () => toast.error('Could not record workout completion. Please try again.')
      })();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['workout-completions'] });
      queryClient.invalidateQueries({ queryKey: ['workouts-all'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Workout completed! 🎉');
      
      // Trigger upsell on first workout completion
      if (!hasProAccess && completions.length === 0) {
        setTimeout(() => {
          setUpsellTrigger('workout_complete');
          setShowUpsell(true);
          api.analytics.track({
            eventName: 'upsell_triggered',
            properties: { trigger: 'first_workout_completion' }
          });
        }, 1500);
      }
    },
    onError: () => {
      // Handled inside mutationFn
    }
  });

  const isWorkoutCompletedToday = (workoutId) => {
    const today = new Date().toISOString().split('T')[0];
    return completions.some(c => c.workout_id === workoutId && c.completed_date === today);
  };

  // Get total completion count for a workout (for tracking if it's been done before)
  const getWorkoutCompletionCount = (workoutId) => {
    return completions.filter(c => c.workout_id === workoutId).length;
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Workouts</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your Workout Plans</h1>
          <p className="text-zinc-500">AI-generated personalized training routines based on your goals</p>
          
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              onClick={() => setPlanType('single')}
              className={planType === 'single'
                ? 'flex-1 sm:flex-none bg-amber-500/20 border border-amber-500 text-amber-400 hover:bg-amber-500/30 rounded-full'
                : 'flex-1 sm:flex-none bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-white hover:bg-zinc-800 rounded-full'}
            >
              Single Workout
            </Button>
            <Button
              onClick={() => setPlanType('weekly')}
              className={planType === 'weekly'
                ? 'flex-1 sm:flex-none bg-amber-500/20 border border-amber-500 text-amber-400 hover:bg-amber-500/30 rounded-full'
                : 'flex-1 sm:flex-none bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-white hover:bg-zinc-800 rounded-full'}
            >
              Weekly Plan
            </Button>
          </div>
        </div>

        {/* Generate Button */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Generate AI Workout</h2>
              <p className="text-zinc-400 text-sm mb-4">
                {planType === 'weekly'
                  ? 'Generate a complete weekly workout plan with multiple training days tailored to your schedule and goals.'
                  : showCustomize 
                    ? 'Customize parameters to create different workout styles. Each generation replaces your current workout.'
                    : 'Generate a personalized workout based on your profile. Click regenerate to get a new variation.'
                }
              </p>

              {showCustomize && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  {planType === 'single' && (
                    <div>
                      <Label className="text-zinc-400 text-xs mb-2 block">Workout Focus</Label>
                      <Select value={workoutParams.focus} onValueChange={(v) => setWorkoutParams({...workoutParams, focus: v})}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder={`Default: ${profile?.workout_preference?.replace(/_/g, ' ') || 'Mixed'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strength">Strength Training</SelectItem>
                          <SelectItem value="cardio">Cardio</SelectItem>
                          <SelectItem value="gym">Gym Workout</SelectItem>
                          <SelectItem value="home">Home Workout</SelectItem>
                          <SelectItem value="outdoor">Outdoor</SelectItem>
                          <SelectItem value="yoga">Yoga & Flexibility</SelectItem>
                          <SelectItem value="calisthenics">Calisthenics</SelectItem>
                          <SelectItem value="hiit">HIIT</SelectItem>
                          <SelectItem value="mixed">Mixed Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {planType === 'weekly' && (
                    <div>
                      <Label className="text-zinc-400 text-xs mb-2 block">Training Days Per Week</Label>
                      <Select value={workoutParams.days_per_week} onValueChange={(v) => setWorkoutParams({...workoutParams, days_per_week: v})}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days/week</SelectItem>
                          <SelectItem value="4">4 days/week</SelectItem>
                          <SelectItem value="5">5 days/week</SelectItem>
                          <SelectItem value="6">6 days/week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label className="text-zinc-400 text-xs mb-2 block">Duration</Label>
                    <Select value={workoutParams.duration} onValueChange={(v) => setWorkoutParams({...workoutParams, duration: v})}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder={`${profile?.workout_duration || 30} min` || "Select duration"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-zinc-400 text-xs mb-2 block">Difficulty</Label>
                    <Select value={workoutParams.difficulty} onValueChange={(v) => setWorkoutParams({...workoutParams, difficulty: v})}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder={profile?.experience_level || "Select difficulty"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-zinc-400 text-xs mb-2 block">Target Muscles</Label>
                    <Select value={workoutParams.target_muscles} onValueChange={(v) => setWorkoutParams({...workoutParams, target_muscles: v})}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="All muscle groups" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chest">Chest</SelectItem>
                        <SelectItem value="back">Back</SelectItem>
                        <SelectItem value="legs">Legs</SelectItem>
                        <SelectItem value="shoulders">Shoulders</SelectItem>
                        <SelectItem value="arms">Arms (Biceps & Triceps)</SelectItem>
                        <SelectItem value="core">Core & Abs</SelectItem>
                        <SelectItem value="upper_body">Upper Body</SelectItem>
                        <SelectItem value="lower_body">Lower Body</SelectItem>
                        <SelectItem value="full_body">Full Body</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-zinc-400 text-xs mb-2 block">Equipment</Label>
                    <Select value={workoutParams.equipment} onValueChange={(v) => setWorkoutParams({...workoutParams, equipment: v})}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder={profile?.available_equipment || "Select equipment"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Equipment</SelectItem>
                        <SelectItem value="basic">Basic (Bands, Dumbbells)</SelectItem>
                        <SelectItem value="full_gym">Full Gym Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => {
                    if (!hasProAccess) {
                      setUpsellTrigger('default');
                      setShowUpsell(true);
                      return;
                    }
                    const params = Object.fromEntries(
                      Object.entries(workoutParams).filter(([k, v]) => {
                        if (planType === 'single' && k === 'days_per_week') return false;
                        if (planType === 'weekly' && k === 'focus') return false;
                        return v !== '';
                      })
                    );
                    const enhancedParams = {
                      ...params,
                      variation_seed: Date.now(),
                      user_preferences: {
                        available_equipment: profile?.available_equipment,
                        experience_level: profile?.experience_level,
                        age: profile?.age,
                        fitness_goal: profile?.fitness_goal
                      }
                    };
                    generateMutation.mutate({ 
                      params: Object.keys(params).length > 0 ? enhancedParams : { user_preferences: enhancedParams.user_preferences }, 
                      type: planType 
                    });
                  }}
                  disabled={generateMutation.isPending}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold px-6 rounded-full h-12 sm:h-11 text-base touch-target"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {workouts.length > 0 ? `Regenerate ${planType === 'weekly' ? 'Weekly Plan' : 'Workout'}` : `Generate ${planType === 'weekly' ? 'Weekly Plan' : 'Workout'}`}
                </Button>
                <Button
                  onClick={() => setShowCustomize(!showCustomize)}
                  className="bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 hover:border-amber-500 rounded-full h-12 sm:h-11 text-base touch-target"
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  {showCustomize ? 'Hide Options' : 'Customize'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Workouts */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            {planType === 'weekly' ? 'Your Weekly Plan' : 'Your Workout'}
          </h2>
          {workoutsLoading && workouts.length === 0 && cachedWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            </div>
          ) : planType === 'weekly' ? (() => {
            const weeklyWorkouts = (workouts.length > 0 ? workouts : cachedWorkouts).filter(w => w.day_of_week);
            if (!weeklyWorkouts.length) return (
              <div className="text-center py-12 rounded-xl border border-zinc-800 bg-zinc-900/30">
                <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500">No weekly plan yet. Generate your weekly plan above!</p>
              </div>
            );
            return (
            <div className="space-y-4">
               {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                 const workout = weeklyWorkouts.find(w => w.day_of_week === day);
                if (!workout) return null;
                return (
                  <div key={day}>
                    <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
                      {day}
                    </h3>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">
                            {workout.workout_name}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                              {workout.difficulty}
                            </span>
                            {workout.estimated_duration && (
                              <span className="px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                                {workout.estimated_duration} min
                              </span>
                            )}
                            {workout.calories_burned && (
                              <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                                🔥 {workout.calories_burned} cal
                              </span>
                            )}
                            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> {calculateWorkoutPoints(workout)} pts
                            </span>
                          </div>
                        </div>
                        {isWorkoutCompletedToday(workout.id) ? (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </div>
                        ) : (
                          <Button
                            onClick={() => completeWorkout.mutate(workout.id)}
                            disabled={completeWorkout.isPending}
                            className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-semibold rounded-full px-6 h-12 sm:h-10 touch-target"
                          >
                            {completeWorkout.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                            )}
                            {getWorkoutCompletionCount(workout.id) > 0 ? 'Complete Again' : 'Complete'}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {workout.exercises?.map((exercise, idx) => (
                          <button
                            key={idx}
                            onClick={() => setDemoExercise(exercise)}
                            className="w-full flex gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all group text-left"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-semibold">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-1">
                                <h5 className="font-medium text-white">{exercise.name}</h5>
                                <span className="text-xs text-zinc-500">
                                  {exercise.sets} sets × {exercise.reps}
                                </span>
                                {exercise.weight_recommendation && (
                                  <span className="text-xs text-amber-400">
                                    {exercise.weight_recommendation}
                                  </span>
                                )}
                              </div>
                              {exercise.instructions && (
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                  {exercise.instructions}
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 flex items-center">
                              <div className="w-7 h-7 rounded-full bg-zinc-800 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                                <Play className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            );
          })() : (() => {
            const singleWorkouts = (workouts.length > 0 ? workouts : cachedWorkouts).filter(w => !w.day_of_week);
            if (!singleWorkouts.length) return (
              <div className="text-center py-12 rounded-xl border border-zinc-800 bg-zinc-900/30">
                <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500">No workout yet. Generate your personalized workout above!</p>
              </div>
            );
            return (
            <div>
               {singleWorkouts.slice(0, 1).map((workout) => (
                <div
                  key={workout.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {workout.workout_name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                          {workout.difficulty}
                        </span>
                        {workout.estimated_duration && (
                          <span className="px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                            {workout.estimated_duration} min
                          </span>
                        )}
                        {workout.calories_burned && (
                          <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                            🔥 {workout.calories_burned} cal
                          </span>
                        )}
                        <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> {calculateWorkoutPoints(workout)} pts
                        </span>
                      </div>
                    </div>
                    {isWorkoutCompletedToday(workout.id) ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed Today
                      </div>
                    ) : (
                      <Button
                        onClick={() => completeWorkout.mutate(workout.id)}
                        disabled={completeWorkout.isPending}
                        className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-semibold rounded-full px-6 h-12 sm:h-10 touch-target"
                      >
                        {completeWorkout.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        {getWorkoutCompletionCount(workout.id) > 0 ? 'Complete Again' : 'Complete Workout'}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {workout.exercises?.map((exercise, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDemoExercise(exercise)}
                        className="w-full flex gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50 hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all group text-left"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <h4 className="font-medium text-white">{exercise.name}</h4>
                            <span className="text-xs text-zinc-500">
                              {exercise.sets} sets × {exercise.reps}
                            </span>
                            {exercise.weight_recommendation && (
                              <span className="text-xs text-amber-400">
                                {exercise.weight_recommendation}
                              </span>
                            )}
                          </div>
                          {exercise.instructions && (
                            <p className="text-sm text-zinc-400 leading-relaxed">
                              {exercise.instructions}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                            <Play className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            );
          })()}
        </div>

      </div>

      {demoExercise && (
        <ExerciseDemoModal exercise={demoExercise} onClose={() => setDemoExercise(null)} />
      )}

      <ProUpsellModalEnhanced
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        triggerType={upsellTrigger}
        contextData={{
          workoutsCompleted: completions.length + 1
        }}
      />
    </div>
  );
}