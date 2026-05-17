import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { useQuery } from "@tanstack/react-query";
import { Trophy, Zap, Users, Plus, Loader2, Lock, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import CreateChallengeForm from "@/components/challenges/CreateChallengeForm";
import { toast } from "sonner";

export default function Challenges() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [filter, setFilter] = useState('active'); // active, upcoming, completed

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.auth.me(),
  });

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges', filter],
    queryFn: async () => {
      const res = await api.functions.invoke('getChallenges', { status: filter });
      return Array.isArray(res?.data) ? res.data : [];
    },
    placeholderData: [],
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: createdChallenges = [] } = useQuery({
    queryKey: ['created-challenges', user?.email],
    queryFn: async () => {
      const res = await api.functions.invoke('getChallenges', { created_by: user.email });
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: !!user?.email,
    staleTime: 0,
    refetchOnMount: true,
  });

  const canCreateMore = createdChallenges.length < 15;

  const displayChallenges = useMemo(() => {
    if (filter === 'completed')
      return [...challenges].sort((a, b) => new Date(b.end_date) - new Date(a.end_date)).slice(0, 10);
    if (filter === 'upcoming')
      return [...challenges].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).slice(0, 10);
    return challenges;
  }, [challenges, filter]);

  const { data: subscription = [], isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    staleTime: 1000 * 60 * 5,
  });

  const sub = subscription[0];
  const hasElite = sub?.plan === 'elite_monthly' || sub?.plan === 'elite_yearly';
  const isActive = sub?.status === 'active' || sub?.status === 'trial' || (sub?.status === 'cancelled' && sub?.end_date && new Date(sub.end_date) > new Date());
  const hasPro = hasElite && isActive; // alias kept so JSX below continues to work

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-zinc-500 text-sm">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Challenges</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Community Challenges</h1>
          <p className="text-zinc-500">Compete with others and level up your fitness</p>
        </div>

        {!hasPro && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Elite Feature</p>
              <p className="text-zinc-400 text-xs mt-1">Upgrade to Elite to create and compete in challenges</p>
            </div>
            <a href="/Subscription" className="text-xs text-amber-400 hover:text-amber-300 font-semibold whitespace-nowrap mt-0.5">Upgrade →</a>
          </div>
        )}

        {/* Filters & Create Button */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            {['active', 'upcoming', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {hasPro && (
            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={() => canCreateMore ? setShowCreateForm(true) : setShowLimitModal(true)}
                className={`px-6 rounded-full h-10 w-full sm:w-auto font-semibold ${
                  canCreateMore
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" /> Create Challenge
              </Button>
              <p className="text-xs text-zinc-500">{createdChallenges.length}/15 created</p>
            </div>
          )}
        </div>

        {/* Challenges Grid */}
        {displayChallenges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-zinc-800/40 flex items-center justify-center mx-auto mb-4"
            >
              <Trophy className="w-8 h-8 text-zinc-600" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-2">No Challenges Yet</h3>
            <p className="text-zinc-500 text-sm">Be the first to create a {filter} challenge!</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {displayChallenges.map((challenge, idx) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ChallengeCard 
                  challenge={challenge}
                  hasPro={hasPro}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {showCreateForm && hasPro && (
          <CreateChallengeForm onClose={() => setShowCreateForm(false)} />
        )}

        {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-white font-bold text-lg">Limit Reached</h3>
                </div>
                <button onClick={() => setShowLimitModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-zinc-400 text-sm mb-6">
                You've reached the maximum of <span className="text-white font-semibold">15 challenges</span> you can create. Delete an existing challenge to make room for a new one.
              </p>
              <Button
                onClick={() => setShowLimitModal(false)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl h-11"
              >
                Got it
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}