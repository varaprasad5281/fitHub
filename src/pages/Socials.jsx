import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Users, MessageCircle, Loader2, UserPlus, Trophy, Check, X } from 'lucide-react';
import { activeSub, hasEliteAccess as checkElite } from '@/lib/subscriptionUtils';
import SocialsPreview from '@/components/conversion/SocialsPreview';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AddFriendForm from '@/components/friends/AddFriendForm';
import FriendsList from '@/components/friends/FriendsList';
import ChatWindow from '@/components/friends/ChatWindow';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { BadgeMiniRow } from '@/components/badges/BadgeTooltip';

export default function SocialsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null); // email string
  const [activeTab, setActiveTab] = useState('friends');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me(),
  });

  const { data: subscription = [], isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    staleTime: 1000 * 60 * 5,
  });

  // Friends list — uses the correct function route
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', 'accepted'],
    queryFn: async () => {
      const response = await api.functions.invoke('getFriendsList', { type: 'accepted' });
      return response?.friends || [];
    },
    staleTime: 0,
    refetchOnMount: true,
    enabled: !!user,
  });

  // Pending incoming requests
  const { data: incoming = [], isLoading: incomingLoading } = useQuery({
    queryKey: ['friendRequests', 'incoming'],
    queryFn: async () => {
      const response = await api.functions.invoke('getFriendsList', { type: 'pending' });
      return (response?.friends || []).filter(f => !f.is_requester);
    },
    staleTime: 1000 * 30,
    refetchOnMount: true,
    enabled: !!user,
  });

  // Pending outgoing requests
  const { data: outgoing = [], isLoading: outgoingLoading } = useQuery({
    queryKey: ['friendRequests', 'outgoing'],
    queryFn: async () => {
      const response = await api.functions.invoke('getFriendsList', { type: 'pending' });
      return (response?.friends || []).filter(f => f.is_requester);
    },
    staleTime: 1000 * 30,
    refetchOnMount: true,
    enabled: !!user,
  });

  const acceptMutation = useMutation({
    mutationFn: async (request) => {
      await api.functions.invoke('friendRequest', { action: 'accept', target_email: request.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Friend added!');
    },
    onError: () => toast.error('Failed to accept request'),
  });

  const declineMutation = useMutation({
    mutationFn: async (request) => {
      await api.functions.invoke('friendRequest', { action: 'reject', target_email: request.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      toast.success('Request declined.');
    },
    onError: () => toast.error('Failed to decline request'),
  });

  // Current user's own points + profile for leaderboard self-comparison
  const { data: myPoints } = useQuery({
    queryKey: ['my-points'],
    queryFn: async () => {
      const pts = await api.entities.Points.list();
      return pts?.[0] || {};
    },
    staleTime: 1000 * 60,
    enabled: !!user,
  });

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const profiles = await api.entities.Profile.list();
      return profiles?.[0] || {};
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  // Featured badges for everyone on the leaderboard (self + friends)
  const leaderboardEmails = [user?.email, ...friends.map(f => f.email)].filter(Boolean);
  const { data: socialBadgeMap = {} } = useQuery({
    queryKey: ['socials-featured-badges', leaderboardEmails.join(',')],
    queryFn: async () => {
      const res = await api.functions.invoke('getBadges', { action: 'bulk_featured', emails: leaderboardEmails });
      return res?.data || {};
    },
    enabled: leaderboardEmails.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Conversations list with unread counts — polls every 10 s so user sees new messages automatically
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.functions.invoke('chatMessage', { action: 'conversations' });
      return res?.conversations || [];
    },
    staleTime: 0,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    enabled: !!user,
  });

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const hasEliteAccess = checkElite(activeSub(Array.isArray(subscription) ? subscription : []));

  if (subLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!hasEliteAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Social</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Unlock Your Circle 👥</h1>
            <p className="text-zinc-500">Connect with serious athletes — upgrade Elite to build your network</p>
          </div>
          <SocialsPreview />
        </div>
      </div>
    );
  }

  // Build leaderboard: current user + all friends, sorted by weekly_points
  const myEntry = {
    email: user?.email,
    username: myProfile?.username || user?.email?.split('@')[0] || 'You',
    avatar_url: myProfile?.profile_picture_url || null,
    level: myPoints?.level || 1,
    weekly_points: myPoints?.weekly_points || 0,
    isMe: true,
  };
  const leaderboard = [myEntry, ...friends]
    .sort((a, b) => (b.weekly_points || 0) - (a.weekly_points || 0));

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6 pb-20 sm:pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Social</p>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Circle</h1>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-4 h-10"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Add Friend
            </Button>
          </div>
        </div>

        {/* Add Friend Form (inline, shown on toggle) */}
        {showAddForm && (
          <div className="mb-6">
            <AddFriendForm
              onSent={() => {
                setShowAddForm(false);
                queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
              }}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full bg-zinc-900/50 border border-zinc-800 mb-6 grid grid-cols-4 rounded-xl overflow-hidden p-0">
            <TabsTrigger value="friends" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-none h-full py-2.5 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:shadow-none">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] sm:text-sm leading-tight">
                <span className="hidden sm:inline">Friends </span>
                {!friendsLoading && <span className="text-[10px] sm:text-xs opacity-70">({friends.length})</span>}
              </span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-none h-full py-2.5 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:shadow-none">
              <UserPlus className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] sm:text-sm leading-tight">
                <span className="hidden sm:inline">Requests </span>
                {!incomingLoading && incoming.length > 0 && (
                  <span className="text-[10px] sm:text-xs opacity-70">({incoming.length})</span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-none h-full py-2.5 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:shadow-none">
              <Trophy className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] sm:text-sm leading-tight">Board</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-none h-full py-2.5 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:shadow-none">
              <div className="relative flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 leading-none">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-sm leading-tight">Chat</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Friends Tab ── */}
          <TabsContent value="friends">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Your Circle</h3>
              <FriendsList onChatClick={(email) => { setSelectedChat(email); setActiveTab('chat'); }} />
            </div>
          </TabsContent>

          {/* ── Requests Tab ── */}
          <TabsContent value="requests" className="space-y-4">
            {/* Incoming */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
                Incoming {incoming.length > 0 && `(${incoming.length})`}
              </h3>
              {incomingLoading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : incoming.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-zinc-400 font-semibold mb-1">No requests right now.</p>
                  <p className="text-xs text-zinc-600">Keep building your circle.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {incoming.map((request, idx) => (
                    <motion.div
                      key={request.id || request.email}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-green-500/20"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {request.profile_picture ? (
                          <img src={request.profile_picture} alt={request.username} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                            {(request.username || request.email || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {request.username || request.friend_name || request.email}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Button
                          onClick={() => acceptMutation.mutate(request)}
                          disabled={acceptMutation.isPending || declineMutation.isPending}
                          className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => declineMutation.mutate(request)}
                          disabled={acceptMutation.isPending || declineMutation.isPending}
                          variant="outline"
                          className="h-8 px-3 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
                Sent {outgoing.length > 0 && `(${outgoing.length})`}
              </h3>
              {outgoingLoading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : outgoing.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No sent requests pending.</p>
              ) : (
                <div className="space-y-2">
                  {outgoing.map((request, idx) => (
                    <motion.div
                      key={request.id || request.email}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                          {(request.username || request.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {request.username || request.friend_name || request.email}
                          </p>
                          <p className="text-xs text-zinc-500">{request.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full ml-2">Pending</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Leaderboard Tab ── */}
          <TabsContent value="leaderboard">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                This Week's Rankings
              </h3>
              {friendsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, idx) => (
                    <motion.div
                      key={entry.email}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        entry.isMe
                          ? 'bg-zinc-800/80 border-zinc-500/50 ring-1 ring-zinc-500/30'
                          : idx === 0
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : idx === 1
                          ? 'bg-zinc-800/60 border-zinc-600/40'
                          : idx === 2
                          ? 'bg-zinc-800/40 border-zinc-700/40'
                          : 'bg-zinc-800/30 border-zinc-800/50'
                      }`}
                    >
                      <span className={`text-lg font-bold w-8 text-center flex-shrink-0 ${
                        idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-700' : 'text-zinc-600'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt={entry.username} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${entry.isMe ? 'bg-amber-600' : 'bg-zinc-700'}`}>
                          {(entry.username || entry.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-white truncate">{entry.username || entry.email}</p>
                          {entry.isMe && (
                            <span className="text-[10px] font-bold bg-zinc-600 text-zinc-300 px-1.5 py-0.5 rounded-full flex-shrink-0">YOU</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-zinc-500">Level {entry.level || 1}</p>
                          <BadgeMiniRow badges={socialBadgeMap[entry.email] || []} size="xs" align="left" above={true} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-amber-400">{(entry.weekly_points || 0).toLocaleString()}</p>
                        <p className="text-xs text-zinc-600">pts this week</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Chat Tab ── */}
          <TabsContent value="chat">
            {selectedChat ? (
              <ChatWindow
                friendEmail={selectedChat}
                onClose={() => {
                  setSelectedChat(null);
                  // Refresh conversation list so unread counts update
                  queryClient.invalidateQueries({ queryKey: ['conversations'] });
                }}
              />
            ) : friends.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                <MessageCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 mb-2">No friends to chat with yet</p>
                <p className="text-xs text-zinc-600">Add friends first, then start a conversation.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Messages</h3>
                <div className="space-y-2">
                  {/* Active conversations with last message + unread count */}
                  {conversations.length > 0 && conversations.map((conv) => {
                    const hasUnread = conv.unread_count > 0;
                    const timeStr = conv.last_message_at
                      ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <button
                        key={conv._id}
                        onClick={() => setSelectedChat(conv.friend_email)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                          hasUnread
                            ? 'bg-zinc-800/80 border-amber-500/30 hover:border-amber-500/50'
                            : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          {conv.friend_avatar ? (
                            <img src={conv.friend_avatar} alt={conv.friend_username} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white">
                              {(conv.friend_username || conv.friend_email || '?')[0].toUpperCase()}
                            </div>
                          )}
                          {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 leading-none">
                              {conv.unread_count > 9 ? '9+' : conv.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${hasUnread ? 'font-bold text-white' : 'font-semibold text-white'}`}>
                              {conv.friend_username || conv.friend_email}
                            </p>
                            {timeStr && (
                              <span className={`text-[10px] flex-shrink-0 ${hasUnread ? 'text-amber-400 font-semibold' : 'text-zinc-600'}`}>
                                {timeStr}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs truncate ${hasUnread ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            {conv.last_message_preview || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  {/* Friends without an existing conversation */}
                  {friends
                    .filter(f => !conversations.some(c => c.friend_email === f.email))
                    .map((friend) => (
                      <button
                        key={friend.id || friend.email}
                        onClick={() => setSelectedChat(friend.email)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50 hover:bg-zinc-800/60 hover:border-zinc-700 transition-colors text-left"
                      >
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt={friend.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-white">
                            {(friend.username || friend.email || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{friend.username || friend.email}</p>
                          <p className="text-xs text-zinc-600 truncate">Start a conversation</p>
                        </div>
                        <MessageCircle className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}