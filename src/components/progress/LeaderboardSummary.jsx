import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

export default function LeaderboardSummary({ leaderboard = {} }) {
  const { userRank, userWeeklyPoints, rankingBonus, top10 = [] } = leaderboard;

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-white font-semibold text-lg">Weekly Leaderboard</h3>
      </div>

      {userRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-sm">Your Rank</p>
              <p className="text-2xl font-bold text-white">#{userRank}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 text-sm">Weekly Points</p>
              <p className="text-2xl font-bold text-amber-400">{userWeeklyPoints}</p>
            </div>
            {rankingBonus > 0 && (
              <div className="text-right">
                <p className="text-zinc-500 text-sm">Bonus</p>
                <p className="text-2xl font-bold text-green-400">+{rankingBonus}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <p className="text-zinc-400 text-sm mb-3">Top 10</p>
      <div className="space-y-2">
        {top10.slice(0, 10).map((user, idx) => {
          const medal = getMedalEmoji(user.rank);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`p-3 rounded-lg flex items-center justify-between ${
                user.isCurrentUser ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-zinc-800/50 border border-zinc-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-center font-bold text-sm">
                  {medal || user.rank}
                </div>
                <div>
                  <p className={`font-medium text-sm ${user.isCurrentUser ? 'text-amber-400' : 'text-white'}`}>
                    {user.username}
                  </p>
                  <p className="text-zinc-500 text-xs">Lvl {user.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {user.weeklyPoints}
                </p>
                <p className="text-zinc-500 text-xs">{user.totalPoints.toLocaleString()} total</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}