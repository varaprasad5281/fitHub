import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Loader2 } from 'lucide-react';
import ActivityCardEnhanced from './ActivityCardEnhanced';
import ActivityFeedFilters from './ActivityFeedFilters';
import SmartActivitySummary from './SmartActivitySummary';

export default function FriendActivityFeed({ friends }) {
  const [timeframe, setTimeframe] = useState('week');
  const [activityFilter, setActivityFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity-feed', friends?.map(f => f.friend_email)],
    queryFn: async () => {
      if (!friends || friends.length === 0) return [];
      
      const friendEmails = friends.map(f => f.friend_email);
      const allActivities = await api.entities.ActivityFeed.list('-created_date', 200);
      
      return allActivities.filter(a => {
        const isFromFriend = friendEmails.includes(a.target_user_email);
        const isPublic = a.visibility === 'public' || a.visibility === 'friends_only';
        return isFromFriend && isPublic;
      });
    },
    enabled: !!friends && friends.length > 0,
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ['social-reactions'],
    queryFn: () => api.entities.SocialReaction.list('-created_date', 500),
    initialData: [],
  });

  // ✅ REAL-TIME: Subscribe to activity feed changes
  useEffect(() => {
    if (!friends || friends.length === 0) return;

    const unsubscribe = api.entities.ActivityFeed.subscribe((event) => {
      const friendEmails = friends.map(f => f.friend_email);
      if (friendEmails.includes(event.data?.target_user_email)) {
        queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
      }
    });

    return unsubscribe;
  }, [friends, queryClient]);

  // ✅ REAL-TIME: Subscribe to reaction changes
  useEffect(() => {
    const unsubscribe = api.entities.SocialReaction.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['social-reactions'] });
    });

    return unsubscribe;
  }, [queryClient]);

  const addReaction = useMutation({
    mutationFn: async (data) => {
      return await api.entities.SocialReaction.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-reactions'] });
    },
  });

  // ✅ FILTER: Apply timeframe filter
  const now = new Date();
  const filteredByTime = activities.filter(a => {
    const actDate = new Date(a.created_date);
    const dayDiff = Math.floor((now - actDate) / (1000 * 60 * 60 * 24));

    if (timeframe === 'today') return dayDiff === 0;
    if (timeframe === 'week') return dayDiff < 7;
    return true;
  });

  // ✅ FILTER: Apply activity type filter
  const filtered = activityFilter === 'all'
    ? filteredByTime
    : filteredByTime.filter(a => a.activity_type === activityFilter);

  // ✅ GROUPING: Group by date
  const groupedByDate = filtered.reduce((acc, activity) => {
    const date = new Date(activity.created_date);
    const dateKey = date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(activity);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500">No recent activities from your friends. Keep training!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ActivityFeedFilters
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        activityFilter={activityFilter}
        setActivityFilter={setActivityFilter}
      />

      {/* Smart Summary */}
      <SmartActivitySummary activities={filtered} friends={friends} />

      {/* Activities */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No activities match your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(dateKey => (
            <div key={dateKey}>
              {/* Date header */}
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-3">
                {dateKey}
              </h3>

              {/* Activities for this date */}
              <div className="space-y-3">
                {groupedByDate[dateKey].map(activity => {
                  const activityReactions = reactions.filter(r => r.activity_feed_id === activity.id);
                  return (
                    <ActivityCardEnhanced
                      key={activity.id}
                      activity={activity}
                      reactions={activityReactions}
                      onReact={(activityId, emoji) => {
                        addReaction.mutate({
                          activity_feed_id: activityId,
                          emoji,
                        });
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}