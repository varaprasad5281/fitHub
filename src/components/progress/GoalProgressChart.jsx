import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function GoalProgressChart({ goal, historicalData = [] }) {
  if (!goal) return null;

  const progressPercentage = Math.min((goal.current_value / goal.target_value) * 100, 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)));
  const daysTotal = Math.ceil((new Date(goal.target_date) - new Date(goal.start_date)) / (1000 * 60 * 60 * 24));
  const expectedProgress = daysTotal > 0 ? ((daysTotal - daysLeft) / daysTotal) * 100 : 0;
  const isOnTrack = progressPercentage >= expectedProgress * 0.85;

  const chartData = historicalData.length > 0 ? historicalData : [
    { date: 'Day 1', value: 0 },
    { date: 'Today', value: goal.current_value }
  ];

  const getGoalLabel = () => {
    const goalMap = {
      weight: 'Weight Loss',
      points: 'Points Goal',
      workout_streak: 'Workout Streak',
      workouts_completed: 'Workouts',
      custom: goal.goal_name
    };
    return goalMap[goal.goal_type] || goal.goal_name;
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-lg mb-1">{getGoalLabel()}</h3>
          <p className="text-zinc-500 text-sm">{goal.goal_name || getGoalLabel()}</p>
        </div>
        {goal.status === 'completed' ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-green-400">Completed</span>
          </div>
        ) : isOnTrack ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">On Track</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-semibold text-red-400">Behind</span>
          </div>
        )}
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-zinc-800/50 p-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Current</p>
          <p className="text-xl font-bold text-white">{goal.current_value} <span className="text-sm text-zinc-500">{goal.unit}</span></p>
        </div>
        <div className="rounded-xl bg-zinc-800/50 p-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Target</p>
          <p className="text-xl font-bold text-amber-400">{goal.target_value} <span className="text-sm text-zinc-500">{goal.unit}</span></p>
        </div>
        <div className="rounded-xl bg-zinc-800/50 p-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Days Left</p>
          <p className="text-xl font-bold text-blue-400">{daysLeft}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Progress</span>
          <span className="text-sm font-semibold text-white">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 to-amber-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Expected vs Actual */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/50 p-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Expected</p>
          <p className="text-lg font-semibold text-white">{Math.round(expectedProgress)}%</p>
        </div>
        <div className="rounded-lg bg-zinc-800/30 border border-zinc-700/50 p-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Actual</p>
          <p className="text-lg font-semibold text-amber-400">{Math.round(progressPercentage)}%</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
            <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}