import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/AuthContext';
import { api } from '../../api/client';
import { COLORS } from '../../lib/theme';

const NAV_TILES = [
  { name: 'Workouts',     screen: 'Workouts',     icon: '🏋️', desc: 'Training plans' },
  { name: 'Nutrition',    screen: 'Nutrition',     icon: '🥗', desc: 'Meal tracking' },
  { name: 'Progress',     screen: 'Progress',      icon: '📈', desc: 'Your stats' },
  { name: 'Coaching',     screen: 'Coaching',      icon: '✨', desc: 'AI guidance' },
  { name: 'Challenges',   screen: 'Challenges',    icon: '🏆', desc: 'Compete & win' },
  { name: 'Leaderboard',  screen: 'Leaderboard',   icon: '🥇', desc: 'Rankings' },
  { name: 'Badges',       screen: 'Badges',        icon: '🎖', desc: 'Achievements' },
  { name: 'Friends',      screen: 'Friends',       icon: '👥', desc: 'Social' },
  { name: 'Subscription', screen: 'Subscription',  icon: '💳', desc: 'Manage plan' },
];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const { data: points = [] } = useQuery({
    queryKey: ['points'],
    queryFn: () => api.entities.Points.list(),
    staleTime: 1000 * 60 * 2,
  });

  const { data: streaks = [] } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.entities.Streak.list(),
    staleTime: 1000 * 60 * 5,
  });

  const totalPoints = points[0]?.total_points || 0;
  const currentStreak = streaks[0]?.current_count || 0;

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Keep showing up. Every day counts.</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalPoints.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={[styles.statCard, styles.statCardMiddle]}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak 🔥</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>7%</Text>
          <Text style={styles.statLabel}>Better daily</Text>
        </View>
      </View>

      {/* Dashboard grid */}
      <Text style={styles.sectionTitle}>Your Dashboard</Text>
      <View style={styles.grid}>
        {NAV_TILES.map((tile) => (
          <TouchableOpacity
            key={tile.screen}
            style={styles.tile}
            onPress={() => navigation.navigate(tile.screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.tileIcon}>{tile.icon}</Text>
            <Text style={styles.tileName}>{tile.name}</Text>
            <Text style={styles.tileDesc}>{tile.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subGreeting: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
  },
  statCardMiddle: {
    borderColor: COLORS.accentBorder,
    backgroundColor: COLORS.accentBg,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '30%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    minHeight: 90,
  },
  tileIcon: { fontSize: 22, marginBottom: 6 },
  tileName: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  tileDesc: { fontSize: 11, color: COLORS.textMuted },
});
