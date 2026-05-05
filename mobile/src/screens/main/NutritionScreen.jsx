import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
  TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { activeSub, hasProAccess } from '../../lib/subscriptionUtils';
import { COLORS } from '../../lib/theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

function MacroBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroLabelRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{Math.round(value)}g</Text>
      </View>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function NutritionScreen() {
  const today = new Date().toISOString().split('T')[0];
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [generating, setGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    staleTime: 1000 * 60 * 5,
  });
  const hasAccess = hasProAccess(activeSub(subscriptions));

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['meals', today],
    queryFn: () => api.entities.MealLog.filter({ date: today }),
    staleTime: 1000 * 60 * 2,
    enabled: hasAccess,
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['meal-plans', today],
    queryFn: () => api.entities.MealPlan.filter({ date: today }),
    staleTime: 1000 * 60 * 10,
    enabled: hasAccess,
  });

  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein  = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarbs    = meals.reduce((s, m) => s + (m.carbohydrates || 0), 0);
  const totalFat      = meals.reduce((s, m) => s + (m.fat || 0), 0);
  const calorieTarget = 2000;
  const caloriePct    = Math.min((totalCalories / calorieTarget) * 100, 100);

  const addMeal = useMutation({
    mutationFn: () => api.entities.MealLog.create({
      date: today,
      meal_type: mealType,
      food_name: foodName,
      calories: parseInt(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbohydrates: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', today] });
      setShowAddForm(false);
      setFoodName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
      showToast('Meal logged ✓');
    },
    onError: () => showToast('Failed to log meal.'),
  });

  const deleteMeal = useMutation({
    mutationFn: (id) => api.entities.MealLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meals', today] }),
  });

  const generateMealPlan = async () => {
    setGenerating(true);
    try {
      await api.functions.invoke('generateMealPlan', {});
      queryClient.invalidateQueries({ queryKey: ['meal-plans', today] });
      showToast('Meal plan generated! 🥗');
    } catch {
      showToast('Failed to generate meal plan.');
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
      {!!toastMsg && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.label}>🥗 Nutrition</Text>
          <Text style={styles.title}>Today's Nutrition</Text>
          <Text style={styles.subtitle}>{today}</Text>
        </View>

        {!hasAccess ? (
          <View style={styles.gateCard}>
            <Text style={styles.gateIcon}>🔒</Text>
            <Text style={styles.gateTitle}>Pro Feature</Text>
            <Text style={styles.gateText}>Meal tracking and AI meal plans are available on Pro and Elite plans.</Text>
          </View>
        ) : (
          <>
            {/* Calorie ring */}
            <View style={styles.calorieCard}>
              <View style={styles.calorieTop}>
                <View>
                  <Text style={styles.calorieValue}>{totalCalories}</Text>
                  <Text style={styles.calorieLabel}>of {calorieTarget} kcal</Text>
                </View>
                <View style={styles.calorieCircle}>
                  <Text style={styles.calorieCirclePct}>{Math.round(caloriePct)}%</Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${caloriePct}%` }]} />
              </View>
              <View style={styles.macros}>
                <MacroBar label="Protein" value={totalProtein} total={150} color="#60a5fa" />
                <MacroBar label="Carbs"   value={totalCarbs}   total={250} color="#f59e0b" />
                <MacroBar label="Fat"     value={totalFat}     total={65}  color="#f87171" />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <Button onPress={() => setShowAddForm(true)} style={{ flex: 1 }}>
                + Log Meal
              </Button>
              <Button onPress={generateMealPlan} loading={generating} variant="secondary" style={{ flex: 1 }}>
                ✨ AI Plan
              </Button>
            </View>

            {/* Today's meals */}
            {meals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's Meals</Text>
                {MEAL_TYPES.map(type => {
                  const group = meals.filter(m => m.meal_type === type);
                  if (!group.length) return null;
                  return (
                    <View key={type} style={styles.mealGroup}>
                      <Text style={styles.mealGroupTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                      {group.map(meal => (
                        <View key={meal.id} style={styles.mealRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.mealName}>{meal.food_name}</Text>
                            <Text style={styles.mealMeta}>
                              {meal.calories} kcal
                              {meal.protein ? ` · P:${meal.protein}g` : ''}
                              {meal.carbohydrates ? ` · C:${meal.carbohydrates}g` : ''}
                              {meal.fat ? ` · F:${meal.fat}g` : ''}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => deleteMeal.mutate(meal.id)} style={styles.deleteBtn}>
                            <Text style={styles.deleteBtnText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}

            {/* AI Meal Plan */}
            {mealPlans.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's Meal Plan</Text>
                {mealPlans.map((plan, i) => (
                  <View key={i} style={styles.planCard}>
                    <Text style={styles.planName}>{plan.meal_name}</Text>
                    <Text style={styles.planMeta}>
                      {plan.calories} kcal · {plan.meal_type}
                    </Text>
                    {plan.description && (
                      <Text style={styles.planDesc}>{plan.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent onRequestClose={() => setShowAddForm(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.formSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Log a Meal</Text>
                <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                {/* Meal type selector */}
                <Text style={styles.fieldLabel}>Meal Type</Text>
                <View style={styles.typeRow}>
                  {MEAL_TYPES.map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setMealType(t)}
                      style={[styles.typeBtn, mealType === t && styles.typeBtnActive]}
                    >
                      <Text style={[styles.typeBtnText, mealType === t && styles.typeBtnTextActive]}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Input label="Food Name" value={foodName} onChangeText={setFoodName} placeholder="e.g. Chicken & rice" />
                <Input label="Calories (kcal)" value={calories} onChangeText={setCalories} placeholder="0" keyboardType="numeric" />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Input label="Protein (g)" value={protein} onChangeText={setProtein} placeholder="0" keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Carbs (g)" value={carbs} onChangeText={setCarbs} placeholder="0" keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Fat (g)" value={fat} onChangeText={setFat} placeholder="0" keyboardType="numeric" />
                  </View>
                </View>

                <Button onPress={() => addMeal.mutate()} loading={addMeal.isPending} style={{ marginTop: 8 }}>
                  Log Meal
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
  center: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },

  calorieCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  calorieTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  calorieValue: { fontSize: 32, fontWeight: '800', color: COLORS.text },
  calorieLabel: { fontSize: 13, color: COLORS.textMuted },
  calorieCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.accentBg, borderWidth: 2, borderColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  calorieCirclePct: { fontSize: 14, fontWeight: '800', color: COLORS.accent },
  progressTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 99, marginBottom: 16 },
  progressFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 99 },
  macros: { gap: 8 },
  macroRow: { gap: 4 },
  macroLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroLabel: { fontSize: 12, color: COLORS.textMuted },
  macroValue: { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  macroTrack: { height: 4, backgroundColor: COLORS.border, borderRadius: 99 },
  macroFill: { height: 4, borderRadius: 99 },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 10 },

  mealGroup: { marginBottom: 12 },
  mealGroupTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  mealRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 12, marginBottom: 6,
  },
  mealName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  mealMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { color: COLORS.textSubtle, fontSize: 14 },

  planCard: {
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8,
  },
  planName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  planMeta: { fontSize: 12, color: COLORS.accent, marginTop: 2 },
  planDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, lineHeight: 17 },

  gateCard: {
    backgroundColor: COLORS.card, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, padding: 32, alignItems: 'center',
  },
  gateIcon: { fontSize: 36, marginBottom: 12 },
  gateTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  gateText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  toast: {
    position: 'absolute', top: 20, left: 20, right: 20, zIndex: 999,
    backgroundColor: '#1c1c1e', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.accentBorder,
  },
  toastText: { color: COLORS.text, fontSize: 14, fontWeight: '500', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  formSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', borderWidth: 1, borderColor: COLORS.border,
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
  fieldLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: COLORS.accentBg, borderColor: COLORS.accentBorder },
  typeBtnText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
  typeBtnTextActive: { color: COLORS.accent },
});
