import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { COLORS } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

function StatCard({ icon, value, label, accent }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function GoalCard({ goal, onDelete }) {
  const progress = goal.target_value > 0
    ? Math.min((goal.current_value / goal.target_value) * 100, 100)
    : 0;

  const statusColor = {
    active:    COLORS.accent,
    completed: COLORS.success,
    failed:    COLORS.danger,
  }[goal.status] || COLORS.textMuted;

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalName}>{goal.goal_name || goal.goal_type}</Text>
          <Text style={styles.goalMeta}>
            {goal.current_value} / {goal.target_value} {goal.unit}
          </Text>
        </View>
        <View style={[styles.goalStatus, { borderColor: statusColor + '40', backgroundColor: statusColor + '15' }]}>
          <Text style={[styles.goalStatusText, { color: statusColor }]}>{goal.status}</Text>
        </View>
      </View>
      <View style={styles.goalTrack}>
        <View style={[styles.goalFill, { width: `${progress}%`, backgroundColor: statusColor }]} />
      </View>
      <Text style={styles.goalPct}>{Math.round(progress)}% complete</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const queryClient = useQueryClient();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState('weight_loss');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [unit, setUnit] = useState('kg');

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['progress-goals'],
    queryFn: () => api.entities.ProgressGoal.list(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: points = [] } = useQuery({
    queryKey: ['points'],
    queryFn: () => api.entities.Points.list(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: streaks = [] } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.entities.Streak.list(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['workout-completions'],
    queryFn: () => api.entities.WorkoutCompletion.list(),
    staleTime: 1000 * 60 * 10,
  });

  const totalPoints   = points[0]?.total_points || 0;
  const weeklyPoints  = points[0]?.weekly_points || 0;
  const currentStreak = streaks[0]?.current_count || 0;
  const longestStreak = streaks[0]?.longest_count || 0;
  const totalWorkouts = completions.length;

  const addGoal = useMutation({
    mutationFn: () => api.entities.ProgressGoal.create({
      goal_name: goalName,
      goal_type: goalType,
      target_value: parseFloat(targetValue) || 0,
      current_value: parseFloat(currentValue) || 0,
      unit,
      status: 'active',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-goals'] });
      setShowGoalForm(false);
      setGoalName(''); setTargetValue(''); setCurrentValue('');
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.label}>📈 Progress</Text>
          <Text style={styles.title}>Your Progress</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="⚡" value={totalPoints.toLocaleString()} label="Total Points" accent />
          <StatCard icon="📅" value={weeklyPoints.toLocaleString()} label="This Week" />
          <StatCard icon="🔥" value={currentStreak} label="Current Streak" accent />
          <StatCard icon="🏆" value={longestStreak} label="Longest Streak" />
          <StatCard icon="💪" value={totalWorkouts} label="Workouts Done" />
          <StatCard icon="⭐" value="7%" label="Improvement" accent />
        </View>

        {/* Goals section */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <TouchableOpacity onPress={() => setShowGoalForm(true)} style={styles.addGoalBtn}>
              <Text style={styles.addGoalBtnText}>+ Add Goal</Text>
            </TouchableOpacity>
          </View>

          {goalsLoading ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />
          ) : goals.length === 0 ? (
            <View style={styles.emptyGoals}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>No goals yet. Set your first goal to track your progress!</Text>
            </View>
          ) : (
            goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))
          )}
        </View>

        {/* Weekly activity — recent completions */}
        {completions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {completions.slice(0, 5).map((c, i) => (
              <View key={i} style={styles.completionRow}>
                <View style={styles.completionDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.completionDate}>{c.completed_date}</Text>
                </View>
                <Text style={styles.completionCheck}>✓</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showGoalForm} animationType="slide" transparent onRequestClose={() => setShowGoalForm(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.formSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>New Goal</Text>
                <TouchableOpacity onPress={() => setShowGoalForm(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                <Input label="Goal Name" value={goalName} onChangeText={setGoalName} placeholder="e.g. Lose 5kg" />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Input label="Current Value" value={currentValue} onChangeText={setCurrentValue} placeholder="0" keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Target Value" value={targetValue} onChangeText={setTargetValue} placeholder="0" keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Unit" value={unit} onChangeText={setUnit} placeholder="kg" />
                  </View>
                </View>
                <Button onPress={() => addGoal.mutate()} loading={addGoal.isPending} style={{ marginTop: 8 }}>
                  Save Goal
                </Button>
                <View style={{ height: 32 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  statCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    alignItems: 'center',
  },
  statCardAccent: { borderColor: COLORS.accentBorder, backgroundColor: COLORS.accentBg },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  statValueAccent: { color: COLORS.accent },
  statLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },

  section: { marginBottom: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  addGoalBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 99, backgroundColor: COLORS.accentBg,
    borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  addGoalBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },

  goalCard: {
    backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 10,
  },
  goalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  goalName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  goalMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  goalStatus: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 99, borderWidth: 1, marginTop: 2,
  },
  goalStatusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  goalTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 99, marginBottom: 4 },
  goalFill: { height: 6, borderRadius: 99 },
  goalPct: { fontSize: 11, color: COLORS.textMuted },

  emptyGoals: {
    backgroundColor: COLORS.card, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 32, alignItems: 'center',
  },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  completionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  completionDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent,
  },
  completionDate: { color: COLORS.text, fontSize: 13 },
  completionCheck: { color: COLORS.success, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  formSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', borderWidth: 1, borderColor: COLORS.border,
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
  sheetTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  closeBtn: {
    width: 32, height: 32, borderRadius: 99, backgroundColor: COLORS.cardHover,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
});
