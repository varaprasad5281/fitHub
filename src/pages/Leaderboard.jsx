import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, Crown, Lock, Loader2, Users, TrendingUp } from "lucide-react";
import { activeSub, hasEliteAccess } from '@/lib/subscriptionUtils';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PodiumDisplay from "@/components/leaderboard/PodiumDisplay";

import { Skeleton } from "@/components/ui/skeleton";
import AddFriendForm from "@/components/friends/AddFriendForm";
import FriendRequestCard from "@/components/friends/FriendRequestCard";
import FriendsLeaderboard from "@/components/leaderboard/FriendsLeaderboard";
import ProUpsellModalEnhanced from "@/components/conversion/ProUpsellModalEnhanced";
import LeaderboardPreview from "@/components/conversion/LeaderboardPreview";

export default function Leaderboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('global');

  // Reset scroll when switching between Global and Friends tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' or 'alltime'
  const [category, setCategory] = useState('points'); // 'points', 'workouts', 'nutrition', 'streaks'
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellTrigger, setUpsellTrigger] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me(),
  });

  const { data: subscriptions, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    initialData: [],
    staleTime: 1000 * 60 * 5,
  });

  // PERFORMANCE: Use cached backend endpoint with real-time updates
   const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
     queryKey: ['leaderboard-cached', timeframe, category],
     queryFn: async () => {
       const { data } = await api.functions.invoke('getLeaderboardCachedSecure', {
         timeframe,
         category
       });
       return data;
     },
     enabled: true,
     initialData: { leaderboard: [], user_rank: 0 },
     staleTime: 1000 * 30, // Refresh every 30s for real-time feel
     gcTime: 1000 * 60 * 10,
     refetchOnWindowFocus: true,
     refetchInterval: 1000 * 30, // Auto-refresh every 30s
   });

   // Real-time updates on points changes
   useEffect(() => {
     if (!user?.email) return;

     const unsubscribe = api.entities.Points.subscribe(() => {
       queryClient.invalidateQueries({ queryKey: ['leaderboard-cached'] });
     });

     return unsubscribe;
   }, [user?.email, queryClient]);

  // Friends leaderboard data
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: () => api.entities.Friend.filter({ status: 'connected' }),
    enabled: !!user,
  });

  // Friend requests data
  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => api.entities.FriendRequest.filter({ 
      recipient_email: user?.email,
      status: 'pending'
    }),
    enabled: !!user,
  });

  const subscription = activeSub(subscriptions);
  const isPending = subscription?.status === 'pending';

  // Leaderboard is Elite-only; use shared utility for consistent access check
  const hasAccess = !isPending && hasEliteAccess(subscription);

  // Check for upsell triggers
  useEffect(() => {
    // Only check if user has no access, user data is available, and leaderboard data is loaded
    if (!hasAccess && user && leaderboardData && leaderboardData.user_rank > 0) {
      const userRankFromBackend = leaderboardData.user_rank; // This is the current user's rank

      // Trigger upsell if user is in top 10 AND they don't have access
      if (userRankFromBackend > 0 && userRankFromBackend <= 10) {
        const hasShownUpsell = sessionStorage.getItem('upsell_top_10');
        if (!hasShownUpsell) {
          setUpsellTrigger('top_10');
          setShowUpsell(true);
          sessionStorage.setItem('upsell_top_10', 'true');
        }
      }
    }
  }, [hasAccess, user, leaderboardData]); // Now depends on leaderboardData

  // Optimized loading state
  if (subLoading || (leaderboardLoading && !leaderboardData?.leaderboard?.length)) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="h-10 w-48 bg-zinc-800/50 rounded-lg mb-6 animate-pulse" />
            <div className="flex gap-2 mb-6">
              <div className="h-10 w-24 bg-zinc-800/50 rounded-full animate-pulse" />
              <div className="h-10 w-24 bg-zinc-800/50 rounded-full animate-pulse" />
            </div>
            <div className="flex justify-center items-end gap-4 mb-12">
              <div className="h-40 w-28 bg-zinc-800/50 rounded-2xl animate-pulse" />
              <div className="h-48 w-28 bg-zinc-800/50 rounded-2xl animate-pulse" />
              <div className="h-36 w-28 bg-zinc-800/50 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-zinc-900/50 rounded-xl animate-pulse" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // PERFORMANCE: Use cached backend data
  const leaderboard = leaderboardData?.leaderboard || [];
  // PERFORMANCE: Get user rank from backend
  const userRank = leaderboardData?.user_rank || 0;
  const currentUser = leaderboard.find(item => item.created_by === user?.email);

  if (!hasAccess) {
    api.analytics.track({
      eventName: 'leaderboard_viewed_locked',
      properties: { has_subscription: false, subscription_status: subscription?.status }
    });

    if (isPending) {
      let message = 'Your payment is being processed. You\'ll have access to the leaderboard in a few minutes. Check back soon! 🔥';
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-zinc-950 flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6"
            >
              <Lock className="w-8 h-8 text-amber-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-3">Payment Processing</h1>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              {message}
            </p>
          </motion.div>
        </motion.div>
      );
    }

    // Free users see preview + upgrade CTA (loss aversion)
    return (
      <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Leaderboard</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Unlock Your Rank 🏆</h1>
            <p className="text-zinc-500">See where you stand among the 7% — upgrade to Elite to claim your position</p>
          </div>
          <LeaderboardPreview
            topLeaders={leaderboard.slice(0, 5)}
            estimatedRank={leaderboardData?.estimated_user_rank}
            workoutsCompleted={currentUser?.workouts_count || 0}
          />
        </div>
      </div>
    );
  }

  api.analytics.track({
    eventName: 'leaderboard_viewed',
    properties: {
      user_rank: userRank || 0,
      has_pro: hasAccess
    }
  });


  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  
  // Pin current user to bottom if not in top 3
  const pinnedUser = currentUser && userRank > 3 ? currentUser : null;
  const displayRest = pinnedUser ? rest.filter(item => item.created_by !== user?.email) : rest;


  const getUserValue = (entry) => {
    if (category === 'points') {
      return timeframe === 'weekly' ? entry?.weekly_points || 0 : entry?.total_points || 0;
    } else if (category === 'workouts') {
      return entry?.workouts_count || 0;
    } else if (category === 'nutrition') {
      return entry?.meals_logged || 0;
    } else {
      return entry?.current_streak || 0;
    }
  };

  const userValue = getUserValue(currentUser);
  const categoryLabel = category === 'points' ? 'pts' 
    : category === 'workouts' ? 'workouts'
    : category === 'nutrition' ? 'meals'
    : 'days';

  let dynamicMessage = null;
  if (userRank > 0 && userRank <= 3) {
    dynamicMessage = {
      text: `You're in the Top 3! 🔥`,
      type: 'success'
    };
  } else if (userRank > 3 && top3.length === 3) {
    const gapToTop3 = getUserValue(top3[2]) - userValue;
    if (gapToTop3 > 0) {
      dynamicMessage = {
        text: `You're ${gapToTop3} ${categoryLabel} away from podium.`,
        type: 'info'
      };
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Leaderboard</p>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            {timeframe === 'weekly' ? 'Weekly Rankings' : 'All-Time Rankings'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">The 7% who stay disciplined</p>
        </div>

        {/* Timeframe & Category Selectors */}
        <div className="mb-6 space-y-3">
          {/* Timeframe */}
          <div className="flex gap-2">
            {[
              { value: 'weekly', label: 'Weekly' },
              { value: 'alltime', label: 'All-Time' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeframe(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  timeframe === value
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'points',    label: '🏆 Points' },
              { value: 'workouts',  label: '💪 Workouts' },
              { value: 'nutrition', label: '🍎 Nutrition' },
              { value: 'streaks',   label: '🔥 Streaks' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  category === value
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 hover:border-zinc-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Message */}
        {dynamicMessage && (
          <div className={`mb-6 p-4 rounded-xl border ${
            dynamicMessage.type === 'success'
              ? 'bg-amber-500/5 border-amber-500/20'
              : 'bg-blue-500/5 border-blue-500/20'
          }`}>
            <div className="flex items-center gap-3">
              <TrendingUp className={`w-5 h-5 ${
                dynamicMessage.type === 'success' ? 'text-amber-400' : 'text-blue-400'
              }`} />
              <p className={`text-sm font-medium ${
                dynamicMessage.type === 'success' ? 'text-amber-300' : 'text-blue-300'
              }`}>
                {dynamicMessage.text}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="global" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
              <Trophy className="w-4 h-4 mr-2" /> Global
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
              <Users className="w-4 h-4 mr-2" /> Friends
              {friendRequests.length > 0 && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{friendRequests.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="mt-8">
            {leaderboard.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-12 text-center">
                <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No leaderboard entries yet. Be the first!</p>
              </div>
            ) : (
              <>
                {/* Podium for Top 3 */}
                {top3.length > 0 && <PodiumDisplay top3={top3} timeframe={timeframe} category={category} />}

                {/* Rest of Rankings */}
                 {displayRest.length > 0 && (
                   <div className="space-y-3 momentum-scroll">
                     <h3 className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-4">
                       Rankings
                     </h3>
                     {displayRest.map((entry, index) => {
                      const rank = index + 4;
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
                            #{rank}
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

                          <div className="text-right shrink-0">
                            <p className="text-lg sm:text-xl font-bold text-white">
                              {category === 'points' 
                                ? (timeframe === 'weekly' ? entry.weekly_points : entry.total_points)
                                : category === 'workouts'
                                ? entry.workouts_count || 0
                                : category === 'nutrition'
                                ? entry.meals_logged || 0
                                : entry.current_streak || 0
                              }
                            </p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">
                              {category === 'points' ? 'pts' 
                                : category === 'workouts' ? 'workouts'
                                : category === 'nutrition' ? 'meals'
                                : 'days'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pinned Current User */}
                {pinnedUser && (
                  <div className="mt-8 pt-6 border-t border-zinc-800">
                    <h3 className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-4">
                      Your Position
                    </h3>
                    <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                        #{userRank}
                      </div>

                      <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                        {pinnedUser.profile_picture_url ? (
                          <img
                            src={pinnedUser.profile_picture_url}
                            alt={pinnedUser.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-zinc-400 font-semibold">
                            {pinnedUser.username?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {pinnedUser.username || 'You'} <span className="text-amber-400 text-xs">(You)</span>
                        </p>
                        <p className="text-zinc-500 text-xs">
                          {dynamicMessage?.text || `Level ${pinnedUser.current_level}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-amber-400">
                          {category === 'points'
                            ? (timeframe === 'weekly' ? pinnedUser.weekly_points : pinnedUser.total_points)
                            : category === 'workouts'
                            ? pinnedUser.workouts_count || 0
                            : category === 'nutrition'
                            ? pinnedUser.meals_logged || 0
                            : pinnedUser.current_streak || 0
                          }
                        </p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                          {categoryLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="friends" className="mt-8">
            <div className="space-y-6">
              {/* Friend Requests Section */}
              {friendRequests.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Friend Requests ({friendRequests.length})</h3>
                  <div className="space-y-2">
                    {friendRequests.map(req => (
                      <FriendRequestCard 
                        key={req.id} 
                        request={req}
                        onRespond={() => {
                          queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
                          queryClient.invalidateQueries({ queryKey: ['friends'] });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Add Friend Form */}
              <AddFriendForm 
                onSent={() => {
                  queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
                }}
              />

              {/* Friends Leaderboard */}
              {friends.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-4">Your Friends</h3>
                  <FriendsLeaderboard 
                    friendEmails={friends.map(f => f.friend_email)} 
                    leaderboard={leaderboard}
                    timeframe={timeframe}
                    user={user}
                    subscription={subscription}
                  />
                </div>
              )}

              {friends.length === 0 && friendRequests.length === 0 && (
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-12 text-center">
                  <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500">No friends yet. Start by adding friends!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
          <p className="text-zinc-600 text-xs leading-relaxed">
            {timeframe === 'weekly' ? (
              <><strong className="text-zinc-500">Weekly Reset:</strong> Leaderboard resets every Monday. Top 3 earn exclusive badges. Stay disciplined. 🏆</>
            ) : (
              <><strong className="text-zinc-500">All-Time:</strong> Total points accumulated since you joined. Legends are made here. 💎</>
            )}
          </p>
        </div>
      </div>

      <ProUpsellModalEnhanced
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        triggerType={upsellTrigger}
        contextData={{
          estimatedRank: leaderboardData?.estimated_user_rank,
          workoutsCompleted: currentUser?.workouts_count || 0
        }}
      />
    </div>
  );
}