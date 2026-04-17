/**
 * Friends Activity Feed Component
 * Shows when friends level up, earn badges, reach leaderboard, etc.
 */

import React from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Award, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const getEventIcon = (eventType) => {
  switch (eventType) {
    case 'top_1_weekly':
    case 'top_3_weekly':
      return <Trophy className="w-4 h-4 text-amber-500" />;
    case 'badge_earned':
      return <Award className="w-4 h-4 text-amber-500" />;
    case 'level_up':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'workout_streak_milestone':
      return <Zap className="w-4 h-4 text-orange-500" />;
    case 'challenge_completed':
      return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case 'prestige_unlocked':
      return <Trophy className="w-4 h-4 text-purple-500" />;
    default:
      return <TrendingUp className="w-4 h-4 text-zinc-500" />;
  }
};

const getEventTemplate = (eventType, friendName, metadata) => {
  switch (eventType) {
    case 'level_up':
      return {
        title: `${friendName} leveled up to Level ${metadata?.level || '?'}`,
        subtitle: 'Consistency is showing.'
      };
    case 'badge_earned':
      return {
        title: `${friendName} earned "${metadata?.badge_name || 'Achievement'}"`,
        subtitle: "Most people quit. The 7% don't."
      };
    case 'workout_streak_milestone':
      return {
        title: `${friendName} hit a ${metadata?.streak_days || '?'}-day streak`,
        subtitle: 'Discipline compounds.'
      };
    case 'top_3_weekly':
      return {
        title: `${friendName} reached the Top 3 this week`,
        subtitle: 'Podium performance.'
      };
    case 'top_1_weekly':
      return {
        title: `${friendName} finished #1 this week`,
        subtitle: 'Champion mindset.'
      };
    case 'challenge_completed':
      return {
        title: `${friendName} completed the weekly challenge`,
        subtitle: 'Progress stays consistent.'
      };
    case 'prestige_unlocked':
      return {
        title: `${friendName} unlocked prestige`,
        subtitle: 'Excellence recognized.'
      };
    case 'subscription_upgraded':
      return {
        title: `${friendName} upgraded to ${metadata?.plan || 'Premium'}`,
        subtitle: 'Committed to the journey.'
      };
    default:
      return {
        title: `${friendName} reached a milestone`,
        subtitle: 'Progress compounds.'
      };
  }
};

export default function FriendsActivityFeed() {
  const { data: activity = [], isLoading } = useQuery({
    queryKey: ['friendsActivity'],
    queryFn: async () => {
      const response = await api.functions.invoke('getFriendsActivity', {
        limit: 20
      });
      return response?.data?.activity || [];
    },
    staleTime: 1000 * 60 * 5
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="text-sm text-zinc-400 font-semibold mb-1">No updates yet.</p>
        <p className="text-xs text-zinc-600">Once your friends start logging workouts and progress, updates will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activity.map((event, idx) => {
        const isPriority = event.priority === 'high';
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-3 rounded-lg border ${
              isPriority
                ? 'border-amber-500/30 bg-amber-500/10'
                : 'border-zinc-700 bg-zinc-800/50'
            }`}
          >
            <div className="flex gap-3">
              <div className="mt-1">{getEventIcon(event.event_type)}</div>
              <div className="flex-1 min-w-0">
                 <div className="flex items-start justify-between gap-2">
                   <div className="flex-1">
                     <p className={`text-sm font-medium ${
                       isPriority ? 'text-amber-300' : 'text-white'
                     }`}>
                       {getEventTemplate(event.event_type, event.friend_name, event.metadata).title}
                     </p>
                     <p className="text-xs text-zinc-600 mt-1">
                       {getEventTemplate(event.event_type, event.friend_name, event.metadata).subtitle}
                     </p>
                   </div>
                  {event.profile_picture && (
                    <img
                      src={event.profile_picture}
                      alt={event.friend_name}
                      className="w-8 h-8 rounded-full object-cover ml-2"
                    />
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-1">
                  {new Date(event.created_at).toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}