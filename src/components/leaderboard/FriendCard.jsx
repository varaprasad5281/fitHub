import React, { useState } from 'react';
import { api } from '@/api/client';
import { MessageCircle, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function FriendCard({ friend, leaderboardEntry, subscription, user }) {
  const [loading, setLoading] = useState(false);

  const isElite = subscription?.plan === 'elite_monthly' || subscription?.plan === 'elite_yearly';
  const isActive = subscription?.status === 'active';
  const hasChat = isElite && isActive;

  const handleChat = async () => {
    if (!hasChat) return;

    setLoading(true);
    try {
      const { data } = await api.functions.invoke('initializeChat', {
        friendEmail: friend.friend_email
      });

      // Navigate to chat page with the chat ID
      window.location.href = createPageUrl('Chat');
    } catch (error) {
      toast.error('Failed to open chat');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    setLoading(true);
    try {
      await api.functions.invoke('manageFriendRequest', {
        action: 'remove',
        friendEmail: friend.friend_email
      });
      toast.success('Friend removed');
    } catch (error) {
      toast.error('Failed to remove friend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 group">
      <div className="flex items-center gap-3 mb-3">
        {leaderboardEntry?.profile_picture_url ? (
          <img
            src={leaderboardEntry.profile_picture_url}
            alt={leaderboardEntry.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <span className="text-amber-400 font-semibold text-sm">
              {leaderboardEntry?.username?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{leaderboardEntry?.username || 'Anonymous'}</p>
          <p className="text-zinc-500 text-xs">{friend.connected_date}</p>
        </div>
      </div>

      <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Points</p>
        <p className="text-lg font-bold text-amber-400">{leaderboardEntry?.weekly_points || 0}</p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleChat}
          disabled={loading || !hasChat}
          className={`flex-1 ${
            hasChat
              ? 'bg-amber-500 hover:bg-amber-600 text-black font-semibold'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {!hasChat ? (
            <>
              <Lock className="w-4 h-4 mr-2" /> Elite Only
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 mr-2" /> Chat
            </>
          )}
        </Button>
        <Button
          onClick={handleRemoveFriend}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          size="icon"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}