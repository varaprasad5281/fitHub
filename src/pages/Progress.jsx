import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Calendar, Plus, AlertCircle, Zap, Flame, ArrowUp, ArrowDown, Minus, Weight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressGoalForm from "@/components/progress/ProgressGoalForm";
import ProgressGoalCard from "@/components/progress/ProgressGoalCard";
import GoalProgressChart from "@/components/progress/GoalProgressChart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Progress() {
  const [showGoalForm, setShowGoalForm] = useState(false);

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['progress-goals'],
    queryFn: () => api.entities.ProgressGoal.list('-createdAt', 50),
    initialData: [],
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });

  const { data: points } = useQuery({
    queryKey: ['points'],
    queryFn: () => api.entities.Points.list(),
    initialData: [],
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const { data: streaks } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.entities.Streak.list(),
    initialData: [],
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const { data: workouts } = useQuery({
    queryKey: ['workouts-all'],
    queryFn: async () => {
      const all = await api.entities.WorkoutCompletion.list('-completed_date', 100);
      return all;
    },
    initialData: [],
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
  });

  const { data: mealLogs } = useQuery({
    queryKey: ['meal-logs'],
    queryFn: async () => {
      const all = await api.entities.MealLog.list('-date', 100);
      return all;
    },
    initialData: [],
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
  });

  const { data: weightLogs } = useQuery({
    queryKey: ['weight-logs'],
    queryFn: async () => {
      const all = await api.entities.WeightLog.list('-date', 100);
      return all;
    },
    initialData: [],
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
  });

  const { data: pointsTransactions = [] } = useQuery({
    queryKey: ['points-transactions'],
    queryFn: () => api.entities.PointsTransaction.list('-transaction_date', 500),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Prepare chart data
  const pointsData = generatePointsChartData(pointsTransactions);
  const workoutData = generateWorkoutChartData(workouts);
  const calorieData = generateCalorieChartData(mealLogs);
  const weightData = generateWeightChartData(weightLogs);
  const leaderboardData = generateLeaderboardChartData(points[0]);
  const activeGoals = goals.filter(g => !g.status || g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  
  // Calculate changes
  const streakChange = calculateStreakChange(streaks[0]);
  const pointsChange = calculatePointsChange(points[0]);
  const workoutChange = calculateWorkoutChange(workouts);
  const calorieChange = calculateCalorieChange(mealLogs);
  const weightChange = calculateWeightChange(weightLogs);

  // Optimized loading state - show skeleton
  if (goalsLoading && goals.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-48 bg-zinc-800 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-zinc-900 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Progress</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your Journey</h1>
          <p className="text-zinc-500">Track your progress towards your goals</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Active Goals</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-amber-400">{activeGoals.length}</p>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Completed</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-green-400">{completedGoals}</p>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Current Streak</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-blue-400">{streaks[0]?.current_streak || 0}w</p>
              {streakChange.value !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${streakChange.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {streakChange.value > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(streakChange.value)}
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Points</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-purple-400">{points[0]?.total_points || 0}</p>
              {pointsChange.percentage !== null && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${pointsChange.value > 0 ? 'text-green-400' : pointsChange.value < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {pointsChange.value > 0 ? <ArrowUp className="w-3 h-3" /> : pointsChange.value < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {Math.abs(pointsChange.percentage)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Tabs */}
         <Tabs defaultValue="points" className="mb-8">
           <TabsList className="bg-zinc-900/50 border border-zinc-800 mb-6">
             <TabsTrigger value="points" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
               <TrendingUp className="w-4 h-4 mr-2" /> Points
             </TabsTrigger>
             <TabsTrigger value="workouts" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
               <Flame className="w-4 h-4 mr-2" /> Workouts
             </TabsTrigger>
             <TabsTrigger value="calories" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
               <Zap className="w-4 h-4 mr-2" /> Calories
             </TabsTrigger>
             <TabsTrigger value="weight" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
               <Weight className="w-4 h-4 mr-2" /> Weight
             </TabsTrigger>
             <TabsTrigger value="ranking" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
               <Target className="w-4 h-4 mr-2" /> Ranking
             </TabsTrigger>
           </TabsList>

          <TabsContent value="points">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Points Over Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={pointsData}>
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="week" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="points" stroke="#fbbf24" fillOpacity={1} fill="url(#colorPoints)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="workouts">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Workout Consistency
                </h3>
                {workoutChange.value !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${workoutChange.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {workoutChange.value > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span className="font-semibold">{Math.abs(workoutChange.value)} this week</span>
                    <span className="text-zinc-500">vs {workoutChange.previousWeek} last week</span>
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="week" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="workouts" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="calories">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Daily Calorie Intake
                </h3>
                {calorieChange.percentage !== null && (
                  <div className={`flex items-center gap-1 text-sm ${calorieChange.value > 0 ? 'text-green-400' : calorieChange.value < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                    {calorieChange.value > 0 ? <ArrowUp className="w-4 h-4" /> : calorieChange.value < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    <span className="font-semibold">{Math.abs(calorieChange.percentage)}% vs last week</span>
                    <span className="text-zinc-500">({Math.round(calorieChange.thisWeek)} avg)</span>
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="calories" stroke="#fbbf24" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Macronutrient Breakdown */}
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <h4 className="text-white font-semibold mb-4">Macronutrient Breakdown (Last 7 Days)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {generateMacroData(mealLogs).map((macro) => (
                    <div key={macro.name} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{macro.name}</p>
                      <p className="text-2xl font-bold text-white mb-1">{macro.value}g</p>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${macro.percentage}%`,
                            backgroundColor: macro.color 
                          }}
                        />
                      </div>
                      <p className="text-zinc-600 text-xs mt-1">{macro.percentage}% of total</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weight">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Weight className="w-4 h-4 text-amber-400" />
                  Weight Progress
                </h3>
                {weightChange.value !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${weightChange.value > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {weightChange.value > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span className="font-semibold">{Math.abs(weightChange.value).toFixed(1)} kg {weightChange.value > 0 ? 'gained' : 'lost'}</span>
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" />
                  <YAxis stroke="#71717a" domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => `${value.toFixed(1)} kg`}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#10b981" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>

              {/* Weight Statistics */}
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <h4 className="text-white font-semibold mb-4">Statistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Current</p>
                    <p className="text-2xl font-bold text-white">{weightChange.current.toFixed(1)} kg</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Average</p>
                    <p className="text-2xl font-bold text-blue-400">{weightChange.average.toFixed(1)} kg</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Goal</p>
                    <p className="text-2xl font-bold text-amber-400">{weightChange.goal || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ranking">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Weekly Ranking Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={leaderboardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="week" stroke="#71717a" />
                  <YAxis stroke="#71717a" reversed />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="rank" stroke="#10b981" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Goals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 min-w-0">
              <Target className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">Your Goals</h2>
            </div>
            <Button
              onClick={() => setShowGoalForm(true)}
              className="shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold px-4 sm:px-6 rounded-full h-9 sm:h-10 text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden xs:inline">Add Goal</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>

          {/* Goal Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Active</p>
              <p className="text-2xl font-bold text-amber-400">{activeGoals.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{completedGoals}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Avg Progress</p>
              <p className="text-2xl font-bold text-blue-400">
                {activeGoals.length > 0 
                  ? Math.round(activeGoals.reduce((sum, g) => sum + (g.current_value / g.target_value * 100), 0) / activeGoals.length)
                  : 0}%
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">On Track</p>
              <p className="text-2xl font-bold text-purple-400">
                {activeGoals.filter(g => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(g.target_date) - new Date()) / (1000 * 60 * 60 * 24)));
                  const daysTotal = Math.ceil((new Date(g.target_date) - new Date(g.start_date)) / (1000 * 60 * 60 * 24));
                  const expectedProgress = ((daysTotal - daysLeft) / daysTotal) * 100;
                  const actualProgress = (g.current_value / g.target_value) * 100;
                  return actualProgress >= expectedProgress * 0.8;
                }).length}
              </p>
            </div>
          </div>

          {activeGoals.length === 0 && !showGoalForm ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
              <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 mb-4">No active goals yet. Set one to get started!</p>
              <Button
                onClick={() => setShowGoalForm(true)}
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold px-6 rounded-full"
              >
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Goal Progress Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeGoals.map(goal => (
                  <GoalProgressChart key={goal.id} goal={goal} />
                ))}
              </div>

              {/* Goal Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGoals.map(goal => (
                  <ProgressGoalCard key={`card-${goal.id}`} goal={goal} />
                ))}
              </div>
            </div>
          )}
        </div>

        {showGoalForm && (
          <ProgressGoalForm onClose={() => setShowGoalForm(false)} />
        )}
      </div>
    </div>
  );
}

function generatePointsChartData(transactions) {
  if (!transactions || transactions.length === 0) return [];

  // Only meaningful transactions (exclude the 0-pt idempotency markers)
  const meaningful = transactions.filter(t => t.points_awarded > 0 && t.source !== 'daily_calc');

  // Build last 12 weeks of weekly totals
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const refDay = new Date();
    // Week ending on refDay - i*7
    const weekEnd = new Date(refDay);
    weekEnd.setDate(refDay.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);

    const weekPts = meaningful
      .filter(t => {
        if (!t.transaction_date) return false;
        const d = new Date(t.transaction_date);
        return d >= weekStart && d <= weekEnd;
      })
      .reduce((sum, t) => sum + (t.points_awarded || 0), 0);

    weeks.push({
      week: weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      points: weekPts,
    });
  }

  // Convert to cumulative running total
  let running = 0;
  return weeks.map(w => {
    running += w.points;
    return { week: w.week, points: running };
  });
}

function generateWorkoutChartData(workouts) {
  const weeks = [];
  for (let i = 3; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const count = workouts.filter(w => {
      const d = new Date(w.completed_date);
      return d >= weekStart && d <= weekEnd;
    }).length;

    weeks.push({
      week: weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      workouts: count
    });
  }
  return weeks.reverse();
}

function generateCalorieChartData(mealLogs) {
  const dailyData = {};
  
  mealLogs.forEach(log => {
    if (!dailyData[log.date]) {
      dailyData[log.date] = 0;
    }
    dailyData[log.date] += log.calories || 0;
  });

  return Object.entries(dailyData)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .slice(-14)
    .map(([date, calories]) => ({
      date: new Date(date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      calories: Math.round(calories)
    }));
}

function generateLeaderboardChartData(points) {
  if (!points) return [];
  
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    // Simulate ranking trend (in reality you'd fetch historical data)
    const estimatedRank = Math.max(1, 50 - (points.total_points || 0) / 100 + Math.random() * 20);
    
    weeks.push({
      week: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      rank: Math.round(estimatedRank)
    });
  }
  return weeks;
}

function generateMacroData(mealLogs) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentLogs = mealLogs.filter(log => new Date(log.date) >= sevenDaysAgo);
  
  const totals = recentLogs.reduce(
    (acc, log) => ({
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fats: acc.fats + (log.fats || 0),
    }),
    { protein: 0, carbs: 0, fats: 0 }
  );
  
  const total = totals.protein + totals.carbs + totals.fats;
  
  if (total === 0) {
    return [
      { name: 'Protein', value: 0, percentage: 0, color: '#ef4444' },
      { name: 'Carbs', value: 0, percentage: 0, color: '#3b82f6' },
      { name: 'Fats', value: 0, percentage: 0, color: '#fbbf24' },
    ];
  }
  
  return [
    { 
      name: 'Protein', 
      value: Math.round(totals.protein), 
      percentage: Math.round((totals.protein / total) * 100),
      color: '#ef4444'
    },
    { 
      name: 'Carbs', 
      value: Math.round(totals.carbs), 
      percentage: Math.round((totals.carbs / total) * 100),
      color: '#3b82f6'
    },
    { 
      name: 'Fats', 
      value: Math.round(totals.fats), 
      percentage: Math.round((totals.fats / total) * 100),
      color: '#fbbf24'
    },
  ];
}

function calculateStreakChange(streak) {
  if (!streak) return { value: 0 };
  // Simple comparison: if current streak is higher than 0, show it as positive change
  return { value: 0 }; // Could be enhanced with historical data
}

function calculatePointsChange(points) {
  if (!points) return { value: 0, percentage: null };
  const weeklyPoints = points.weekly_points || 0;
  const totalPoints = points.total_points || 0;
  
  if (totalPoints === 0) return { value: 0, percentage: null };
  
  const percentage = Math.round((weeklyPoints / totalPoints) * 100);
  return { 
    value: weeklyPoints, 
    percentage: Math.min(percentage, 100)
  };
}

function calculateWorkoutChange(workouts) {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const thisWeek = workouts.filter(w => {
    const d = new Date(w.completed_date);
    return d >= thisWeekStart;
  }).length;
  
  const lastWeek = workouts.filter(w => {
    const d = new Date(w.completed_date);
    return d >= lastWeekStart && d < thisWeekStart;
  }).length;
  
  return {
    value: thisWeek - lastWeek,
    thisWeek,
    previousWeek: lastWeek
  };
}

function calculateCalorieChange(mealLogs) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);
  
  const thisWeekLogs = mealLogs.filter(log => {
    const d = new Date(log.date);
    return d >= sevenDaysAgo;
  });
  
  const lastWeekLogs = mealLogs.filter(log => {
    const d = new Date(log.date);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });
  
  const thisWeekAvg = thisWeekLogs.length > 0 
    ? thisWeekLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / Math.max(thisWeekLogs.length / 3, 1)
    : 0;
  
  const lastWeekAvg = lastWeekLogs.length > 0
    ? lastWeekLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / Math.max(lastWeekLogs.length / 3, 1)
    : 0;
  
  if (lastWeekAvg === 0) return { value: 0, percentage: null, thisWeek: thisWeekAvg };
  
  const percentageChange = Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100);
  
  return {
    value: thisWeekAvg - lastWeekAvg,
    percentage: percentageChange,
    thisWeek: thisWeekAvg,
    lastWeek: lastWeekAvg
  };
}

function generateWeightChartData(weightLogs) {
  return weightLogs
    .slice(-30)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(log => ({
      date: new Date(log.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      weight: log.weight_kg || 0
    }));
}

function calculateWeightChange(weightLogs) {
  if (weightLogs.length === 0) {
    return { value: 0, current: 0, average: 0, goal: null };
  }

  const sorted = [...weightLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
  const current = sorted[0]?.weight_kg || 0;
  const oldest = sorted[sorted.length - 1]?.weight_kg || current;
  const value = current - oldest;
  const average = weightLogs.reduce((sum, log) => sum + (log.weight_kg || 0), 0) / weightLogs.length;

  return {
    value,
    current,
    average,
    goal: null
  };
}