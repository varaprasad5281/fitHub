import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Pressable,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { COLORS } from '../../lib/theme';

// ── Rarity colours ─────────────────────────────────────────────────────────────
const RARITY_COLORS = {
  common:    { border: '#52525b', label: '#a1a1aa', glow: 'transparent' },
  rare:      { border: '#3b82f6', label: '#60a5fa', glow: '#0c1f3f'    },
  epic:      { border: '#a855f7', label: '#c084fc', glow: '#2d0544'    },
  legendary: { border: '#f59e0b', label: '#fbbf24', glow: '#3b1c00'    },
};

const CATEGORY_LABEL = {
  workout:   '💪 Workout',
  streak:    '🔥 Streak',
  nutrition: '🥗 Nutrition',
  points:    '⭐ Points',
  social:    '🤝 Social',
};

// ── BadgeTile ─────────────────────────────────────────────────────────────────
function BadgeTile({ badge }) {
  const rc = RARITY_COLORS[badge.rarity_level] || RARITY_COLORS.common;
  const isEarned = badge.earned;
  const progress = badge.progress ?? 0;

  return (
    <View style={[
      styles.tile,
      { borderColor: rc.border, backgroundColor: isEarned ? rc.glow : COLORS.card },
      !isEarned && styles.tileLocked,
    ]}>
      <Text style={[styles.tileIcon, !isEarned && { opacity: 0.4 }]}>
        {badge.icon || (isEarned ? '🏅' : '🔒')}
      </Text>
      <Text style={[styles.tileName, !isEarned && { color: COLORS.textMuted }]} numberOfLines={2}>
        {badge.name}
      </Text>
      <Text style={[styles.tileRarity, { color: rc.label }]}>
        {(badge.rarity_level || '').toUpperCase()}
      </Text>

      {/* Progress bar for locked badges */}
      {!isEarned && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{progress}%</Text>
        </View>
      )}

      {isEarned && (
        <View style={styles.earnedDot}>
          <Text style={styles.earnedDotText}>✓</Text>
        </View>
      )}
    </View>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
const TABS = ['All', 'Earned', 'Locked'];

export default function BadgesScreen() {
  const [tab, setTab] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: badgeData, isLoading } = useQuery({
    queryKey: ['badges-progress'],
    queryFn: async () => {
      const res = await api.functions.invoke('getBadges', { action: 'progress' });
      return { badges: res.data || [], stats: res.stats || {} };
    },
    staleTime: 1000 * 60 * 5,
  });

  const allBadges = badgeData?.badges || [];
  const stats = badgeData?.stats || {};

  const earned = allBadges.filter(b => b.earned);
  const locked  = allBadges.filter(b => !b.earned);

  const categories = ['all', ...new Set(allBadges.map(b => b.category).filter(Boolean))];

  const visibleBadges = allBadges.filter(badge => {
    if (categoryFilter !== 'all' && badge.category !== categoryFilter) return false;
    if (tab === 'Earned') return badge.earned;
    if (tab === 'Locked') return !badge.earned;
    return true;
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>🎖 BADGES</Text>
        <Text style={styles.title}>Achievements</Text>
      </View>

      {/* Stats scroll row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
        <StatCard label="Workouts"    value={stats.workouts_completed} />
        <StatCard label="Best Streak" value={stats.streak_days} />
        <StatCard label="Meals"       value={stats.meals_logged} />
        <StatCard label="Points"      value={stats.total_points} />
        <StatCard label="Friends"     value={stats.friends_count} />
      </ScrollView>

      {/* Overall progress */}
      <View style={styles.overallCard}>
        <Text style={styles.overallText}>
          {earned.length} / {allBadges.length} badges earned
        </Text>
        <View style={styles.progressTrack}>
          <View style={[
            styles.progressFill,
            { width: allBadges.length ? `${(earned.length / allBadges.length) * 100}%` : '0%' },
          ]} />
        </View>
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
        {categories.map(cat => (
          <Pressable
            key={cat}
            onPress={() => setCategoryFilter(cat)}
            style={[styles.pill, categoryFilter === cat && styles.pillActive]}
          >
            <Text style={[styles.pillText, categoryFilter === cat && styles.pillTextActive]}>
              {cat === 'all' ? 'All' : (CATEGORY_LABEL[cat] || cat)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={styles.tabItem}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Badge grid */}
      {visibleBadges.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎖</Text>
          <Text style={styles.emptyText}>
            {tab === 'Earned'
              ? 'No badges earned yet. Complete workouts, log meals, and build your streak!'
              : tab === 'Locked'
              ? 'You've earned everything in this category! 🎉'
              : 'No badges found.'}
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {visibleBadges
            .sort((a, b) => {
              if (tab === 'All' && a.earned !== b.earned) return a.earned ? -1 : 1;
              return (b.progress ?? 0) - (a.progress ?? 0);
            })
            .map(badge => (
              <BadgeTile key={badge._id || badge.badge_code} badge={badge} />
            ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  content:    { padding: 20, paddingBottom: 48 },
  center:     { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },

  // Header
  header:     { marginBottom: 16 },
  label:      { fontSize: 11, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.4, marginBottom: 4 },
  title:      { fontSize: 26, fontWeight: '800', color: COLORS.text },

  // Stats row
  statsRow:   { marginBottom: 16 },
  statCard:   {
    backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: 16, paddingVertical: 10,
    alignItems: 'center', marginRight: 10, minWidth: 80,
  },
  statValue:  { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLabel:  { fontSize: 10, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },

  // Overall progress
  overallCard: {
    backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1,
    borderColor: COLORS.border, padding: 16, marginBottom: 16,
  },
  overallText: { color: COLORS.text, fontWeight: '600', fontSize: 14, marginBottom: 10 },

  // Progress bar (shared)
  progressTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: 99, overflow: 'hidden' },
  progressFill:  { height: 8, backgroundColor: COLORS.accent, borderRadius: 99 },

  // Category pills
  pillRow:       { marginBottom: 14 },
  pill:          {
    borderRadius: 99, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
  },
  pillActive:    { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  pillText:      { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  pillTextActive: { color: '#000' },

  // Tabs
  tabs:         { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  tabItem:      { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
  tabText:      { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.accent },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2, backgroundColor: COLORS.accent, borderRadius: 99,
  },

  // Badge grid
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile:        {
    width: '31%', flexGrow: 1,
    borderRadius: 14, borderWidth: 1.5,
    padding: 12, alignItems: 'center',
    minHeight: 110, position: 'relative',
  },
  tileLocked:  { opacity: 0.7 },
  tileIcon:    { fontSize: 30, marginBottom: 4 },
  tileName:    { fontSize: 11, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 2 },
  tileRarity:  { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },

  progressWrap: { width: '100%', marginTop: 4 },
  progressLabel: { fontSize: 9, color: COLORS.textSubtle, textAlign: 'right', marginTop: 2 },

  earnedDot:  {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: COLORS.accent, width: 16, height: 16,
    borderRadius: 99, alignItems: 'center', justifyContent: 'center',
  },
  earnedDotText: { fontSize: 9, fontWeight: '900', color: '#000' },

  // Empty state
  emptyState: {
    backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.border, padding: 36, alignItems: 'center',
  },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyText:  { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
