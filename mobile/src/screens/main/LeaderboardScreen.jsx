import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/AuthContext';
import { api } from '../../api/client';
import { COLORS } from '../../lib/theme';

const RANK_COLORS = ['#f59e0b', '#9ca3af', '#b45309'];
const RANK_EMOJIS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const { user } = useAuth();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.entities.WeeklyLeaderboard.list(),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  }

  const sorted = [...leaderboard].sort((a, b) => (b.weekly_points || 0) - (a.weekly_points || 0));
  const myEntry = sorted.find(e => e.user_email === user?.email);
  const myRank  = myEntry ? sorted.indexOf(myEntry) + 1 : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.label}>🥇 Leaderboard</Text>
        <Text style={styles.title}>This Week's Leaders</Text>
      </View>

      {/* My rank */}
      {myRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankLabel}>Your Rank</Text>
          <Text style={styles.myRankValue}>#{myRank}</Text>
          <Text style={styles.myRankPoints}>{myEntry?.weekly_points || 0} pts this week</Text>
        </View>
      )}

      {/* Top 3 podium */}
      {sorted.length >= 3 && (
        <View style={styles.podium}>
          {[sorted[1], sorted[0], sorted[2]].map((entry, pos) => {
            const actualRank = sorted.indexOf(entry) + 1;
            const height = pos === 1 ? 90 : pos === 0 ? 70 : 60;
            return (
              <View key={entry.id || pos} style={styles.podiumSlot}>
                <Text style={styles.podiumEmoji}>{RANK_EMOJIS[actualRank - 1] || '🎖'}</Text>
                <Text style={styles.podiumName} numberOfLines={1}>{entry.user_name || 'User'}</Text>
                <View style={[styles.podiumBar, { height, backgroundColor: RANK_COLORS[actualRank - 1] || COLORS.border }]}>
                  <Text style={styles.podiumRank}>#{actualRank}</Text>
                </View>
                <Text style={styles.podiumPts}>{entry.weekly_points || 0} pts</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Full list */}
      <View style={styles.list}>
        {sorted.map((entry, i) => {
          const isMe = entry.user_email === user?.email;
          return (
            <View key={entry.id || i} style={[styles.listRow, isMe && styles.listRowMe]}>
              <View style={styles.rankCol}>
                {i < 3 ? (
                  <Text style={{ fontSize: 18 }}>{RANK_EMOJIS[i]}</Text>
                ) : (
                  <Text style={styles.rankNum}>#{i + 1}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.listName, isMe && styles.listNameMe]}>
                  {entry.user_name || 'User'} {isMe ? '(You)' : ''}
                </Text>
              </View>
              <Text style={[styles.listPts, isMe && styles.listPtsMe]}>
                {(entry.weekly_points || 0).toLocaleString()} pts
              </Text>
            </View>
          );
        })}
        {sorted.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🥇</Text>
            <Text style={styles.emptyText}>No leaderboard data yet. Complete workouts to appear here!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  myRankCard: {
    backgroundColor: COLORS.accentBg, borderRadius: 16, borderWidth: 1,
    borderColor: COLORS.accentBorder, padding: 20, alignItems: 'center', marginBottom: 24,
  },
  myRankLabel: { fontSize: 12, color: COLORS.accent, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  myRankValue: { fontSize: 40, fontWeight: '900', color: COLORS.accent, marginVertical: 4 },
  myRankPoints: { fontSize: 13, color: COLORS.textMuted },
  podium: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    gap: 8, marginBottom: 28, paddingHorizontal: 16,
  },
  podiumSlot: { flex: 1, alignItems: 'center' },
  podiumEmoji: { fontSize: 22, marginBottom: 4 },
  podiumName: { fontSize: 11, fontWeight: '600', color: COLORS.text, marginBottom: 6, textAlign: 'center' },
  podiumBar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'center' },
  podiumRank: { color: '#fff', fontWeight: '900', fontSize: 16 },
  podiumPts: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  list: { gap: 8 },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, padding: 14,
  },
  listRowMe: { borderColor: COLORS.accentBorder, backgroundColor: COLORS.accentBg },
  rankCol: { width: 32, alignItems: 'center' },
  rankNum: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  listName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  listNameMe: { color: COLORS.accent },
  listPts: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  listPtsMe: { color: COLORS.accent },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
});
