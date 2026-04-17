import React from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, Flame, TrendingUp, Award, Check, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import FriendRequestNotification from './FriendRequestNotification';

export default function NotificationCenter() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me(),
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.entities.Notification.list('-created_date', 20),
    initialData: [],
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) => api.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => api.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const icons = {
    workout_missed: Flame,
    podium_near: TrendingUp,
    streak_building: Flame,
    goal_achieved: Award,
    general: Bell,
  };

  return (
    <div className="flex items-center gap-2">
      <FriendRequestNotification user={user} />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-zinc-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
      <SheetContent className="bg-zinc-950 border-zinc-800">
        <SheetHeader>
          <SheetTitle className="text-white">Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">No notifications yet</p>
          ) : (
            notifications.map((notif, idx) => {
              const Icon = icons[notif.type] || Bell;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border ${
                    notif.read
                      ? 'border-zinc-800 bg-zinc-900/30'
                      : 'border-amber-500/30 bg-amber-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                       <Icon className="w-4 h-4 text-amber-400" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-white text-sm leading-relaxed">{notif.message}</p>
                       <p className="text-zinc-600 text-xs mt-1">
                         {new Date(notif.created_date).toLocaleDateString('en-GB', {
                           day: 'numeric',
                           month: 'short',
                           hour: '2-digit',
                           minute: '2-digit',
                         })}
                       </p>
                     </div>
                     <div className="flex gap-1 shrink-0">
                       {!notif.read && (
                         <button
                           type="button"
                           onClick={() => markAsReadMutation.mutate(notif.id)}
                           className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-amber-400 active:bg-zinc-800 transition-colors"
                           title="Mark as read"
                           style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                         >
                           <Check className="w-4 h-4" />
                         </button>
                       )}
                       {notif.read && (
                         <button
                           type="button"
                           onClick={() => deleteNotificationMutation.mutate(notif.id)}
                           className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 active:bg-zinc-800 transition-colors"
                           title="Remove notification"
                           style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                         >
                           <Check className="w-4 h-4 opacity-50" />
                         </button>
                       )}
                     </div>
                   </div>
                </motion.div>
              );
            })
          )}
        </div>
      </SheetContent>
      </Sheet>
    </div>
  );
}