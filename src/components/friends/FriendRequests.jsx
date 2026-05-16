/**
 * Friend Requests Component
 * Shows incoming and outgoing requests
 */

import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function FriendRequests() {
  const queryClient = useQueryClient();

  const { data: incoming = [], isLoading: incomingLoading } = useQuery({
    queryKey: ['friendRequests', 'incoming'],
    queryFn: async () => {
      const response = await api.functions.invoke('getFriendsList', { type: 'pending' });
      return (response?.friends || []).filter(f => !f.is_requester);
    },
    staleTime: 1000 * 30,
    refetchOnMount: true,
  });

  const { data: outgoing = [], isLoading: outgoingLoading } = useQuery({
    queryKey: ['friendRequests', 'outgoing'],
    queryFn: async () => {
      const response = await api.functions.invoke('getFriendsList', { type: 'pending' });
      return (response?.friends || []).filter(f => f.is_requester);
    },
    staleTime: 1000 * 30,
    refetchOnMount: true,
  });

  const acceptMutation = useMutation({
    mutationFn: async (request) => {
      await api.functions.invoke('friendRequest', {
        action: 'accept',
        target_email: request.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests-notifications'] });
      toast.success('Friend added! Accountability just got stronger.');
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (request) => {
      await api.functions.invoke('friendRequest', {
        action: 'reject',
        target_email: request.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests-notifications'] });
      toast.success('Request declined.');
    },
  });

  return (
    <Tabs defaultValue="incoming" className="w-full">
      <TabsList className="bg-zinc-800 rounded-lg p-1 grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="incoming" className="text-xs">
          Incoming {incoming.length > 0 && `(${incoming.length})`}
        </TabsTrigger>
        <TabsTrigger value="outgoing" className="text-xs">
          Outgoing {outgoing.length > 0 && `(${outgoing.length})`}
        </TabsTrigger>
      </TabsList>

      {/* Incoming */}
      <TabsContent value="incoming">
        {incomingLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : incoming.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-zinc-400 font-semibold mb-1">No requests right now.</p>
              <p className="text-xs text-zinc-600">Keep building your circle. The 7% don't train alone.</p>
            </div>
        ) : (
          <div className="space-y-2">
            {incoming.map((request, idx) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-green-500/20"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <UserAvatar
                    src={request.profile_picture}
                    name={request.friend_name || request.username || request.email}
                    className="w-8 h-8"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {request.friend_name || request.username || request.email}
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
      </TabsContent>

      {/* Outgoing */}
      <TabsContent value="outgoing">
        {outgoingLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : outgoing.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-zinc-400">No pending requests.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {outgoing.map((request, idx) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
              >
                <div className="flex items-center gap-2 flex-1">
                  <UserAvatar
                    src={request.profile_picture}
                    name={request.friend_name || request.email}
                    className="w-8 h-8"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {request.friend_name}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-zinc-500 ml-2">Pending</span>
              </motion.div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}