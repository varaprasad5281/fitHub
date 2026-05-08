/**
 * Badges Page
 * Shows earned badges, locked badges with real progress bars, and featured selection.
 */

import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ── Rarity colours ────────────────────────────────────────────────────────────
const RARITY = {
  common:    { border: 'border-zinc-600', glow: '',                       label: 'text-zinc-400',   bg: 'bg-zinc-800/60'   },
  rare:      { border: 'border-blue-500', glow: 'shadow-blue-500/20',     label: 'text-blue-400',   bg: 'bg-blue-900/30'   },
  epic:      { border: 'border-purple-500', glow: 'shadow-purple-500/20', label: 'text-purple-400', bg: 'bg-purple-900/30' },
  legendary: { border: 'border-amber-400', glow: 'shadow-amber-400/30',   label: 'text-amber-400',  bg: 'bg-amber-900/30'  },
};

const CATEGORY_LABEL = {
  workout:   '💪 Workout',
  streak:    '🔥 Streak',
  nutrition: '🥗 Nutrition',
  points:    '⭐ Points',
  social:    '🤝 Social',
};

// ── Earned badge card ─────────────────────────────────────────────────────────
function EarnedCard({ badge, onFeature, featured }) {
  const r = RARITY[badge.rarity_level] || RARITY.common;
  return (
    <div className={`relative rounded-2xl border ${r.border} ${r.bg} shadow-lg ${r.glow} p-5 flex flex-col items-center gap-2 text-center`}>
      {featured && (
        <span className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          FEATURED
        </span>
      )}
      <span className="text-4xl">{badge.icon || '🏅'}</span>
      <p className="text-white font-bold text-sm leading-tight">{badge.name}</p>
      <p className={`text-xs font-semibold uppercase tracking-wide ${r.label}`}>{badge.rarity_level}</p>
      <p className="text-zinc-500 text-xs leading-snug">{badge.description}</p>
      <button
        onClick={() => onFeature.mutate({ badgeId: badge._id, featured: !featured })}
        className={`mt-1 text-xs px-3 py-1 rounded-full border transition-colors ${
          featured
            ? 'border-amber-500 text-amber-400 hover:bg-amber-500/10'
            : 'border-zinc-600 text-zinc-500 hover:border-zinc-400 hover:text-zinc-300'
        }`}
      >
        {featured ? 'Unfeature' : 'Feature'}
      </button>
    </div>
  );
}

// ── Locked badge card ─────────────────────────────────────────────────────────
function LockedCard({ badge }) {
  const r = RARITY[badge.rarity_level] || RARITY.common;
  const progress = badge.progress ?? 0;

  return (
    <div className={`rounded-2xl border ${r.border} bg-zinc-900/60 p-5 flex flex-col items-center gap-2 text-center opacity-75`}>
      <span className="text-4xl grayscale opacity-50">{badge.icon || '🔒'}</span>
      <p className="text-zinc-300 font-bold text-sm leading-tight">{badge.name}</p>
      <p className={`text-xs font-semibold uppercase tracking-wide ${r.label}`}>{badge.rarity_level}</p>
      <p className="text-zinc-600 text-xs leading-snug">{badge.description}</p>
      <div className="w-full mt-1">
        <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-zinc-600 text-[10px] mt-1 text-right">{progress}% there</p>
      </div>
    </div>
  );
}

// ── Stat summary card ─────────────────────────────────────────────────────────
function StatCard({ label, value }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center">
      <p className="text-xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Badges() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('earned');
  const [filterCategory, setFilterCategory] = useState('all');
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

  // Single 'progress' query returns badges + user stats
  const { data: badgeData, isLoading } = useQuery({
    queryKey: ['badges-progress', user?.email],
    queryFn: async () => {
      const res = await api.functions.invoke('getBadges', { action: 'progress' });
      return { badges: res.data || [], stats: res.stats || {} };
    },
    enabled: !!user,
  });

  const allBadges = badgeData?.badges || [];
  const stats = badgeData?.stats || {};

  const featureMutation = useMutation({
    mutationFn: async ({ badgeId, featured }) => {
      const featuredCount = allBadges.filter(b => b.earned && b.is_featured).length;
      if (featured && featuredCount >= 3) throw new Error('Max 3 badges can be featured');
      await api.entities.UserBadge.update(badgeId, { is_featured: featured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges-progress'] });
      toast.success('Badge updated!');
    },
    onError: (err) => toast.error(err.message || 'Failed to update badge'),
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Award className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">Log in to view your badges</p>
        </div>
      </div>
    );
  }

  const earned   = allBadges.filter(b => b.earned);
  const locked   = allBadges.filter(b => !b.earned);
  const featured = earned.filter(b => b.is_featured);

  const categories = ['all', ...new Set(allBadges.map(b => b.category).filter(Boolean))];

  const applyFilter = (list) =>
    filterCategory === 'all' ? list : list.filter(b => b.category === filterCategory);

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Badges</h1>
          <p className="text-zinc-400">Earn badges through discipline, effort, and consistency</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
          <StatCard label="Workouts"   value={stats.workouts_completed} />
          <StatCard label="Best Streak" value={stats.streak_days} />
          <StatCard label="Meals"      value={stats.meals_logged} />
          <StatCard label="Points"     value={stats.total_points} />
          <StatCard label="Friends"    value={stats.friends_count} />
        </div>

        {/* Overall progress bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 flex items-center gap-5">
          <Award className="w-8 h-8 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold mb-2">
              {earned.length} / {allBadges.length} badges earned
            </p>
            <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: allBadges.length ? `${(earned.length / allBadges.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filterCategory === cat
                  ? 'bg-amber-500 border-amber-500 text-black'
                  : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cat === 'all' ? 'All' : (CATEGORY_LABEL[cat] || cat)}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 border-b border-zinc-800">
          {[
            { id: 'earned',   label: `Earned (${applyFilter(earned).length})`   },
            { id: 'locked',   label: `Locked (${applyFilter(locked).length})`   },
            { id: 'featured', label: `Featured (${featured.length})`            },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                tab === t.id
                  ? 'text-amber-400 border-amber-400'
                  : 'text-zinc-500 border-transparent hover:text-zinc-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : tab === 'earned' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {applyFilter(earned).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Award className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">No badges earned yet. Keep grinding!</p>
                </div>
              ) : (
                applyFilter(earned).map(badge => (
                  <motion.div key={badge._id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
                    <EarnedCard badge={badge} onFeature={featureMutation} featured={badge.is_featured} />
                  </motion.div>
                ))
              )}
            </div>
          ) : tab === 'locked' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {applyFilter(locked).length === 0 ? (
                <div className="col-span-full text-center py-12 text-zinc-500">
                  You've earned all badges in this category! 🎉
                </div>
              ) : (
                applyFilter(locked)
                  .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
                  .map(badge => (
                    <motion.div key={badge._id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
                      <LockedCard badge={badge} />
                    </motion.div>
                  ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.length === 0 ? (
                <div className="col-span-full text-center py-12 text-zinc-500">
                  Feature up to 3 badges to display on your profile.
                </div>
              ) : (
                featured.map(badge => (
                  <motion.div key={badge._id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
                    <EarnedCard badge={badge} onFeature={featureMutation} featured />
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
