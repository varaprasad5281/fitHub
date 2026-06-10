/**
 * Performance Challenge Tracker
 * Shows weekly/monthly performance challenges focused on consistency
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Target, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChallengeTracker() {
  const [selectedType, setSelectedType] = useState('weekly');

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: async () => {
      const now = new Date();
      const all = await api.entities.Challenge.filter({ is_active: true });
      return all.filter(
        c => new Date(c.start_date) <= now && new Date(c.end_date) >= now
      );
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userChallengeProgress'],
    queryFn: async () => {
      return await api.entities.UserChallengeProgress.list();
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  const activeChallenges = challenges.filter(c => c.challenge_type === selectedType);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-zinc-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Performance Challenges</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {['weekly', 'monthly'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedType === type
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            {type === 'weekly' ? 'Weekly' : 'Monthly'}
          </button>
        ))}
      </div>

      {/* Challenges */}
      <AnimatePresence mode="wait">
        {activeChallenges.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">
            No {selectedType} challenges active
          </p>
        ) : (
          <div className="space-y-3">
            {activeChallenges.map(challenge => {
              const progress = userProgress?.find(p => p.challenge_id === challenge.id);
              const completed = progress?.completed;
              const objectives = progress?.progress || [];

              const completedCount = objectives.filter(o => o.completed).length;
              const totalObjectives = objectives.length;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg border transition-colors ${
                    completed
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-zinc-800/50 border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <Target className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{challenge.name}</p>
                      <p className="text-xs text-zinc-500">{challenge.description}</p>
                    </div>
                  </div>

                  {/* Objectives progress */}
                  <div className="space-y-1">
                    {objectives.map((obj, idx) => {
                      const objDef = challenge.objectives[idx];
                      const pct = (obj.current_value / obj.target_value) * 100;

                      return (
                        <div key={idx} className="text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-zinc-400">{objDef.description}</span>
                            <span
                              className={obj.completed ? 'text-green-400 font-bold' : 'text-amber-300'}
                            >
                              {obj.current_value}/{obj.target_value}
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(pct, 100)}%` }}
                              className={obj.completed ? 'bg-green-600' : 'bg-zinc-600'}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status */}
                  <div className="mt-2 text-xs">
                    {completed ? (
                      <p className="text-green-400 font-semibold">✓ Completed!</p>
                    ) : (
                      <p className="text-zinc-500">
                        {completedCount}/{totalObjectives} objectives complete
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}