import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Award, Flame } from 'lucide-react';
import { api } from '@/api/client';

export default function FriendComparison({ friendEmail, friendName }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const { data } = await api.functions.invoke('getFriendComparison', {
          friend_email: friendEmail,
        });
        setComparison(data);
      } catch (error) {
        console.log('Comparison error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [friendEmail]);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="h-20 bg-zinc-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!comparison) {
    return null;
  }

  const stats = [
    { icon: Flame, label: 'Current Streak', you: comparison.your_streak, friend: comparison.friend_streak, unit: 'w' },
    { icon: Zap, label: 'Weekly Points', you: comparison.your_points, friend: comparison.friend_points, unit: '' },
    { icon: Trophy, label: 'Workouts', you: comparison.your_workouts, friend: comparison.friend_workouts, unit: '' },
    { icon: Award, label: 'Badges', you: comparison.your_badges, friend: comparison.friend_badges, unit: '' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6"
    >
      <h3 className="text-white font-bold text-lg mb-4">Accountability View</h3>
      <p className="text-zinc-400 text-sm mb-6">How you stack up with {friendName}.</p>

      <div className="space-y-3">
        {stats.map(({ icon: Icon, label, you, friend, unit }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-zinc-400">{label}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-bold text-sm">{you}{unit}</p>
                <p className="text-zinc-500 text-xs">You</p>
              </div>
              <div className="w-px h-8 bg-zinc-700" />
              <div className="text-right">
                <p className="text-white font-bold text-sm">{friend}{unit}</p>
                <p className="text-zinc-500 text-xs">{friendName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
        <p className="text-zinc-400 text-xs text-center">
          Push harder together. Accountability breeds consistency.
        </p>
      </div>
    </motion.div>
  );
}