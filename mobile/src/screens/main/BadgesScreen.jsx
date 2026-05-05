import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { COLORS } from '../../lib/theme';

export default function BadgesScreen() {
  const { data: userBadges = [], isLoading: ubLoading } = useQuery({
    queryKey: ['user-badges'],
    queryFn: () => api.entities.UserBadge.list(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: allBadges = [], isLoading: bLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: () => api.entities.Badge.list(),
    staleTime: 1000 * 60 * 10,
  });

  const isLoading = ubLoading || bLoading;
  const earnedIds = new Set(userBadges.map(ub => ub.badge_id));

  const earned   = allBadges.filter(b => earnedIds.has(b.id));
  const unearned = allBadges.filter(b => !earnedIds.has(b.id));

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.label}>🎖 Badges</Text>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>{earned.length} of {allBadges.length} earned</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {
            width: allBadges.length > 0 ? `${(earned.length / allBadges.length) * 100}%` : '0%'
          }]} />
        </View>
        <Text style={styles.progressText}>{earned.length}/{allBadges.length} badges</Text>
      </View>

      {earned.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earned 🎉</Text>
          <View style={styles.badgeGrid}>
            {earned.map(badge => (
              <BadgeTile key={badge.id} badge={badge} earned />
            ))}
          </View>
        </View>
      )}

      {unearned.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locked</Text>
          <View style={styles.badgeGrid}>
            {unearned.map(badge => (
              <BadgeTile key={badge.id} badge={badge} earned={false} />
            ))}
          </View>
        </View>
      )}

      {allBadges.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎖</Text>
          <Text style={styles.emptyText}>No badges configured yet. Complete workouts and challenges to earn achievements!</Text>
        </View>
      )}
    </ScrollView>
  );
}

function BadgeTile({ badge, earned }) {
  return (
    <View style={[styles.badgeTile, !earned && styles.badgeTileLocked]}>
      <Text style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
        {badge.icon || '🏅'}
      </Text>
      <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]} numberOfLines={2}>
        {badge.name}
      </Text>
      {badge.points_required && !earned && (
        <Text style={styles.badgeReq}>{badge.points_required} pts</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  progressCard: {
    backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1,
    borderColor: COLORS.border, padding: 16, marginBottom: 24,
  },
  progressTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: 99, marginBottom: 8 },
  progressFill: { height: 8, backgroundColor: COLORS.accent, borderRadius: 99 },
  progressText: { color: COLORS.textMuted, fontSize: 12, textAlign: 'right' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeTile: {
    width: '30%', flexGrow: 1,
    backgroundColor: COLORS.accentBg, borderRadius: 14, borderWidth: 1,
    borderColor: COLORS.accentBorder, padding: 14, alignItems: 'center', minHeight: 90,
  },
  badgeTileLocked: {
    backgroundColor: COLORS.card, borderColor: COLORS.border, opacity: 0.6,
  },
  badgeIcon: { fontSize: 28, marginBottom: 6 },
  badgeIconLocked: { opacity: 0.5 },
  badgeName: { fontSize: 11, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  badgeNameLocked: { color: COLORS.textMuted },
  badgeReq: { fontSize: 10, color: COLORS.textSubtle, marginTop: 2 },
  emptyState: {
    backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.border, padding: 40, alignItems: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
