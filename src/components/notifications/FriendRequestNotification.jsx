import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function FriendRequestNotification({ user }) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [displayedRequests, setDisplayedRequests] = useState(new Set());

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friend-requests-notifications', user?.email],
    queryFn: () => api.entities.FriendRequest.filter({
      receiver_email: user?.email,
      status: 'pending'
    }),
    enabled: !!user,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,  // poll every 30s, not every 5s
  });

  // Show toast notifications for new requests
  useEffect(() => {
    friendRequests.forEach(request => {
      if (!displayedRequests.has(request.id)) {
        toast.info(`${request.requester_email} sent you a friend request!`, {
          duration: 5000,
          icon: <UserPlus className="w-4 h-4" />
        });
        setDisplayedRequests(prev => new Set([...prev, request.id]));
      }
    });
  }, [friendRequests, displayedRequests]);

  const unreadCount = friendRequests.length;

  if (!user || unreadCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setNotificationOpen(!notificationOpen)}
        className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg z-50">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <p className="text-white font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              Friend Requests ({unreadCount})
            </p>
            <button onClick={() => setNotificationOpen(false)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto p-4 space-y-3 momentum-scroll">
            {friendRequests.map(request => (
              <div
                key={request.id}
                className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-amber-500/30 transition-colors"
              >
                <p className="text-white text-sm font-medium mb-2">{request.requester_email}</p>
                <Button
                  size="sm"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded-lg h-8"
                  onClick={() => {
                    window.location.href = '/Friends';
                  }}
                >
                  View Request
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}