import React from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Bell, Flame, TrendingUp, Award, Check, Dumbbell,
  Sparkles, Crown, Lightbulb, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FriendRequestNotification from './FriendRequestNotification';

const TYPE_CONFIG = {
  welcome:           { icon: Sparkles, color: 'text-amber-400',  bg: 'bg-amber-500/20' },
  workout_completed: { icon: Dumbbell,  color: 'text-green-400',  bg: 'bg-green-500/20' },
  streak_milestone:  { icon: Flame,     color: 'text-orange-400', bg: 'bg-orange-500/20' },
  coaching_ready:    { icon: Lightbulb, color: 'text-amber-400',  bg: 'bg-amber-500/20' },
  subscription:      { icon: Crown,     color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  goal_achieved:     { icon: Award,     color: 'text-amber-400',  bg: 'bg-amber-500/20' },
  podium_near:       { icon: TrendingUp,color: 'text-blue-400',   bg: 'bg-blue-500/20' },
  streak_building:   { icon: Flame,     color: 'text-orange-400', bg: 'bg-orange-500/20' },
  workout_missed:    { icon: Flame,     color: 'text-red-400',    bg: 'bg-red-500/20' },
  general:           { icon: Bell,      color: 'text-zinc-400',   bg: 'bg-zinc-700/40' },
};

function formatDate(notif) {
  const raw = notif.createdAt || notif.created_date || notif.updatedAt;
  if (!raw) return '';
  return new Date(raw).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationCenter() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me(),
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.entities.Notification.list('-created_date', 20),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) => api.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => api.entities.Notification.update(n.id, { read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => api.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="flex items-center gap-2">
      <FriendRequestNotification user={user} />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-zinc-800 hover:text-zinc-200 active:bg-zinc-700 data-[state=open]:bg-zinc-800"
          >
            <Bell className="w-5 h-5 text-zinc-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent className="bg-zinc-950 border-zinc-800 flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <div className="flex items-center justify-between pr-8">
              <SheetTitle className="text-white">Notifications</SheetTitle>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </SheetHeader>

          <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoading ? (
              <p className="text-zinc-600 text-sm text-center py-8">Loading…</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <Bell className="w-10 h-10 text-zinc-700" />
                <p className="text-zinc-600 text-sm text-center">No notifications yet.<br />Complete a workout to get started!</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {notifications.map((notif, idx) => {
                  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`p-3 rounded-xl border transition-colors ${
                        notif.read
                          ? 'border-zinc-800/60 bg-zinc-900/20'
                          : 'border-amber-500/25 bg-amber-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${notif.read ? 'text-zinc-400' : 'text-white'}`}>
                            {notif.message}
                          </p>
                          <p className="text-zinc-600 text-xs mt-1">{formatDate(notif)}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!notif.read ? (
                            <button
                              type="button"
                              onClick={() => markAsReadMutation.mutate(notif.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => deleteNotificationMutation.mutate(notif.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
