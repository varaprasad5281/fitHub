import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/api/client';
import { useQuery } from "@tanstack/react-query";
import { User, Flame, Trophy, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PublicProfile() {
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('email');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['public-user', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const users = await api.entities.User.filter({ email: userEmail });
      return users?.[0] || null;
    },
    enabled: !!userEmail,
  });

  const { data: profiles } = useQuery({
    queryKey: ['public-profile', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return api.entities.Profile.filter({ created_by: userEmail });
    },
    initialData: [],
    enabled: !!userEmail,
  });

  const { data: streaks } = useQuery({
    queryKey: ['public-streak', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return api.entities.Streak.filter({ created_by: userEmail });
    },
    initialData: [],
    enabled: !!userEmail,
  });

  const { data: points } = useQuery({
    queryKey: ['public-points', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return api.entities.Points.filter({ created_by: userEmail });
    },
    initialData: [],
    enabled: !!userEmail,
  });

  const { data: featuredBadges = [] } = useQuery({
    queryKey: ['public-featured-badges', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const res = await api.functions.invoke('getBadges', { action: 'featured', email: userEmail });
      return res?.data || [];
    },
    enabled: !!userEmail,
  });

  const profile = profiles[0];
  const streak = streaks[0];
  const point = points[0];

  const RARITY_STYLES = {
    common:    { border: 'border-zinc-600', label: 'text-zinc-400',   bg: 'bg-zinc-800/60'   },
    rare:      { border: 'border-blue-500', label: 'text-blue-400',   bg: 'bg-blue-900/30'   },
    epic:      { border: 'border-purple-500', label: 'text-purple-400', bg: 'bg-purple-900/30' },
    legendary: { border: 'border-amber-400', label: 'text-amber-400',  bg: 'bg-amber-900/30'  },
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <User className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-zinc-400 mb-6">This profile doesn't exist or is private.</p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold px-6 rounded-full">
              Back Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0">
              {profile.profile_picture_url ? (
                <img 
                  src={profile.profile_picture_url} 
                  alt={profile.username || 'Profile'} 
                  className="w-full h-full object-cover" 
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <User className="w-8 h-8 text-zinc-600" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">
                {user?.full_name || profile.username || user?.email?.split('@')[0]}
              </h1>
              {profile.username && user?.full_name && (
                <p className="text-zinc-500 text-sm mb-2">@{profile.username}</p>
              )}
              {profile.country && profile.show_on_leaderboard && (
                <p className="text-zinc-500 text-sm">{profile.country}</p>
              )}
              {profile.bio && (
                <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Streak</span>
              </div>
              <p className="text-2xl font-black text-white">{streak?.current_streak || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Points</span>
              </div>
              <p className="text-2xl font-black text-white">{point?.total_points || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Level</span>
              </div>
              <p className="text-2xl font-black text-white">{point?.level || 1}</p>
            </div>
          </div>
        </div>

        {/* Featured Badges */}
        {featuredBadges.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Featured Badges</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {featuredBadges.map((badge) => {
                const r = RARITY_STYLES[badge.rarity_level] || RARITY_STYLES.common;
                return (
                  <div
                    key={badge._id || badge.badge_code}
                    className={`rounded-xl border ${r.border} ${r.bg} p-4 flex flex-col items-center gap-1.5 text-center`}
                  >
                    <span className="text-3xl">{badge.icon || '🏅'}</span>
                    <p className="text-white font-semibold text-xs leading-tight">{badge.name}</p>
                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${r.label}`}>
                      {badge.rarity_level}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="space-y-4">
          <h3 className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Details</h3>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800">
            <div className="p-4 flex justify-between">
              <span className="text-zinc-500 text-sm">Age</span>
              <span className="text-white font-medium">{profile.age} years</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-zinc-500 text-sm">Height</span>
              <span className="text-white font-medium">{profile.height_cm} cm</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-zinc-500 text-sm">Weight</span>
              <span className="text-white font-medium">{profile.weight_kg} kg</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-zinc-500 text-sm">Goal</span>
              <span className="text-white font-medium capitalize">{profile.fitness_goal?.replace('_', ' ')}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-zinc-500 text-sm">Activity Level</span>
              <span className="text-white font-medium capitalize">{profile.activity_level?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}