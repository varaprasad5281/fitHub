import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable,
} from 'react-native';
import { COLORS, DIFFICULTY_COLORS } from '../../lib/theme';

function ExerciseRow({ exercise, index }) {
  return (
    <View style={styles.exerciseRow}>
      <View style={styles.exerciseIndex}>
        <Text style={styles.exerciseIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseMeta}>
          {exercise.sets} sets × {exercise.reps}
          {exercise.rest_seconds ? `  ·  ${exercise.rest_seconds}s rest` : ''}
        </Text>
        {exercise.weight_recommendation && (
          <Text style={styles.exerciseWeight}>⚖ {exercise.weight_recommendation}</Text>
        )}
      </View>
    </View>
  );
}

export default function WorkoutCard({ workout, onComplete, isCompleted = false }) {
  const [showDetail, setShowDetail] = useState(false);

  if (!workout) return null;

  const dc = DIFFICULTY_COLORS[workout.difficulty] || DIFFICULTY_COLORS.beginner;

  return (
    <>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{workout.workout_name}</Text>
            <View style={[styles.diffBadge, { backgroundColor: dc.bg, borderColor: dc.border }]}>
              <Text style={[styles.diffText, { color: dc.text }]}>
                {workout.difficulty}
              </Text>
            </View>
          </View>
          {workout.personalization_notes && (
            <Text style={styles.notes} numberOfLines={2}>{workout.personalization_notes}</Text>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {workout.estimated_duration && (
            <View style={styles.stat}>
              <Text style={styles.statIcon}>⏱</Text>
              <Text style={styles.statValue}>{workout.estimated_duration} min</Text>
            </View>
          )}
          {workout.calories_burned && (
            <View style={styles.stat}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>~{workout.calories_burned} cal</Text>
            </View>
          )}
          <View style={styles.stat}>
            <Text style={styles.statIcon}>💪</Text>
            <Text style={styles.statValue}>{workout.exercises?.length || 0} exercises</Text>
          </View>
        </View>

        {/* Exercise preview (first 3) */}
        <View style={styles.exercisePreview}>
          {(workout.exercises || []).slice(0, 3).map((ex, i) => (
            <ExerciseRow key={i} exercise={ex} index={i} />
          ))}
          {(workout.exercises?.length || 0) > 3 && (
            <TouchableOpacity onPress={() => setShowDetail(true)} style={styles.moreBtn}>
              <Text style={styles.moreBtnText}>
                +{workout.exercises.length - 3} more exercises — View all
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setShowDetail(true)} style={styles.detailBtn}>
            <Text style={styles.detailBtnText}>View Full Workout</Text>
          </TouchableOpacity>
          {!isCompleted && onComplete && (
            <TouchableOpacity onPress={onComplete} style={styles.completeBtn}>
              <Text style={styles.completeBtnText}>✓ Complete Workout</Text>
            </TouchableOpacity>
          )}
          {isCompleted && workout.completed_date && (
            <View style={styles.completedTag}>
              <Text style={styles.completedTagText}>✓ Completed {workout.completed_date}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Full detail modal */}
      <Modal visible={showDetail} animationType="slide" transparent onRequestClose={() => setShowDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{workout.workout_name}</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {(workout.exercises || []).map((ex, i) => (
                <View key={i} style={styles.fullExerciseRow}>
                  <View style={styles.exerciseIndex}>
                    <Text style={styles.exerciseIndexText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {ex.sets} sets × {ex.reps}
                      {ex.rest_seconds ? `  ·  ${ex.rest_seconds}s rest` : ''}
                    </Text>
                    {ex.weight_recommendation && (
                      <Text style={styles.exerciseWeight}>⚖ {ex.weight_recommendation}</Text>
                    )}
                    {ex.instructions && (
                      <Text style={styles.exerciseInstructions}>{ex.instructions}</Text>
                    )}
                  </View>
                </View>
              ))}
              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 24,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    marginTop: 2,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notes: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statIcon: { fontSize: 13 },
  statValue: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  exercisePreview: {
    padding: 16,
    gap: 4,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39,39,42,0.5)',
  },
  fullExerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.accentBg,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  exerciseIndexText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseInfo: { flex: 1 },
  exerciseName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  exerciseWeight: {
    color: COLORS.accent,
    fontSize: 12,
    marginTop: 2,
  },
  exerciseInstructions: {
    color: COLORS.textSubtle,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  moreBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  moreBtnText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailBtn: {
    flex: 1,
    height: 44,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  completeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 99,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  completedTag: {
    flex: 1,
    height: 44,
    borderRadius: 99,
    backgroundColor: COLORS.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.20)',
  },
  completedTagText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 99,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: COLORS.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
});
