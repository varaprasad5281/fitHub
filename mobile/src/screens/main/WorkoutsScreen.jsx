import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/AuthContext';
import { api } from '../../api/client';
import { activeSub, hasProAccess } from '../../lib/subscriptionUtils';
import WorkoutCard from '../../components/workout/WorkoutCard';
import Button from '../../components/ui/Button';
import { COLORS, DIFFICULTY_COLORS } from '../../lib/theme';

export default function WorkoutsScreen() {
  const [generating, setGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyWorkout, setHistoryWorkout] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts', user?.email],
    queryFn: () => api.entities.Workout.filter({ created_by: user.email }),
    staleTime: 1000 * 60 * 5,
    enabled: !!user?.email,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    staleTime: 1000 * 60 * 5,
  });
  const hasAccess = hasProAccess(activeSub(subscriptions));

  // Current active workout (most recent, not completed)
  const currentWorkout = workouts
    .filter(w => !w.is_completed)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null;

  // Completed workouts sorted by date desc
  const completedWorkouts = workouts
    .filter(w => w.is_completed)
    .sort((a, b) => (b.completed_date || '').localeCompare(a.completed_date || ''));

  const completeWorkout = useMutation({
    mutationFn: async (workoutId) => {
      const result = await api.functions.invoke('completeWorkout', { workout_id: workoutId });
      return result?.points_earned ?? 0;
    },
    onSuccess: (pointsEarned) => {
      showToast(`Workout completed! +${pointsEarned} points 🎉`);
      queryClient.invalidateQueries({ queryKey: ['points'] });
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      api.functions.invoke('updateStreak').then(res => {
        if (res?.bonus_points > 0) {
          setTimeout(() => showToast(`🔥 ${res.current_count}-day streak! +${res.bonus_points} bonus pts`), 1000);
        }
        queryClient.invalidateQueries({ queryKey: ['points'] });
      }).catch(() => {});
    },
    onError: () => showToast('Failed to complete workout.'),
  });

  const generateWorkout = async () => {
    setGenerating(true);
    try {
      const activeAll = workouts.filter(w => !w.is_completed);
      if (activeAll.length > 0) {
        await Promise.all(activeAll.map(w => api.entities.Workout.delete(w.id)));
      }
      await api.functions.invoke('generatePersonalizedWorkout', {});
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.email] });
      showToast('New personalised workout ready! 💪');
    } catch {
      showToast('Failed to generate workout. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Toast */}
      {!!toastMsg && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.label}>🏋️ Workouts</Text>
          <Text style={styles.title}>Your Training Plan</Text>
          <Text style={styles.subtitle}>Generate a personalised workout anytime</Text>
        </View>

        {/* Subscription gate */}
        {!hasAccess ? (
          <View style={styles.gateCard}>
            <Text style={styles.gateIcon}>🔒</Text>
            <Text style={styles.gateTitle}>Pro Feature</Text>
            <Text style={styles.gateText}>
              Personalised AI workouts are available on Pro and Elite plans.
            </Text>
            <Button variant="primary" onPress={() => {}} style={{ marginTop: 16 }}>
              Upgrade to Pro
            </Button>
          </View>
        ) : (
          <>
            {/* Current workout */}
            {currentWorkout ? (
              <View style={styles.section}>
                <WorkoutCard
                  workout={currentWorkout}
                  onComplete={() => completeWorkout.mutate(currentWorkout.id)}
                  isCompleted={false}
                />
                <Button
                  onPress={generateWorkout}
                  loading={generating}
                  variant="secondary"
                  style={{ marginTop: 12 }}
                >
                  {generating ? 'Generating…' : '✨ Regenerate Workout'}
                </Button>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🏋️</Text>
                <Text style={styles.emptyText}>No active workout. Generate your next session!</Text>
                <Button onPress={generateWorkout} loading={generating} style={{ marginTop: 16 }}>
                  {generating ? 'Generating…' : '✨ Generate Workout'}
                </Button>
              </View>
            )}

            {/* History button */}
            {completedWorkouts.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowHistory(true)}
                style={styles.historyBtn}
                activeOpacity={0.75}
              >
                <Text style={styles.historyBtnText}>
                  📋 Previously Completed ({completedWorkouts.length})
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* History bottom sheet */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.historySheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Previously Completed</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
              {completedWorkouts.map((workout) => {
                const dc = DIFFICULTY_COLORS[workout.difficulty] || DIFFICULTY_COLORS.beginner;
                return (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.historyRow}
                    onPress={() => { setHistoryWorkout(workout); setShowHistory(false); }}
                    activeOpacity={0.75}
                  >
                    <View style={styles.historyCheckCircle}>
                      <Text style={{ fontSize: 14 }}>✓</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyRowTitle} numberOfLines={1}>{workout.workout_name}</Text>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 3 }}>
                        {workout.completed_date && (
                          <Text style={styles.historyMeta}>{workout.completed_date}</Text>
                        )}
                        {workout.estimated_duration && (
                          <Text style={styles.historyMeta}>⏱ {workout.estimated_duration} min</Text>
                        )}
                        {workout.calories_burned && (
                          <Text style={styles.historyMeta}>🔥 {workout.calories_burned} cal</Text>
                        )}
                      </View>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: dc.bg, borderColor: dc.border }]}>
                      <Text style={[styles.diffText, { color: dc.text }]}>{workout.difficulty}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* History workout detail */}
      {historyWorkout && (
        <Modal visible animationType="slide" transparent onRequestClose={() => setHistoryWorkout(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.historySheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{historyWorkout.workout_name}</Text>
                <TouchableOpacity onPress={() => setHistoryWorkout(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
                <WorkoutCard workout={historyWorkout} isCompleted />
                <View style={{ height: 24 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
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

  section: { marginBottom: 16 },

  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },

  historyBtn: {
    borderRadius: 99,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    backgroundColor: COLORS.accentBg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  historyBtnText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },

  gateCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    alignItems: 'center',
  },
  gateIcon: { fontSize: 36, marginBottom: 12 },
  gateTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  gateText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  toast: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  toastText: { color: COLORS.text, fontSize: 14, fontWeight: '500', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  historySheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: COLORS.border, borderRadius: 99,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 12 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 99, backgroundColor: COLORS.cardHover,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },

  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.background, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  historyCheckCircle: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accentBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  historyRowTitle: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  historyMeta: { color: COLORS.textMuted, fontSize: 12 },
  diffBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1,
  },
  diffText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
});
