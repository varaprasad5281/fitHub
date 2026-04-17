import React from 'react';
import { Medal, Trophy, Flame } from 'lucide-react';

export default function FriendLeaderboard({ friendProfiles }) {
  const sortedFriends = [...friendProfiles].sort((a, b) => {
    const pointsA = a.points?.[0]?.total_points || 0;
    const pointsB = b.points?.[0]?.total_points || 0;
    return pointsB - pointsA;
  });

  const getMedalIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="text-lg font-bold text-zinc-500">#{rank + 1}</span>;
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h3 className="text-white font-semibold">Friends Leaderboard</h3>
      </div>

      <div className="space-y-2">
        {sortedFriends.map((friend, rank) => {
          const points = friend.points?.[0]?.total_points || 0;
          const streak = friend.streaks?.[0]?.current_streak || 0;

          return (
            <div
              key={friend.id}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8">
                  {getMedalIcon(rank)}
                </div>
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {friend.profile?.profile_picture_url ? (
                      <img
                        src={friend.profile.profile_picture_url}
                        alt={friend.profile?.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-zinc-400">
                        {friend.profile?.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {friend.profile?.username || 'User'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-zinc-400 text-sm">{streak}w</span>
                </div>
                <span className="text-amber-400 font-semibold text-sm min-w-12">
                  {points.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}