import React from 'react';

export default function FriendsLeaderboard({ friendEmails, leaderboard, timeframe, user, subscription }) {
  const friendsData = leaderboard.filter(entry => 
    friendEmails.includes(entry.created_by)
  );

  if (friendsData.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 text-center">
        <p className="text-zinc-500">None of your friends are on the leaderboard yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friendsData.map((entry, index) => {
        const isCurrentUser = entry.created_by === user?.email;

        return (
          <div
            key={entry.id}
            className={`rounded-xl border p-3 sm:p-4 flex items-center gap-3 sm:gap-4 ${
              isCurrentUser
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-zinc-800 bg-zinc-900/50'
            }`}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
              #{index + 1}
            </div>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
              {entry.profile_picture_url ? (
                <img
                  src={entry.profile_picture_url}
                  alt={entry.username}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="text-zinc-400 font-semibold">
                  {entry.username?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {entry.username || 'Anonymous'}
                {isCurrentUser && <span className="ml-2 text-amber-400 text-xs">(You)</span>}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-white">
                  {timeframe === 'weekly' ? entry.weekly_points : entry.total_points}
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">pts</p>
              </div>
              {subscription?.plan === 'elite_monthly' || subscription?.plan === 'elite_yearly' ? (
                subscription?.status === 'active' && (
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-black rounded-lg"
                    onClick={() => window.location.href = '/Chat'}
                  >
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                )
              ) : (
                <Button
                  size="sm"
                  disabled
                  className="bg-zinc-800 text-zinc-500 rounded-lg"
                >
                  <Lock className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}