import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Lock, Loader2, Trophy, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DailyChallenge() {
  const [claiming, setClaiming] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState('pending'); // pending, claimed, completed
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const user = await api.auth.me();
      if (!user) return [];
      return api.entities.Subscription.filter({ created_by: user.email });
    },
    initialData: [],
  });

  const { data: dailyChallenge, isLoading, refetch } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: async () => {
      const isAuth = await api.auth.isAuthenticated();
      if (!isAuth) return null;
      
      const sub = subscription[0];
      if (!sub?.plan?.includes('pro') && !sub?.plan?.includes('elite')) {
        return null;
      }

      try {
        const { data } = await api.functions.invoke('generateDailyChallenge');
        return data.challenge;
      } catch (error) {
        if (error.response?.status === 400) {
          setChallengeStatus('claimed');
        }
        return null;
      }
    },
    enabled: !!subscription[0],
    staleTime: 1000 * 60 * 5, // Revalidate every 5 mins
    refetchInterval: 1000 * 60 * 60, // Auto-refetch every hour
  });

  const hasPro = subscription[0]?.plan?.includes('pro') || subscription[0]?.plan?.includes('elite');

  // Track challenge completion
  const handleClaimChallenge = async () => {
    setClaiming(true);
    try {
      const isAuth = await api.auth.isAuthenticated();
      if (!isAuth) {
        api.auth.redirectToLogin();
        return;
      }

      const user = await api.auth.me();
      const pointsReward = dailyChallenge.points_reward || 50;
      const today = new Date().toISOString().split('T')[0];

      // Get current points
      const pointsList = await api.entities.Points.filter({ created_by: user.email });
      const userPoints = pointsList[0];

      // Award points
      if (userPoints) {
        await api.entities.Points.update(userPoints.id, {
          total_points: (userPoints.total_points || 0) + pointsReward,
          weekly_points: (userPoints.weekly_points || 0) + pointsReward,
        });
      } else {
        await api.entities.Points.create({
          total_points: pointsReward,
          weekly_points: pointsReward,
          level: 1
        });
      }

      // Log the claim in points transaction
      await api.entities.PointsTransaction.create({
        source: 'daily_challenge_claimed',
        points_awarded: pointsReward,
        transaction_date: today,
        reference_id: dailyChallenge.id,
        metadata: {
          challenge_name: dailyChallenge.name,
          difficulty: dailyChallenge.difficulty,
          requirement: dailyChallenge.requirement
        }
      });

      setChallengeStatus('claimed');
      
      api.analytics.track({
        eventName: 'daily_challenge_claimed',
        properties: { 
          challenge_name: dailyChallenge.name,
          difficulty: dailyChallenge.difficulty,
          points_awarded: pointsReward
        }
      });
      
      // Refresh points data
      queryClient.invalidateQueries(['points']);
      toast.success(`Challenge accepted! +${pointsReward} points 🔥`);
      
      // Redirect to challenges page
      setTimeout(() => navigate(createPageUrl('Challenges')), 500);
    } catch (error) {
      console.error('Challenge claim error:', error);
      toast.error('Failed to accept challenge');
    } finally {
      setClaiming(false);
    }
  };

  if (!hasPro) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 flex items-center gap-4">
        <Lock className="w-6 h-6 text-amber-400 shrink-0" />
        <div>
          <h3 className="text-white font-semibold text-sm">Unlock Daily Challenges</h3>
          <p className="text-zinc-400 text-xs mt-1">Pro & Elite members get daily challenges to stay disciplined</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!dailyChallenge) return null;

  const isClaimed = challengeStatus === 'claimed';

  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-b p-6 transition-all ${
      isClaimed 
        ? 'border-green-500/30 from-green-500/10 to-transparent' 
        : 'border-amber-500/30 from-amber-500/10 to-transparent'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isClaimed ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Challenge Claimed</span>
              </>
            ) : (
              <>
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Daily Challenge</span>
              </>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{dailyChallenge.name}</h3>
          <p className="text-zinc-400 text-sm mb-4">{dailyChallenge.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="w-4 h-4" />
              <span>Resets daily at midnight</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full font-semibold capitalize ${
                isClaimed
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {dailyChallenge.difficulty} • +{dailyChallenge.points_reward || 50} pts
              </span>
            </div>
          </div>

          <Button
            onClick={handleClaimChallenge}
            disabled={claiming || isClaimed}
            className={`px-6 rounded-full h-10 font-semibold ${
              isClaimed
                ? 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black'
            }`}
          >
            {isClaimed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Accepted!
              </>
            ) : (
              claiming ? 'Claiming...' : 'Accept Challenge 🔥'
            )}
          </Button>
        </div>
        
        <div className="shrink-0">
          <Trophy className={`w-12 h-12 ${isClaimed ? 'text-green-400' : 'text-amber-400'}/40`} />
        </div>
      </div>
    </div>
  );
}