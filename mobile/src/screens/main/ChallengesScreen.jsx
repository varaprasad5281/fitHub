import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { COLORS } from '../../lib/theme';
import Button from '../../components/ui/Button';

export default function ChallengesScreen() {
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => api.entities.Challenge.list(),
    staleTime: 1000 * 60 * 5,
  });

  const joinChallenge = useMutation({
    mutationFn: (id) => api.entities.Challenge.update(id, { joined: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenges'] }),
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  }

  const active   = challenges.filter(c => c.status === 'active');
  const upcoming = challenges.filter(c => c.status === 'upcoming');
  const past     = challenges.filter(c => c.status === 'completed');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.label}>🏆 Challenges</Text>
        <Text style={styles.title}>Challenges</Text>
        <Text style={styles.subtitle}>Compete, push limits, earn extra points</Text>
      </View>

      {challenges.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyText}>No challenges available right now. Check back soon!</Text>
        </View>
      ) : (
        <>
          {active.length > 0 && <ChallengeGroup title="Active" challenges={active} onJoin={id => joinChallenge.mutate(id)} />}
          {upcoming.length > 0 && <ChallengeGroup title="Upcoming" challenges={upcoming} onJoin={id => joinChallenge.mutate(id)} />}
          {past.length > 0 && <ChallengeGroup title="Completed" challenges={past} />}
        </>
      )}
    </ScrollView>
  );
}

function ChallengeGroup({ title, challenges, onJoin }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {challenges.map(c => (
        <View key={c.id} style={styles.challengeCard}>
          <View style={styles.challengeTop}>
            <Text style={styles.challengeTitle}>{c.title || c.challenge_name}</Text>
            <View style={[
              styles.statusBadge,
              c.status === 'active' ? styles.badgeActive : c.status === 'completed' ? styles.badgeDone : styles.badgeUpcoming,
            ]}>
              <Text style={[
                styles.statusText,
                c.status === 'active' ? styles.textActive : c.status === 'completed' ? styles.textDone : styles.textUpcoming,
              ]}>
                {c.status}
              </Text>
            </View>
          </View>
          {c.description && <Text style={styles.challengeDesc}>{c.description}</Text>}
          <View style={styles.challengeMeta}>
            {c.points_reward && <Text style={styles.metaItem}>⚡ {c.points_reward} pts</Text>}
            {c.end_date && <Text style={styles.metaItem}>📅 Ends {c.end_date}</Text>}
            {c.participants_count !== undefined && <Text style={styles.metaItem}>👥 {c.participants_count} joined</Text>}
          </View>
          {onJoin && c.status === 'active' && !c.joined && (
            <Button onPress={() => onJoin(c.id)} variant="secondary" style={{ marginTop: 12, height: 40 }}>
              Join Challenge
            </Button>
          )}
          {c.joined && (
            <View style={styles.joinedTag}>
              <Text style={styles.joinedTagText}>✓ Joined</Text>
            </View>
          )}
        </View>
      ))}
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  challengeCard: {
    backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1,
    borderColor: COLORS.border, padding: 16, marginBottom: 12,
  },
  challengeTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  challengeTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  badgeActive: { backgroundColor: COLORS.accentBg, borderColor: COLORS.accentBorder },
  badgeDone: { backgroundColor: COLORS.successBg, borderColor: 'rgba(34,197,94,0.25)' },
  badgeUpcoming: { backgroundColor: COLORS.infoBg, borderColor: 'rgba(96,165,250,0.25)' },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  textActive: { color: COLORS.accent },
  textDone: { color: COLORS.success },
  textUpcoming: { color: COLORS.info },
  challengeDesc: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 10 },
  challengeMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaItem: { color: COLORS.textMuted, fontSize: 12 },
  joinedTag: {
    marginTop: 12, paddingVertical: 8, borderRadius: 99,
    backgroundColor: COLORS.successBg, borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)',
    alignItems: 'center',
  },
  joinedTagText: { color: COLORS.success, fontSize: 12, fontWeight: '700' },
  emptyState: {
    backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.border, padding: 40, alignItems: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
