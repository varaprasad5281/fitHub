import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { api } from '@/api/client';
import { Trophy, Award, Zap, Flame } from "lucide-react";

export default function AchievementsBadges({ userEmail }) {
  const { data: badges = [] } = useQuery({
    queryKey: ['badges', userEmail],
    queryFn: () => api.entities.Badge.filter({ created_by: userEmail }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: points = {} } = useQuery({
    queryKey: ['points', userEmail],
    queryFn: async () => {
      const data = await api.entities.Points.filter({ created_by: userEmail });
      return data[0] || {};
    },
    staleTime: 1000 * 60 * 2,
  });

  const badgeTypeConfig = {
    top_3_week: {
      icon: Trophy,
      label: 'Weekly Podium',
      color: 'from-yellow-500 to-amber-600',
      desc: rank => {
        const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
        return `Ranked #${rank}`;
      }
    },
    streak_milestone: {
      icon: Flame,
      label: 'Streak Champion',
      color: 'from-red-500 to-orange-500',
      desc: 'Maintained streak'
    },
    points_milestone: {
      icon: Zap,
      label: 'Points Master',
      color: 'from-purple-500 to-pink-500',
      desc: 'Points achievement'
    },
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-2xl font-black text-amber-400 mb-1">{points.level || 1}</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Level</div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-2xl font-black text-purple-400 mb-1">{points.total_points || 0}</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Points</div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="text-2xl font-black text-emerald-400 mb-1">{badges.length}</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Badges</div>
        </div>
      </div>

      {/* Badges Grid */}
      {badges.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Achievements Unlocked</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const config = badgeTypeConfig[badge.badge_type];
              const Icon = config?.icon || Award;
              const earnedDate = new Date(badge.earned_date).toLocaleDateString('en-GB', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-xl border border-zinc-700 bg-gradient-to-br ${config?.color || 'from-zinc-700 to-zinc-800'} bg-opacity-10 overflow-hidden`}
                >
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-2">
                      <Icon className="w-6 h-6 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{config?.label || 'Badge'}</div>
                        <div className="text-xs text-zinc-400 mt-1">
                          {badge.rank && config?.desc ? config.desc(badge.rank) : config?.desc}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 mt-2">Earned {earnedDate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 px-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
          <Award className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">Keep pushing! Badges appear as you achieve milestones.</p>
        </div>
      )}
    </div>
  );
}