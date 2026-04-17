/**
 * Badges Page
 * Shows earned badges, locked badges, and featured selection
 */

import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PremiumBadgeCard from '@/components/badge/PremiumBadgeCard';
import LockedBadgeCard from '@/components/badge/LockedBadgeCard';
import { RARITY_STYLES } from '@/components/badge/badgeDesignTokens';

export default function Badges() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('earned');
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await api.auth.isAuthenticated();
        if (isAuth) {
          const userData = await api.auth.me();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    checkAuth();
  }, []);

  const { data: earned = [], isLoading: loadingEarned } = useQuery({
    queryKey: ['userBadges', user?.email],
    queryFn: async () => {
      const { data } = await api.functions.invoke('getBadges', { action: 'me' });
      return data.badges || [];
    },
    enabled: !!user,
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['allBadges'],
    queryFn: async () => {
      const { data } = await api.functions.invoke('getBadges', { action: 'all' });
      return data.badges || [];
    },
  });

  const featureMutation = useMutation({
    mutationFn: async ({ badgeId, featured }) => {
      const currentEarned = earned.find(b => b.id === badgeId);
      if (!currentEarned) return;

      // Max 3 featured
      const featuredCount = earned.filter(b => b.is_featured).length;
      if (featured && featuredCount >= 3) {
        throw new Error('Max 3 badges can be featured');
      }

      await api.entities.UserBadge.update(badgeId, { is_featured: featured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
      toast.success('Badge featured!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to feature badge');
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Award className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">Log in to view your badges</p>
          <Button onClick={() => api.auth.redirectToLogin()} className="bg-amber-500 hover:bg-amber-600">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const earnedSet = new Set(earned.map(b => b.badge_code));
  const locked = allBadges.filter(b => !earnedSet.has(b.code));

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Badges</h1>
          <p className="text-zinc-400">Earn badges through discipline, effort, and consistency</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 border-b border-zinc-800">
          {['earned', 'locked', 'featured'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 font-semibold transition-colors border-b-2 capitalize ${
                tab === t
                  ? 'text-amber-400 border-amber-400'
                  : 'text-zinc-500 border-transparent hover:text-zinc-400'
              }`}
            >
              {t} ({t === 'earned' ? earned.length : t === 'locked' ? locked.length : earned.filter(b => b.is_featured).length})
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loadingEarned ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : tab === 'earned' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {earned.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Award className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">No badges earned yet. Keep grinding!</p>
                </div>
              ) : (
                earned.map(ub => (
                  <motion.div key={ub.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    <PremiumBadgeCard
                      badge={ub.badge}
                      userBadge={ub}
                      onFeature={featureMutation}
                      size="medium"
                      featured={ub.is_featured}
                    />
                  </motion.div>
                ))
              )}
            </div>
          ) : tab === 'locked' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {locked.length === 0 ? (
                <div className="col-span-full text-center py-12 text-zinc-500">
                  You've earned all badges!
                </div>
              ) : (
                locked.map(badge => (
                  <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    <LockedBadgeCard badge={badge} progress={null} size="medium" />
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {earned.filter(b => b.is_featured).length === 0 ? (
                <div className="col-span-full text-center py-12 text-zinc-500">
                  Feature up to 3 badges to display on your profile
                </div>
              ) : (
                earned
                  .filter(b => b.is_featured)
                  .map(ub => (
                    <motion.div key={ub.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                      <PremiumBadgeCard
                        badge={ub.badge}
                        userBadge={ub}
                        onFeature={featureMutation}
                        size="medium"
                        featured={true}
                      />
                    </motion.div>
                  ))
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}