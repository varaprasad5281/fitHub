/**
 * FriendsLeaderboard
 * Accepts a pre-built, pre-sorted `friends` array from getFriendsList
 * (shape: { email, username, avatar_url, level, weekly_points, isMe? })
 * and renders it.  Both Leaderboard.jsx and Socials.jsx use the same
 * data source so the numbers always match.
 *
 * Featured badges are fetched in one bulk call and shown as hoverable
 * mini-icons beneath each user's name.
 */
import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BadgeMiniRow } from '@/components/badges/BadgeTooltip';

export default function FriendsLeaderboard({ friends = [], hasEliteAccess = false }) {
  const [imgErrors, setImgErrors] = useState(new Set());
  const markImgError = (email) => setImgErrors(prev => new Set([...prev, email]));

  // Bulk-fetch featured badges for every entry in one round-trip
  const emails = friends.map(f => f.email).filter(Boolean);
  const { data: badgeMap = {} } = useQuery({
    queryKey: ['leaderboard-featured-badges', emails.join(',')],
    queryFn: async () => {
      const res = await api.functions.invoke('getBadges', { action: 'bulk_featured', emails });
      return res?.data || {};
    },
    enabled: emails.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  if (friends.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 text-center">
        <p className="text-zinc-500">Add friends to see how you compare this week.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((entry, index) => {
        const entryBadges = badgeMap[entry.email] || [];
        return (
          <div
            key={entry.email}
            className={`rounded-xl border p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-colors ${
              entry.isMe
                ? 'border-zinc-500/50 bg-zinc-800/80 ring-1 ring-zinc-500/30'
                : 'border-zinc-800 bg-zinc-900/50'
            }`}
          >
            {/* Rank */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </div>

            {/* Avatar */}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${entry.avatar_url && !imgErrors.has(entry.email) ? (entry.isMe ? 'bg-amber-600' : 'bg-zinc-700') : 'bg-amber-500/20'}`}>
              {entry.avatar_url && !imgErrors.has(entry.email) ? (
                <img
                  src={entry.avatar_url}
                  alt={entry.username}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={() => markImgError(entry.email)}
                />
              ) : (
                <span className="text-amber-400 font-bold text-sm">
                  {(entry.username || entry.email || '?')[0].toUpperCase()}
                </span>
              )}
            </div>

            {/* Name + YOU pill + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-medium text-sm truncate">
                  {entry.username || entry.email || 'Anonymous'}
                </p>
                {entry.isMe && (
                  <span className="text-[10px] font-bold bg-zinc-600 text-zinc-300 px-1.5 py-0.5 rounded-full flex-shrink-0">YOU</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-zinc-500 text-xs">Level {entry.level || 1}</p>
                {entryBadges.length > 0 && (
                  <BadgeMiniRow badges={entryBadges} size="xs" align="left" above={true} />
                )}
              </div>
            </div>

            {/* Points + chat button */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-amber-400">
                  {(entry.weekly_points || 0).toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">pts</p>
              </div>

              {!entry.isMe && (
                hasEliteAccess ? (
                  <Link to={`${createPageUrl('Socials')}?chat=${entry.email}`}>
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-black rounded-lg"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    disabled
                    className="bg-zinc-800 text-zinc-500 rounded-lg"
                    title="Elite only"
                  >
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
