/**
 * Prestige Achievement Display
 * Shows prestige status and eligibility for elite achievement level
 * Prestige is a rare distinction earned through consistent discipline
 */

import React from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, Award, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrestigeDisplay() {
  const queryClient = useQueryClient();

  const { data: userLevel, isLoading } = useQuery({
    queryKey: ['userLevel'],
    queryFn: async () => {
      const levels = await api.entities.UserLevel.list();
      return levels[0];
    },
    staleTime: 1000 * 60 * 5,
  });

  const prestigeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.functions.invoke('activatePrestige');
      return response.data;
    },
    onSuccess: data => {
      toast.success(data.message || 'Prestige activated!');
      queryClient.invalidateQueries({ queryKey: ['userLevel'] });
      queryClient.invalidateQueries({ queryKey: ['userRewards'] });
    },
    onError: () => {
      toast.error('Could not activate prestige. Check eligibility.');
    },
  });

  if (isLoading) {
    return <Skeleton className="h-20" />;
  }

  if (!userLevel) {
    return null;
  }

  const isEligible = userLevel.prestige_triggers && userLevel.prestige_triggers.length > 0;
  const isPrestiged = userLevel.prestige_level > 0;

  if (isPrestiged) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4"
      >
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-amber-400" />
          <div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Elite Achievement</p>
            <p className="text-sm font-bold text-white">Prestige {userLevel.prestige_level}</p>
            <p className="text-xs text-amber-300 mt-0.5">Recognized for exceptional discipline</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isEligible) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
      >
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-zinc-600" />
          <div>
            <p className="text-xs text-zinc-500 font-semibold">Prestige Locked</p>
            <p className="text-xs text-zinc-600">Reach level 30 to unlock elite status</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Prestige Available</p>
            <p className="text-sm font-bold text-white">Achieve Elite Status</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-amber-300/80 mb-3">
        You've demonstrated exceptional consistency. Activate prestige to join the elite.
      </p>

      <Button
        onClick={() => prestigeMutation.mutate()}
        disabled={prestigeMutation.isPending}
        className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 font-semibold rounded-lg h-10"
      >
        {prestigeMutation.isPending ? 'Activating...' : 'Achieve Elite Status'}
      </Button>
    </motion.div>
  );
}