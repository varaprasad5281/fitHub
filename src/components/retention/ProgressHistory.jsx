/**
 * Progress History View
 * Shows user's journey over time
 * Emotional attachment: "Look how far you've come"
 */

import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProgressHistory() {
  const [timeRange, setTimeRange] = useState('month'); // week, month, all

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['userBadges'],
    queryFn: async () => {
      const userBadges = await api.entities.UserBadge.list();
      // Sort by earned_at
      return userBadges.sort((a, b) => 
        new Date(b.earned_at) - new Date(a.earned_at)
      );
    }
  });

  const { data: level } = useQuery({
    queryKey: ['userLevel'],
    queryFn: async () => {
      const levels = await api.entities.UserLevel.list();
      return levels[0];
    }
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const acts = await api.entities.ActivityFeed.list();
      return acts.filter(a => 
        ['workout_completed', 'goal_achieved', 'streak_milestone'].includes(a.activity_type)
      );
    }
  });

  if (badgesLoading || activitiesLoading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  // Prepare chart data
  const getChartData = () => {
    const now = new Date();
    let days = 30;

    if (timeRange === 'week') days = 7;
    if (timeRange === 'all') days = 365;

    const data = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayActivities = activities?.filter(a => 
        a.created_date?.split('T')[0] === dateStr
      ) || [];

      data.push({
        date: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        fullDate: dateStr,
        activities: dayActivities.length,
        workouts: dayActivities.filter(a => a.activity_type === 'workout_completed').length
      });
    }

    return data;
  };

  const chartData = getChartData();

  // Recent badges
  const recentBadges = badges?.slice(0, 5) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
    >
      <Tabs defaultValue="activity" className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Your Journey</h3>
          <TabsList className="bg-zinc-800 rounded-lg p-1">
            <TabsTrigger value="activity" className="text-xs rounded">Activity</TabsTrigger>
            <TabsTrigger value="badges" className="text-xs rounded">Badges</TabsTrigger>
          </TabsList>
        </div>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          {/* Time Range */}
          <div className="flex gap-2">
            {['week', 'month', 'all'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
                }`}
              >
                {range === 'all' ? 'All Time' : range === 'month' ? '30d' : '7d'}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-48 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  interval={Math.floor(chartData.length / 7)}
                />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px'
                  }}
                  cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="workouts" fill="#71717a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-zinc-800/50 p-2">
              <p className="text-xs text-zinc-500 mb-0.5">Total Activities</p>
              <p className="text-lg font-bold text-white">
                {activities?.length || 0}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 p-2">
              <p className="text-xs text-zinc-500 mb-0.5">Active Days</p>
              <p className="text-lg font-bold text-white">
                {chartData.filter(d => d.activities > 0).length}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-3">
          {recentBadges.length > 0 ? (
            <>
              <p className="text-xs text-zinc-500">Recent Achievements</p>
              <div className="space-y-2">
                {recentBadges.map((badge, idx) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {badge.badge_code?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <Award className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">No badges earned yet</p>
              <p className="text-xs text-zinc-600 mt-1">Complete activities to unlock</p>
            </div>
          )}

          {/* Total Badges */}
          <div className="mt-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">Total Badges</p>
              <p className="text-xl font-bold text-white">{badges?.length || 0}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}