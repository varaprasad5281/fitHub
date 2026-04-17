import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Trash2, MessageCircle, Lock, Loader2, UserPlus } from 'lucide-react';
import SocialsPreview from '@/components/conversion/SocialsPreview';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import AddFriendForm from '@/components/friends/AddFriendForm';
import FriendRequestCard from '@/components/friends/FriendRequestCard';
import ChatWindow from '@/components/chat/ChatWindow';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FriendLeaderboard from '@/components/social/FriendLeaderboard';

export default function SocialsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    initialData: [],
  });

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: () => api.entities.Friend.filter({ status: 'connected' }),
    enabled: !!user,
  });

  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => api.entities.FriendRequest.filter({
      recipient_email: user?.email,
      status: 'pending'
    }),
    enabled: !!user,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.entities.Profile.list('-created_date', 100),
    initialData: [],
  });

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const allChats = await api.entities.Chat.list('-last_message_date', 50);
      return allChats.filter(
        chat => chat.participant_1_email === user?.email || chat.participant_2_email === user?.email
      );
    },
    enabled: !!user,
  });

  const { data: friendsPoints = [] } = useQuery({
    queryKey: ['friends-points', friends?.map(f => f.friend_email)],
    queryFn: async () => {
      if (!friends || friends.length === 0) return [];
      const allPoints = await api.entities.Points.list();
      return friends.map(f => {
        const points = allPoints.find(p => p.created_by === f.friend_email);
        return { ...f, points: [points] || [] };
      });
    },
    enabled: !!friends && friends.length > 0,
  });

  const { data: friendsStreaks = [] } = useQuery({
    queryKey: ['friends-streaks', friends?.map(f => f.friend_email)],
    queryFn: async () => {
      if (!friends || friends.length === 0) return [];
      const allStreaks = await api.entities.Streak.list();
      return friends.map(f => {
        const streak = allStreaks.find(s => s.created_by === f.friend_email);
        return { ...f, streaks: [streak] || [] };
      });
    },
    enabled: !!friends && friends.length > 0,
  });

  const sub = subscription[0];
  const isElite = sub?.plan === 'elite_monthly' || sub?.plan === 'elite_yearly';
  const isActive = sub?.status === 'active' || (sub?.status === 'cancelled' && sub?.end_date && new Date(sub.end_date) > new Date());
  const hasEliteAccess = isElite && isActive;
  const hasChat = hasEliteAccess;

  const handleUnfriend = async (friendEmail) => {
    try {
      const friendRecord = friends.find(f => f.friend_email === friendEmail);
      if (friendRecord) {
        await api.entities.Friend.delete(friendRecord.id);
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        toast.success('Friend removed');
      }
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  if (friendsLoading || requestsLoading || chatsLoading) {
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

  const friendProfiles = friends.map(f => {
    const profile = profiles.find(p => p.created_by === f.friend_email);
    return { ...f, profile };
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Social</p>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Social</h1>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-4 h-10"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Add Friend
            </Button>
          </div>
        </div>

        {/* Tabs */}
         <Tabs defaultValue="friends" className="mb-8">
            <TabsList className="bg-zinc-900/50 border border-zinc-800 mb-6">
              <TabsTrigger value="friends" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
                <Users className="w-4 h-4 mr-2" /> Friends ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
                <UserPlus className="w-4 h-4 mr-2" /> Requests ({friendRequests.length})
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
                <Users className="w-4 h-4 mr-2" /> Leaderboard
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </TabsTrigger>
            </TabsList>

           {/* Friends Tab */}
           <TabsContent value="friends">
            {showAddForm && (
              <div className="mb-6">
                <AddFriendForm
                  onSent={() => {
                    setShowAddForm(false);
                    queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
                  }}
                />
              </div>
            )}

            {friends.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 mb-6">No friends yet. Start connecting!</p>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-6"
                >
                  Add Your First Friend
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friendProfiles.map(friend => (
                  <div
                    key={friend.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {friend.profile?.profile_picture_url ? (
                            <img
                              src={friend.profile.profile_picture_url}
                              alt={friend.profile?.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate">
                            {friend.profile?.username || 'User'}
                          </p>
                          <p className="text-zinc-500 text-xs">Connected {friend.connected_date}</p>
                        </div>
                      </div>
                    </div>

                    {friend.profile?.bio && (
                      <p className="text-zinc-400 text-xs mb-4 line-clamp-2">
                        {friend.profile.bio}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {hasChat ? (
                        <Button
                          size="sm"
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-xs"
                          onClick={() => {
                            // Switch to chat tab
                            const chatTab = document.querySelector('[value="chat"]');
                            chatTab?.click();
                          }}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" /> Chat
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          className="flex-1 bg-zinc-800 text-zinc-500 rounded-lg text-xs"
                        >
                          <Lock className="w-3 h-3 mr-1" /> Elite
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnfriend(friend.friend_email)}
                        className="border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 rounded-lg"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
            {friends.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">Add friends to see the leaderboard</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <FriendLeaderboard 
                    friendProfiles={friendProfiles.map(f => ({
                      ...f,
                      points: friendsPoints.find(fp => fp.id === f.id)?.points || [],
                      streaks: friendsStreaks.find(fs => fs.id === f.id)?.streaks || []
                    }))}
                  />
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <p className="text-white font-semibold mb-4">About</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Your Rank</p>
                      <p className="text-2xl font-bold text-amber-400">#1</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Friend Count</p>
                      <p className="text-2xl font-bold text-blue-400">{friends.length}</p>
                    </div>
                    <div className="pt-3 border-t border-zinc-800">
                      <p className="text-zinc-500 text-xs">Compete with friends to climb the ranks!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests">
            {friendRequests.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                <UserPlus className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendRequests.map(request => (
                  <FriendRequestCard
                    key={request.id}
                    request={request}
                    onRespond={() => {
                      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
                      queryClient.invalidateQueries({ queryKey: ['friends'] });
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            {!hasChat ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Elite Feature</h2>
                <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                  Chat with your friends is exclusively available for Elite tier members. Upgrade now to start messaging.
                </p>
                <Link to={createPageUrl('Subscription')}>
                  <Button className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-8">
                    Upgrade to Elite
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <div className="lg:col-span-1">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 max-h-96 overflow-y-auto momentum-scroll">
                    {chats.length === 0 ? (
                      <p className="text-zinc-500 text-sm text-center py-8">No conversations yet</p>
                    ) : (
                      <div className="space-y-2">
                        {chats.map(chat => {
                          const otherEmail = chat.participant_1_email === user?.email 
                            ? chat.participant_2_email 
                            : chat.participant_1_email;
                          const otherName = chat.participant_1_email === user?.email
                            ? chat.participant_2_username
                            : chat.participant_1_username;
                          const isSelected = selectedChat?.id === chat.id;

                          return (
                            <button
                              key={chat.id}
                              onClick={() => setSelectedChat(chat)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-amber-500/10 border border-amber-500/30'
                                  : 'hover:bg-zinc-800/50'
                              }`}
                            >
                              <p className="text-white font-medium text-sm">{otherName}</p>
                              <p className="text-zinc-500 text-xs truncate">{chat.last_message}</p>
                              <p className="text-zinc-600 text-xs mt-1">
                                {new Date(chat.last_message_date).toLocaleDateString('en-GB', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Window */}
                <div className="lg:col-span-2">
                  {selectedChat ? (
                    <div>
                      <div className="mb-4 p-4 border-b border-zinc-800">
                        <h2 className="text-white font-semibold">
                          {selectedChat.participant_1_email === user?.email
                            ? selectedChat.participant_2_username
                            : selectedChat.participant_1_username}
                        </h2>
                      </div>
                      <ChatWindow
                        chatId={selectedChat.id}
                        friendName={selectedChat.participant_1_email === user?.email
                          ? selectedChat.participant_2_username
                          : selectedChat.participant_1_username}
                        friendEmail={selectedChat.participant_1_email === user?.email
                          ? selectedChat.participant_2_email
                          : selectedChat.participant_1_email}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center h-96 flex items-center justify-center">
                      <div>
                        <MessageCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500">Select a conversation to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}