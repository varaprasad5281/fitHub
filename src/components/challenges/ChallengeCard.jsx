import React from 'react';
import { Trophy, Users, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from '@/api/client';
import { toast } from "sonner";

export default function ChallengeCard({ challenge, hasPro }) {
  const queryClient = useQueryClient();
  const isParticipating = challenge.user_participating;

  const joinChallengeMutation = useMutation({
    mutationFn: () =>
      api.functions.invoke('joinChallenge', { challenge_id: challenge.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Joined challenge!');
    },
    onError: () => {
      toast.error('Failed to join challenge');
    },
  });

  const daysLeft = challenge.end_date
    ? Math.max(0, Math.ceil((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-amber-500/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{challenge.name}</h3>
          {challenge.description && (
            <p className="text-zinc-400 text-sm">{challenge.description}</p>
          )}
        </div>
        <Trophy className="w-5 h-5 text-amber-400 shrink-0 ml-3" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-zinc-400">
          <Users className="w-4 h-4" />
          <span>{challenge.participants.length} joined</span>
        </div>
        {daysLeft !== null && (
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar className="w-4 h-4" />
            <span>{daysLeft} days left</span>
          </div>
        )}
        {challenge.metric && (
          <div className="flex items-center gap-2 text-zinc-400">
            <TrendingUp className="w-4 h-4" />
            <span>{challenge.metric.replace(/_/g, ' ')}</span>
          </div>
        )}
        {challenge.difficulty && (
          <div className="text-zinc-400">
            <span className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${
              challenge.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              challenge.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {challenge.difficulty}
            </span>
          </div>
        )}
      </div>

      {challenge.prize_description && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Prize</p>
          <p className="text-zinc-300 text-sm">{challenge.prize_description}</p>
        </div>
      )}

      {challenge.status === 'completed' || daysLeft === 0 ? (
        <div className="w-full py-2 text-center text-zinc-500 text-sm font-semibold">
          🏁 Challenge Ended
        </div>
      ) : isParticipating ? (
        <div className="w-full py-2 text-center text-amber-400 text-sm font-semibold">
          ✓ You're participating
        </div>
      ) : hasPro ? (
        <Button
          onClick={() => joinChallengeMutation.mutate()}
          disabled={joinChallengeMutation.isPending}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-lg h-10"
        >
          {joinChallengeMutation.isPending ? 'Joining...' : 'Join Challenge'}
        </Button>
      ) : null}
    </div>
  );
}
