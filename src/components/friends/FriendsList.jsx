/**
 * Friends List Component
 * Shows accepted friends with options
 */

import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MessageCircle, MoreVertical, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RemoveFriendModal, BlockUserModal } from './FriendActionModals';
import { BadgeMiniRow } from '@/components/badges/BadgeTooltip';

export default function FriendsList({ onChatClick }) {
  const [removeModalOpen, setRemoveModalOpen] = useState(null);
  const [blockModalOpen, setBlockModalOpen] = useState(null);
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends', 'accepted'],
    queryFn: async () => {
      const response = await api.functions.invoke('getFriendsList', { type: 'accepted' });
      return response?.friends || [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch featured badges for all friends in one request
  const { data: badgeMap = {} } = useQuery({
    queryKey: ['friends-featured-badges', friends.map(f => f.email).join(',')],
    queryFn: async () => {
      const emails = friends.map(f => f.email).filter(Boolean);
      if (!emails.length) return {};
      const res = await api.functions.invoke('getBadges', { action: 'bulk_featured', emails });
      return res?.data || {};
    },
    enabled: friends.length > 0,
    staleTime: 1000 * 60 * 5, // badges rarely change - 5 min cache
  });

  const removeMutation = useMutation({
    mutationFn: async (friendEmail) => {
      await api.functions.invoke('friendRequest', {
        action: 'remove',
        target_email: friendEmail
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Friend removed.');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || 'Failed to remove friend');
    }
  });

  const blockMutation = useMutation({
    mutationFn: async (friendEmail) => {
      await api.functions.invoke('friendRequest', {
        action: 'block',
        target_email: friendEmail
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('User blocked.');
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="text-sm text-zinc-400 font-semibold mb-1">No friends added yet.</p>
        <p className="text-xs text-zinc-600">Add someone you trust. Discipline compounds faster with accountability.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {friends.map((friend, idx) => (
          <motion.div
            key={friend.id || friend.email}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
          >
            <div
              className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
              onClick={() => onChatClick?.(friend.email)}
            >
              <UserAvatar
                src={friend.avatar_url}
                name={friend.username || 'User'}
                className="w-10 h-10"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{friend.username || 'Unknown'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <BadgeMiniRow badges={badgeMap[friend.email] || []} size="xs" align="left" above={true} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => onChatClick?.(friend.email)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                  <DropdownMenuItem
                    onClick={() => setRemoveModalOpen(friend.email)}
                    className="text-red-400 hover:bg-zinc-800 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setBlockModalOpen(friend.email)}
                    className="text-orange-400 hover:bg-zinc-800 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Block
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </div>

      <RemoveFriendModal
        isOpen={!!removeModalOpen}
        friendName={removeModalOpen}
        onConfirm={() => {
          removeMutation.mutate(removeModalOpen);
          setRemoveModalOpen(null);
        }}
        onCancel={() => setRemoveModalOpen(null)}
        isPending={removeMutation.isPending}
      />

      <BlockUserModal
        isOpen={!!blockModalOpen}
        userName={blockModalOpen}
        onConfirm={() => {
          blockMutation.mutate(blockModalOpen);
          setBlockModalOpen(null);
        }}
        onCancel={() => setBlockModalOpen(null)}
        isPending={blockMutation.isPending}
      />
    </>
  );
      }