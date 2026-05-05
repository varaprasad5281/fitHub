import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { COLORS } from '../../lib/theme';

export default function CoachingScreen({ navigation }) {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['coaching'],
    queryFn: () => api.entities.CoachingSession.list(),
    staleTime: 1000 * 60 * 5,
  });

  const markRead = useMutation({
    mutationFn: (id) => api.entities.CoachingSession.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coaching'] }),
  });

  const unread = sessions.filter(s => !s.read);
  const read   = sessions.filter(s => s.read);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.label}>✨ Coaching</Text>
        <Text style={styles.title}>AI Coaching</Text>
        <Text style={styles.subtitle}>Personalised guidance based on your activity</Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyTitle}>No coaching yet</Text>
          <Text style={styles.emptyText}>
            Complete workouts and log meals to receive personalised AI coaching tips.
          </Text>
        </View>
      ) : (
        <>
          {unread.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>New ({unread.length})</Text>
              {unread.map(session => (
                <SessionCard key={session.id} session={session} onRead={() => markRead.mutate(session.id)} />
              ))}
            </View>
          )}
          {read.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Previous</Text>
              {read.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function SessionCard({ session, onRead }) {
  return (
    <TouchableOpacity
      style={[styles.sessionCard, !session.read && styles.sessionCardUnread]}
      onPress={onRead}
      activeOpacity={0.8}
    >
      <View style={styles.sessionTop}>
        <View style={styles.sessionTypeBadge}>
          <Text style={styles.sessionTypeText}>{session.coaching_type?.replace('_', ' ') || 'coaching'}</Text>
        </View>
        <Text style={styles.sessionDate}>{session.session_date}</Text>
        {!session.read && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.sessionAdvice}>{session.advice}</Text>
      {session.actionable_items?.length > 0 && (
        <View style={styles.tips}>
          {session.actionable_items.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>→</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
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
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  sessionCard: {
    backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1,
    borderColor: COLORS.border, padding: 16, marginBottom: 12,
  },
  sessionCardUnread: { borderColor: COLORS.accentBorder, backgroundColor: 'rgba(245,158,11,0.05)' },
  sessionTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sessionTypeBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
    backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  sessionTypeText: { color: COLORS.accent, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  sessionDate: { color: COLORS.textMuted, fontSize: 12, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  sessionAdvice: { color: COLORS.text, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  tips: { gap: 6 },
  tipRow: { flexDirection: 'row', gap: 8 },
  tipBullet: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  tipText: { color: COLORS.textMuted, fontSize: 13, flex: 1, lineHeight: 18 },
  emptyState: {
    backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.border, padding: 40, alignItems: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
