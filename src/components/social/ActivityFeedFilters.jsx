import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Flame, Trophy, Star, Award, TrendingUp } from 'lucide-react';

const timeframeOptions = [
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'week', label: 'This Week', icon: Calendar },
  { id: 'all', label: 'All Time', icon: Calendar },
];

const activityTypes = [
  { id: 'all', label: 'All Activities', icon: null },
  { id: 'workout', label: 'Workouts', icon: Flame },
  { id: 'meal', label: 'Meals', icon: Star },
  { id: 'streak', label: 'Streaks', icon: Trophy },
  { id: 'achievement', label: 'Achievements', icon: Award },
  { id: 'leaderboard', label: 'Rankings', icon: TrendingUp },
];

export default function ActivityFeedFilters({ timeframe, setTimeframe, activityFilter, setActivityFilter }) {
  return (
    <div className="space-y-4">
      {/* Timeframe Filter */}
      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2 font-semibold">Timeframe</p>
        <div className="flex gap-2 flex-wrap">
          {timeframeOptions.map(tf => (
            <Button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              variant={timeframe === tf.id ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full text-xs ${
                timeframe === tf.id
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Activity Type Filter */}
      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2 font-semibold">Activity Type</p>
        <div className="flex gap-2 flex-wrap">
          {activityTypes.map(type => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                onClick={() => setActivityFilter(type.id)}
                variant={activityFilter === type.id ? 'default' : 'outline'}
                size="sm"
                className={`rounded-full text-xs ${
                  activityFilter === type.id
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                {Icon && <Icon className="w-3 h-3 mr-1" />}
                {type.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}