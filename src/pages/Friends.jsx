/**
 * Friends Page
 * Complete friends + chat + activity system
 */

import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Activity, LogIn, Sparkles } from 'lucide-react';
import SocialsPreview from '@/components/conversion/SocialsPreview';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import UserSearch from '@/components/friends/UserSearch';
import FriendsList from '@/components/friends/FriendsList';
import FriendRequests from '@/components/friends/FriendRequests';
import ChatWindow from '@/components/friends/ChatWindow';
import FriendsActivityFeed from '@/components/friends/FriendsActivityFeed';
import FriendOnboarding from '@/components/friends/FriendOnboarding';
import SuggestedFriendsCard from '@/components/friends/SuggestedFriendsCard';
import FriendSocialNudge from '@/components/friends/FriendSocialNudge';

export default function FriendsPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [suggested, setSuggested] = useState([]);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    staleTime: 1000 * 60 * 5,
  });
  const sub = subscriptions[0];
  const isElite = sub?.plan === 'elite_monthly' || sub?.plan === 'elite_yearly';
  const isActive = sub?.status === 'active' || sub?.status === 'trial' || (sub?.status === 'cancelled' && sub?.end_date && new Date(sub.end_date) > new Date());
  const hasEliteAccess = isElite && isActive;

  // Check auth and load suggested friends
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await api.auth.isAuthenticated();
        if (authenticated) {
          const userData = await api.auth.me();
          setUser(userData);

          // Fetch suggested friends
          const friendships = await api.entities.Friendship.filter({
            requester_email: userData.email,
            status: 'accepted',
          });
          
          // Show onboarding if no friends yet
          if (friendships.length === 0) {
            const shownOnboarding = localStorage.getItem('friend_onboarding_shown');
            if (!shownOnboarding) {
              setShowOnboarding(true);
              localStorage.setItem('friend_onboarding_shown', 'true');
            }
          }

          // Load suggestions - server returns { data: [...] }
          const suggestRes = await api.functions.invoke('suggestedFriends');
          setSuggested(suggestRes?.data || []);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 flex items-center justify-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 max-w-md text-center">
          <LogIn className="w-8 h-8 text-zinc-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to build your circle</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Log in to connect with friends and stay accountable.
          </p>
          <Link to={createPageUrl('QuickLogin')}>
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg h-10">
              Sign In
            </Button>
          </Link>
        </div>
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
              <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Friends</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Unlock Your Circle 👥</h1>
            <p className="text-zinc-500">Connect with serious athletes - upgrade Elite to build your network</p>
          </div>
          <SocialsPreview />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 pb-20 sm:pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
         <div className="mb-6">
           <div className="flex items-center gap-2 mb-2">
             <Users className="w-5 h-5 text-amber-400" />
             <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold">
               Accountability
             </p>
           </div>
           <h1 className="text-3xl font-bold text-white">Your Circle</h1>
           <p className="text-sm text-zinc-400 mt-1">
             Build your accountability network. Progress is easier with commitment.
           </p>
         </div>

         <Tabs defaultValue="friends" className="w-full">
           <TabsList className="bg-zinc-800 rounded-lg p-1 grid w-full grid-cols-4 mb-4">
             <TabsTrigger value="friends" className="text-xs sm:text-sm">Friends</TabsTrigger>
             <TabsTrigger value="requests" className="text-xs sm:text-sm">Requests</TabsTrigger>
             <TabsTrigger value="chat" className="text-xs sm:text-sm">Messages</TabsTrigger>
             <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4">
            {/* Suggested Friends */}
            {suggested.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Suggested
                  </h3>
                </div>
                <div className="space-y-3">
                  {suggested.slice(0, 5).map((suggestion) => (
                    <SuggestedFriendsCard
                      key={suggestion.email}
                      suggestion={suggestion}
                      onAddFriend={() => {
                        api.functions.invoke('friendRequest', { target_email: suggestion.email });
                        setSuggested(suggested.filter(s => s.email !== suggestion.email));
                      }}
                      isLoading={false}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Search */}
            <UserSearch />

            {/* Friends List */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
                Your Circle
              </h3>
              <FriendsList onChatClick={(email) => {
                setSelectedChat(email);
              }} />
            </motion.div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
                Friend Requests
              </h3>
              <FriendRequests />
            </motion.div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="chat" className="space-y-4">
            {selectedChat ? (
              <ChatWindow
                friendEmail={selectedChat}
                onClose={() => setSelectedChat(null)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-zinc-600 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">No message selected</h3>
                  <p className="text-sm text-zinc-500 text-center max-w-sm mb-4">
                    Select a friend from your circle to start a conversation.
                  </p>
                  <button
                    onClick={() => {
                      // Switch to friends tab
                      const friendsBtn = document.querySelector('[value="friends"]');
                      friendsBtn?.click();
                    }}
                    className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                  >
                    Go to Friends →
                  </button>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Accountability Stream
              </h3>
              <FriendsActivityFeed />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Friend Onboarding Modal */}
        <AnimatePresence>
          {showOnboarding && (
            <FriendOnboarding
              onComplete={() => setShowOnboarding(false)}
              onSkip={() => setShowOnboarding(false)}
            />
          )}
        </AnimatePresence>

        {/* Friend Social Nudge */}
        {user && (
          <FriendSocialNudge
            userEmail={user.email}
            onNudgeAction={() => setShowOnboarding(true)}
          />
        )}
        </div>
        </div>
        );
        }