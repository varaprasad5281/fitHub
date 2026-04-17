import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, TrendingUp, Crown, Users, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * LeaderboardPreview Component
 * 
 * Shows free users a glimpse of what they're missing:
 * - Top 5 global leaders (blurred/locked)
 * - Estimated rank if they upgrade
 * - Clear loss aversion messaging
 * 
 * Props:
 * - topLeaders: Array of leader data { rank, username, points, isProUser }
 * - estimatedRank: number (user's estimated rank if they had Pro)
 * - workoutsCompleted: number
 */
export default function LeaderboardPreview({ topLeaders = [], estimatedRank = null, workoutsCompleted = 0 }) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate(createPageUrl('Pricing'));
  };

  // Mock top leaders if not provided (for dev)
  const leaders = useMemo(() => {
    if (topLeaders.length > 0) return topLeaders;
    return [
      { rank: 1, username: 'Champion', points: 2850, isProUser: true },
      { rank: 2, username: 'Rising Star', points: 2640, isProUser: true },
      { rank: 3, username: 'Consistent', points: 2480, isProUser: true },
      { rank: 4, username: 'Dedicated', points: 2290, isProUser: true },
      { rank: 5, username: 'Focused', points: 2140, isProUser: true },
    ];
  }, [topLeaders]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Global Leaderboard Preview</p>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Top 5 Leaders</h3>
        <p className="text-sm text-zinc-500">Unlock the full leaderboard to compete with the 7%</p>
      </div>

      {/* Leaders Cards (Blurred/Locked) */}
      <div className="space-y-2 mb-6 relative">
        {leaders.slice(0, 5).map((leader, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative"
          >
            {/* Locked overlay */}
            <div className="absolute inset-0 rounded-lg bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center group cursor-not-allowed">
              <div className="flex flex-col items-center gap-1">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Unlock</span>
              </div>
            </div>

            {/* Card content (behind overlay) */}
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-between opacity-60 blur-sm">
              <div className="flex items-center gap-3">
                {/* Rank badge */}
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-amber-400">#{leader.rank}</span>
                </div>
                {/* Username */}
                <div>
                  <p className="text-sm font-semibold text-white">{leader.username}</p>
                  {leader.isProUser && (
                    <p className="text-xs text-amber-400 font-semibold">Pro Member</p>
                  )}
                </div>
              </div>
              {/* Points */}
              <div className="text-right">
                <p className="text-sm font-bold text-amber-400">{leader.points} pts</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Estimated Rank Section */}
      {estimatedRank && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 mb-6"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                You'd Rank #{estimatedRank}
              </p>
              <p className="text-xs text-zinc-400">
                Based on your {workoutsCompleted} completed workouts, this is your estimated position on the Pro leaderboard.
              </p>
              <p className="text-xs text-amber-400 font-semibold mt-2 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Upgrade now to see your exact rank
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Why Upgrade Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50 mb-6 space-y-3"
      >
        <div className="flex gap-3">
          <Users className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Compete with the committed</p>
            <p className="text-xs text-zinc-500">Real-time rankings against serious athletes</p>
          </div>
        </div>
        <div className="flex gap-3">
          <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Track your progress</p>
            <p className="text-xs text-zinc-500">Advanced analytics show your performance gaps</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Crown className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Prove your discipline</p>
            <p className="text-xs text-zinc-500">Show the world you're part of the 7%</p>
          </div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold py-3 h-auto rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200"
        >
          Unlock Leaderboard & Pro Features
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Trust signal */}
      <p className="text-xs text-center text-zinc-500 mt-4">
        Cancel anytime. No hidden fees.
      </p>
    </div>
  );
}