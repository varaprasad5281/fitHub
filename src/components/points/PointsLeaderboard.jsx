import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function PointsLeaderboard({ leaderboard = [], isLoading = false, currentUserEmail = '' }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (rank === 2) return 'text-gray-300 bg-gray-500/10 border-gray-500/30';
    if (rank === 3) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Weekly Leaderboard</p>
        </div>
        <p className="text-white font-semibold text-lg">This Week's Rankings</p>
      </div>

      {/* Leaderboard list */}
      {leaderboard.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-zinc-500">No leaderboard data available yet</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {leaderboard.slice(0, 20).map((user, idx) => {
            const rank = idx + 1;
            const medal = getMedalEmoji(rank);
            const rankColor = getRankColor(rank);
            const isCurrent = currentUserEmail && user.email === currentUserEmail;

            return (
              <motion.div
                key={rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`p-4 flex items-center justify-between transition-all ${
                  isCurrent ? 'bg-amber-500/10 border-l-4 border-l-amber-400' : 'hover:bg-zinc-800/30'
                }`}
              >
                {/* Left side: rank and user */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank badge */}
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-center ${rankColor}`}>
                    {medal ? (
                      <span className="text-lg">{medal}</span>
                    ) : (
                      <span className="text-lg">{rank}</span>
                    )}
                  </div>

                  {/* User info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{user.username}</p>
                      {user.level >= 5 && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-semibold">
                          L{user.level}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-sm">{user.totalPoints.toLocaleString()} total points</p>
                  </div>
                </div>

                {/* Right side: weekly points */}
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <p className="text-amber-400 font-bold">{user.weeklyPoints}</p>
                  </div>
                  {user.rankingBonus > 0 && (
                    <p className="text-green-400 text-xs">+{user.rankingBonus} bonus</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}