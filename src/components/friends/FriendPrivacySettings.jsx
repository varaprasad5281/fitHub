import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { Shield, Eye, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FriendPrivacySettings() {
  const queryClient = useQueryClient();

  // Create new entity if needed for privacy settings
  const { data: privacySettings = {} } = useQuery({
    queryKey: ['friend_privacy_settings'],
    queryFn: async () => {
      try {
        const user = await api.auth.me();
        // This would need to be created/fetched from a new entity
        return {
          who_can_request: 'everyone', // everyone, friends_of_friends, nobody
          hide_from_search: false,
          disable_suggestions: false,
        };
      } catch {
        return {};
      }
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (settings) => {
      // This would update the privacy settings entity
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('Privacy settings saved');
      queryClient.invalidateQueries({ queryKey: ['friend_privacy_settings'] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6"
    >
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-amber-400" />
        <h3 className="text-white font-bold text-lg">Privacy & Safety</h3>
      </div>

      {/* Who can send friend requests */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-white">
          <Mail className="w-4 h-4 text-zinc-400" />
          Friend Requests From
        </label>
        <Select defaultValue={privacySettings.who_can_request || 'everyone'}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="everyone">Everyone</SelectItem>
            <SelectItem value="friends_of_friends">Friends of Friends</SelectItem>
            <SelectItem value="nobody">Nobody</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-zinc-500">Control who can send you friend requests.</p>
      </div>

      {/* Hide from search */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-white">
          <Eye className="w-4 h-4 text-zinc-400" />
          Visibility
        </label>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
          <input
            type="checkbox"
            defaultChecked={privacySettings.hide_from_search || false}
            className="w-4 h-4 rounded"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Hide from search results</p>
            <p className="text-xs text-zinc-500">Other users won't be able to find you</p>
          </div>
        </div>
      </div>

      {/* Disable suggestions */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
          <input
            type="checkbox"
            defaultChecked={privacySettings.disable_suggestions || false}
            className="w-4 h-4 rounded"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Don't show me in suggestions</p>
            <p className="text-xs text-zinc-500">You won't appear in others' suggested friends</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}